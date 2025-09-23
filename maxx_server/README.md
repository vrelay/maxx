# Maxx Looksmaxxing API Server

A standalone Node.js Express server for the Maxx looksmaxxing application, migrated from Firebase Cloud Functions.

## Features

- 🚀 Express.js server with ES6 modules
- 🔐 Firebase Authentication integration
- 🤖 Google Gemini AI integration for image analysis and generation
- 🖼️ Firebase Storage for image management
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)
- 📝 Comprehensive logging and error handling
- 🔄 Graceful shutdown handling

## API Endpoints

### Authentication
All endpoints require Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### Endpoints

1. **POST /api/analyze**
   - Analyze looksmaxxing images and provide recommendations
   - Body: `{ frontImageUrl, sideImageUrl, fullBodyImageUrl?, userStylePrefs?, targetIntensity? }`

2. **POST /api/generate/front**
   - Generate enhanced front image
   - Body: `{ frontImageUrl, sideImageUrl, advice, targetIntensity? }`

3. **POST /api/generate/side**
   - Generate side profile image
   - Body: `{ enhancedFrontImagePath, advice }`

4. **POST /api/generate/physique**
   - Generate physique/full body image
   - Body: `{ enhancedFrontImagePath, advice }`

5. **POST /api/generate/lifestyle**
   - Generate lifestyle/action full body image
   - Body: `{ enhancedFrontImagePath, advice }`

6. **GET /health**
   - Health check endpoint

## Setup

### 1. Install Dependencies
```bash
cd maxx_server
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Required environment variables:
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket name
- `GEMINI_API_KEY` - Google Gemini API key

### 3. Firebase Service Account Setup

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Extract the values and add them to your `.env` file

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Migration from Cloud Functions

### Key Changes Made:

1. **Authentication**: 
   - Cloud Functions: Automatic `request.auth.uid`
   - Express: Manual token verification with middleware

2. **API Structure**:
   - Cloud Functions: `functions.https.onCall()`
   - Express: Standard REST endpoints with Express router

3. **Error Handling**:
   - Cloud Functions: `functions.https.HttpsError`
   - Express: Standard HTTP status codes and error middleware

4. **Environment Variables**:
   - Cloud Functions: Firebase environment
   - Express: `.env` file with dotenv

### Request/Response Format

The request and response formats remain the same as the original Cloud Functions to maintain compatibility with the existing frontend.

## Client-Side Changes Required

Update your client code from:
```javascript
// Old Cloud Functions approach
const analyzeLooksmaxxing = httpsCallable(functions, 'analyzeLooksmaxxing');
const result = await analyzeLooksmaxxing(data);
```

To:
```javascript
// New REST API approach
const idToken = await user.getIdToken();
const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify(data)
});
const result = await response.json();
```

## Production Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start src/server.js --name "maxx-api"
pm2 startup
pm2 save
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Set up SSL/TLS certificates
- Configure reverse proxy (nginx/Apache)

## Monitoring and Logging

The server includes:
- Morgan HTTP request logging
- Comprehensive error logging
- Health check endpoint
- Graceful shutdown handling

## Rate Limiting

- 10 requests per minute per IP
- 50 requests per hour per IP
- Configurable via environment variables

## Security Features

- Helmet.js for security headers
- CORS configuration
- Request size limits
- Input validation
- Firebase token verification

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint
- `npm test` - Run tests (when implemented)

### Project Structure
```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── services/        # Business logic services
└── utils/           # Utility functions
```
