const express = require('express');
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const userController = new UserController();

router.use(authMiddleware); // All user routes require authentication

router.get('/watchlist', (req, res) => userController.getWatchlist(req, res));
router.post('/watchlist', (req, res) => userController.addToWatchlist(req, res));
router.delete('/watchlist/:animeId', (req, res) => userController.removeFromWatchlist(req, res));
router.post('/ratings', (req, res) => userController.rateAnime(req, res));
router.get('/ratings', (req, res) => userController.getRatings(req, res));

module.exports = router;
