const express = require('express');
const aiController = require("../controllers/ai.controller");
const auth = require('../middleware/auth');

const router = express.Router();

// Protect the code review endpoint with authentication
router.post("/get-review", auth, aiController.getReview);

module.exports = router;    