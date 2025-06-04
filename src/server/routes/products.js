const express = require('express');
const router = express.Router();

// Mock database for products
let products = [
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
  },
  {
    id: 5,
    name: 'Retro Polaroid Camera',
    price: 75.00,
    description: 'Vintage Polaroid camera in working condition',
    category: 'Electronics',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 6,
    name: 'Mid-Century Coffee Table',
    price: 120.00,
    description: 'Authentic mid-century modern coffee table with minimal wear',
    category: 'Furniture',
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a694?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  }
];

// Get all products
router.get('/', (req, res) => {
  res.json(products);
});

// Get product by ID
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Create a new product
router.post('/', (req, res) => {
  const newProduct = {
    id: products.length + 1,
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: req.body.category,
    condition: req.body.condition,
    imageUrl: req.body.imageUrl || 'https://via.placeholder.com/300'
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update a product
router.put('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  
  const updatedProduct = {
    ...product,
    name: req.body.name || product.name,
    price: req.body.price || product.price,
    description: req.body.description || product.description,
    category: req.body.category || product.category,
    condition: req.body.condition || product.condition,
    imageUrl: req.body.imageUrl || product.imageUrl
  };
  
  products = products.map(p => p.id === parseInt(req.params.id) ? updatedProduct : p);
  res.json(updatedProduct);
});

// Delete a product
router.delete('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  
  products = products.filter(p => p.id !== parseInt(req.params.id));
  res.json({ message: 'Product deleted successfully' });
});

module.exports = router;