const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserRepository = require('../../infrastructure/database/repositories/UserRepository');
const EmailService = require('../../infrastructure/services/EmailService');

class AuthController {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if user exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const existingUsername = await this.userRepository.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user (unverified)
      const user = await this.userRepository.create({
        username,
        email,
        passwordHash,
        verificationToken,
        verificationTokenExpires,
        isVerified: false,
      });

      // Send verification email (async, don't wait)
      EmailService.sendVerificationEmail(email, username, verificationToken)
        .then(result => {
          if (result.success) {
            console.log(`✉️  Verification email sent to ${email}`);
          } else {
            console.warn(`⚠️  Failed to send verification email to ${email}:`, result.error);
          }
        });

      // Generate JWT (but user still needs to verify email)
      const token = jwt.sign(
        { userId: user.id, username: user.username, isVerified: false },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully. Please check your email to verify your account.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isVerified: false,
        },
        requiresVerification: true,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if email is verified
      if (!user.isVerified) {
        return res.status(403).json({ 
          error: 'Please verify your email before logging in. Check your inbox for the verification link.',
          requiresVerification: true,
          email: user.email,
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username, isVerified: true },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isVerified: true
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      // Find user by verification token
      const user = await this.userRepository.findByVerificationToken(token);

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      // Check if token has expired
      if (new Date() > new Date(user.verificationTokenExpires)) {
        return res.status(400).json({ error: 'Verification token has expired. Please request a new one.' });
      }

      // Check if already verified
      if (user.isVerified) {
        return res.status(200).json({ message: 'Email already verified. You can now log in.' });
      }

      // Verify the user
      await this.userRepository.verifyUser(user.id);

      res.json({
        message: 'Email verified successfully! You can now log in.',
        success: true,
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Email verification failed' });
    }
  }

  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Find user
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: 'If the email exists, a verification link has been sent.' });
      }

      // Check if already verified
      if (user.isVerified) {
        return res.status(400).json({ error: 'Email is already verified' });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Update user with new token
      await this.userRepository.updateVerificationToken(user.id, verificationToken, verificationTokenExpires);

      // Send verification email
      const result = await EmailService.sendVerificationEmail(email, user.username, verificationToken);

      if (!result.success) {
        return res.status(500).json({ error: 'Failed to send verification email. Please try again later.' });
      }

      res.json({ message: 'Verification email sent. Please check your inbox.' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: 'Failed to resend verification email' });
    }
  }
}

module.exports = AuthController;
