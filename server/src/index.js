const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// --- Puthusa add panna thevayana imports ---
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User'); // Database-la user-ah save panna ithu thevai

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS with permissive options
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ==========================================
// --- Google Auth Session & Passport Setup ---
// ==========================================
app.use(session({
    secret: process.env.SESSION_SECRET || 'expense_tracker_secret',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Database-la intha email-la already user irukkaara nu check panrom
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        // 2. User illana, puthusa oru account create panrom
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: Math.random().toString(36).slice(-8), // Dummy secure password
          monthlyBudget: 2000,
          currency: '$'
        });
      }
      
      // Return user data (profile-ku bathila ippo DB user varum)
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
// ==========================================


// Health Check Endpoint for Kubernetes & Docker
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'etracker-backend',
    uptime: process.uptime(),
  });
});

// API Info Route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Expense Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      transactions: '/api/transactions',
    },
  });
});

// Mount Routes (Passport setup-ku aparam thaan irukkanum - Ippo correct ah irukku)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 ETracker Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Rejection: ${err.message}`);
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});

// Handle SIGTERM for Kubernetes Pod termination
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

module.exports = app;