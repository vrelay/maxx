import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const ButtonStart = ({
  text,
  handlepress,
}: {
  text: string;
  handlepress: () => void;
}) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.continueButton} onPress={handlepress}>
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingTop: verticalScale(20),
    zIndex: 100,
  },
  continueButton: {
    height: verticalScale(40),
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(16),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(8),
    elevation: moderateScale(8),
  },
  buttonText: {
    color: "#2D1B69",
    fontSize: moderateScale(14),
    fontWeight: "500",
    letterSpacing: moderateScale(-1),
  },
});

export default ButtonStart;
