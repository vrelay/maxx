import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import { useAuth } from "@/src/context/AuthContext";
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

const Support: React.FC = () => {
  const { user } = useAuth();

  const handleEmailSupport = () => {
    const subject = encodeURIComponent('Maxx App Support Request');
    const body = encodeURIComponent(
      `Hi Maxx Support Team,\n\n` +
      `I need help with:\n\n` +
      `User ID: ${user?.uid || 'Not available'}\n` +
      `Email: ${user?.email || 'Not available'}\n\n` +
      `Please describe your issue here...\n\n`
    );
    
    const emailUrl = `mailto:support@lookai.me?subject=${subject}&body=${body}`;
    
    Linking.openURL(emailUrl).catch(() => {
      // Fallback if email app is not available
      console.log('Email app not available');
    });
  };

  const handleFAQ = () => {
    // Navigate to FAQ or open web FAQ
    Linking.openURL('https://lookai.me/faq').catch(() => {
      console.log('Could not open FAQ');
    });
  };

  const supportOptions = [
    {
      title: 'Email Support',
      description: 'Get help via email',
      icon: 'envelope',
      onPress: handleEmailSupport,
    },
    {
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      icon: 'question-circle',
      onPress: handleFAQ,
    },
    {
      title: 'App Issues',
      description: 'Report bugs or technical problems',
      icon: 'bug',
      onPress: handleEmailSupport,
    },
    {
      title: 'Billing Support',
      description: 'Help with payments and subscriptions',
      icon: 'credit-card',
      onPress: handleEmailSupport,
    },
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
                <TouchableOpacity onPress={() => SafeNavigation.goBack("/(tabs)/settings")}>
                  <FontAwesome name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.headerSpacer} />
              </View>

              {/* Support Options */}
              <View style={styles.optionsContainer}>
                {supportOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionCard}
                    onPress={option.onPress}
                  >
                    <View style={styles.optionIcon}>
                      <FontAwesome name={option.icon as any} size={24} color="#6D37D4" />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={16} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Contact Information */}
              <View style={styles.contactContainer}>
                <Text style={styles.contactTitle}>Contact Information</Text>
                <View style={styles.contactItem}>
                  <FontAwesome name="envelope" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.contactText}>support@lookai.me</Text>
                </View>
                <View style={styles.contactItem}>
                  <FontAwesome name="globe" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.contactText}>www.lookai.me</Text>
                </View>
              </View>

              {/* Response Time Info */}
              <View style={styles.responseContainer}>
                <Text style={styles.responseTitle}>Response Time</Text>
                <Text style={styles.responseText}>
                  We typically respond to support requests within 24-48 hours during business days.
                </Text>
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
  optionsContainer: {
    gap: verticalScale(15),
    marginBottom: verticalScale(30),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(12),
    padding: scale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionIcon: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(15),
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  optionDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: moderateScale(14),
  },
  contactContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(12),
    padding: scale(20),
    marginBottom: verticalScale(20),
  },
  contactTitle: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(15),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  contactText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: moderateScale(14),
    marginLeft: scale(10),
  },
  responseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(12),
    padding: scale(20),
  },
  responseTitle: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(10),
  },
  responseText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
});

export default Support;

