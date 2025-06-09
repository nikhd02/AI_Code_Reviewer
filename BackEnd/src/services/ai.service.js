const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Gemini API with the correct API version
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY, {
  apiVersion: 'v1'
});

// Enhanced code review service that provides AI-like personalized feedback
async function getAIReview(code, language = 'javascript') {
  try {
    // Get the Gemini Flash model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Create a prompt for code review
    const prompt = `You are an expert code reviewer. Please review the following ${language} code and provide a detailed analysis.
    
    Code:
    ${code}
    
    Please provide your review in the following format:
    
    SCORE: [A number between 0 and 100, for example: SCORE: 85]
    
    1. Code Quality Assessment:
       - Best practices followed
       - Areas for improvement
    
    2. Potential Issues:
       - Bugs or logical errors
       - Security concerns
    
    3. Performance Analysis:
       - Optimization opportunities
       - Memory usage considerations
    
    4. Recommendations:
       - Specific improvements
       - Alternative approaches
    
    Please be detailed and specific in your analysis.`;

    // Generate the review
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const review = response.text();

    console.log('Raw review text:', review); // Debug log

    // Extract score from the review using multiple patterns
    let score = 0;
    const scorePatterns = [
      /SCORE:\s*(\d+)/i,
      /Score:\s*(\d+)/i,
      /score:\s*(\d+)/i,
      /(\d+)\s*\/\s*100/i,
      /(\d+)\s*out of\s*100/i
    ];

    for (const pattern of scorePatterns) {
      const match = review.match(pattern);
      if (match) {
        score = parseInt(match[1]);
        console.log('Found score using pattern:', pattern, 'Score:', score);
        break;
      }
    }

    // If no score found, try to extract any number between 0-100
    if (score === 0) {
      const numberMatch = review.match(/\b([0-9]|[1-9][0-9]|100)\b/);
      if (numberMatch) {
        score = parseInt(numberMatch[0]);
        console.log('Found score using fallback pattern:', score);
      }
    }

    const grade = calculateGrade(score);
    console.log('Final score:', score);
    console.log('Final grade:', grade);

    // Remove the score line from the review text
    const cleanedReview = review.replace(/SCORE:\s*\d+.*$/im, '').trim();

    // Format the response
    const reviewResponse = {
      review: cleanedReview,
      score: score,
      grade: grade,
      timestamp: new Date().toISOString(),
      language: language
    };

    console.log('Sending response:', reviewResponse); // Debug log
    return reviewResponse;
  } catch (error) {
    console.error('Error in getAIReview:', error);
    throw new Error('Failed to generate AI review: ' + error.message);
  }
}

// Helper function to calculate grade based on score
function calculateGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

module.exports = {
  getAIReview
};    