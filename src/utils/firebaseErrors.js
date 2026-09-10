// Maps Firebase Authentication error codes to user-friendly messages.
// Custom app codes (thrown by AuthContext) are handled too.
const errorMessages = {
  'auth/invalid-email': 'The email address is not valid. Please check it and try again.',
  'auth/missing-password': 'Please enter your password.',
  'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
  'auth/user-not-found': 'No account found with this email. Please create an account.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-login-credentials': 'Incorrect email or password.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled yet.',
  'auth/requires-recent-login': 'Please log in again before trying this.',
  'auth/expired-action-code': 'This reset link is expired. Please request a new one.',
  'no-profile':
    'No profile was found for this account. Please create a new account from the Register screen.',
  'invalid-role': 'This account does not have a valid role set. Please contact support.',
};

export function getAuthErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  const message = errorMessages[error.code] || errorMessages[error.message] || error.message;
  return message || fallback;
}