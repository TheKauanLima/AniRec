const express = require('express');
const authRoutes = require('./authRoutes');
const animeRoutes = require('./animeRoutes');
const recommendationRoutes = require('./recommendationRoutes');
const userRoutes = require('./userRoutes');
const malRoutes = require('./malRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/auth/mal', malRoutes);
router.use('/anime', animeRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/users', userRoutes);

module.exports = router;
