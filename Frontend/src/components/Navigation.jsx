import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = ({ isAuthenticated, user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Code Reviewer</Link>
      </div>

      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        {isAuthenticated ? (
          <>
            <Link to="/review">Code Review</Link>
            <Link to="/snippets">Code Snippets</Link>
            <Link to="/reviews">My Reviews</Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
        
        {isAuthenticated && (
          <div className="profile-dropdown" ref={dropdownRef}>
            <div className="profile-picture-container" onClick={toggleDropdown}>
              <img 
                src={user?.profilePicture ? `http://localhost:3000${user.profilePicture}` : '/default-profile.svg'} 
                alt="Profile" 
                className="nav-profile-image"
              />
            </div>
            {dropdownOpen && (
              <div className="dropdown-menu show">
                <Link to="/profile">Profile</Link>
                <button onClick={onLogout} className="logout-btn">Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 