import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBuyNow = async () => {
    if (!user) {
      alert('Please log in to purchase items');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to buy "${product.name}" for $${product.price.toFixed(2)}?`);
    
    if (!confirmed) return;

    try {
      const response = await axios.post('/api/orders/place-direct', 
        { 
          productId: product.id, 
          quantity: 1,
          totalAmount: product.price
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      alert(`Order placed successfully! Order ID: ${response.data.orderId}`);
      
      // Redirect to orders page
      window.location.href = '/orders';
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading product details...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', color: '#4CAF50' }}>
          <i className="fas fa-arrow-left" style={{ marginRight: '0.5rem' }}></i> Back to Products
        </Link>
      </div>
      
      <div className="product-detail">
        <div>
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="product-detail-image" 
          />
        </div>
        
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p className="product-detail-price">${product.price.toFixed(2)}</p>
          
          <div className="product-meta">
            <span className="product-meta-item">
              <i className="fas fa-tag" style={{ marginRight: '0.5rem' }}></i>
              {product.category}
            </span>
            <span className="product-meta-item">
              <i className="fas fa-star" style={{ marginRight: '0.5rem' }}></i>
              {product.condition}
            </span>
          </div>
          
          <p className="product-detail-description">{product.description}</p>
          
          <div style={{ marginTop: '2rem' }}>
            <button 
              onClick={handleBuyNow}
              className="btn" 
              style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                padding: '1rem 3rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              <i className="fas fa-shopping-bag" style={{ marginRight: '0.5rem' }}></i>
              Buy Now - ${product.price.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;