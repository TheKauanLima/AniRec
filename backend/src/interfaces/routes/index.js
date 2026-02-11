const express = require('express');
const authRoutes = require('./authRoutes');
const animeRoutes = require('./animeRoutes');
const recommendationRoutes = require('./recommendationRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/anime', animeRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/users', userRoutes);

module.exports = router;
