const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image_url, p.description
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists
    const productResult = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already in cart
    const existingItem = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;
      await pool.query(
        'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
        [newQuantity, req.user.id, productId]
      );
    } else {
      // Add new item
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [req.user.id, productId, quantity]
      );
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const result = await pool.query(
      'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;