import express from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import referralService from '../services/referralService.js';

const router = express.Router();

/**
 * Generate referral code for authenticated user
 */
router.post('/generate', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid: userId, email } = req.user;
    
    const result = await referralService.generateReferralCode(userId, email);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          code: result.code,
          shareUrl: `https://yourapp.com/invite?code=${result.code}`
        },
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Generate referral code error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Claim referral code (when referred user signs up)
 */
router.post('/claim', verifyFirebaseToken, async (req, res) => {
  try {
    const { code } = req.body;
    const { uid: referredUserId, email: referredUserEmail } = req.user;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Referral code is required'
      });
    }
    
    const result = await referralService.claimReferralCode(
      code, 
      referredUserId, 
      referredUserEmail
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Claim referral code error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get user's referral information and stats
 */
router.get('/info', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid: userId } = req.user;
    
    const result = await referralService.getReferralInfo(userId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get referral info error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get user's rewards
 */
router.get('/rewards', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid: userId } = req.user;
    
    const result = await referralService.getUserRewards(userId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.rewards
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Check if user has active referral rewards
 */
router.get('/check-rewards', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid: userId } = req.user;
    
    const result = await referralService.checkActiveRewards(userId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Check rewards error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
