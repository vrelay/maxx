import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import revenueCatService from '../services/revenueCatService';

export const usePremiumCheck = () => {
  const { isPremium, refreshCustomerInfo } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  const checkPremiumAndShowPaywall = async () => {
    try {
      // Refresh premium status to ensure it's up to date
      await refreshCustomerInfo();
      
      // Check if user has premium access (subscription or referral rewards)
      const premiumAccess = await revenueCatService.checkCombinedPremiumAccess();
      
      if (!premiumAccess.hasAccess) {
        // User doesn't have premium access, show paywall
        setShowPaywall(true);
        return false;
      }
      
      // User has premium access
      return true;
    } catch (error) {
      console.error('Error checking premium status:', error);
      // On error, show paywall to be safe
      setShowPaywall(true);
      return false;
    }
  };

  const hidePaywall = () => {
    setShowPaywall(false);
  };

  return {
    isPremium,
    showPaywall,
    setShowPaywall,
    checkPremiumAndShowPaywall,
    hidePaywall,
  };
};

