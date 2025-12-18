import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import cors from 'cors';
import passport from './config/passport.js';
import environment from './config/environment.js';
import connectDatabase from './config/database.js';
import { sanitizeAll } from './middleware/sanitization.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import learningRoutes from './routes/learning.js';
import progressRoutes from './routes/progress.js';
import leaderboardRoutes from './routes/leaderboard.js';
import chatbotRoutes from './routes/chatbot.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Connect to database
await connectDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS
app.use(cors(environment.cors));

// Body parsing
app.use(express.json({ limit: environment.security.maxRequestBodySize }));
app.use(express.urlencoded({ extended: true, limit: environment.security.maxRequestBodySize }));

// Session configuration
app.use(session({
  secret: environment.session.secret,
  resave: false,
  saveUninitialized: false,
  name: environment.session.name,
  cookie: environment.session.cookie,
  store: MongoStore.create({
    mongoUrl: environment.database.uri,
    touchAfter: 24 * 3600, // Update session once per 24 hours unless changed
    crypto: {
      secret: environment.session.secret,
    },
  }),
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Global sanitization
app.use(sanitizeAll);

// Health check endpoint (no rate limit)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply rate limiting to all API routes
app.use('/api', generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = environment.node.port;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                     CYBERGUARD API SERVER                      ║
╚════════════════════════════════════════════════════════════════╝

Environment: ${environment.node.env}
Port: ${PORT}
API URL: ${environment.api.url}
Frontend URL: ${environment.frontend.url}

Server started successfully at ${new Date().toISOString()}

Security features enabled:
  ✓ Helmet (Security headers)
  ✓ CORS (Cross-origin protection)
  ✓ Rate limiting
  ✓ Input sanitization
  ✓ Session security
  ✓ MongoDB injection prevention
  ✓ XSS protection

Authentication providers:
  ✓ Email/Password
  ✓ Google OAuth

Ready to accept connections...
  `);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;