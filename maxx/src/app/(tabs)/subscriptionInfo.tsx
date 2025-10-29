import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
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

const SubscriptionInfo: React.FC = () => {
  const handleOpenTerms = () => {
    // Open Terms of Use - you can replace this with your actual terms URL
    Linking.openURL('https://lookai.me/terms').catch(() => {
      // Fallback to in-app terms screen
      router.push("/(tabs)/termsOfService");
    });
  };

  const handleOpenPrivacy = () => {
    // Open Privacy Policy - you can replace this with your actual privacy URL
    Linking.openURL('https://lookai.me/privacy').catch(() => {
      // Fallback to in-app privacy screen
      router.push("/(tabs)/privacyPolicy");
    });
  };

  const subscriptionDetails = [
    {
      title: "Maxx Premium Weekly",
      description: "Full access to all premium features",
      price: "$9.99 per week",
      period: "7 days",
      features: [
        "Unlimited AI-powered looksmaxxing analysis",
        "Multiple pose transformations",
        "Detailed progress tracking",
        "Personalized improvement plans",
        "Priority customer support",
        "Advanced analytics and insights"
      ]
    }
  ];

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
                <TouchableOpacity onPress={() => SafeNavigation.goBack("/(tabs)/managePlan")}>
                  <FontAwesome name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscription Information</Text>
                <View style={styles.headerSpacer} />
              </View>

              {/* Subscription Details */}
              <View style={styles.subscriptionContainer}>
                <Text style={styles.sectionTitle}>Auto-Renewable Subscription</Text>
                
                {subscriptionDetails.map((subscription, index) => (
                  <View key={index} style={styles.subscriptionCard}>
                    <View style={styles.subscriptionHeader}>
                      <Text style={styles.subscriptionTitle}>{subscription.title}</Text>
                      <Text style={styles.subscriptionDescription}>{subscription.description}</Text>
                    </View>
                    
                    <View style={styles.subscriptionDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Price:</Text>
                        <Text style={styles.detailValue}>{subscription.price}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Subscription Period:</Text>
                        <Text style={styles.detailValue}>{subscription.period}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Auto-Renewal:</Text>
                        <Text style={styles.detailValue}>Yes, automatically renews</Text>
                      </View>
                    </View>

                    <View style={styles.featuresContainer}>
                      <Text style={styles.featuresTitle}>What's Included:</Text>
                      {subscription.features.map((feature, featureIndex) => (
                        <View key={featureIndex} style={styles.featureItem}>
                          <FontAwesome name="check-circle" size={16} color="#4CAF50" />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              {/* Important Information */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Important Information</Text>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoText}>
                    • Payment will be charged to your Apple ID account at the confirmation of purchase
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoText}>
                    • Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoText}>
                    • Your account will be charged for renewal within 24 hours prior to the end of the current period
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoText}>
                    • You can manage and cancel your subscriptions by going to your account settings on the App Store after purchase
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoText}>
                    • Any unused portion of a free trial period, if offered, will be forfeited when you purchase a subscription
                  </Text>
                </View>
              </View>

              {/* Legal Links */}
              <View style={styles.legalContainer}>
                <Text style={styles.legalTitle}>Legal Documents</Text>
                
                <TouchableOpacity style={styles.legalButton} onPress={handleOpenTerms}>
                  <FontAwesome name="file-text-o" size={20} color="#6D37D4" />
                  <Text style={styles.legalButtonText}>Terms of Use (EULA)</Text>
                  <FontAwesome name="external-link" size={16} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.legalButton} onPress={handleOpenPrivacy}>
                  <FontAwesome name="shield" size={20} color="#6D37D4" />
                  <Text style={styles.legalButtonText}>Privacy Policy</Text>
                  <FontAwesome name="external-link" size={16} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>

              {/* Contact Information */}
              <View style={styles.contactContainer}>
                <Text style={styles.contactTitle}>Need Help?</Text>
                <Text style={styles.contactText}>
                  For subscription support, billing questions, or technical assistance, please contact us:
                </Text>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => router.push("/(tabs)/support" as any)}
                >
                  <FontAwesome name="question-circle" size={20} color="#6D37D4" />
                  <Text style={styles.contactButtonText}>Contact Support</Text>
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
  subscriptionContainer: {
    marginBottom: verticalScale(30),
  },
  sectionTitle: {
    color: '#fff',
    fontSize: moderateScale(20),
    fontWeight: '600',
    marginBottom: verticalScale(20),
  },
  subscriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(16),
    padding: scale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  subscriptionHeader: {
    marginBottom: verticalScale(20),
  },
  subscriptionTitle: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  subscriptionDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: moderateScale(14),
  },
  subscriptionDetails: {
    marginBottom: verticalScale(20),
    gap: verticalScale(12),
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
  featuresContainer: {
    marginTop: verticalScale(10),
  },
  featuresTitle: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(12),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: moderateScale(14),
    marginLeft: scale(10),
    flex: 1,
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
    marginBottom: verticalScale(15),
  },
  infoItem: {
    marginBottom: verticalScale(12),
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  legalContainer: {
    marginBottom: verticalScale(20),
  },
  legalTitle: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(15),
  },
  legalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(12),
    padding: scale(15),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  legalButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '500',
    marginLeft: scale(15),
    flex: 1,
  },
  contactContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(12),
    padding: scale(20),
    alignItems: 'center',
  },
  contactTitle: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(10),
  },
  contactText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: moderateScale(14),
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(25),
    gap: scale(10),
  },
  contactButtonText: {
    color: '#6D37D4',
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
});

export default SubscriptionInfo;

