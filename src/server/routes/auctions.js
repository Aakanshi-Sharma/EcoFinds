const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all active auctions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        p.name,
        p.description,
        p.category,
        p.condition,
        p.image_url,
        u.username as seller_username,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count,
        (SELECT bid_amount FROM bids WHERE auction_id = a.id ORDER BY bid_amount DESC LIMIT 1) as highest_bid
      FROM auctions a
      JOIN products p ON a.product_id = p.id
      LEFT JOIN users u ON a.seller_id = u.id
      WHERE a.status = 'active' AND a.end_time > NOW()
      ORDER BY a.end_time ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ message: 'Error fetching auctions' });
  }
});

// Get auction by ID with bid history
router.get('/:id', async (req, res) => {
  try {
    const auctionId = req.params.id;
    
    // Get auction details
    const auctionResult = await pool.query(`
      SELECT 
        a.*,
        p.name,
        p.description,
        p.category,
        p.condition,
        p.image_url,
        u.username as seller_username
      FROM auctions a
      JOIN products p ON a.product_id = p.id
      LEFT JOIN users u ON a.seller_id = u.id
      WHERE a.id = $1
    `, [auctionId]);
    
    if (auctionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    // Get bid history
    const bidsResult = await pool.query(`
      SELECT 
        b.*,
        u.username
      FROM bids b
      JOIN users u ON b.user_id = u.id
      WHERE b.auction_id = $1
      ORDER BY b.bid_amount DESC, b.bid_time DESC
    `, [auctionId]);
    
    const auction = auctionResult.rows[0];
    auction.bids = bidsResult.rows;
    auction.bid_count = bidsResult.rows.length;
    auction.highest_bid = bidsResult.rows.length > 0 ? bidsResult.rows[0].bid_amount : auction.starting_price;
    
    res.json(auction);
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({ message: 'Error fetching auction' });
  }
});

// Place a bid
router.post('/:id/bid', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const auctionId = req.params.id;
    const { bidAmount } = req.body;
    const userId = req.user.userId;
    
    // Validate bid amount
    if (!bidAmount || bidAmount <= 0) {
      return res.status(400).json({ message: 'Invalid bid amount' });
    }
    
    // Get auction details
    const auctionResult = await client.query(`
      SELECT * FROM auctions WHERE id = $1 AND status = 'active' AND end_time > NOW()
    `, [auctionId]);
    
    if (auctionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Auction not found or has ended' });
    }
    
    const auction = auctionResult.rows[0];
    
    // Check if user is the seller
    if (auction.seller_id === userId) {
      return res.status(400).json({ message: 'You cannot bid on your own auction' });
    }
    
    // Check if bid is higher than current price
    if (bidAmount <= auction.current_price) {
      return res.status(400).json({ 
        message: `Bid must be higher than current price of $${auction.current_price}` 
      });
    }
    
    // Get user's highest bid for this auction
    const userBidResult = await client.query(`
      SELECT MAX(bid_amount) as highest_bid FROM bids WHERE auction_id = $1 AND user_id = $2
    `, [auctionId, userId]);
    
    const userHighestBid = userBidResult.rows[0].highest_bid || 0;
    
    // Check if user is already the highest bidder
    const highestBidResult = await client.query(`
      SELECT user_id FROM bids WHERE auction_id = $1 ORDER BY bid_amount DESC LIMIT 1
    `, [auctionId]);
    
    if (highestBidResult.rows.length > 0 && highestBidResult.rows[0].user_id === userId) {
      return res.status(400).json({ message: 'You are already the highest bidder' });
    }
    
    // Insert new bid
    await client.query(`
      INSERT INTO bids (auction_id, user_id, bid_amount) VALUES ($1, $2, $3)
    `, [auctionId, userId, bidAmount]);
    
    // Update auction current price
    await client.query(`
      UPDATE auctions SET current_price = $1 WHERE id = $2
    `, [bidAmount, auctionId]);
    
    await client.query('COMMIT');
    
    res.json({ 
      message: 'Bid placed successfully',
      bidAmount: bidAmount,
      auctionId: auctionId
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error placing bid:', error);
    res.status(500).json({ message: 'Error placing bid' });
  } finally {
    client.release();
  }
});

// Create a new auction
router.post('/create', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { productId, startingPrice, reservePrice, duration } = req.body;
    const sellerId = req.user.userId;
    
    // Validate input
    if (!productId || !startingPrice || !duration) {
      return res.status(400).json({ message: 'Product ID, starting price, and duration are required' });
    }
    
    // Check if product exists and belongs to user
    const productResult = await client.query(`
      SELECT * FROM products WHERE id = $1 AND user_id = $2
    `, [productId, sellerId]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or you do not own this product' });
    }
    
    // Check if auction already exists for this product
    const existingAuction = await client.query(`
      SELECT id FROM auctions WHERE product_id = $1 AND status = 'active'
    `, [productId]);
    
    if (existingAuction.rows.length > 0) {
      return res.status(400).json({ message: 'An active auction already exists for this product' });
    }
    
    // Calculate end time
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + parseInt(duration));
    
    // Create auction
    const auctionResult = await client.query(`
      INSERT INTO auctions (product_id, seller_id, starting_price, current_price, reserve_price, end_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [productId, sellerId, startingPrice, startingPrice, reservePrice, endTime]);
    
    // Update product sale type
    await client.query(`
      UPDATE products SET sale_type = 'auction' WHERE id = $1
    `, [productId]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Auction created successfully',
      auctionId: auctionResult.rows[0].id
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating auction:', error);
    res.status(500).json({ message: 'Error creating auction' });
  } finally {
    client.release();
  }
});

// Get user's bids
router.get('/user/bids', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query(`
      SELECT 
        b.*,
        a.end_time,
        a.status as auction_status,
        a.current_price,
        p.name as product_name,
        p.image_url,
        (SELECT MAX(bid_amount) FROM bids WHERE auction_id = a.id) as highest_bid,
        (SELECT user_id FROM bids WHERE auction_id = a.id ORDER BY bid_amount DESC LIMIT 1) as highest_bidder_id
      FROM bids b
      JOIN auctions a ON b.auction_id = a.id
      JOIN products p ON a.product_id = p.id
      WHERE b.user_id = $1
      ORDER BY b.bid_time DESC
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user bids:', error);
    res.status(500).json({ message: 'Error fetching user bids' });
  }
});

module.exports = router;