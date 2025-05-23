import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navigation from "./components/Navigation";
import Profile from './components/Profile';
import CodeSnippets from './components/CodeSnippets';
import Reviews from './components/Reviews';
import CodeReviewer from './components/CodeReviewer';

// API base URL
const API_BASE_URL = 'https://vercel.com/adarsh-dubeys-projects-49f9603a/ai-code-reviewer-mw13/46pXTRwp8cP5ifAuDsZPryzDJuDg';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function LandingPage() {
  const token = localStorage.getItem('token');
  
  return (
    <div className="landing-container">
      <div className="overlay"></div>
      <div className="left-images">
        <img src="/images/code2.png" alt="Code Sample 2" className="code-image" />
      </div>
      <div className="content">
        <h1>Welcome to Code Reviewer</h1>
        <p>Analyze your code with AI-powered reviews.</p>
        <div className="button-group">
          {token ? (
            <Link to="/review" className="btn btn-primary me-2">Go to Code Reviewer</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary me-2">Login</Link>
              <Link to="/signup" className="btn btn-outline-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('User data:', response.data); // Debug log
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Navigation isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
            <Route path="/snippets" element={isAuthenticated ? <CodeSnippets /> : <Navigate to="/login" />} />
            <Route 
              path="/review" 
              element={
                <ProtectedRoute>
                  <CodeReviewer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reviews" 
              element={
                <ProtectedRoute>
                  <Reviews />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
