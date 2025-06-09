const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -tokens');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Update user profile
router.patch('/', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates!' });
  }
  
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Handle password update separately
    if (updates.includes('password')) {
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    updates.forEach(update => {
      if (update !== 'currentPassword') {
        user[update] = req.body[update];
      }
    });
    
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ error: error.message || 'Error updating profile' });
  }
});

// Upload profile picture
router.post('/upload-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    await user.save();
    
    res.json({ profilePicture: user.profilePicture });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ error: error.message || 'Error uploading profile picture' });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

// Delete account
router.delete('/', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
});

module.exports = router; 