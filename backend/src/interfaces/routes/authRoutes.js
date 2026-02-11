const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();
const authController = new AuthController();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/verify-email', (req, res) => authController.verifyEmail(req, res));
router.post('/resend-verification', (req, res) => authController.resendVerification(req, res));

module.exports = router;
