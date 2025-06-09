const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true
  },
  profilePicture: {
    type: String,
    default: '/uploads/profiles/default.png'
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'javascript'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  
  next();
});

// Generate auth token
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  
  user.tokens = user.tokens.concat({ token });
  await user.save();
  
  return token;
};

// Find user by credentials
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('Unable to login');
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error('Unable to login');
  }
  
  return user;
};

// Compare password
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  
  delete userObject.password;
  delete userObject.tokens;
  
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 