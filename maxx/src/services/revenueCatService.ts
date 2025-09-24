import Purchases, { LogLevel, PurchasesOffering, CustomerInfo } from 'react-native-purchases';

// Your RevenueCat public API key
const RC_PUBLIC_KEY = 'appl_qEjeFunztHVXQUeroKMFAYGPZAp';
const ENTITLEMENT_ID = 'premium';

class RevenueCatService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(LogLevel.DEBUG);
      }

      // Configure RevenueCat
      await Purchases.configure({ apiKey: RC_PUBLIC_KEY });
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
}

export default new RevenueCatService();
