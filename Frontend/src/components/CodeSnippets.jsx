import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/CodeSnippets.css';

const CodeSnippets = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    code: '',
    language: 'javascript',
    description: ''
  });

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/snippets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnippets(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching snippets:', error);
      setError('Failed to load code snippets');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewSnippet({
      ...newSnippet,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/snippets', newSnippet, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddForm(false);
      setNewSnippet({
        title: '',
        code: '',
        language: 'javascript',
        description: ''
      });
      fetchSnippets();
    } catch (error) {
      console.error('Error creating snippet:', error);
      setError('Failed to create code snippet');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/snippets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSnippets();
    } catch (error) {
      console.error('Error deleting snippet:', error);
      setError('Failed to delete code snippet');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="snippets-container">
      <div className="snippets-header">
        <h2>My Code Snippets</h2>
        <button 
          className="add-snippet-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New Snippet'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="snippet-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newSnippet.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              name="language"
              value={newSnippet.language}
              onChange={handleInputChange}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="code">Code</label>
            <textarea
              id="code"
              name="code"
              value={newSnippet.code}
              onChange={handleInputChange}
              required
              rows="10"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newSnippet.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <button type="submit" className="save-btn">Save Snippet</button>
        </form>
      )}

      <div className="snippets-grid">
        {snippets.map(snippet => (
          <div key={snippet._id} className="snippet-card">
            <div className="snippet-header">
              <h3>{snippet.title}</h3>
              <span className="language-badge">{snippet.language}</span>
            </div>
            <pre className="code-preview">
              <code>{snippet.code.substring(0, 150)}...</code>
            </pre>
            {snippet.description && (
              <p className="snippet-description">{snippet.description}</p>
            )}
            <div className="snippet-actions">
              <Link to={`/snippets/${snippet._id}`} className="view-btn">
                View Full
              </Link>
              <button
                onClick={() => handleDelete(snippet._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {snippets.length === 0 && !showAddForm && (
        <div className="no-snippets">
          <p>You haven't saved any code snippets yet.</p>
          <button 
            className="add-snippet-btn"
            onClick={() => setShowAddForm(true)}
          >
            Add Your First Snippet
          </button>
        </div>
      )}
    </div>
  );
};

export default CodeSnippets; 