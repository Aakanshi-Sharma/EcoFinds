import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProductDetailPage = () => {
  const { id } = useParams();
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
          
          <button className="btn" style={{ marginRight: '1rem' }}>
            <i className="fas fa-shopping-cart" style={{ marginRight: '0.5rem' }}></i>
            Add to Cart
          </button>
          
          <button className="btn" style={{ backgroundColor: '#f44336' }}>
            <i className="fas fa-heart" style={{ marginRight: '0.5rem' }}></i>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;