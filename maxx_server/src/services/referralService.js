import { db } from '../config/firebase.js';
import { customAlphabet } from 'nanoid';
import { REFERRAL_COLLECTIONS, REFERRAL_STATUS, REWARD_TYPES } from '../models/referralModels.js';

const nanoid = customAlphabet('0123456789', 4);

class ReferralService {
  
  /**
   * Generate a unique referral code for a user
   */
  async generateReferralCode(userId, userEmail) {
    try {
      console.log('🔄 DEBUG: Generating referral code for user:', userId);
      
      // Check if user already has a referral code
      const existingCodesSnapshot = await db.collection(REFERRAL_COLLECTIONS.REFERRAL_CODES)
        .where('user_id', '==', userId)
        .get();
      
      if (!existingCodesSnapshot.empty) {
        const existingCode = existingCodesSnapshot.docs[0].data();
        console.log('✅ DEBUG: Existing referral code found:', existingCode.code);
        return {
          success: true,
          code: existingCode.code,
          message: 'Referral code already exists'
        };
      }
      
      // Generate unique code
      let code;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        code = nanoid(); // Already 4 digits, no need to uppercase
        
        const codeSnapshot = await db.collection(REFERRAL_COLLECTIONS.REFERRAL_CODES)
          .where('code', '==', code)
          .get();
        
        isUnique = codeSnapshot.empty;
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Failed to generate unique referral code');
      }

      // Create referral code document
      const referralCodeData = {
        code,
        user_id: userId,
        user_email: userEmail,
        created_at: new Date(),
        is_active: true,
        total_referrals: 0,
        successful_referrals: 0
      };

      console.log('🔄 DEBUG: Creating new referral code:', code);
      const docRef = await db.collection(REFERRAL_COLLECTIONS.REFERRAL_CODES).add(referralCodeData);
      console.log('✅ DEBUG: Referral code created with ID:', docRef.id);

      return {
        success: true,
        code,
        id: docRef.id,
        message: 'Referral code generated successfully'
      };
    } catch (error) {
      console.error('❌ DEBUG: Error generating referral code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Claim a referral code (when referred user signs up)
   */
  async claimReferralCode(code, referredUserId, referredUserEmail) {
    try {
      console.log('🔄 DEBUG: Claiming referral code:', code, 'for user:', referredUserId);
      
      // Validate referral code exists and is active
      const codeSnapshot = await db.collection(REFERRAL_COLLECTIONS.REFERRAL_CODES)
        .where('code', '==', code)
        .where('is_active', '==', true)
        .get();
      
      if (codeSnapshot.empty) {
        console.log('❌ DEBUG: Invalid or inactive referral code');
        return {
          success: false,
          error: 'Invalid or inactive referral code'
        };
      }

      const referralCodeDoc = codeSnapshot.docs[0];
      const referralCodeData = referralCodeDoc.data();

      // Prevent self-referral
      if (referralCodeData.user_id === referredUserId) {
        console.log('❌ DEBUG: Self-referral not allowed');
        return {
          success: false,
          error: 'Self-referral is not allowed'
        };
      }

      // Check if this user has already been referred
      const existingReferralSnapshot = await db.collection(REFERRAL_COLLECTIONS.REFERRALS)
        .where('referred_user_id', '==', referredUserId)
        .get();

      if (!existingReferralSnapshot.empty) {
        console.log('❌ DEBUG: User has already been referred');
        return {
          success: false,
          error: 'User has already been referred'
        };
      }

      // Use batch transaction for atomicity
      const batch = db.batch();

      // Create referral record
      const referralData = {
        referrer_user_id: referralCodeData.user_id,
        referrer_user_email: referralCodeData.user_email,
        referrer_code: code,
        referred_user_id: referredUserId,
        referred_user_email: referredUserEmail,
        status: REFERRAL_STATUS.PENDING,
        created_at: new Date(),
        qualified_at: null,
        reward_granted: false
      };

      const referralRef = db.collection(REFERRAL_COLLECTIONS.REFERRALS).doc();
      batch.set(referralRef, referralData);

      // Update referral code total count
      batch.update(referralCodeDoc.ref, {
        total_referrals: (referralCodeData.total_referrals || 0) + 1
      });

      await batch.commit();
      console.log('✅ DEBUG: Referral code claimed successfully');

      return {
        success: true,
        message: 'Referral code claimed successfully'
      };
    } catch (error) {
      console.error('❌ DEBUG: Error claiming referral code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get referral information for a user
   */
  async getReferralInfo(userId) {
    try {
      console.log('🔄 DEBUG: Getting referral info for user:', userId);
      
      // Get user's referral code
      const codeSnapshot = await db.collection(REFERRAL_COLLECTIONS.REFERRAL_CODES)
        .where('user_id', '==', userId)
        .get();
      
      if (codeSnapshot.empty) {
        console.log('❌ DEBUG: No referral code found for user');
        return {
          success: false,
          error: 'No referral code found'
        };
      }

      const codeData = codeSnapshot.docs[0].data();

      // Get successful referrals
      const referralsSnapshot = await db.collection(REFERRAL_COLLECTIONS.REFERRALS)
        .where('referrer_user_id', '==', userId)
        .where('status', '==', REFERRAL_STATUS.QUALIFIED)
        .get();
      
      const successfulReferrals = referralsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get pending referrals
      const pendingSnapshot = await db.collection(REFERRAL_COLLECTIONS.REFERRALS)
        .where('referrer_user_id', '==', userId)
        .where('status', '==', REFERRAL_STATUS.PENDING)
        .get();
      
      const pendingReferrals = pendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('✅ DEBUG: Referral info retrieved successfully');

      return {
        success: true,
        data: {
          code: codeData.code,
          totalReferrals: codeData.total_referrals || 0,
          successfulReferrals: codeData.successful_referrals || 0,
          pendingReferrals: pendingReferrals.length,
          successfulReferralsList: successfulReferrals,
          pendingReferralsList: pendingReferrals
        }
      };
    } catch (error) {
      console.error('❌ DEBUG: Error getting referral info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Qualify a referral (when referred user makes a purchase)
   */
  async qualifyReferral(referredUserId, purchaseData = {}) {
    try {
      console.log('🔄 DEBUG: Qualifying referral for user:', referredUserId);
      
      // Find pending referral for this user
      const referralSnapshot = await db.collection(REFERRAL_COLLECTIONS.REFERRALS)
        .where('referred_user_id', '==', referredUserId)
        .where('status', '==', REFERRAL_STATUS.PENDING)
        .get();

      if (referralSnapshot.empty) {
        console.log('❌ DEBUG: No pending referral found for user');
        return {
          success: false,
          error: 'No pending referral found'
        };
      }

      const referralDoc = referralSnapshot.docs[0];
      const referralData = referralDoc.data();

      // Use batch transaction for atomicity
      const batch = db.batch();

      // Update referral status to qualified
      batch.update(referralDoc.ref, {
        status: REFERRAL_STATUS.QUALIFIED,
        qualified_at: new Date(),
        purchase_data: purchaseData
      });

      // Create reward for referrer
      const rewardData = {
        user_id: referralData.referrer_user_id,
        type: REWARD_TYPES.FREE_MONTH,
        amount: 1,
        referral_id: referralDoc.id,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        is_used: false,
        description: 'Free month reward for successful referral'
      };

      const rewardRef = db.collection(REFERRAL_COLLECTIONS.REWARDS).doc();
      batch.set(rewardRef, rewardData);

      // Update referral code successful count
      const codeSnapshot = await db.collection(REFERRAL_COLLECTIONS.REFERRAL_CODES)
        .where('code', '==', referralData.referrer_code)
        .get();
      
      if (!codeSnapshot.empty) {
        const codeDoc = codeSnapshot.docs[0];
        const codeData = codeDoc.data();
        batch.update(codeDoc.ref, {
          successful_referrals: (codeData.successful_referrals || 0) + 1
        });
      }

      await batch.commit();
      console.log('✅ DEBUG: Referral qualified successfully');

      return {
        success: true,
        message: 'Referral qualified successfully',
        referrerUserId: referralData.referrer_user_id,
        rewardId: rewardRef.id,
        rewardData: rewardData
      };
    } catch (error) {
      console.error('❌ DEBUG: Error qualifying referral:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get rewards for a user
   */
  async getRewards(userId) {
    try {
      console.log('🔄 DEBUG: Getting rewards for user:', userId);
      
      const rewardsSnapshot = await db.collection(REFERRAL_COLLECTIONS.REWARDS)
        .where('user_id', '==', userId)
        .where('is_used', '==', false)
        .get();
      
      const rewards = rewardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('✅ DEBUG: Rewards retrieved successfully');

      return {
        success: true,
        data: rewards
      };
    } catch (error) {
      console.error('❌ DEBUG: Error getting rewards:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user has active rewards
   */
  async checkActiveRewards(userId) {
    try {
      console.log('🔄 DEBUG: Checking active rewards for user:', userId);
      
      const rewardsSnapshot = await db.collection(REFERRAL_COLLECTIONS.REWARDS)
        .where('user_id', '==', userId)
        .where('is_used', '==', false)
        .get();
      
      const rewards = rewardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('✅ DEBUG: Active rewards check completed');

      return {
        success: true,
        data: {
          hasActiveRewards: !rewardsSnapshot.empty,
          rewards: rewards
        }
      };
    } catch (error) {
      console.error('❌ DEBUG: Error checking active rewards:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mark a reward as used
   */
  async markRewardAsUsed(rewardId) {
    try {
      console.log('🔄 DEBUG: Marking reward as used:', rewardId);
      
      await db.collection(REFERRAL_COLLECTIONS.REWARDS)
        .doc(rewardId)
        .update({
          is_used: true,
          used_at: new Date()
        });
      
      console.log('✅ DEBUG: Reward marked as used successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ DEBUG: Error marking reward as used:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ReferralService();