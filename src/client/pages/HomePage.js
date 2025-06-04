import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        // Get only the first 4 products for featured section
        setFeaturedProducts(response.data.slice(0, 4));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch featured products');
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      <Hero />
      
      <section>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Featured Products</h2>
          <Link to="/products" style={{ color: '#4CAF50', fontWeight: '500' }}>View All</Link>
        </div>
        
        {loading ? (
          <p>Loading featured products...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
      
      <section style={{ marginTop: '4rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#4CAF50' }}>Why Choose EcoFinds?</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <i className="fas fa-leaf" style={{ fontSize: '2rem', color: '#4CAF50', marginBottom: '1rem' }}></i>
              <h3 style={{ marginBottom: '0.5rem' }}>Eco-Friendly</h3>
              <p>By choosing second-hand items, you're helping reduce waste and conserving resources.</p>
            </div>
            
            <div>
              <i className="fas fa-dollar-sign" style={{ fontSize: '2rem', color: '#4CAF50', marginBottom: '1rem' }}></i>
              <h3 style={{ marginBottom: '0.5rem' }}>Budget-Friendly</h3>
              <p>Get quality items at a fraction of their original price, saving money while shopping responsibly.</p>
            </div>
            
            <div>
              <i className="fas fa-gem" style={{ fontSize: '2rem', color: '#4CAF50', marginBottom: '1rem' }}></i>
              <h3 style={{ marginBottom: '0.5rem' }}>Unique Finds</h3>
              <p>Discover one-of-a-kind treasures that you won't find in regular stores.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;