import React from 'react'

const Header = () => {
  return (
    <header className="top-header">
      <div className="brand">FashionAdda</div>

      <div className="search-wrap">
        <input type="text" placeholder="Search for products..." />
        <button type="button" aria-label="Search">⌕</button>
      </div>

      <div className="cart-button">
        <span className="cart-icon">🛒</span>
        <span>Cart (0)</span>
      </div>
    </header>
  )
}

export default Header