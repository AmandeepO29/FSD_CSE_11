import React from 'react'

const itemData = [
  {
    id: 1,
    title: 'Casual T-Shirt',
    subtitle: 'Premium cotton t-shirt',
    price: '₹799',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    title: 'Smartphone',
    subtitle: 'Latest Android Smartphone',
    price: '₹24,999',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    title: 'Smart Watch',
    subtitle: 'Fitness and health tracking',
    price: '₹3,999',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 4,
    title: 'Backpack',
    subtitle: 'Lightweight travel backpack',
    price: '₹1,499',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 5,
    title: 'Laptop',
    subtitle: 'Powerful laptop for work and study',
    price: '₹59,999',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 6,
    title: 'Running Shoes',
    subtitle: 'Comfortable sports shoes',
    price: '₹1,999',
    image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 7,
    title: 'Wireless Headphones',
    subtitle: 'Noise cancelling headphones',
    price: '₹2,499',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 8,
    title: 'Camera',
    subtitle: 'Capture every moment',
    price: '₹18,499',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80'
  }
]

const Home = () => {
  return (
    <main className="products-wrapper">
      <div className="products-header">
        <h2>Popular Products</h2>
        <a href="#">Explore our products</a>
      </div>

      <div className="product-grid">
        {itemData.map((item) => (
          <article className="product-card" key={item.id}>
            <div className="product-visual">
              <img src={item.image} alt={item.title} />
            </div>

            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
            <div className="price">{item.price}</div>
            <button type="button" className="add-cart-btn">Add to Cart</button>
          </article>
        ))}
      </div>
    </main>
  )
}

export default Home