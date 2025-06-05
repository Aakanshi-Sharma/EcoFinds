const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.total_amount, o.status, o.shipping_address, o.created_at,
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'product_name', p.name,
                 'product_image', p.image_url,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id, o.total_amount, o.status, o.shipping_address, o.created_at
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Place direct order (single product)
router.post('/place-direct', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { productId, quantity = 1, totalAmount } = req.body;
    const userId = req.user.userId;

    // Validate product exists
    const productResult = await client.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productResult.rows[0];
    const calculatedTotal = product.price * quantity;

    // Verify total amount
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, status, created_at, updated_at) 
       VALUES ($1, $2, 'pending', NOW(), NOW()) 
       RETURNING *`,
      [userId, totalAmount]
    );

    const order = orderResult.rows[0];

    // Create order item
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [order.id, productId, quantity, product.price]
    );

    // Update product clicks (track popularity)
    await client.query(
      'UPDATE products SET clicks = COALESCE(clicks, 0) + 1 WHERE id = $1',
      [productId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order.id,
      order: {
        id: order.id,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.created_at
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error placing direct order:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Place order from cart
router.post('/place', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Get cart items
    const cartResult = await client.query(`
      SELECT c.product_id, c.quantity, p.price, p.name
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `, [req.user.id]);

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = cartResult.rows.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);

    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, totalAmount, shippingAddress]
    );

    const orderId = orderResult.rows[0].id;

    // Create order items
    for (const item of cartResult.rows) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Clear cart
    await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    res.json({ 
      message: 'Order placed successfully',
      orderId: orderId,
      totalAmount: totalAmount
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Get specific order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT o.id, o.total_amount, o.status, o.shipping_address, o.created_at,
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'product_name', p.name,
                 'product_image', p.image_url,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id, o.total_amount, o.status, o.shipping_address, o.created_at
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;