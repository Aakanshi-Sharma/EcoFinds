import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="product-image" 
        />
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">₹{product.price.toFixed(0)}</p>
          <p className="product-category">{product.category}</p>
          <span className="product-condition">{product.condition}</span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;