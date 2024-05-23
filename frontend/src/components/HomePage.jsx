import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="left-container">
        <h1 className="welcome-message">Welcome to the Bank</h1>
        <div className="buttons">
          <Link to="/login" className="button">Login</Link>
          <Link to="/register" className="button">Register</Link>
        </div>
      </div>
      <div className="right-container">
        <img src="/bank.jpg" alt="Bank" className="bank-image" />
      </div>
    </div>
  );
};

export default HomePage;
