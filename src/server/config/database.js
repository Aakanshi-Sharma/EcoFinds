const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ecofinds',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        condition VARCHAR(50),
        image_url TEXT,
        user_id INTEGER REFERENCES users(id),
        clicks INTEGER DEFAULT 0,
        sale_type VARCHAR(20) DEFAULT 'fixed_price',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cart table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    // Create wishlist table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create auctions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auctions (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) UNIQUE,
        seller_id INTEGER REFERENCES users(id),
        starting_price DECIMAL(10, 2) NOT NULL,
        current_price DECIMAL(10, 2) NOT NULL,
        reserve_price DECIMAL(10, 2),
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        winner_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bids table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        auction_id INTEGER REFERENCES auctions(id),
        user_id INTEGER REFERENCES users(id),
        bid_amount DECIMAL(10, 2) NOT NULL,
        bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample products if table is empty
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      const sampleProducts = [
        {
          name: 'Vintage Denim Jacket',
          price: 45.99,
          description: 'Classic vintage denim jacket in excellent condition',
          category: 'Clothing',
          condition: 'Good',
          image_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
        },
        {
          name: 'Retro Record Player',
          price: 89.99,
          description: 'Fully functional vintage record player from the 70s',
          category: 'Electronics',
          condition: 'Fair',
          image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
        },
        {
          name: 'Antique Wooden Chair',
          price: 65.00,
          description: 'Beautiful handcrafted wooden chair with intricate details',
          category: 'Furniture',
          condition: 'Excellent',
          image_url: 'https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
        },
        {
          name: 'Vintage Leather Bag',
          price: 35.50,
          description: 'Genuine leather messenger bag with minimal wear',
          category: 'Accessories',
          condition: 'Good',
          image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
        },
        {
          name: 'Retro Polaroid Camera',
          price: 75.00,
          description: 'Vintage Polaroid camera in working condition',
          category: 'Electronics',
          condition: 'Good',
          image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
        },
        {
          name: 'Mid-Century Coffee Table',
          price: 120.00,
          description: 'Authentic mid-century modern coffee table with minimal wear',
          category: 'Furniture',
          condition: 'Excellent',
          image_url: 'https://images.unsplash.com/photo-1532372320572-cda25653a694?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
        }
      ];

      for (const product of sampleProducts) {
        await pool.query(
          'INSERT INTO products (name, price, description, category, condition, image_url, sale_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [product.name, product.price, product.description, product.category, product.condition, product.image_url, product.sale_type || 'fixed_price']
        );
      }
      console.log('Sample products inserted');

      // Add some auction products
      const auctionProducts = [
        {
          name: 'Rare Vintage Watch',
          price: 50.00, // starting price
          description: 'Rare vintage watch from the 1960s, collector\'s item',
          category: 'Accessories',
          condition: 'Good',
          image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
          sale_type: 'auction'
        },
        {
          name: 'Antique Vase',
          price: 25.00, // starting price
          description: 'Beautiful antique ceramic vase with hand-painted details',
          category: 'Home & Garden',
          condition: 'Excellent',
          image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
          sale_type: 'auction'
        }
      ];

      for (const product of auctionProducts) {
        const result = await pool.query(
          'INSERT INTO products (name, price, description, category, condition, image_url, sale_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [product.name, product.price, product.description, product.category, product.condition, product.image_url, product.sale_type]
        );
        
        // Create auction for this product
        const productId = result.rows[0].id;
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + 7); // 7 days from now
        
        await pool.query(
          'INSERT INTO auctions (product_id, starting_price, current_price, end_time) VALUES ($1, $2, $3, $4)',
          [productId, product.price, product.price, endTime]
        );
      }
      console.log('Sample auction products inserted');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = { pool, initializeDatabase };