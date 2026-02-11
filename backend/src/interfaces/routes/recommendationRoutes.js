const express = require('express');
const RecommendationController = require('../controllers/RecommendationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const recommendationController = new RecommendationController();

router.get('/', authMiddleware, (req, res) => recommendationController.getRecommendations(req, res));

module.exports = router;
