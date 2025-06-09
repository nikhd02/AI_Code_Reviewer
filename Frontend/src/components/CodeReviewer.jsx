import { useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import axios from 'axios';
import './CodeReviewer.css';

const CodeReviewer = () => {
  const [code, setCode] = useState('// Enter your code here\nfunction example() {\n  console.log("Hello, world!");\n}');
  const [review, setReview] = useState('');
  const [score, setScore] = useState(null);
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('javascript');

  const reviewCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to review');
      return;
    }

    setLoading(true);
    setError('');
    setReview('');
    setScore(null);
    setGrade('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to use the code reviewer');
      }

      const response = await axios.post(
        'http://localhost:3000/api/ai/get-review',
        { code, language },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('API Response:', response.data); // Debug log

      if (response.data && typeof response.data.review === 'string') {
        const newScore = response.data.score;
        const newGrade = response.data.grade;
        
        console.log('Setting new score:', newScore);
        console.log('Setting new grade:', newGrade);
        
        setReview(response.data.review);
        setScore(newScore);
        setGrade(newGrade);
      } else if (typeof response.data === 'string') {
        setReview(response.data);
      } else {
        throw new Error('Invalid review format received');
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.status === 401) {
        setError('Please login to use the code reviewer');
      } else {
        setError(err.response?.data?.error || 'Failed to generate code review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    console.log('Calculating color for score:', score); // Debug log
    if (score === null || score === undefined) return '#F44336';
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#8BC34A';
    if (score >= 70) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <main>
      <div className="left">
        <div className="language-selector">
          <label htmlFor="language">Language:</label>
          <select 
            id="language" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
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
        <div className="code">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="code-editor"
            spellCheck="false"
          />
        </div>
        <button className="review" onClick={reviewCode} disabled={loading}>
          {loading ? 'Reviewing...' : 'Review Code'}
        </button>
      </div>
      <div className="right">
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div className="loading-message">Generating code review...</div>
        ) : (
          review && (
            <div className="review-content">
              {score !== null && (
                <div className="score-container">
                  <div 
                    className="score-display" 
                    style={{ 
                      backgroundColor: getScoreColor(score),
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <div className="score-value">{score}%</div>
                    <div className="score-grade">{grade}</div>
                  </div>
                  <div className="score-details">
                    <div className="score-label">Code Quality Score</div>
                    <div className="score-description">
                      {score >= 90 ? 'Excellent' :
                       score >= 80 ? 'Very Good' :
                       score >= 70 ? 'Good' :
                       score >= 60 ? 'Fair' :
                       'Needs Improvement'}
                    </div>
                  </div>
                </div>
              )}
              <div className="markdown-content">
                <Markdown rehypePlugins={[rehypeHighlight]}>
                  {review}
                </Markdown>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
};

export default CodeReviewer; 