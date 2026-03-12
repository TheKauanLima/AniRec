const express = require('express');
const MALAuthController = require('../controllers/MALAuthController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const malAuthController = new MALAuthController();

// Get MAL authorization URL (no auth needed — this starts the login flow)
router.get('/auth-url', (req, res) => malAuthController.getAuthUrl(req, res));

// Handle MAL OAuth callback (exchange code for tokens, create/link user)
router.post('/callback', (req, res) => malAuthController.handleCallback(req, res));

// Import user's MAL anime list (requires existing auth)
router.post('/import', authMiddleware, (req, res) => malAuthController.importAnimeList(req, res));

module.exports = router;
