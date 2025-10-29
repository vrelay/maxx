import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import { useAuth } from "@/src/context/AuthContext";
import revenueCatService from "@/src/services/revenueCatService";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { SafeNavigation } from "../../utils/safeNavigation";

interface SubscriptionDetails {
  isActive: boolean;
  expiresAt?: Date;
  willRenew?: boolean;
  daysRemaining?: number;
  productTitle?: string;
  priceString?: string;
  source: 'subscription' | 'referral' | 'test' | 'none';
}

const ManagePlan: React.FC = () => {
  const { user, isPremium, refreshCustomerInfo } = useAuth();
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadSubscriptionDetails();
  }, []);

  const loadSubscriptionDetails = async () => {
    try {
      setLoading(true);
      
      // Check combined premium access (subscription + referral)
      const premiumAccess = await revenueCatService.checkCombinedPremiumAccess();
      
      if (premiumAccess.hasAccess) {
        // Get detailed subscription info
        const subscriptionStatus = await revenueCatService.checkSubscriptionStatus();
        const customerInfo = await revenueCatService.getCustomerInfo();
        
        const entitlement = customerInfo?.entitlements.active['premium'];
        const product = entitlement?.productIdentifier;
        
        setSubscriptionDetails({
          isActive: subscriptionStatus.isActive,
          expiresAt: subscriptionStatus.expiresAt,
          willRenew: subscriptionStatus.willRenew,
          daysRemaining: subscriptionStatus.daysRemaining,
          productTitle: premiumAccess.source === 'test' ? 'Test Premium Account' : (product || 'Premium Subscription'),
          priceString: premiumAccess.source === 'test' ? 'Free (Test Account)' : '$9.99/week',
          source: premiumAccess.source
        });
      } else {
        setSubscriptionDetails({
          isActive: false,
          willRenew: false,
          source: 'none'
        });
      }
    } catch (error) {
      console.error('Error loading subscription details:', error);
      Alert.alert('Error', 'Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
      [
        {
          text: 'Keep Subscription',
          style: 'cancel',
        },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              
              // Note: RevenueCat doesn't directly handle cancellations
              // Users need to cancel through their device settings or the platform store
              Alert.alert(
                'Cancel Subscription',
                'To cancel your subscription, please go to your device settings:\n\n' +
                'iOS: Settings > Apple ID > Subscriptions\n' +
                'Android: Google Play Store > Subscriptions\n\n' +
                'Or visit the App Store/Google Play Store to manage your subscription.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      const result = await revenueCatService.restorePurchases();
      
      if (result.success) {
        Alert.alert('Success', 'Your purchases have been restored!');
        await loadSubscriptionDetails();
        await refreshCustomerInfo();
      } else {
        Alert.alert('No Purchases Found', result.error || 'No previous purchases found to restore.');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (!subscriptionDetails?.isActive) return '#FF6B6B';
    if (subscriptionDetails.source === 'referral') return '#4ECDC4';
    return '#4CAF50';
  };

  const getStatusText = () => {
    if (!subscriptionDetails?.isActive) return 'Inactive';
    if (subscriptionDetails.source === 'referral') return 'Referral Reward';
    if (subscriptionDetails.source === 'test') return 'Test Account';
    return 'Active';
  };

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GridBackgroundImg top={true} />
        <LinearGradient
          colors={["#171840", "#6D37D4"]}
          locations={[0, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading subscription details...</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GridBackgroundImg top={true} />
      <LinearGradient
        colors={["#171840", "#6D37D4"]}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => SafeNavigation.goBack("/(tabs)/settings")}>
                  <FontAwesome name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Plan</Text>
                <View style={styles.headerSpacer} />
              </View>

              {/* Subscription Status Card */}
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                    <Text style={styles.statusText}>{getStatusText()}</Text>
                  </View>
                  {subscriptionDetails?.isActive && (
                    <Text style={styles.planName}>{subscriptionDetails.productTitle}</Text>
                  )}
                </View>

                {subscriptionDetails?.isActive && (
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Price</Text>
                      <Text style={styles.detailValue}>{subscriptionDetails.priceString}</Text>
                    </View>
                    
                    {subscriptionDetails.source === 'test' && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Account Type</Text>
                        <Text style={styles.detailValue}>Test Account</Text>
                      </View>
                    )}
                    
                    {subscriptionDetails.expiresAt && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          {subscriptionDetails.source === 'referral' ? 'Expires' : 
                           subscriptionDetails.source === 'test' ? 'Valid Until' : 'Next Billing'}
                        </Text>
                        <Text style={styles.detailValue}>
                          {formatDate(subscriptionDetails.expiresAt)}
                        </Text>
                      </View>
                    )}
                    
                    {subscriptionDetails.daysRemaining && subscriptionDetails.daysRemaining > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Days Remaining</Text>
                        <Text style={styles.detailValue}>{subscriptionDetails.daysRemaining} days</Text>
                      </View>
                    )}
                    
                    {subscriptionDetails.source === 'subscription' && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Auto-Renewal</Text>
                        <Text style={styles.detailValue}>
                          {subscriptionDetails.willRenew ? 'Enabled' : 'Disabled'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {subscriptionDetails?.isActive && subscriptionDetails.source === 'subscription' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={handleCancelSubscription}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <FontAwesome name="times-circle" size={20} color="#fff" />
                    )}
                    <Text style={styles.actionButtonText}>Cancel Subscription</Text>
                  </TouchableOpacity>
                )}

                {subscriptionDetails?.source !== 'test' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.restoreButton]}
                    onPress={handleRestorePurchases}
                  >
                    <FontAwesome name="refresh" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Restore Purchases</Text>
                  </TouchableOpacity>
                )}

                {subscriptionDetails?.source === 'test' && (
                  <View style={styles.testAccountInfo}>
                    <FontAwesome name="info-circle" size={20} color="#4ECDC4" />
                    <Text style={styles.testAccountText}>
                      This is a test account with full premium access for development purposes.
                    </Text>
                  </View>
                )}

                {!subscriptionDetails?.isActive && (
                  <ButtonStart
                    text="Upgrade to Premium"
                    handlepress={() => router.push("/(tabs)/paywallScreen")}
                  />
                )}
              </View>

              {/* Information Section */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Subscription Management</Text>
                <Text style={styles.infoText}>
                  • Manage your subscription through your device settings{'\n'}
                  • Cancel anytime - access continues until the end of your billing period{'\n'}
                  • Restore purchases if you've previously subscribed on another device{'\n'}
                  • Contact support if you need assistance with billing
                </Text>
                
                <TouchableOpacity 
                  style={styles.subscriptionInfoLink}
                  onPress={() => router.push("/(tabs)/subscriptionInfo" as any)}
                >
                  <Text style={styles.subscriptionInfoLinkText}>View Full Subscription Information</Text>
                </TouchableOpacity>
              </View>

              {/* Support Section */}
              <View style={styles.supportContainer}>
                <TouchableOpacity 
                  style={styles.supportButton}
                  onPress={() => router.push("/(tabs)/support" as any)}
                >
                  <FontAwesome name="question-circle" size={20} color="#6D37D4" />
                  <Text style={styles.supportButtonText}>Contact Support</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(20),
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: moderateScale(16),
    marginTop: verticalScale(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(30),
  },
  headerTitle: {
    color: '#fff',
    fontSize: moderateScale(24),
    fontWeight: '600',
    fontFamily: 'Matter',
  },
  headerSpacer: {
    width: scale(24),
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(16),
    padding: scale(20),
    marginBottom: verticalScale(30),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusHeader: {
    marginBottom: verticalScale(20),
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  statusDot: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginRight: scale(10),
  },
  statusText: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: '600',
  },
  planName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: moderateScale(16),
  },
  detailsContainer: {
    gap: verticalScale(15),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: moderateScale(14),
  },
  detailValue: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  actionsContainer: {
    gap: verticalScale(15),
    marginBottom: verticalScale(30),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(12),
    gap: scale(10),
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.5)',
  },
  restoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  testAccountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
    borderRadius: moderateScale(12),
    padding: scale(16),
    marginBottom: verticalScale(10),
    gap: scale(12),
  },
  testAccountText: {
    color: '#4ECDC4',
    fontSize: moderateScale(14),
    flex: 1,
    lineHeight: moderateScale(18),
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(12),
    padding: scale(20),
    marginBottom: verticalScale(20),
  },
  infoTitle: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(10),
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  subscriptionInfoLink: {
    marginTop: verticalScale(15),
    alignItems: 'center',
  },
  subscriptionInfoLinkText: {
    color: '#6D37D4',
    fontSize: moderateScale(14),
    textDecorationLine: 'underline',
  },
  supportContainer: {
    alignItems: 'center',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(25),
    gap: scale(10),
  },
  supportButtonText: {
    color: '#6D37D4',
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
});

export default ManagePlan;
