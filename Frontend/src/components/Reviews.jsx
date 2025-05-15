import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (selectedLanguage === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(review => review.language === selectedLanguage));
    }
  }, [selectedLanguage, reviews]);

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
      setFilteredReviews(data);
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

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  if (loading) return <div className="loading">Loading reviews...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h1>My Reviews</h1>
        <div className="reviews-controls">
          <div className="language-filter">
            <label htmlFor="language-filter">Filter by Language:</label>
            <select 
              id="language-filter" 
              value={selectedLanguage} 
              onChange={handleLanguageChange}
            >
              <option value="all">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>
          <button className="create-review-btn" onClick={() => navigate('/review')}>
            Create New Review
          </button>
        </div>
      </div>
      
      <div className="reviews-grid">
        {filteredReviews.length > 0 ? (
          filteredReviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <h3>{review.title || 'Untitled Review'}</h3>
                <div className="review-actions">
                  <button onClick={() => handleEdit(review._id)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(review._id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="review-language">
                <span className="language-badge">{review.language || 'Unknown'}</span>
              </div>
              
              <div className="code-snippet">
                <pre>{review.code}</pre>
              </div>
              
              <div className="review-content">
                <h4>Review:</h4>
                <p>{review.review}</p>
              </div>
              
              <div className="review-footer">
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-reviews">
            <p>No reviews found for the selected language.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews; 