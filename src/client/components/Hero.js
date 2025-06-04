import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero">
      <h1>Sustainable Shopping for a Better Tomorrow</h1>
      <p>
        Discover unique second-hand treasures that are good for your wallet and the planet.
        Join the circular economy movement with EcoFinds.
      </p>
      <Link to="/products" className="btn">Browse Products</Link>
    </section>
  );
};

export default Hero;