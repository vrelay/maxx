import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import ImageSlider from "@/src/componants/molecules/imgslider";
import img from "@/src/constants/img";
import { useAuth } from "@/src/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const TabsIndex = () => {
  const { user, isAuthenticated } = useAuth();

  const handleContinue = () => {
    if (isAuthenticated) {
      if (user && user.emailVerified) {
        router.push("/(tabs)");
        // router.push("/(tabs)/loadingAiProcessing");
        // router.push("/(tabs)/aiResult");
        // router.push("/(tabs)/mainScreen");
        return;
      } else if (user && !user.emailVerified) {
        router.push("/(auth)/verifyEmailScreen");
        return;
      }
    } else {
      router.push("/(auth)/authScreen");
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2D1B69" />

        {/* Background Image positioned at bottom */}
        <GridBackgroundImg top={false} />

        {/* Main content with gradient overlay */}
        <LinearGradient
          colors={["#171840", "#6D37D4"]}
          locations={[0, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.textContainer}>
              <Text style={styles.heading}>
                From today's{"\n"}
                you, to your peak{"\n"}potential
              </Text>
              <Text style={styles.subheading}>
                Discover your ultimate look and the steps to{"\n"}achieve it.
              </Text>
            </View>
            {/* Image Slider Section */}
            <View style={styles.sliderContainer}>
              <ImageSlider
                beforeImage={img.before_img_grey}
                afterImage={img.after_img}
                containerWidth={scale(300)}
                containerHeight={scale(305)}
                sliderWidth={moderateScale(3)}
                knobSize={moderateScale(36)}
              />
            </View>
            {/* Continue Button Section */}
            <ButtonStart text="Continue" handlepress={handleContinue} />
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
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(20),
    zIndex: 2,
  },
  textContainer: {
    alignItems: "flex-start",
  },
  heading: {
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(40),
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: moderateScale(46), // 114.99% of 40px
    letterSpacing: moderateScale(-0.4), // -1% of 40px
  },
  subheading: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "400",
    lineHeight: moderateScale(22.4), // 140% of 16px
    letterSpacing: moderateScale(-0.16), // -1% of 16px
    marginTop: verticalScale(16),
  },
  sliderContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});

export default TabsIndex;
