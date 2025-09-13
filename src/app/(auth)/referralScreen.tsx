import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const ReferralScreen = () => {
  const [referralCode, setReferralCode] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

  const handleCodeChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...referralCode];
      newCode[index] = value;
      setReferralCode(newCode);

      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === "Backspace" && !referralCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = () => {
    const codeString = referralCode.join("");
    if (codeString.length === 4) {
      router.push("/(tabs)");
    } else {
      console.log("Please enter complete referral code");
    }
  };

  const handleNoCode = () => {
    router.push("/(tabs)");
  };

  return (
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
              <View style={styles.codeInputContainer}>
                {referralCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
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
                    autoFocus={index === 0}
                  />
                ))}
              </View>
              <Text style={styles.helperText}>
                Don't have referral code? Ask your{"\n"}friend to share it
              </Text>
            </View>
            <View style={styles.bottomContainer}>
              <ButtonStart text="Continue" handlepress={handleContinue} />
              <TouchableOpacity
                onPress={handleNoCode}
                style={styles.noCodeButton}
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
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(24),
    fontWeight: "500",
    textAlign: "center",
    marginBottom: verticalScale(8),
    letterSpacing: moderateScale(-0.5),
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(40),
    fontWeight: "400",
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
    fontSize: moderateScale(14),
    textAlign: "center",
    lineHeight: verticalScale(20),
    fontWeight: "500",
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
    fontSize: moderateScale(14),
    textAlign: "center",
    fontWeight: "500",
  },
});

export default ReferralScreen;
