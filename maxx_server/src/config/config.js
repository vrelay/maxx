import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Firebase Configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  },

  // Gemini AI Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: {
      pro: "gemini-2.5-pro",
      flash: "gemini-2.5-flash-image-preview",
    },
  },

  // Image processing settings
  images: {
    maxSizeMB: parseInt(process.env.MAX_IMAGE_SIZE_MB) || 10,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    quality: parseFloat(process.env.IMAGE_QUALITY) || 0.8,
  },

  // Rate limiting
  rateLimits: {
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 10,
    maxRequestsPerHour: parseInt(process.env.MAX_REQUESTS_PER_HOUR) || 50,
  },

  // Timeouts
  timeouts: {
    analysis: 60000, // 60 seconds
    imageGeneration: 120000, // 2 minutes
    total: 540000, // 9 minutes
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_STORAGE_BUCKET',
  'GEMINI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

export default config;
