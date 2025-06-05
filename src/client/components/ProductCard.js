import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      window.location.href = '/orders';
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  // If this is an auction item, show auction info instead
  if (product.saleType === 'auction' && product.auction) {
    return (
      <div className="product-card auction-card">
        <Link to={`/auctions/${product.auction.id}`}>
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/300'} 
            alt={product.name} 
            className="product-image" 
          />
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="current-bid" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
              Current Bid: ${product.auction.currentPrice.toFixed(2)}
            </p>
            <p className="product-category">{product.category}</p>
            <span className="product-condition">{product.condition}</span>
            <p style={{ color: '#f39c12', fontWeight: 'bold', marginTop: '0.5rem' }}>
              🔨 AUCTION
            </p>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img 
          src={product.imageUrl || 'https://via.placeholder.com/300'} 
          alt={product.name} 
          className="product-image" 
        />
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p className="product-category">{product.category}</p>
          <span className="product-condition">{product.condition}</span>
          {product.clicks && (
            <p className="text-sm text-gray-500">{product.clicks} views</p>
          )}
        </div>
      </Link>
      
      <div className="product-actions" style={{ padding: '1rem', borderTop: '1px solid #eee' }}>
        <form onSubmit={handleBuyNow} style={{ width: '100%' }}>
          <button 
            type="submit"
            className="btn-primary"
            style={{ 
              width: '100%',
              padding: '0.75rem', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
          >
            Buy Now - ${product.price.toFixed(2)}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductCard;