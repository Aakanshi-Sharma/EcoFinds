const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ecofinds',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function addClicksColumn() {
  try {
    // Check if clicks column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='clicks'
    `);

    if (checkColumn.rows.length === 0) {
      // Add clicks column
      await pool.query('ALTER TABLE products ADD COLUMN clicks INTEGER DEFAULT 0');
      console.log('Added clicks column to products table');
    } else {
      console.log('Clicks column already exists');
    }

    await pool.end();
  } catch (error) {
    console.error('Error adding clicks column:', error);
    await pool.end();
  }
}

addClicksColumn();