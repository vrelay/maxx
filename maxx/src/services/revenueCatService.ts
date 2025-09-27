import Purchases, { LOG_LEVEL, PurchasesOffering, CustomerInfo } from 'react-native-purchases';
import { auth } from '../config/firebase';

// Your RevenueCat public API key
const RC_PUBLIC_KEY = 'appl_qEjeFunztHVXQUeroKMFAYGPZAp';
const ENTITLEMENT_ID = 'premium';

class RevenueCatService {
  private isInitialized = false;

  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Configure RevenueCat
      await Purchases.configure({ apiKey: RC_PUBLIC_KEY });
      
      // Set app user ID if provided
      if (userId) {
        await Purchases.logIn(userId);
      }
      
      this.isInitialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('RevenueCat initialization failed:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      await this.initialize();
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      await this.initialize();
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error fetching customer info:', error);
      return null;
    }
  }

  async purchasePackage(packageToPurchase: any): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
    try {
      await this.initialize();
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return { success: true, customerInfo };
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false, error: 'Purchase cancelled' };
      }
      console.error('Purchase error:', error);
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  async restorePurchases(): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
    try {
      await this.initialize();
      const customerInfo = await Purchases.restorePurchases();
      return { success: true, customerInfo };
    } catch (error: any) {
      console.error('Restore error:', error);
      return { success: false, error: error.message || 'Restore failed' };
    }
  }

  isPremiumUser(customerInfo: CustomerInfo | null): boolean {
    if (!customerInfo) return false;
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  }

  // Listen for customer info updates
  addCustomerInfoUpdateListener(listener: (customerInfo: CustomerInfo) => void) {
    return Purchases.addCustomerInfoUpdateListener(listener);
  }

  async checkSubscriptionStatus(): Promise<{
    isActive: boolean;
    expiresAt?: Date;
    willRenew: boolean;
    daysRemaining?: number;
  }> {
    try {
      await this.initialize();
      const customerInfo = await this.getCustomerInfo();
      
      if (!customerInfo) {
        return { isActive: false, willRenew: false };
      }

      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
      
      if (!entitlement) {
        return { isActive: false, willRenew: false };
      }

      const expiresAt = new Date(entitlement.expirationDate || new Date());
      const now = new Date();
      const isActive = expiresAt > now;
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        isActive,
        expiresAt,
        willRenew: entitlement.willRenew,
        daysRemaining: isActive ? daysRemaining : 0
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return { isActive: false, willRenew: false };
    }
  }

  // Add method to check combined premium access (subscription + referral rewards)
  async checkCombinedPremiumAccess(): Promise<{
    hasAccess: boolean;
    source: 'subscription' | 'referral' | 'none';
    expiresAt?: Date;
  }> {
    try {
      await this.initialize();
      
      // Check RevenueCat subscription
      const customerInfo = await this.getCustomerInfo();
      const rcPremium = !!customerInfo?.entitlements.active[ENTITLEMENT_ID];
      
      if (rcPremium) {
        const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
        return {
          hasAccess: true,
          source: 'subscription',
          expiresAt: new Date(entitlement.expirationDate || new Date())
        };
      }
      
      // 🎯 NEW: Check for active referral rewards
      try {
        const response = await fetch('http://10.145.59.119:3000/api/referral/check-rewards', {
          headers: {
            'Authorization': `Bearer ${await this.getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.hasActiveRewards) {
            const activeReward = data.data.rewards[0]; // Get first active reward
            console.log('🎁 User has active referral reward:', activeReward);
            return {
              hasAccess: true,
              source: 'referral',
              expiresAt: new Date(activeReward.expires_at)
            };
          }
        }
      } catch (error) {
        console.error('Error checking referral rewards:', error);
      }
      
      return {
        hasAccess: rcPremium,
        source: rcPremium ? 'subscription' : 'none'
      };
      
    } catch (error) {
      console.error('Error checking premium access:', error);
      return {
        hasAccess: false,
        source: 'none'
      };
    }
  }

  /**
   * Get Firebase auth token for API requests
   */
  private async getAuthToken(): Promise<string> {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        return token;
      }
      throw new Error('No authenticated user');
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw error;
    }
  }
}

export default new RevenueCatService();
