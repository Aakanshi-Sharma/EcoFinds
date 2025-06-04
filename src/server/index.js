const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 12000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/products', productRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../../dist')));

// Serve index.html for client-side routing
const clientRoutes = ['/', '/products', '/products/:id', '/about', '/contact'];
clientRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
});

// Sample data for testing
const sampleProducts = [
  {
    id: 1,
    name: 'Vintage Denim Jacket',
    price: 45.99,
    description: 'Classic vintage denim jacket in excellent condition',
    category: 'Clothing',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 2,
    name: 'Retro Record Player',
    price: 89.99,
    description: 'Fully functional vintage record player from the 70s',
    category: 'Electronics',
    condition: 'Fair',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 3,
    name: 'Antique Wooden Chair',
    price: 65.00,
    description: 'Beautiful handcrafted wooden chair with intricate details',
    category: 'Furniture',
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 4,
    name: 'Vintage Leather Bag',
    price: 35.50,
    description: 'Genuine leather messenger bag with minimal wear',
    category: 'Accessories',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  }
];

// API endpoint to get sample data
app.get('/api/sample-products', (req, res) => {
  res.json(sampleProducts);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});