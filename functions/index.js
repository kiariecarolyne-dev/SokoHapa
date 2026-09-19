'use strict';

// SokoHapa - server-side push notification senders.
//
// The app writes EXPO push tokens to pushTokens/{uid}/tokens/{deviceId}
// (see src/services/pushNotifications.js). These Cloud Functions watch the
// order/delivery state transitions that should notify a user, resolve the
// recipient from the real document data (never from client input), and send
// via the Expo Push API. Recipients and messages are therefore determined
// exclusively server-side; clients can never trigger a push for another user.
//
// Deployment prerequisites (documented in the project README):
//   firebase use sokohapa-20744
//   firebase functions:secrets:set EXPO_ACCESS_TOKEN   (Expo account access token)
//   firebase deploy --only functions
//
// Requires the Blaze (pay-as-you-go) plan because these are Firebase Gen 2
// functions. Sending pushes to a project that the tokens were minted for also
// requires the EXPO_ACCESS_TOKEN to authenticate with the Expo Push API.

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');

initializeApp();

const DELIVERY_STATUS_PICKED_UP = 'Picked Up';
const ORDER_STATUS_NEW = 'New';
const REQUEST_STATUS_AWAITING_ACCEPT = 'Awaiting Accept';

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const EXPO_MESSAGE_CHUNK_SIZE = 100;
const EXPO_TOKEN_PREFIX = 'ExponentPushToken';

function formatKES(value) {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  try {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  } catch (error) {
    return `KSh ${amount}`;
  }
}

// ---------------------------------------------------------------------------
// Idempotency guards
// ---------------------------------------------------------------------------
// Every notification is written to notificationEvents/{eventId} BEFORE any
// push is sent. The doc is created with an atomic `create` (fails if it
// already exists), so a duplicate event (Firestore replays the same
// transition, or a retried function invocation) can never double-notify. The
// guard is only deleted when the send throws, leaving the slot free for a
// genuine retry. These docs are written with the admin SDK, which bypasses
// security rules; clients are explicitly denied access in firestore.rules.

async function claimNotificationEvent(eventId) {
  const ref = getFirestore().doc(`notificationEvents/${eventId}`);
  try {
    await ref.create({
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function completeNotificationEvent(eventId) {
  await getFirestore()
    .doc(`notificationEvents/${eventId}`)
    .update({
      status: 'sent',
      sentAt: FieldValue.serverTimestamp(),
    })
    .catch(() => {});
}

async function releaseNotificationEvent(eventId) {
  await getFirestore()
    .doc(`notificationEvents/${eventId}`)
    .delete()
    .catch(() => {});
}

// ---------------------------------------------------------------------------
// Expo Push API
// ---------------------------------------------------------------------------

function isValidExpoToken(token) {
  return typeof token === 'string' && token.startsWith(EXPO_TOKEN_PREFIX);
}

// Sends a batch of Expo push messages (max 100 per HTTP request) and returns
// one result entry per message: { to, status, ...ticketFields }.
async function sendExpoMessages(messages) {
  const results = [];
  const valid = messages.filter((message) => isValidExpoToken(message.to));
  const invalid = messages.filter((message) => !isValidExpoToken(message.to));

  for (const message of invalid) {
    results.push({
      to: message.to,
      status: 'error',
      details: { error: 'InvalidToken' },
    });
  }

  for (let i = 0; i < valid.length; i += EXPO_MESSAGE_CHUNK_SIZE) {
    const chunk = valid.slice(i, i + EXPO_MESSAGE_CHUNK_SIZE);
    let responseBody;
    try {
      const headers = { 'Content-Type': 'application/json' };
      const accessToken = process.env.EXPO_ACCESS_TOKEN;
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const response = await fetch(EXPO_PUSH_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(chunk),
      });
      responseBody = await response.json();
    } catch (error) {
      for (const message of chunk) {
        results.push({
          to: message.to,
          status: 'error',
          details: { error: 'SendFailed', message: error.message },
        });
      }
      continue;
    }

    const tickets = Array.isArray(responseBody?.data) ? responseBody.data : [];
    chunk.forEach((message, index) => {
      results.push({ to: message.to, ...(tickets[index] ?? {}) });
    });
  }

  return results;
}

// Loads the active (enabled) Expo push tokens stored for a user.
async function getActiveTokensForUser(uid) {
  if (!uid) return [];
  const snapshot = await getFirestore()
    .collection('pushTokens')
    .doc(uid)
    .collection('tokens')
    .where('enabled', '==', true)
    .get();
  const tokens = [];
  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    if (isValidExpoToken(data?.token)) {
      tokens.push({ id: docSnapshot.id, token: data.token });
    }
  });
  return tokens;
}

async function deleteToken(uid, tokenDocId) {
  await getFirestore()
    .doc(`pushTokens/${uid}/tokens/${tokenDocId}`)
    .delete()
    .catch(() => {});
}

// Sends a push notification to every stored token of a user. Tokens Expo
// reports as DeviceNotRegistered are removed so dead devices stop receiving
// (and don't clog future sends).
async function sendToUser(uid, { title, body, data }) {
  const tokens = await getActiveTokensForUser(uid);
  if (tokens.length === 0) {
    return;
  }

  const messages = tokens.map(({ token }) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  const results = await sendExpoMessages(messages);
  for (const result of results) {
    if (result?.details?.error === 'DeviceNotRegistered') {
      const match = tokens.find(({ token }) => token === result.to);
      if (match) {
        await deleteToken(uid, match.id);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Triggers
// ---------------------------------------------------------------------------

// 1. A buyer has just placed an order -> notify the vendor.
exports.notifyVendorOnNewOrder = onDocumentCreated(
  'orders/{orderId}',
  async (event) => {
    const order = event.data?.data ? event.data.data() : null;
    if (!order) return;
    if (order.status !== ORDER_STATUS_NEW) return;
    if (!order.vendorUid) return;

    const orderId = event.params.orderId;
    const guardEventId = `new-order:${orderId}`;
    if (!(await claimNotificationEvent(guardEventId))) return;

    try {
      await sendToUser(order.vendorUid, {
        title: 'New Order Received',
        body: `You have received order ${order.orderNumber || orderId} worth ${formatKES(
          order.total
        )}.`,
        data: {
          type: 'new_order',
          role: 'vendor',
          orderId,
        },
      });
      await completeNotificationEvent(guardEventId);
    } catch (error) {
      await releaseNotificationEvent(guardEventId);
      throw error;
    }
  }
);

// 2. A vendor assigned a specific delivery person -> notify only that person.
exports.notifyDeliveryPersonOnRequest = onDocumentCreated(
  'deliveryRequests/{requestId}',
  async (event) => {
    const request = event.data?.data ? event.data.data() : null;
    if (!request) return;
    if (request.status !== REQUEST_STATUS_AWAITING_ACCEPT) return;
    if (!request.deliveryUid) return;

    const requestId = event.params.requestId;
    const guardEventId = `delivery-request:${requestId}`;
    if (!(await claimNotificationEvent(guardEventId))) return;

    try {
      const orderRef =
        request.orderNumber || request.orderId || requestId || 'order';
      const pickup =
        request.pickupLocation ||
        request.vendor?.location ||
        'the vendor store';
      await sendToUser(request.deliveryUid, {
        title: 'New Delivery Request',
        body: `You have been selected to deliver order ${orderRef}. Pickup from ${pickup}.`,
        data: {
          type: 'delivery_request',
          role: 'delivery',
          orderId: request.orderId || null,
          requestId,
        },
      });
      await completeNotificationEvent(guardEventId);
    } catch (error) {
      await releaseNotificationEvent(guardEventId);
      throw error;
    }
  }
);

// 3. A delivery person scanned the parcel as picked up -> notify the buyer.
exports.notifyBuyerOnPickedUp = onDocumentUpdated(
  'orders/{orderId}',
  async (event) => {
    const change = event.data;
    const before = change?.before?.data ? change.before.data() : null;
    const after = change?.after?.data ? change.after.data() : null;
    if (!before || !after) return;
    if (
      before.deliveryStatus === DELIVERY_STATUS_PICKED_UP ||
      after.deliveryStatus !== DELIVERY_STATUS_PICKED_UP
    ) {
      return;
    }
    if (!after.buyerUid) return;

    const orderId = event.params.orderId;
    const guardEventId = `picked-up:${orderId}`;
    if (!(await claimNotificationEvent(guardEventId))) return;

    try {
      await sendToUser(after.buyerUid, {
        title: 'Your Order Has Been Picked Up',
        body: `Order ${after.orderNumber || orderId} has been picked up and is on the way.`,
        data: {
          type: 'order_picked_up',
          role: 'buyer',
          orderId,
        },
      });
      await completeNotificationEvent(guardEventId);
    } catch (error) {
      await releaseNotificationEvent(guardEventId);
      throw error;
    }
  }
);