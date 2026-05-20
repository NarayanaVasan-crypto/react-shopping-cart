// src/context/CartContext.jsx
import React, { createContext, useContext, useReducer, useMemo } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
          )
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, qty: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, qty: action.payload.qty } : i
        ).filter(i => i.qty > 0)
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const cartCount = useMemo(() => state.items.reduce((sum, i) => sum + i.qty, 0), [state.items]);
  const cartTotal = useMemo(() => state.items.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2), [state.items]);

  const addItem    = (product) => dispatch({ type: 'ADD_ITEM', payload: product });
  const removeItem = (id)      => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQty  = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  const clearCart  = ()        => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ items: state.items, cartCount, cartTotal, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
