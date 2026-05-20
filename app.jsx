// src/App.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import './App.css';

// ─── Product Card ────────────────────────────────────────────────
const ProductCard = memo(({ product }) => {
  const { addItem, items } = useCart();
  const inCart = items.some(i => i.id === product.id);

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <img src={product.image} alt={product.title} loading="lazy" />
      </div>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-title">{product.title}</h3>
        <div className="product-footer">
          <span className="product-price">${product.price}</span>
          <div className="product-rating">⭐ {product.rating.rate} ({product.rating.count})</div>
        </div>
        <button
          className={`add-btn ${inCart ? 'in-cart' : ''}`}
          onClick={() => addItem(product)}
        >
          {inCart ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
});

// ─── Cart Sidebar ─────────────────────────────────────────────────
const CartSidebar = ({ onClose }) => {
  const { items, cartTotal, removeItem, updateQty, clearCart } = useCart();
  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {items.length === 0 ? (
          <div className="cart-empty">🛒 Your cart is empty</div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.title} />
                  <div className="cart-item-info">
                    <p className="cart-item-title">{item.title.slice(0, 40)}…</p>
                    <p className="cart-item-price">${(item.price * item.qty).toFixed(2)}</p>
                    <div className="qty-controls">
                      <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      <button className="remove-btn" onClick={() => removeItem(item.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total">Total: <strong>${cartTotal}</strong></div>
              <button className="checkout-btn">Checkout</button>
              <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────
const ShopApp = () => {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActive] = useState('all');
  const [loading, setLoading]       = useState(true);
  const [cartOpen, setCartOpen]     = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    Promise.all([
      fetch('https://fakestoreapi.com/products').then(r => r.json()),
      fetch('https://fakestoreapi.com/products/categories').then(r => r.json())
    ]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(['all', ...cats]);
      setLoading(false);
    });
  }, []);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="app">
      <nav className="navbar">
        <h1 className="logo">🛍 ShopReact</h1>
        <button className="cart-btn" onClick={() => setCartOpen(true)}>
          🛒 Cart {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
      </nav>

      <div className="category-bar">
        {categories.map(cat => (
          <button
            key={cat}
            className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActive(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading products…</div>
      ) : (
        <div className="products-grid">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />}
    </div>
  );
};

export default () => (
  <CartProvider>
    <ShopApp />
  </CartProvider>
);
