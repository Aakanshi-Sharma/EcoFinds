const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ecofinds',
  password: 'password',
  port: 5432,
});

async function migrateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migration...');
    
    // Add sale_type column to products table
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS sale_type VARCHAR(20) DEFAULT 'fixed_price'
    `);
    console.log('Added sale_type column to products table');
    
    // Create auctions table
    await client.query(`
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
    console.log('Created auctions table');

    // Create bids table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        auction_id INTEGER REFERENCES auctions(id),
        user_id INTEGER REFERENCES users(id),
        bid_amount DECIMAL(10, 2) NOT NULL,
        bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created bids table');
    
    console.log('Database migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrateDatabase();