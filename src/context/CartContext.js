import React, { createContext, useContext, useMemo, useState } from 'react';

const DELIVERY_FEE_PLACEHOLDER = 150;

const CartContext = createContext({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  increaseQuantity: () => {},
  decreaseQuantity: () => {},
  clearCart: () => {},
  subtotal: 0,
  deliveryFee: DELIVERY_FEE_PLACEHOLDER,
  total: 0,
});

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (product, quantity = 1) => {
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
    // Price calculations are kept here so they can later become real dynamic
    // calculations (e.g. per-store delivery fees, discounts, taxes).
    const deliveryFee = DELIVERY_FEE_PLACEHOLDER;
    const total = subtotal + deliveryFee;

    return {
      items,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      subtotal,
      deliveryFee,
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