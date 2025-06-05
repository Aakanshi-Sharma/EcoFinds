const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.id, p.id as product_id, p.name, p.price, p.image_url, p.description, p.category, p.condition
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to wishlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const productResult = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already in wishlist
    const existingItem = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    if (existingItem.rows.length > 0) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    // Add to wishlist
    await pool.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)',
      [req.user.id, productId]
    );

    res.json({ message: 'Item added to wishlist successfully' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from wishlist
router.delete('/remove/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM wishlist WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    res.json({ message: 'Item removed from wishlist successfully' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    res.json({ inWishlist: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;