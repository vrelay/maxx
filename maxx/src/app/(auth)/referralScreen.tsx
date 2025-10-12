import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import referralService from "../../services/referralService";

const ReferralScreen = () => {
  const [referralCode, setReferralCode] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // small timeout makes it robust across navigation transitions
    const id = setTimeout(() => {
      Keyboard.dismiss();
    }, 50);

    return () => clearTimeout(id);
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...referralCode];
      newCode[index] = value;
      setReferralCode(newCode);

      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      } else if (index === 3) {
        // optionally dismiss keyboard when last digit entered
        Keyboard.dismiss();
      }
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !referralCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = async () => {
    const codeString = referralCode.join("");
    if (codeString.length !== 4) {
      Alert.alert('Error', 'Please enter complete referral code');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 DEBUG: Claiming referral code:', codeString);
      const result = await referralService.claimReferralCode(codeString);
      console.log('📊 DEBUG: Claim result:', result);
      
      if (result.success) {
        Alert.alert(
          'Success!', 
          'Referral code claimed successfully! You\'ll get rewards when you subscribe.',
          [{ text: 'OK', onPress: () => router.push("/(tabs)") }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to claim referral code');
      }
    } catch (error) {
      console.error('❌ DEBUG: Error claiming referral:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNoCode = () => {
    router.push("/(tabs)");
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#2D1B69" />
          <GridBackgroundImg top={true} />
          <LinearGradient
            colors={["#171840", "#6D37D4"]}
            locations={[0, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradient}
          >
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.contentContainer}>
                <Text style={styles.title}>Enter your referral code</Text>
                <Text style={styles.subtitle}>
                  Enter the 4 digit referral code
                </Text>
                <TouchableWithoutFeedback onPress={() => focusInput(0)}>
                  <View style={styles.codeInputContainer}>
                    {referralCode.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          inputRefs.current[index] = ref;
                        }}
                        style={[
                          styles.codeInput,
                          digit ? styles.codeInputFilled : styles.codeInputEmpty,
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        onChangeText={(val) => handleCodeChange(index, val)}
                        onKeyPress={({ nativeEvent }) =>
                          handleKeyPress(index, nativeEvent.key)
                        }
                        value={digit}
                        textAlign="center"
                        selectionColor="#FFFFFF"
                        // autoFocus={index === 0}
                        editable={!loading}
                        submitBehavior="blurAndSubmit"
                        onSubmitEditing={() => {
                          // when user presses "submit" on keyboard, move next or dismiss
                          if (index < 3) {
                            inputRefs.current[index + 1]?.focus();
                          } else {
                            Keyboard.dismiss();
                          }
                        }}
                        // iOS specific: avoid keyboard auto-show from predictive/autofill behavior
                        // (no built-in prop to disable, but ensuring no autoFocus helps)
                      />
                    ))}
                  </View>
                </TouchableWithoutFeedback>
                <Text style={styles.helperText}>
                  Don't have referral code? Ask your{"\n"}friend to share it
                </Text>
              </View>
              <View style={styles.bottomContainer}>
                <ButtonStart 
                  text={loading ? "Processing..." : "Continue"} 
                  handlepress={loading ? () => {} : handleContinue}
                />
                <TouchableOpacity
                  onPress={loading ? () => {} : handleNoCode}
                  style={[styles.noCodeButton, loading && { opacity: 0.5 }]}
                >
                  <Text style={styles.noCodeText}>
                    I don't have referral code
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>
      </GestureHandlerRootView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: scale(20),
    justifyContent: "space-between",
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
    gap: verticalScale(170),
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(28),
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: moderateScale(46), // 114.99% of 40px
    letterSpacing: moderateScale(-0.4), // -1% of 40px
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "400",
    lineHeight: moderateScale(22.4), // 140% of 16px
    letterSpacing: moderateScale(-0.16), // -1% of 16px
    textAlign: "center",
    marginBottom: verticalScale(40),
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: scale(200),
    marginBottom: verticalScale(30),
  },
  codeInput: {
    borderBottomWidth: moderateScale(2),
    width: scale(40),
    height: verticalScale(50),
    color: "#FFFFFF",
    fontSize: moderateScale(32),
    fontWeight: "600",
    fontFamily: "Plush-Trial",
    textAlign: "center",
    paddingBottom: verticalScale(8),
  },
  codeInputEmpty: {
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
  },
  codeInputFilled: {
    borderBottomColor: "#FFFFFF",
  },
  helperText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "400",
    lineHeight: moderateScale(22.4), // 140% of 16px
    letterSpacing: moderateScale(-0.16), // -1% of 16px
    textAlign: "center",
  },
  bottomContainer: {
    paddingBottom: verticalScale(10),
  },
  noCodeButton: {
    marginTop: verticalScale(20),
    paddingVertical: verticalScale(10),
  },
  noCodeText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "400",
    lineHeight: moderateScale(22.4), // 140% of 16px
    letterSpacing: moderateScale(-0.16), // -1% of 16px
    textAlign: "center",
  },
});

export default ReferralScreen;
