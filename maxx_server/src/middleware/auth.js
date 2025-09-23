import { auth } from '../config/firebase.js';

/**
 * Middleware to verify Firebase ID token and extract user information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'invalid-argument',
        message: 'Authorization header with Bearer token is required'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({
        error: 'invalid-argument',
        message: 'ID token is required'
      });
    }

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Add user information to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      ...decodedToken
    };

    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    
    let errorMessage = 'Invalid or expired token';
    let errorCode = 'unauthenticated';
    
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token has expired';
    } else if (error.code === 'auth/id-token-revoked') {
      errorMessage = 'Token has been revoked';
    } else if (error.code === 'auth/invalid-id-token') {
      errorMessage = 'Invalid token format';
    }

    return res.status(401).json({
      error: errorCode,
      message: errorMessage
    });
  }
};

/**
 * Optional middleware to verify Firebase token but continue if not present
 * Useful for endpoints that can work with or without authentication
 */
export const optionalFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      
      if (idToken) {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          ...decodedToken
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token verification fails
    console.warn('Optional auth failed:', error.message);
    next();
  }
};
