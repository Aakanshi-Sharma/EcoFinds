import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AuctionCard = ({ auction }) => {
  const { user } = useContext(AuthContext);
  const [timeLeft, setTimeLeft] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  useEffect(() => {
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
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      } else {
        setTimeLeft('Auction ended');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.end_time]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please log in to place a bid');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    if (!bidAmount || bidValue <= auction.current_price) {
      alert(`Bid must be higher than current price of $${auction.current_price.toFixed(2)}`);
      return;
    }
    
    if (bidValue < minBidAmount) {
      alert(`Minimum bid is $${minBidAmount.toFixed(2)}`);
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
      // Refresh the page to show updated bid
      window.location.reload();
    } catch (error) {
      console.error('Error placing bid:', error);
      alert(error.response?.data?.message || 'Error placing bid. Please try again.');
    } finally {
      setIsPlacingBid(false);
    }
  };

  const minBidAmount = Math.ceil((auction.current_price + 0.01) * 100) / 100;

  return (
    <div className="auction-card">
      <Link to={`/auctions/${auction.id}`}>
        <img src={auction.image_url} alt={auction.name} />
        <div className="auction-info">
          <h3>{auction.name}</h3>
          <p className="current-price">Current Bid: ${auction.current_price}</p>
          <p className="time-left">{timeLeft}</p>
          <p className="bid-count">{auction.bid_count || 0} bids</p>
          <p className="category">{auction.category}</p>
          <div className="condition-badge">{auction.condition}</div>
        </div>
      </Link>
      
      {timeLeft !== 'Auction ended' && (
        <div className="bid-section" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handlePlaceBid} className="bid-form">
            <input
              type="number"
              step="0.01"
              min={minBidAmount}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Min: $${minBidAmount.toFixed(2)}`}
              disabled={isPlacingBid}
            />
            <button 
              type="submit" 
              disabled={isPlacingBid || !bidAmount}
              className="bid-button"
            >
              {isPlacingBid ? 'Placing...' : 'Place Bid'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuctionCard;