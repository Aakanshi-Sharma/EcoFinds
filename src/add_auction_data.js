const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ecofinds',
  password: 'password',
  port: 5432,
});

async function addAuctionData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, add auction products
    const auctionProducts = [
      {
        name: 'Rare Vintage Watch',
        price: 50.00,
        description: 'Rare vintage watch from the 1960s, collector\'s item',
        category: 'Accessories',
        condition: 'Good',
        image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        sale_type: 'auction'
      },
      {
        name: 'Antique Vase',
        price: 25.00,
        description: 'Beautiful antique ceramic vase with hand-painted details',
        category: 'Home & Garden',
        condition: 'Excellent',
        image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        sale_type: 'auction'
      }
    ];

    for (const product of auctionProducts) {
      const result = await client.query(
        'INSERT INTO products (name, price, description, category, condition, image_url, sale_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [product.name, product.price, product.description, product.category, product.condition, product.image_url, product.sale_type]
      );
      
      const productId = result.rows[0].id;
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7); // 7 days from now
      
      await client.query(
        'INSERT INTO auctions (product_id, starting_price, current_price, end_time) VALUES ($1, $2, $3, $4)',
        [productId, product.price, product.price, endTime]
      );
      
      console.log(`Added auction product: ${product.name} (ID: ${productId})`);
    }
    
    await client.query('COMMIT');
    console.log('Auction data added successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding auction data:', error);
  } finally {
    client.release();
    pool.end();
  }
}

addAuctionData();