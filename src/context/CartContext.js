import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  increaseQuantity: () => {},
  decreaseQuantity: () => {},
  clearCart: () => {},
  subtotal: 0,
  total: 0,
});

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (product, quantity = 1, store = null) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          pricePerKg: product.pricePerKg,
          availableQuantity: product.availableQuantity,
          masterProductId: product.masterProductId ?? null,
          unit: product.unit || 'kg',
          storeId: store?.id ?? product.storeId ?? product.store?.id ?? null,
          storeName: store?.name ?? product.storeName ?? null,
          vendorUid: store?.vendorUid ?? product.vendorUid ?? null,
          vendorName: store?.vendorName ?? product.vendorName ?? null,
          quantity,
        },
      ];
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity < item.availableQuantity
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  const value = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.pricePerKg * item.quantity,
      0
    );
    // The payable total intentionally does NOT include a delivery fee: the
    // delivery fee is paid separately in cash directly to the delivery person
    // and depends on the delivery distance. Packaging is chosen at checkout and
    // added to the order total there, so `total` here equals the product
    // subtotal only.
    const total = subtotal;

    return {
      items,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      subtotal,
      total,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}