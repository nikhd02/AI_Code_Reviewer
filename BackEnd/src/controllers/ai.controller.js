const { getAIReview } = require('../services/ai.service');
const CodeReview = require('../models/CodeReview');

async function getReview(req, res) {
  try {
    const { code, language = 'javascript' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    // Get AI review
    const review = await getAIReview(code, language);
    
    // Save review to database
    try {
      const codeReview = new CodeReview({
        code,
        review,
        language,
        user: req.user._id
      });
      await codeReview.save();
    } catch (error) {
      console.error('Error saving review:', error);
      // Continue even if save fails
    }
    
    res.json({ review });
  } catch (error) {
    console.error('Error in getReview:', error);
    res.status(500).json({ error: 'Failed to get code review' });
  }
}

module.exports = { getReview };