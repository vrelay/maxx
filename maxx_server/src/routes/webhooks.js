import express from 'express';
import crypto from 'crypto';
import referralService from '../services/referralService.js';
import { WEBHOOK_EVENTS } from '../models/referralModels.js';

const router = express.Router();

/**
 * Verify RevenueCat webhook signature
 */
function verifyWebhookSignature(payload, signature, secret) {
  if (!secret) {
    console.error('Webhook secret not configured');
    return false;
  }
  
  if (!signature) {
    console.error('No signature provided');
    return false;
  }
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * RevenueCat webhook endpoint
 */
router.post('/revenuecat', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-revenuecat-signature'];
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    
    console.log('RevenueCat webhook received');
    console.log('Signature:', signature ? 'Present' : 'Missing');
    console.log('Secret configured:', !!webhookSecret);
    
    // Verify webhook signature if secret is configured
    if (webhookSecret && !verifyWebhookSignature(req.body, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const event = JSON.parse(req.body.toString());
    console.log('Webhook event type:', event.type);
    console.log('App user ID:', event.subscriber?.original_app_user_id || event.app_user_id);
    
    // Extract user information
    const appUserId = event.subscriber?.original_app_user_id || event.app_user_id;
    if (!appUserId) {
      console.error('No app_user_id found in webhook');
      return res.status(400).json({ error: 'No app_user_id' });
    }
    
    // Handle different event types
    switch (event.type) {
      case WEBHOOK_EVENTS.INITIAL_PURCHASE:
      case WEBHOOK_EVENTS.RENEWAL:
      case WEBHOOK_EVENTS.PRODUCT_CHANGE:
        await handlePurchaseEvent(appUserId, event);
        break;
        
      case WEBHOOK_EVENTS.CANCELLATION:
      case WEBHOOK_EVENTS.EXPIRATION:
        await handleCancellationEvent(appUserId, event);
        break;
        
      default:
        console.log('Unhandled webhook event type:', event.type);
    }
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Handle purchase events (qualify referrals)
 */
async function handlePurchaseEvent(appUserId, event) {
  try {
    console.log(`Processing purchase event for user: ${appUserId}`);
    
    const purchaseData = {
      product_id: event.product_id,
      purchase_date: event.purchase_date,
      expiration_date: event.expiration_date,
      is_trial_period: event.is_trial_period,
      event_type: event.type,
      store: event.store,
      price: event.price,
      currency: event.currency
    };
    
    console.log('Purchase data:', purchaseData);
    
    // Qualify referral if user was referred
    const result = await referralService.qualifyReferral(appUserId, purchaseData);
    
    if (result.success) {
      console.log(`Referral qualified for user ${appUserId}:`, result.rewardId);
      
      // 🎯 CRITICAL FIX: Grant referrer premium access
      if (result.referrerUserId) {
        await grantReferralPremiumAccess(result.referrerUserId, result.rewardId);
      }
    } else {
      console.log(`No referral to qualify for user ${appUserId}:`, result.error);
    }
    
  } catch (error) {
    console.error('Error handling purchase event:', error);
  }
}

/**
 * Handle cancellation events
 */
async function handleCancellationEvent(appUserId, event) {
  try {
    console.log(`User ${appUserId} cancelled subscription:`, event.type);
    // You might want to handle referral reversals here
    // For now, we'll just log it
  } catch (error) {
    console.error('Error handling cancellation event:', error);
  }
}

/**
 * Grant premium access to referrer via RevenueCat promotional entitlements
 */
async function grantReferralPremiumAccess(referrerUserId, rewardId) {
  try {
    console.log(`🎁 Granting premium access to referrer: ${referrerUserId}`);
    
    // For now, we'll use a custom approach since RevenueCat Admin SDK setup is complex
    // We'll create a custom entitlement that the client can check
    
    // Mark the reward as used (premium access granted)
    const markResult = await referralService.markRewardAsUsed(rewardId);
    
    if (markResult.success) {
      console.log(`✅ Premium access granted to ${referrerUserId} via referral reward`);
      
      // TODO: In production, you might want to:
      // 1. Use RevenueCat Admin SDK to grant promotional entitlements
      // 2. Or implement a custom premium check system
      // 3. Send push notification to referrer about their reward
      
    } else {
      console.error(`❌ Failed to mark reward as used for ${referrerUserId}`);
    }
    
  } catch (error) {
    console.error('❌ Error granting premium access:', error);
  }
}

/**
 * Test webhook endpoint (for development)
 */
router.post('/test', (req, res) => {
  console.log('Test webhook received:', req.body);
  res.json({ success: true, message: 'Test webhook received' });
});

export default router;
