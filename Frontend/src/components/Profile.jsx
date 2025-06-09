import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currentPassword: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        password: '',
        currentPassword: ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Update profile information
      const updates = { ...formData };
      if (!updates.password) {
        delete updates.password;
        delete updates.currentPassword;
      }

      const profileResponse = await axios.patch('http://localhost:3000/api/profile', updates, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Upload profile picture if selected
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);

        await axios.post('http://localhost:3000/api/profile/upload-picture', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setSuccess('Profile updated successfully');
      setIsEditing(false);
      await fetchUserProfile(); // Refresh user data
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || error.message || 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className='profile_page'>
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-picture">
            <img 
              src={user.profilePicture ? `http://localhost:3000${user.profilePicture}` : '/default-profile.svg'} 
              alt="Profile" 
              className="profile-image"
            />
            {isEditing && (
              <div className="profile-picture-upload">
                <label htmlFor="profile-picture-input" className="upload-button">
                  Change Picture
                </label>
                <input 
                  id="profile-picture-input" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleProfilePictureChange} 
                  style={{ display: 'none' }} 
                />
              </div>
            )}
          </div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-content">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password (required for password change)</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-actions">
              <button 
                className="btn btn-primary" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 