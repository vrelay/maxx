import { useEffect, useRef } from 'react';
import revenueCatService from './revenueCatService';

export const useSubscriptionMonitoring = (refreshCustomerInfo: () => Promise<void>) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check subscription status every 5 minutes
    intervalRef.current = setInterval(async () => {
      try {
        const status = await revenueCatService.checkSubscriptionStatus();
        
        if (!status.isActive) {
          console.log('Subscription expired, refreshing customer info...');
          await refreshCustomerInfo();
        }
      } catch (error) {
        console.error('Subscription monitoring error:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshCustomerInfo]);
};
