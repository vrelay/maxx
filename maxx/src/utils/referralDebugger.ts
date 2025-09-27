// Referral System Debugger
// Add this to your app for easy testing

import referralService from '../services/referralService';
import { auth } from '../config/firebase';

export const testReferralSystem = async () => {
  console.log("🧪 DEBUG: Starting referral system test...");
  
  try {
    // 1. Check authentication
    const user = auth.currentUser;
    if (!user) {
      console.log("❌ DEBUG: No authenticated user - please sign in first");
      return;
    }
    console.log("✅ DEBUG: User authenticated:", user.uid);

    // 2. Test get referral info
    console.log("🔄 DEBUG: Testing getReferralInfo...");
    const infoResult = await referralService.getReferralInfo();
    console.log("📊 DEBUG: Referral info result:", infoResult);

    // 3. Test generate referral code (if needed)
    if (!infoResult.success || !infoResult.data) {
      console.log("🔄 DEBUG: No referral code found, generating new one...");
      const generateResult = await referralService.generateReferralCode();
      console.log("📊 DEBUG: Generate result:", generateResult);
    }

    // 4. Test share URL generation
    if (infoResult.success && infoResult.data) {
      const shareUrl = referralService.generateShareUrl(infoResult.data.code);
      const message = referralService.generateShareMessage(infoResult.data.code);
      console.log("📤 DEBUG: Share URL:", shareUrl);
      console.log("📤 DEBUG: Share message:", message);
    }

    // 5. Test rewards check
    console.log("🔄 DEBUG: Testing getRewards...");
    const rewardsResult = await referralService.getRewards();
    console.log("📊 DEBUG: Rewards result:", rewardsResult);

    // 6. Test active rewards check
    console.log("🔄 DEBUG: Testing checkActiveRewards...");
    const activeRewardsResult = await referralService.checkActiveRewards();
    console.log("📊 DEBUG: Active rewards result:", activeRewardsResult);

    console.log("✅ DEBUG: Referral system test completed!");

  } catch (error) {
    console.error("❌ DEBUG: Error in referral system test:", error);
  }
};

// Test referral code claiming (use with a valid code)
export const testClaimReferralCode = async (code: string) => {
  console.log("🧪 DEBUG: Testing claim referral code:", code);
  
  try {
    const result = await referralService.claimReferralCode(code);
    console.log("📊 DEBUG: Claim result:", result);
    return result;
  } catch (error) {
    console.error("❌ DEBUG: Error claiming referral code:", error);
    return { success: false, error: error.message };
  }
};

// Quick test function you can call from anywhere
export const quickReferralTest = () => {
  console.log("🚀 DEBUG: Running quick referral test...");
  testReferralSystem();
};
