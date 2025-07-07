'use client';

import React, { useState } from 'react';
import '../static/TestimonialsSection.css';

const TestimonialsSection = () => {
  const [reviewText, setReviewText] = useState('');
  const [authorName, setAuthorName] = useState('');

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (reviewText.trim() && authorName.trim()) {
      console.log('Review submitted:', { reviewText, authorName });
      alert('Thank you for your review!');
      setReviewText('');
      setAuthorName('');
    } else {
      alert('Please fill in both fields');
    }
  };

  const testimonials = [
    {
      id: 1,
      quote: "FashionHub has revolutionized my shopping experience. The curated collections and personalized recommendations have helped me discover my unique style. It's not just shopping, it's a journey of self-expression.",
      author: "Gourav",
      title: "FASHION ENTHUSIAST",
      avatar: "#"
    },
    {
      id: 2,
      quote: "The marketplace feature has been a game-changer for my boutique business. The platform connects me with fashion-forward customers who appreciate quality. Sales have increased by 300% since joining.",
      author: "Manav",
      title: "BOUTIQUE OWNER",
      avatar: "#"
    },
    {
      id: 3,
      quote: "The fashion quiz feature is incredibly insightful! It helped me understand my style preferences and discover new trends that perfectly match my personality. It's like having a personal stylist in my pocket.",
      author: "Aayush",
      title: "STYLE EXPLORER",
      avatar: "#"
    }
  ];

  return (
    <div className="testimonials-container">
      <h2 className="testimonials-title">What our customers say...</h2>
      
      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="testimonial-content">
              <p className="testimonial-quote">"{testimonial.quote}"</p>
              
              <div className="testimonial-author">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author} 
                  className="author-avatar"
                />
                <div className="author-info">
                  <h4 className="author-name">{testimonial.author}</h4>
                  <p className="author-title">{testimonial.title}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Review Submission Form */}
      <div className="review-submission-section">
        <h3 className="review-form-title">Share Your Experience</h3>
        <form onSubmit={handleSubmitReview} className="review-form">
          {/* <div className="form-group">
            <input
              type="text"
              placeholder="Your Name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="review-input"
              required
            />
          </div> */}
          <div className="form-group">
            <textarea
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="review-textarea"
              rows="4"
              required
            />
          </div>
          <button type="submit" className="submit-review-btn">
            Send Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestimonialsSection;
