const { getAIReview } = require('../services/ai.service');
const CodeReview = require('../models/CodeReview');

const getReview = async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required.' });
    }
    
    const aiResponse = await getAIReview(code, language);
    
    // Try to save the review to the database
    try {
      const review = new CodeReview({
        code,
        review: aiResponse.review,
        language,
        user: req.userId,
        timestamp: aiResponse.timestamp,
        score: aiResponse.score,
        grade: aiResponse.grade
      });
      
      await review.save();
    } catch (saveError) {
      console.error('Error saving review:', saveError);
      // Continue execution even if save fails
    }
    
    res.json({
      success: true,
      review: aiResponse.review,
      score: aiResponse.score,
      grade: aiResponse.grade,
      timestamp: aiResponse.timestamp,
      language: aiResponse.language
    });
  } catch (error) {
    console.error('Error in getReview:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate code review',
      details: error.message 
    });
  }
};

module.exports = {
  getReview
};