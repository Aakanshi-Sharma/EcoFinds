const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

<<<<<<< HEAD
// Get featured products (most clicked)
router.get('/featured', async (req, res) => {
  try {
    const { limit = '6' } = req.query;
    const limitNum = parseInt(limit) || 6;

    const query = `
      SELECT 
        p.*, 
        u.username as seller_name,
        a.id as auction_id,
        a.current_price as auction_current_price,
        a.end_time as auction_end_time,
        a.status as auction_status
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN auctions a ON p.id = a.product_id AND a.status = 'active'
      ORDER BY p.clicks DESC, p.created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limitNum]);
    
    const products = result.rows.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      description: product.description,
      category: product.category,
      condition: product.condition,
      imageUrl: product.image_url,
      sellerName: product.seller_name,
      clicks: product.clicks,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      saleType: product.sale_type,
      auction: product.auction_id ? {
        id: product.auction_id,
        currentPrice: parseFloat(product.auction_current_price),
        endTime: product.auction_end_time,
        status: product.auction_status
      } : null
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Internal server error' });
=======
// Mock database for products
let products = [
  {
    id: 1,
    name: 'Vintage Denim Jacket',
    price: 700,
    description: 'Classic vintage denim jacket in excellent condition',
    category: 'Clothing',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 2,
    name: 'Retro Record Player',
    price: 6000,
    description: 'Fully functional vintage record player from the 70s',
    category: 'Electronics',
    condition: 'Fair',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 3,
    name: 'Antique Wooden Chair',
    price: 1650,
    description: 'Beautiful handcrafted wooden chair with intricate details',
    category: 'Furniture',
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 4,
    name: 'Vintage Leather Bag',
    price: 1500,
    description: 'Genuine leather messenger bag with minimal wear',
    category: 'Accessories',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 5,
    name: 'Retro Polaroid Camera',
    price: 2000,
    description: 'Vintage Polaroid camera in working condition',
    category: 'Electronics',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 6,
    name: 'Mid-Century Coffee Table',
    price: 3200,
    description: 'Authentic mid-century modern coffee table with minimal wear',
    category: 'Furniture',
    condition: 'Excellent',
    imageUrl: 'https://assets.wfcdn.com/im/85238002/resize-h1200-w1200%5Ecompr-r85/2922/292290580/George+Oliver+Klever+Mid+Century+Modern+Coffee+Table+%7C+Round+Wooden+Center+Table+with+Storage.jpg'
>>>>>>> a20ecd2d15e6007f8eec4e4d998e263ad7346579
  }
});

// Get all products with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      condition, 
      minPrice, 
      maxPrice, 
      sortBy = 'created_at', 
      sortOrder = 'DESC',
      search,
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT 
        p.*, 
        u.username as seller_name,
        a.id as auction_id,
        a.current_price as auction_current_price,
        a.end_time as auction_end_time,
        a.status as auction_status
      FROM products p 
      LEFT JOIN users u ON p.user_id = u.id 
      LEFT JOIN auctions a ON p.id = a.product_id AND a.status = 'active'
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    // Add filters
    if (category) {
      paramCount++;
      query += ` AND p.category = $${paramCount}`;
      queryParams.push(category);
    }

    if (condition) {
      paramCount++;
      query += ` AND p.condition = $${paramCount}`;
      queryParams.push(condition);
    }

    if (minPrice) {
      paramCount++;
      query += ` AND p.price >= $${paramCount}`;
      queryParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND p.price <= $${paramCount}`;
      queryParams.push(parseFloat(maxPrice));
    }

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Add sorting
    const validSortFields = ['name', 'price', 'created_at', 'updated_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    query += ` ORDER BY p.${sortField} ${sortDirection}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(parseInt(limit));
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM products p WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (category) {
      countParamCount++;
      countQuery += ` AND p.category = $${countParamCount}`;
      countParams.push(category);
    }

    if (condition) {
      countParamCount++;
      countQuery += ` AND p.condition = $${countParamCount}`;
      countParams.push(condition);
    }

    if (minPrice) {
      countParamCount++;
      countQuery += ` AND p.price >= $${countParamCount}`;
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      countParamCount++;
      countQuery += ` AND p.price <= $${countParamCount}`;
      countParams.push(parseFloat(maxPrice));
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (p.name ILIKE $${countParamCount} OR p.description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Format products for frontend compatibility
    const products = result.rows.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      description: product.description,
      category: product.category,
      condition: product.condition,
      imageUrl: product.image_url,
      sellerName: product.seller_name,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      saleType: product.sale_type,
      auction: product.auction_id ? {
        id: product.auction_id,
        currentPrice: parseFloat(product.auction_current_price),
        endTime: product.auction_end_time,
        status: product.auction_status
      } : null
    }));

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get product by ID and increment clicks
router.get('/:id', async (req, res) => {
  try {
    // Increment clicks
    await pool.query('UPDATE products SET clicks = clicks + 1 WHERE id = $1', [req.params.id]);

    const result = await pool.query(
      `SELECT 
        p.*, 
        u.username as seller_name,
        a.id as auction_id,
        a.current_price as auction_current_price,
        a.end_time as auction_end_time,
        a.status as auction_status,
        a.starting_price as auction_starting_price
       FROM products p 
       LEFT JOIN users u ON p.user_id = u.id 
       LEFT JOIN auctions a ON p.id = a.product_id AND a.status = 'active'
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = result.rows[0];
    res.json({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      description: product.description,
      category: product.category,
      condition: product.condition,
      imageUrl: product.image_url,
      sellerName: product.seller_name,
      clicks: product.clicks,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      saleType: product.sale_type,
      auction: product.auction_id ? {
        id: product.auction_id,
        currentPrice: parseFloat(product.auction_current_price),
        startingPrice: parseFloat(product.auction_starting_price),
        endTime: product.auction_end_time,
        status: product.auction_status
      } : null
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new product (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, price, description, category, condition, imageUrl } = req.body;

    if (!name || !price || !category || !condition) {
      return res.status(400).json({ message: 'Name, price, category, and condition are required' });
    }

    const result = await pool.query(
      `INSERT INTO products (name, price, description, category, condition, image_url, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, price, description, category, condition, imageUrl || 'https://via.placeholder.com/300', req.user.userId]
    );

    const product = result.rows[0];
    res.status(201).json({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      description: product.description,
      category: product.category,
      condition: product.condition,
      imageUrl: product.image_url,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a product (requires authentication and ownership)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, price, description, category, condition, imageUrl } = req.body;

    // Check if product exists and user owns it
    const existingProduct = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [req.params.id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (existingProduct.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ message: 'You can only update your own products' });
    }

    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name), 
           price = COALESCE($2, price), 
           description = COALESCE($3, description), 
           category = COALESCE($4, category), 
           condition = COALESCE($5, condition), 
           image_url = COALESCE($6, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [name, price, description, category, condition, imageUrl, req.params.id]
    );

    const product = result.rows[0];
    res.json({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      description: product.description,
      category: product.category,
      condition: product.condition,
      imageUrl: product.image_url,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a product (requires authentication and ownership)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if product exists and user owns it
    const existingProduct = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [req.params.id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (existingProduct.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get categories and conditions for filters
router.get('/meta/filters', async (req, res) => {
  try {
    const categoriesResult = await pool.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
    const conditionsResult = await pool.query('SELECT DISTINCT condition FROM products WHERE condition IS NOT NULL ORDER BY condition');
    
    res.json({
      categories: categoriesResult.rows.map(row => row.category),
      conditions: conditionsResult.rows.map(row => row.condition)
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;