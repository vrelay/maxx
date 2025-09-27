import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import ReferralCard from '../../componants/molecules/ReferralCard';
import ReferralInput from '../../componants/molecules/ReferralInput';

const ReferralScreen: React.FC = () => {
  const [referralClaimed, setReferralClaimed] = useState(false);

  const handleReferralClaimed = (success: boolean) => {
    setReferralClaimed(success);
    if (success) {
      // You could show a success message or navigate somewhere
      console.log('✅ DEBUG: Referral claimed successfully');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Referral Program</Text>
            <Text style={styles.subtitle}>
              Invite friends and earn rewards!
            </Text>
          </View>

          {!referralClaimed && (
            <ReferralInput onReferralClaimed={handleReferralClaimed} />
          )}

          <ReferralCard />

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>1. Share your referral code with friends</Text>
            <Text style={styles.infoItem}>2. When they sign up and subscribe, you both get rewards</Text>
            <Text style={styles.infoItem}>3. You earn 1 free month for each successful referral</Text>
            <Text style={styles.infoItem}>4. Your friends get special benefits too!</Text>
          </View>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions:</Text>
          <Text style={styles.termsText}>
            • Referral rewards are granted after the referred user makes their first subscription purchase
          </Text>
          <Text style={styles.termsText}>
            • Rewards expire 30 days after being granted
          </Text>
          <Text style={styles.termsText}>
            • Self-referrals are not allowed
          </Text>
          <Text style={styles.termsText}>
            • Maxx reserves the right to modify or cancel the referral program at any time
          </Text>
        </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
    marginBottom: 6,
  },
});

export default ReferralScreen;
