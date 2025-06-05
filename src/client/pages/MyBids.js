import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MyBids = () => {
  const { user } = useContext(AuthContext);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchMyBids();
    }
  }, [user]);

  const fetchMyBids = async () => {
    try {
      const response = await axios.get('/api/auctions/user/bids', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
      setError('Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="my-bids-page">
        <div className="container">
          <h1>My Bids</h1>
          <p>Please <Link to="/login">log in</Link> to view your bids.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading your bids...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const groupedBids = bids.reduce((acc, bid) => {
    if (!acc[bid.auction_id]) {
      acc[bid.auction_id] = {
        auction_id: bid.auction_id,
        product_name: bid.product_name,
        image_url: bid.image_url,
        auction_status: bid.auction_status,
        current_price: bid.current_price,
        end_time: bid.end_time,
        highest_bid: bid.highest_bid,
        highest_bidder_id: bid.highest_bidder_id,
        my_bids: []
      };
    }
    acc[bid.auction_id].my_bids.push(bid);
    return acc;
  }, {});

  const auctionBids = Object.values(groupedBids);

  return (
    <div className="my-bids-page">
      <div className="container">
        <h1>My Bids</h1>
        
        {auctionBids.length === 0 ? (
          <div className="no-bids">
            <h3>You haven't placed any bids yet</h3>
            <p><Link to="/auctions">Browse active auctions</Link> to start bidding!</p>
          </div>
        ) : (
          <div className="bids-list">
            {auctionBids.map(auctionBid => {
              const isWinning = auctionBid.highest_bidder_id === user.userId;
              const isEnded = new Date(auctionBid.end_time) < new Date();
              const myHighestBid = Math.max(...auctionBid.my_bids.map(b => b.bid_amount));
              
              return (
                <div key={auctionBid.auction_id} className="bid-group">
                  <div className="auction-summary">
                    <img src={auctionBid.image_url} alt={auctionBid.product_name} />
                    <div className="auction-details">
                      <h3>
                        <Link to={`/auctions/${auctionBid.auction_id}`}>
                          {auctionBid.product_name}
                        </Link>
                      </h3>
                      <div className="bid-status">
                        {isEnded ? (
                          isWinning ? (
                            <span className="status won">🎉 You Won!</span>
                          ) : (
                            <span className="status lost">Auction Ended</span>
                          )
                        ) : (
                          isWinning ? (
                            <span className="status winning">🔥 You're Winning!</span>
                          ) : (
                            <span className="status outbid">Outbid</span>
                          )
                        )}
                      </div>
                      <div className="price-info">
                        <span>Current Price: ${auctionBid.current_price}</span>
                        <span>Your Highest Bid: ${myHighestBid}</span>
                      </div>
                      {!isEnded && (
                        <div className="time-left">
                          Ends: {new Date(auctionBid.end_time).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="my-bid-history">
                    <h4>Your Bids ({auctionBid.my_bids.length})</h4>
                    <div className="bid-items">
                      {auctionBid.my_bids
                        .sort((a, b) => new Date(b.bid_time) - new Date(a.bid_time))
                        .map(bid => (
                          <div key={bid.id} className="bid-item">
                            <span className="amount">${bid.bid_amount}</span>
                            <span className="time">
                              {new Date(bid.bid_time).toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBids;