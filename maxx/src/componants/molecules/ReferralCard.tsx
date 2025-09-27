import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Share, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import referralService, { ReferralInfo } from '../../services/referralService';

interface ReferralCardProps {
  onReferralGenerated?: (code: string) => void;
}

const ReferralCard: React.FC<ReferralCardProps> = ({ onReferralGenerated }) => {
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReferralInfo();
  }, []);

  const loadReferralInfo = async () => {
    console.log("🔄 DEBUG: Loading referral info...");
    try {
      setLoading(true);
      const result = await referralService.getReferralInfo();
      console.log("🌐 DEBUG: Referral info result:", result);
      
      if (result.success && result.data) {
        console.log("✅ DEBUG: Setting referral info:", result.data);
        setReferralInfo(result.data);
        onReferralGenerated?.(result.data.code);
      } else {
        console.log("❌ DEBUG: No referral info found, generating new code...");
        // If no referral code exists, generate one
        await generateReferralCode();
      }
    } catch (error) {
      console.error("❌ DEBUG: Error loading referral info:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    try {
      setGenerating(true);
      const result = await referralService.generateReferralCode();
      if (result.success && result.data) {
        // Reload referral info to get the new code
        await loadReferralInfo();
      } else {
        Alert.alert('Error', result.error || 'Failed to generate referral code');
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
      Alert.alert('Error', 'Failed to generate referral code');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    console.log("🔄 DEBUG: Starting share process...");
    if (!referralInfo) {
      console.log("❌ DEBUG: No referral info available for sharing");
      return;
    }

    try {
      const message = referralService.generateShareMessage(referralInfo.code);
      
      console.log("📤 DEBUG: Share message:", message);
      
      await Share.share({
        message: message,
        title: 'Join Maxx with my referral code!'
      });
      
      console.log("✅ DEBUG: Share completed successfully");
    } catch (error) {
      console.error("❌ DEBUG: Error sharing:", error);
    }
  };

  if (loading || generating) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {generating ? 'Generating your referral code...' : 'Loading referral info...'}
          </Text>
        </View>
      </View>
    );
  }

  if (!referralInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load referral info</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReferralInfo}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Referral Code</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{referralInfo.code}</Text>
        </View>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{referralInfo.totalReferrals}</Text>
            <Text style={styles.statLabel}>Total Referrals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{referralInfo.successfulReferrals}</Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{referralInfo.pendingReferrals}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Share Your Code</Text>
        </TouchableOpacity>

        <View style={styles.rewardInfo}>
          <Text style={styles.rewardTitle}>🎁 Earn Rewards</Text>
          <Text style={styles.rewardDescription}>
            Get 1 free month for each friend who subscribes to Maxx Premium!
          </Text>
        </View>

        {referralInfo.successfulReferrals > 0 && (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>🎉 Congratulations!</Text>
            <Text style={styles.successText}>
              You've successfully referred {referralInfo.successfulReferrals} friend{referralInfo.successfulReferrals > 1 ? 's' : ''}!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  codeContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  code: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
    letterSpacing: 3,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  rewardInfo: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  successContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
});

export default ReferralCard;
