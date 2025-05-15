import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Navigation = ({ isAuthenticated, user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Code Reviewer</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/review">Code Review</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/snippets">Code Snippets</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/reviews">My Reviews</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">Sign Up</Link>
                </li>
              </>
            )}
          </ul>
          
          {isAuthenticated && (
            <div className="profile-dropdown" ref={dropdownRef}>
              <div className="profile-picture-container" onClick={toggleDropdown}>
                <img 
                  src={user?.profilePicture ? `http://localhost:3000${user.profilePicture}` : '/default-profile.svg'} 
                  alt="Profile" 
                  className="profile-picture"
                />
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu show">
                  <Link className="dropdown-item" to="/profile">Profile</Link>
                  <button className="dropdown-item" onClick={onLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 