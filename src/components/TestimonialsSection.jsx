'use client';

import React, { useState, useEffect } from 'react';
import '../static/TestimonialsSection.css';

const TestimonialsSection = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [reviewText, setReviewText] = useState('');

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (reviewText.trim()) {
      console.log('Review submitted:', { reviewText });
      alert('Thank you for your review!');
      setReviewText('');
    } else {
      alert('Please fill in the review field');
    }
  };

  const testimonials = [
    {
      id: 1,
      quote: "This platform has revolutionized my shopping experience. The curated collections and personalized recommendations have helped me discover my unique style. It's not just shopping, it's a journey of self-expression.",
      author: "Gourav",
      title: "FASHION ENTHUSIAST",
      avatar: "#"
    },
    {
      id: 2,
      quote: "The marketplace feature has been a game-changer for my boutique. The platform connects me with fashion-forward customers who appreciate quality. My sales have increased by over 300% since joining.",
      author: "Manav",
      title: "BOUTIQUE OWNER",
      avatar: "#"
    },
    {
      id: 3,
      quote: "The fashion quiz is incredibly insightful! It helped me understand my style preferences and discover new trends that perfectly match my personality. It's like having a personal stylist in my pocket.",
      author: "Aayush",
      title: "STYLE EXPLORER",
      avatar: "#"
    }
  ];

  return (
    <div className="testimonials-section">
      <h2 className="testimonials-title">Voices of Our Community</h2>
      
      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="testimonial-content">
              <p className="testimonial-quote">“{testimonial.quote}”</p>
              
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
      
      {isClient && (
        <div className="review-submission-section">
          <h3 className="review-form-title">Leave Your Impression</h3>
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="form-group">
              <textarea
                placeholder="Share your experience with us..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="review-textarea"
                rows="4"
                required
              />
            </div>
            <button type="submit" className="submit-review-btn">
              Submit Review
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TestimonialsSection;