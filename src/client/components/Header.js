import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
             <img src={Logo} alt="EcoFinds Logo" className="logo-image" />
        </Link>
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/auctions">🔨 Auctions</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link to="/add-product">Sell Item</Link></li>
                <li><Link to="/orders">📦 Orders</Link></li>
                <li><Link to="/my-bids">💰 My Bids</Link></li>
                <li>
                  <span style={{ color: '#666', marginRight: '1rem' }}>
                    Welcome, {user?.username}!
                  </span>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      color: '#333'
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;