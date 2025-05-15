const express = require('express');
const router = express.Router();
const Snippet = require('../models/Snippet');
const auth = require('../middleware/auth');

// Create a new snippet
router.post('/', auth, async (req, res) => {
  try {
    const snippet = new Snippet({
      ...req.body,
      user: req.userId
    });
    await snippet.save();
    res.status(201).json(snippet);
  } catch (error) {
    res.status(400).json({ error: 'Error creating snippet' });
  }
});

// Get all snippets for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching snippets' });
  }
});

// Get public snippets
router.get('/public', async (req, res) => {
  try {
    const snippets = await Snippet.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('user', 'username');
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public snippets', error: error.message });
  }
});

// Get snippets by category
router.get('/category/:category', async (req, res) => {
  try {
    const snippets = await Snippet.find({
      category: req.params.category,
      $or: [{ isPublic: true }, { user: req.userId }]
    }).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching snippets by category', error: error.message });
  }
});

// Search snippets
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const snippets = await Snippet.find({
      $or: [{ isPublic: true }, { user: req.userId }],
      $text: { $search: query }
    }).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ message: 'Error searching snippets', error: error.message });
  }
});

// Get a specific snippet
router.get('/:id', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ _id: req.params.id, user: req.userId });
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching snippet' });
  }
});

// Update a snippet
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'code', 'language', 'description'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates!' });
  }
  
  try {
    const snippet = await Snippet.findOne({ _id: req.params.id, user: req.userId });
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    updates.forEach(update => {
      snippet[update] = req.body[update];
    });
    
    await snippet.save();
    res.json(snippet);
  } catch (error) {
    res.status(400).json({ error: 'Error updating snippet' });
  }
});

// Delete a snippet
router.delete('/:id', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findOneAndDelete({ _id: req.params.id, user: req.userId });
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting snippet' });
  }
});

module.exports = router; 