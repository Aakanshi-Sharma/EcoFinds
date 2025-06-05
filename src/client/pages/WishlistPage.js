import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const WishlistPage = () => {
  const { user } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    }
  }, [user]);

  const fetchWishlistItems = async () => {
    try {
      const response = await axios.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await axios.delete(`/api/wishlist/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchWishlistItems();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post('/api/cart/add', 
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your wishlist</h2>
          <a href="/login" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-8">
          <h2 className="text-xl mb-4">Your wishlist is empty</h2>
          <a href="/products" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Browse Products
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={item.image_url || 'https://via.placeholder.com/300'} 
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl font-bold text-green-600">${item.price}</span>
                  <span className="text-sm text-gray-500">{item.condition}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => addToCart(item.product_id)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => removeFromWishlist(item.id)}
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;