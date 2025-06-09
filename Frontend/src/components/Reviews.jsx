import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Reviews.css';
const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/reviews/my-reviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      
      setReviews(reviews.filter(review => review._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (id) => {
    navigate(`/review/${id}`);
  };

  const handleViewFull = (review) => {
    setSelectedReview(review);
  };

  const handleCloseFullView = () => {
    setSelectedReview(null);
  };

  if (loading) return <div className="loading">Loading reviews...</div>;
  if (error) return <div className="error-message">{error}</div>;

  if (selectedReview) {
    return (
      <div className="reviews-container">
        <div className="reviews-header">
          <h1>Review Details</h1>
          <button className="create-review-btn" onClick={handleCloseFullView}>
            Back to Reviews
          </button>
        </div>
        
        <div className="review-card full-view">
          <div className="review-header">
            <h3>{selectedReview.title}</h3>
            <div className="review-actions">
              <button onClick={() => handleEdit(selectedReview._id)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => handleDelete(selectedReview._id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
          
          <div className="code-snippet">
            <pre>{selectedReview.code}</pre>
          </div>
          
          <div className="review-content">
            <h4>Review:</h4>
            <p>{selectedReview.review}</p>
          </div>
          
          <div className="review-footer">
            <span className="review-date">
              {new Date(selectedReview.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h1>My Reviews</h1>
        <button className="create-review-btn" onClick={() => navigate('/review')}>
          Create New Review
        </button>
      </div>
      
      <div className="reviews-grid">
        {reviews.map(review => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <h3>{review.title}</h3>
              <div className="review-actions">
                <button onClick={() => handleEdit(review._id)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(review._id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
            
            <div className="code-snippet">
              <pre>{review.code.substring(0, 150)}...</pre>
            </div>
            
            <div className="review-content">
              <h4>Review:</h4>
              <p>{review.review.substring(0, 100)}...</p>
            </div>
            
            <div className="review-footer">
              <span className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
              <button onClick={() => handleViewFull(review)} className="view-btn">
                View Full
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews; 