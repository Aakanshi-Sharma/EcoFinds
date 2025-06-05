import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const CartPage = () => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await axios.put(`/api/cart/update/${itemId}`, 
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`/api/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const placeOrder = async () => {
    if (!shippingAddress.trim()) {
      alert('Please enter a shipping address');
      return;
    }

    try {
      const response = await axios.post('/api/orders/place', 
        { shippingAddress },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      alert(`Order placed successfully! Order ID: ${response.data.orderId}`);
      setCartItems([]);
      setShowCheckout(false);
      setShippingAddress('');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your cart</h2>
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
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <h2 className="text-xl mb-4">Your cart is empty</h2>
          <a href="/products" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/100'} 
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-600">${item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 px-2 py-1 rounded"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-lg font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${getTotalPrice()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${getTotalPrice()}</span>
              </div>
            </div>

            {!showCheckout ? (
              <button 
                onClick={() => setShowCheckout(true)}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Shipping Address</label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your full shipping address..."
                    className="w-full p-3 border rounded-lg"
                    rows="3"
                  />
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={placeOrder}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                  >
                    Place Order
                  </button>
                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Back to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;