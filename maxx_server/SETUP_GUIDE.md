# 🚀 Node.js Server Setup Guide

## Prerequisites
- Node.js 18+ installed
- Firebase project with Authentication and Storage enabled
- Google Cloud project with Generative AI API enabled

## Step-by-Step Setup

### 1. **Get Firebase Service Account Credentials**

#### Option A: Using Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Settings** (gear icon) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate new private key"**
6. Save the downloaded JSON file securely

#### Option B: Using Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **IAM & Admin** → **Service Accounts**
4. Click **"Create Service Account"**
5. Give it a name (e.g., "maxx-server")
6. Grant these roles:
   - Firebase Admin SDK Administrator Service Agent
   - Storage Admin
7. Click **"Create Key"** → **JSON**

### 2. **Get Gemini API Key**

#### Option A: Google AI Studio (Easiest)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select your project or create a new one
5. Copy the generated API key

#### Option B: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Generative AI API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Generative AI API"
   - Click **Enable**
3. Create API Key:
   - Go to **APIs & Services** → **Credentials**
   - Click **"Create Credentials"** → **API Key**
   - Copy the generated key

### 3. **Setup Environment Variables**

1. **Copy the template:**
   ```bash
   cd maxx_server
   cp .env.template .env
   ```

2. **Fill in your credentials:**
   Open `.env` file and replace the placeholder values:

   ```bash
   # From your Firebase service account JSON file:
   FIREBASE_PROJECT_ID=your-actual-project-id
   FIREBASE_PRIVATE_KEY_ID=abc123def456...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=123456789012345678901
   
   # Your Gemini API key:
   GEMINI_API_KEY=AIzaSyC-your-actual-gemini-api-key
   
   # Your Firebase storage bucket (usually project-id.appspot.com):
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

### 4. **Important Notes**

#### **Private Key Formatting**
The private key must be properly formatted with `\n` for line breaks:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...\n-----END PRIVATE KEY-----\n"
```

#### **Storage Bucket Name**
- Usually: `your-project-id.appspot.com`
- Find it in Firebase Console → Storage → Files tab
- Look at the URL: `gs://your-bucket-name`

### 5. **Verify Your Setup**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Test the server:**
   ```bash
   npm run dev
   ```

3. **Check health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

   Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "version": "1.0.0",
     "environment": "development"
   }
   ```

### 6. **Common Issues & Solutions**

#### **Issue: "Missing required environment variables"**
- Make sure all required variables are set in `.env`
- Check for typos in variable names
- Ensure no extra spaces around `=`

#### **Issue: "Invalid private key"**
- Ensure private key has proper `\n` line breaks
- Make sure it's wrapped in double quotes
- Copy the entire key including BEGIN/END lines

#### **Issue: "Firebase initialization failed"**
- Verify your service account has proper permissions
- Check that the project ID matches your Firebase project
- Ensure the service account JSON is from the correct project

#### **Issue: "Gemini API key invalid"**
- Verify the API key is correct
- Ensure Generative AI API is enabled in Google Cloud
- Check if the API key has proper permissions

### 7. **Security Best Practices**

1. **Never commit `.env` file to git**
   ```bash
   # Already in .gitignore, but double-check:
   echo ".env" >> .gitignore
   ```

2. **Use different API keys for development/production**

3. **Rotate keys regularly**

4. **Restrict API key permissions in Google Cloud Console**

### 8. **Production Deployment**

For production, set environment variables directly on your server:
```bash
export FIREBASE_PROJECT_ID=your-project-id
export GEMINI_API_KEY=your-api-key
# ... etc
```

Or use your hosting platform's environment variable settings (Heroku, Railway, DigitalOcean, etc.)

## 🎉 You're Ready!

Once all environment variables are set correctly, your server should start without errors and be ready to handle requests from your React Native app!
