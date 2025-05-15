const express = require('express');
const router = express.Router();
const CodeReview = require('../models/CodeReview');
const auth = require('../middleware/auth');

// Save a code review
router.post('/', auth, async (req, res) => {
  try {
    const review = new CodeReview({
      ...req.body,
      user: req.userId
    });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: 'Error saving review', error: error.message });
  }
});

// Get all reviews for the authenticated user
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await CodeReview.find({ user: req.userId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Get public reviews
router.get('/public', async (req, res) => {
  try {
    const reviews = await CodeReview.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('user', 'username');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public reviews', error: error.message });
  }
});

// Get reviews by language
router.get('/language/:language', async (req, res) => {
  try {
    const reviews = await CodeReview.find({
      language: req.params.language,
      $or: [{ isPublic: true }, { user: req.userId }]
    }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews by language', error: error.message });
  }
});

// Search reviews
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const reviews = await CodeReview.find({
      $or: [{ isPublic: true }, { user: req.userId }],
      $text: { $search: query }
    }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error searching reviews', error: error.message });
  }
});

// Get a specific review
router.get('/:id', auth, async (req, res) => {
  try {
    const review = await CodeReview.findOne({
      _id: req.params.id,
      $or: [{ isPublic: true }, { user: req.userId }]
    });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching review', error: error.message });
  }
});

// Update a review
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['code', 'language', 'review', 'metrics', 'tags', 'isPublic'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    const review = await CodeReview.findOne({ _id: req.params.id, user: req.userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    updates.forEach(update => review[update] = req.body[update]);
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: 'Error updating review', error: error.message });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await CodeReview.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

// Export review as PDF
router.get('/:id/export', auth, async (req, res) => {
  try {
    const review = await CodeReview.findOne({
      _id: req.params.id,
      $or: [{ isPublic: true }, { user: req.userId }]
    });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Here you would generate a PDF using a library like pdfkit
    // For now, we'll just return the review data
    res.json({
      message: 'PDF generation would happen here',
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Error exporting review', error: error.message });
  }
});

module.exports = router; 