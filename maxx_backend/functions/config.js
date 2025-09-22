// Configuration for Firebase Functions
const functions = require('firebase-functions');
require('dotenv').config();

const config = {
  // Gemini API Configuration
  gemini: {
    apiKey: "AIzaSyABxmBIww94AOS178H2v6lJqWYGz5hymwI",
    model: {
      pro: "gemini-2.0-flash-exp", // For analysis
      flash: "gemini-2.0-flash-exp" // For image generation
    }
  },
  
  // Image processing settings
  images: {
    maxSizeMB: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    quality: 0.8
  },
  
  // Rate limiting
  rateLimits: {
    maxRequestsPerMinute: 10,
    maxRequestsPerHour: 50
  },
  
  // Timeouts
  timeouts: {
    analysis: 60000, // 60 seconds
    imageGeneration: 120000, // 2 minutes
    total: 540000 // 9 minutes (Firebase max)
  }
};

module.exports = config;
