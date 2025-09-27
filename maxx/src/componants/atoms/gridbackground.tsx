import img from "@/src/constants/img";
import React from "react";
import { ImageBackground, StyleSheet } from "react-native";
import { verticalScale } from "react-native-size-matters";

const GridBackgroundImg = ({top}: {top: boolean}) => {
  return (
    <ImageBackground
      source={img.gridpattern}
      style={[
        styles.gridimg,
        top ? { top: 0 } : { bottom: 0 }
      ]}
      imageStyle={styles.gridImageStyle}
    />
  );
};

const styles = StyleSheet.create({
  gridimg: {
    position: "absolute",
    left: 0,
    right: 0,
    height: verticalScale(150),
    width: "100%",
    zIndex: -1,
  },
  gridImageStyle: {
    resizeMode: "cover",
  },
});

export default GridBackgroundImg;
