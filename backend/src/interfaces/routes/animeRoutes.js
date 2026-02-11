const express = require('express');
const AnimeController = require('../controllers/AnimeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const animeController = new AnimeController();

router.get('/search', (req, res) => animeController.search(req, res));
router.get('/top', (req, res) => animeController.getTop(req, res));
router.get('/:id', (req, res) => animeController.getById(req, res));

module.exports = router;
