import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await axios.get('/api/auctions');
      setAuctions(response.data);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setError('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading auctions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="auctions-page">
      <div className="container">
        <div className="page-header">
          <h1>Live Auctions</h1>
          <p>Bid on unique items and find great deals!</p>
        </div>

        {auctions.length === 0 ? (
          <div className="no-auctions">
            <h3>No active auctions at the moment</h3>
            <p>Check back later for new auction items!</p>
          </div>
        ) : (
          <div className="auctions-grid">
            {auctions.map(auction => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions;