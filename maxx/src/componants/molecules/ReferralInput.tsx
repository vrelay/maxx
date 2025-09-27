import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import referralService from '../../services/referralService';

interface ReferralInputProps {
  onReferralClaimed?: (success: boolean) => void;
  placeholder?: string;
}

const ReferralInput: React.FC<ReferralInputProps> = ({ 
  onReferralClaimed,
  placeholder = "Enter referral code" 
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClaimReferral = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter a referral code');
      return;
    }

    // Validate 4-digit numeric code
    if (!/^\d{4}$/.test(code.trim())) {
      Alert.alert('Error', 'Please enter a valid 4-digit referral code');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 DEBUG: Claiming referral code:', code.trim());
      const result = await referralService.claimReferralCode(code.trim());
      console.log('📊 DEBUG: Claim result:', result);
      
      if (result.success) {
        Alert.alert(
          'Success!', 
          'Referral code claimed successfully! You\'ll get rewards when you subscribe.',
          [{ text: 'OK', onPress: () => onReferralClaimed?.(true) }]
        );
        setCode('');
        Keyboard.dismiss(); // Dismiss keyboard after successful claim
      } else {
        Alert.alert('Error', result.error || 'Failed to claim referral code');
        onReferralClaimed?.(false);
      }
    } catch (error) {
      console.error('❌ DEBUG: Error claiming referral:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      onReferralClaimed?.(false);
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <Text style={styles.title}>Have a referral code?</Text>
        <Text style={styles.description}>
          Enter a friend's referral code to get rewards when you subscribe!
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder={placeholder}
            placeholderTextColor="#999"
            autoCapitalize="none"
            maxLength={4}
            keyboardType="numeric"
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleClaimReferral}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleClaimReferral}
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Claim</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <Text style={styles.helpText}>
          💡 You can only use one referral code per account
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 12,
    backgroundColor: '#F8F9FA',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ReferralInput;
