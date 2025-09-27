import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/config.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import looksmaxxingRoutes from './routes/looksmaxxing.js';
import referralRoutes from './routes/referral.js';
import webhookRoutes from './routes/webhooks.js';

const app = express();

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Replace with your actual frontend domain
    : ['http://localhost:3000', 'http://localhost:8081', 'exp://192.168.1.100:8081'], // Development origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.server.nodeEnv !== 'test') {
  app.use(morgan(config.server.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimits.maxRequestsPerMinute,
  message: {
    error: 'too-many-requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const hourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.rateLimits.maxRequestsPerHour,
  message: {
    error: 'too-many-requests',
    message: 'Hourly rate limit exceeded, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);
app.use('/api', hourlyLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.server.nodeEnv
  });
});

// API routes
app.use('/api', looksmaxxingRoutes);
app.use('/api/referral', referralRoutes);
app.use('/webhooks', webhookRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Maxx Looksmaxxing API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      analyze: 'POST /api/analyze',
      generateFront: 'POST /api/generate/front',
      generateSide: 'POST /api/generate/side',
      generatePhysique: 'POST /api/generate/physique',
      generateLifestyle: 'POST /api/generate/lifestyle'
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(config.server.port, () => {
  console.log(`Maxx Looksmaxxing API Server running on port ${config.server.port}`);
  console.log(`Environment: ${config.server.nodeEnv}`);
  console.log(`Health check: http://localhost:${config.server.port}/health`);
  console.log(`API docs: http://localhost:${config.server.port}/`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
