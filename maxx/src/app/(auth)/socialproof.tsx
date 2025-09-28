import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import img from "@/src/constants/img";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const SecondScreen = () => {
  const handleTransformMe = () => {
    router.push("/(auth)/referralScreen");
  };

  return (
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
          {/* Laurel Wreath with 2M Text */}
          <View style={styles.contentContainer}>
            <View style={styles.laurelContainer}>
              <Image
                source={img.laurelWreath} // You'll need to add this image to your constants
                style={styles.laurelImage}
                resizeMode="contain"
              />
              <Text style={styles.laurelText}>2M</Text>
            </View>

            {/* Main Heading */}
            <Text style={styles.heading}>
              Transformations{"\n"}
              <Text style={styles.headingItalic}>and counting</Text>
            </Text>

            {/* Subheading */}
            <Text style={styles.subheading}>
              The fastest-growing community of men{"\n"}
              investing in themselves.
            </Text>
          </View>

          {/* Transform Me Button */}
          <ButtonStart text="Transform Me" handlepress={handleTransformMe} />
        </SafeAreaView>
      </LinearGradient>
    </View>
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
  contentContainer: {
    flex: 1,
    alignItems: "flex-start",
    paddingTop: verticalScale(100),
  },
  laurelContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(10),
    position: "relative",
  },
  laurelImage: {
    width: scale(162),
    height: scale(120),
  },
  laurelText: {
    position: "absolute",
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(32),
    fontWeight: "700",
    letterSpacing: moderateScale(-1),
  },
  heading: {
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(40),
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: moderateScale(46), // 114.99% of 40px
    letterSpacing: moderateScale(-0.4), // -1% of 40px
    marginBottom: verticalScale(16),
  },
  headingItalic: {
    fontStyle: "italic",
    color: "#FFFFFF",
  },
  subheading: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "400",
    lineHeight: moderateScale(22.4), // 140% of 16px
    letterSpacing: moderateScale(-0.16), // -1% of 16px
  },
});

export default SecondScreen;
