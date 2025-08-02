'use client';

import React, { useState, useEffect } from 'react';
import { getUserById } from '@/lib/user';
import { useAuth } from "@/hooks/useAuth";
import '../static/TestimonialsSection.css';

const TestimonialsSection = () => {
  const [isClient, setIsClient] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserProfile();
      console.log("Logged-in user info:", user);
    }
  }, [authLoading, user]);

  const fetchUserProfile = async () => {
      try {
        const profile = await getUserById(user.uid);
        setUserProfile(profile);
        console.log("User Profile: ",profile)
      } 
      catch (error) {
        console.error('Error loading user profile:', error);
      }
    }


  const [reviewText, setReviewText] = useState('');

  const handleSubmitReview = async (e) => {
  e.preventDefault();
  if (!reviewText.trim()) {
    alert('Please fill in the review field');
    return;
  }

  try {
    await fetch('https://script.google.com/macros/s/AKfycbx88OcHe1xhSD2QqJKib1S-2qJVyddMSbTcJQ8AnMjrC-CiasdD-OmE343cyjXpSYTGHw/exec', {
      method: 'POST',
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user?.displayName || 'Anonymous',
        title: userProfile?.role || 'user',
        feedback: reviewText.trim(),
        toShow: '0',
        timestamp: new Date().toISOString(),
      }),
    });


    alert('Thank you for your review!');
    setReviewText('');
  } catch (error) {
    console.error('Submission failed:', error);
    alert('Something went wrong. Please try again.');
  }
};



  const testimonials = [
    {
      id: 1,
      quote: "This platform has revolutionized my shopping experience. The curated collections and personalized recommendations have helped me discover my unique style. It's not just shopping, it's a journey of self-expression.",
      author: "Gourav",
      title: "FASHION ENTHUSIAST",
      avatar: "anything"
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
    },
    {
      id: 4,
      quote: "Avtarra is amazing! I created a stylish avatar with cool outfits and realistic expressions. The 3D download option is a great bonus. Also, Zyra, the AI fashion designer, gave me really helpful style suggestions. Loved the overall experience!",
      author: "Arshad",
      title: "FASHION EXPERT",
      avatar: "#"
    }
  ];


  return (
    <div id="testimonials" className="testimonials-section">
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
        <div id="leave-impression" className="review-submission-section">
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