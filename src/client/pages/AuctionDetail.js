import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AuctionDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuction();
  }, [id]);

  useEffect(() => {
    if (auction) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(auction.end_time).getTime();
        const distance = endTime - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          if (days > 0) {
            setTimeLeft(`${days} days, ${hours} hours, ${minutes} minutes`);
          } else if (hours > 0) {
            setTimeLeft(`${hours} hours, ${minutes} minutes, ${seconds} seconds`);
          } else {
            setTimeLeft(`${minutes} minutes, ${seconds} seconds`);
          }
        } else {
          setTimeLeft('Auction ended');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [auction]);

  const fetchAuction = async () => {
    try {
      const response = await axios.get(`/api/auctions/${id}`);
      setAuction(response.data);
    } catch (error) {
      console.error('Error fetching auction:', error);
      setError('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to place a bid');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= auction.current_price) {
      alert(`Bid must be higher than current price of $${auction.current_price}`);
      return;
    }

    setIsPlacingBid(true);

    try {
      await axios.post(`/api/auctions/${auction.id}/bid`, 
        { bidAmount: parseFloat(bidAmount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      alert('Bid placed successfully!');
      setBidAmount('');
      // Refresh auction data
      fetchAuction();
    } catch (error) {
      console.error('Error placing bid:', error);
      alert(error.response?.data?.message || 'Error placing bid. Please try again.');
    } finally {
      setIsPlacingBid(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading auction details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!auction) {
    return <div className="error">Auction not found</div>;
  }

  const minBidAmount = auction.current_price + 1;
  const isAuctionEnded = timeLeft === 'Auction ended';

  return (
    <div className="auction-detail-page">
      <div className="container">
        <div className="auction-detail">
          <div className="auction-image">
            <img src={auction.image_url} alt={auction.name} />
          </div>
          
          <div className="auction-info">
            <h1>{auction.name}</h1>
            <p className="description">{auction.description}</p>
            
            <div className="auction-stats">
              <div className="stat">
                <label>Current Bid:</label>
                <span className="current-price">${auction.current_price}</span>
              </div>
              
              <div className="stat">
                <label>Starting Price:</label>
                <span>${auction.starting_price}</span>
              </div>
              
              <div className="stat">
                <label>Time Left:</label>
                <span className={isAuctionEnded ? 'ended' : 'active'}>{timeLeft}</span>
              </div>
              
              <div className="stat">
                <label>Total Bids:</label>
                <span>{auction.bid_count}</span>
              </div>
              
              <div className="stat">
                <label>Category:</label>
                <span>{auction.category}</span>
              </div>
              
              <div className="stat">
                <label>Condition:</label>
                <span className="condition-badge">{auction.condition}</span>
              </div>
              
              {auction.seller_username && (
                <div className="stat">
                  <label>Seller:</label>
                  <span>{auction.seller_username}</span>
                </div>
              )}
            </div>

            {!isAuctionEnded && user && (
              <div className="bid-section">
                <h3>Place Your Bid</h3>
                <form onSubmit={handlePlaceBid} className="bid-form">
                  <div className="bid-input-group">
                    <input
                      type="number"
                      step="0.01"
                      min={minBidAmount}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Minimum bid: $${minBidAmount}`}
                      disabled={isPlacingBid}
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={isPlacingBid || !bidAmount}
                      className="bid-button"
                    >
                      {isPlacingBid ? 'Placing Bid...' : 'Place Bid'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!user && !isAuctionEnded && (
              <div className="login-prompt">
                <p>Please <a href="/login">log in</a> to place a bid.</p>
              </div>
            )}

            {isAuctionEnded && (
              <div className="auction-ended">
                <h3>Auction Ended</h3>
                {auction.bids && auction.bids.length > 0 ? (
                  <p>Winning bid: ${auction.bids[0].bid_amount} by {auction.bids[0].username}</p>
                ) : (
                  <p>No bids were placed on this auction.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {auction.bids && auction.bids.length > 0 && (
          <div className="bid-history">
            <h3>Bid History</h3>
            <div className="bids-list">
              {auction.bids.map((bid, index) => (
                <div key={bid.id} className={`bid-item ${index === 0 ? 'highest-bid' : ''}`}>
                  <span className="bid-amount">${bid.bid_amount}</span>
                  <span className="bidder">{bid.username}</span>
                  <span className="bid-time">
                    {new Date(bid.bid_time).toLocaleString()}
                  </span>
                  {index === 0 && <span className="highest-badge">Highest Bid</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionDetail;