import React from 'react'

const categories = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Shoes', icon: '👟' },
  { name: 'Home', icon: '🏠' },
  { name: 'Accessories', icon: '⌚' }
]

const Navbar = () => {
  return (
    <nav className="category-bar" aria-label="Product categories">
      {categories.map((category) => (
        <div className="category-item" key={category.name}>
          <div className="category-icon">{category.icon}</div>
          <span>{category.name}</span>
        </div>
      ))}
    </nav>
  )
}

export default Navbar