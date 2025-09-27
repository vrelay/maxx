import { useEffect } from 'react';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import referralService from '../services/referralService';

export const useReferralLink = () => {
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      try {
        const url = new URL(event.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          // Store referral code for later use
          AsyncStorage.setItem('pendingReferralCode', code);
          console.log('Referral code captured:', code);
        }
      } catch (error) {
        console.error('Error parsing referral URL:', error);
      }
    };

    // Handle initial URL
    Linking.getInitialURL().then(url => {
      if (url) {
        handleUrl({ url });
      }
    });

    // Listen for incoming URLs
    const subscription = Linking.addEventListener('url', handleUrl);

    return () => {
      subscription?.remove();
    };
  }, []);

  const claimPendingReferral = async (userId: string) => {
    try {
      const pendingCode = await AsyncStorage.getItem('pendingReferralCode');
      
      if (pendingCode) {
        console.log('Claiming pending referral code:', pendingCode);
        const result = await referralService.claimReferralCode(pendingCode);
        
        if (result.success) {
          await AsyncStorage.removeItem('pendingReferralCode');
          console.log('Referral code claimed successfully');
          return true;
        } else {
          console.error('Failed to claim referral code:', result.error);
          // Don't remove the code if claiming failed, user might want to try again
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error claiming pending referral:', error);
      return false;
    }
  };

  const clearPendingReferral = async () => {
    try {
      await AsyncStorage.removeItem('pendingReferralCode');
    } catch (error) {
      console.error('Error clearing pending referral:', error);
    }
  };

  return { 
    claimPendingReferral, 
    clearPendingReferral 
  };
};
