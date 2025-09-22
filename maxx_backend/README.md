# Maxx Backend - Cloud Functions

This is the Firebase Cloud Functions backend for the Maxx looksmaxxing application. It provides AI-powered image analysis and enhancement services using Google's Gemini AI model.

## Overview

The backend consists of 5 main cloud functions that work together to provide a complete looksmaxxing analysis and image enhancement pipeline:

1. **analyzeLooksmaxxing** - Analyzes user photos and provides personalized looksmaxxing advice
2. **generateEnhancedFront** - Creates an enhanced front portrait based on the analysis
3. **generateSideProfile** - Generates an improved side profile image
4. **generatePhysique** - Creates a full-body physique shot with ideal proportions
5. **generateLifestyle** - Generates a high-status lifestyle image

## Features

- **AI-Powered Analysis**: Uses Gemini 2.0 Flash for comprehensive looksmaxxing advice
- **Image Generation**: Creates enhanced images using Gemini 2.5 Flash Image Preview
- **Firebase Integration**: Seamless integration with Firebase Auth, Storage, and Firestore
- **Secure**: All functions require authentication and validate user permissions
- **Scalable**: Configured with appropriate memory and timeout settings for production use

## Tech Stack

- **Runtime**: Node.js 22
- **Framework**: Firebase Functions v6
- **AI**: Google Gemini AI (2.0 Flash & 2.5 Flash Image Preview)
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth
- **Image Processing**: Sharp, Multer
- **HTTP Client**: Axios

## Prerequisites

- Node.js 22 or higher
- Firebase CLI
- Google Cloud Project with Firebase enabled
- Gemini AI API key

## Installation

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   cd maxx_backend
   ```

2. **Install dependencies:**
   ```bash
   cd functions
   npm install
   ```

3. **Configure environment:**
   - Update the Gemini API key in `functions/config.js`
   - Ensure Firebase project is properly configured

4. **Deploy to Firebase:**
   ```bash
   firebase emulators:start --only functions
   ```

## Configuration

The application uses a centralized configuration file (`functions/config.js`) that includes:

- **Gemini API Settings**: API key and model configurations
- **Image Processing**: File size limits, allowed types, and quality settings
- **Rate Limiting**: Request limits per minute/hour
- **Timeouts**: Function-specific timeout configurations

## API Endpoints

All functions are callable via Firebase Functions and require authentication.

### 1. analyzeLooksmaxxing

Analyzes user photos and provides personalized looksmaxxing advice.

**Input:**
```javascript
{
  frontImageUrl: string,    // Required: Front-facing photo URL
  sideImageUrl: string,     // Required: Side profile photo URL
  fullBodyImageUrl?: string // Optional: Full body photo URL
}
```

**Output:**
```javascript
{
  success: boolean,
  advice: string,           // Detailed looksmaxxing recommendations
  timestamp: string
}
```

### 2. generateEnhancedFront

Creates an enhanced front portrait based on the analysis advice.

**Input:**
```javascript
{
  frontImageUrl: string,    // Original front photo
  sideImageUrl: string,     // Original side photo
  fullBodyImageUrl?: string, // Optional full body photo
  advice: string            // Analysis advice from step 1
}
```

**Output:**
```javascript
{
  success: boolean,
  imagePath: string,        // Firebase Storage path to enhanced image
  timestamp: string
}
```

### 3. generateSideProfile

Generates an improved side profile image from the enhanced front image.

**Input:**
```javascript
{
  enhancedFrontImagePath: string, // Path from step 2
  advice: string                  // Original analysis advice
}
```

**Output:**
```javascript
{
  success: boolean,
  imagePath: string,        // Firebase Storage path to side profile
  timestamp: string
}
```

### 4. generatePhysique

Creates a full-body physique shot with ideal male proportions.

**Input:**
```javascript
{
  enhancedFrontImagePath: string, // Path from step 2
  advice: string                  // Original analysis advice
}
```

**Output:**
```javascript
{
  success: boolean,
  imagePath: string,        // Firebase Storage path to physique image
  timestamp: string
}
```

### 5. generateLifestyle

Generates a high-status lifestyle image in an upscale environment.

**Input:**
```javascript
{
  enhancedFrontImagePath: string, // Path from step 2
  advice: string                  // Original analysis advice
}
```

**Output:**
```javascript
{
  success: boolean,
  imagePath: string,        // Firebase Storage path to lifestyle image
  timestamp: string
}
```

## Development

### Local Development

1. **Start the Firebase emulators:**
   ```bash
   npm run serve
   ```

2. **View the emulator UI:**
   Open http://localhost:4000 in your browser

3. **Test functions locally:**
   ```bash
   npm run shell
   ```

### Available Scripts

- `npm run lint` - Run ESLint
- `npm run serve` - Start Firebase emulators
- `npm run shell` - Start Firebase functions shell
- `npm run deploy` - Deploy functions to Firebase
- `npm run logs` - View function logs

## Function Configuration

Each function is configured with appropriate resources:

- **analyzeLooksmaxxing**: 1GB memory, 120s timeout
- **generateEnhancedFront**: 2GB memory, 300s timeout
- **generateSideProfile**: 2GB memory, 300s timeout
- **generatePhysique**: 2GB memory, 300s timeout
- **generateLifestyle**: 2GB memory, 300s timeout

## Security

- All functions require Firebase Authentication
- User ID validation on all endpoints
- Input validation and sanitization
- Private image storage with user-specific paths
- Rate limiting to prevent abuse

## Error Handling

Functions include comprehensive error handling with:
- Input validation
- Authentication checks
- AI API error handling
- Firebase Storage error handling
- Detailed error logging

## Monitoring

Monitor function performance and errors through:
- Firebase Console Functions tab
- Cloud Logging
- Function metrics and analytics

## Deployment

Deploy to production using:
```bash
firebase deploy --only functions
```

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
