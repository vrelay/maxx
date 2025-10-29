import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { FontAwesome } from '@expo/vector-icons';
import revenueCatService from '@/src/services/revenueCatService';
import { router } from 'expo-router';

interface PaywallProps {
  onPurchaseSuccess?: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onPurchaseSuccess }) => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    initializePaywall();
    
    // Listen for customer info updates
    const listener = revenueCatService.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
    });

    return () => {
      if (listener && listener.remove) {
        listener.remove();
      }
    };
  }, []);

  const initializePaywall = async () => {
    try {
      const [offerings, customerInfo] = await Promise.all([
        revenueCatService.getOfferings(),
        revenueCatService.getCustomerInfo()
      ]);
      
      setPackages(offerings?.availablePackages || []);
      setCustomerInfo(customerInfo);
    } catch (error) {
      console.error('Paywall initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageToPurchase: any) => {
    setPurchasing(packageToPurchase.identifier);
    
    try {
      const result = await revenueCatService.purchasePackage(packageToPurchase);
      
      if (result.success) {
        setCustomerInfo(result.customerInfo);
        Alert.alert('Success!', 'Welcome to Maxx Premium!');
        onPurchaseSuccess?.();
       
      } else {
        Alert.alert('Purchase Failed', result.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await revenueCatService.restorePurchases();
      
      if (result.success) {
        setCustomerInfo(result.customerInfo);
        if (revenueCatService.isPremiumUser(result.customerInfo)) {
          Alert.alert('Success!', 'Your purchases have been restored!');
          onPurchaseSuccess?.();
       
        } else {
          Alert.alert('No Purchases Found', 'No previous purchases found to restore.');
        }
      } else {
        Alert.alert('Restore Failed', result.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Restore failed. Please try again.');
    }
  };

  const isPremium = revenueCatService.isPremiumUser(customerInfo);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading premium options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.premiumContainer}>
          <FontAwesome name="check-circle" size={60} color="#34D399" />
          <Text style={styles.premiumTitle}>You're Premium!</Text>
          <Text style={styles.premiumSubtitle}>Enjoy all Maxx features</Text>
          <TouchableOpacity style={styles.continueButton} onPress={() => router.back()}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="times" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Unlock Maxx Premium</Text>
        <Text style={styles.subtitle}>Get your personalized looksmaxxing plan and unlock your potential</Text>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <FontAwesome name="check" size={16} color="#34D399" />
            <Text style={styles.featureText}>Personalized looksmaxxing plan</Text>
          </View>
          <View style={styles.feature}>
            <FontAwesome name="check" size={16} color="#34D399" />
            <Text style={styles.featureText}>Detailed analysis & insights</Text>
          </View>
          <View style={styles.feature}>
            <FontAwesome name="check" size={16} color="#34D399" />
            <Text style={styles.featureText}>Daily transformation tasks</Text>
          </View>
          <View style={styles.feature}>
            <FontAwesome name="check" size={16} color="#34D399" />
            <Text style={styles.featureText}>Progress tracking</Text>
          </View>
        </View>

        <View style={styles.packagesContainer}>
          {packages.map((pkg, index) => (
            <TouchableOpacity
              key={pkg.identifier}
              style={[
                styles.packageButton,
                index === 1 && styles.recommendedPackage
              ]}
              onPress={() => handlePurchase(pkg)}
              disabled={purchasing === pkg.identifier}
            >
              {index === 1 && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>BEST VALUE</Text>
                </View>
              )}
              
              <View style={styles.packageContent}>
                <Text style={styles.packageTitle}>
                  {pkg.product.title}
                </Text>
                <Text style={styles.packagePrice}>
                  {pkg.product.priceString}
                </Text>
                {pkg.product.introPrice && (
                  <Text style={styles.packageIntro}>
                    {pkg.product.introPrice.priceString} for {pkg.product.introPrice.periodNumberOfUnits} {pkg.product.introPrice.periodUnit}
                  </Text>
                )}
              </View>
              
              {purchasing === pkg.identifier ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <FontAwesome name="chevron-right" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.subscriptionInfoButton} 
          onPress={() => router.push("/(tabs)/subscriptionInfo" as any)}
        >
          <Text style={styles.subscriptionInfoText}>Subscription Information</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B69',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: moderateScale(16),
    marginTop: verticalScale(16),
  },
  premiumContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  premiumTitle: {
    color: '#fff',
    fontSize: moderateScale(28),
    fontWeight: '700',
    marginTop: verticalScale(20),
  },
  premiumSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(16),
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#fff',
    paddingHorizontal: scale(40),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(30),
  },
  continueButtonText: {
    color: '#2D1B69',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
  },
  title: {
    color: '#fff',
    fontSize: moderateScale(32),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(16),
    textAlign: 'center',
    marginBottom: verticalScale(30),
  },
  featuresContainer: {
    marginBottom: verticalScale(30),
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  featureText: {
    color: '#fff',
    fontSize: moderateScale(16),
    marginLeft: scale(12),
  },
  packagesContainer: {
    marginBottom: verticalScale(20),
  },
  packageButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: moderateScale(12),
    padding: scale(20),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  recommendedPackage: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: '#34D399',
    borderWidth: 2,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#34D399',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  recommendedText: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  packageContent: {
    flex: 1,
  },
  packageTitle: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  packagePrice: {
    color: '#fff',
    fontSize: moderateScale(24),
    fontWeight: '700',
  },
  packageIntro: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(14),
    marginTop: verticalScale(4),
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(16),
  },
  restoreText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(16),
    textDecorationLine: 'underline',
  },
  subscriptionInfoButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  subscriptionInfoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: moderateScale(14),
    textDecorationLine: 'underline',
  },
  disclaimer: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: moderateScale(12),
    textAlign: 'center',
    lineHeight: moderateScale(16),
    marginTop: verticalScale(20),
  },
});

export default Paywall;
