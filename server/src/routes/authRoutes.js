const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Normal Email/Password Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// --- Google OAuth Routes ---

// 1. User-ah Google login page-ku anuppum (Account select panna popup varum)
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// 2. Login mudinja apram Google thiruppi anuppura route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // 1. JWT Token Generate panrom 
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET || 'etracker_default_secret_key_12345',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    // 2. Dynamic Frontend URL (Production-ku Netlify URL, local-na localhost use pannum)
    const frontendURL = process.env.NODE_ENV === 'production'
      ? (process.env.FRONTEND_URL || 'https://expense-tracker-by-mds.netlify.app')
      : 'https://expense-tracker-by-mds.netlify.app';

    // 3. Token-ah query params valiya frontend-ku anuppurom
    res.redirect(`${frontendURL}/dashboard?token=${token}`);
  }
);

module.exports = router;