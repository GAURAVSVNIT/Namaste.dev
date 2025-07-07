'use client';

import React from 'react';
import '../static/QuizPromo.css';

const QuizPromo = () => {
  return (
    <div className="quiz-promo-container">
      <div className="quiz-promo-content">
        <h2 className="quiz-promo-title">Take Our Quiz and Win Exciting Coupons and Discounts!</h2>
        <p className="quiz-promo-description">
          Discover your unique fashion style and unlock exclusive rewards! 
          Take our personalized fashion quiz and get instant access to special discounts, 
          limited-time offers, and style recommendations tailored just for you.
        </p>
        <a href="/quiz" className="quiz-cta-button">
          Start Quiz Now
        </a>
      </div>
    </div>
  );
};

export default QuizPromo;
