import img from "@/src/constants/img";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
const { width: screenWidth } = Dimensions.get("window");

const ImageSlider = ({
  beforeImage = img.before_img_grey,
  afterImage,
  containerWidth = screenWidth - 40,
  containerHeight = 400,
  sliderWidth = 4,
  knobSize = 40,
}) => {
  const sliderPosition = useSharedValue(containerWidth / 2);
  const startPosition = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      startPosition.value = sliderPosition.value;
    })
    .onUpdate((event) => {
      "worklet";
      const newPosition = startPosition.value + event.translationX;
      // Constrain the slider within bounds
      sliderPosition.value = Math.max(0, Math.min(containerWidth, newPosition));
    });

  // Before image container (left side) - only width changes
  const beforeContainerStyle = useAnimatedStyle(() => {
    return {
      width: sliderPosition.value,
    };
  });

  // After image container (right side) - only width changes
  const afterContainerStyle = useAnimatedStyle(() => {
    return {
      width: containerWidth - sliderPosition.value,
    };
  });

  // Slider line position
  const sliderStyle = useAnimatedStyle(() => {
    return {
      left: sliderPosition.value - sliderWidth / 2,
    };
  });

  // Knob position
  const knobStyle = useAnimatedStyle(() => {
    return {
      left: sliderPosition.value - knobSize / 2,
    };
  });

  return (
    <View
      style={[
        styles.container,
        { width: containerWidth, height: containerHeight },
      ]}
    >
      {/* Before Image (Left side) - FIXED position, only container width changes */}
      <Animated.View style={[styles.beforeContainer, beforeContainerStyle]}>
        <Image
          source={beforeImage}
          style={[
            styles.image,
            { width: containerWidth, height: containerHeight },
          ]}
          resizeMode="cover"
        />
      </Animated.View>

      {/* After Image (Right side) - FIXED position, only container width changes */}
      <Animated.View style={[styles.afterContainer, afterContainerStyle]}>
        <Image
          source={afterImage}
          style={[
            styles.image,
            {
              width: containerWidth,
              height: containerHeight,
              // Image stays in same position, but we clip from left
              right: 0,
            },
          ]}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Slider Line */}
      <Animated.View
        style={[
          styles.sliderLine,
          sliderStyle,
          { width: sliderWidth, height: containerHeight },
        ]}
      />

      {/* Draggable Knob */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.knob,
            knobStyle,
            { width: knobSize, height: knobSize },
          ]}
          collapsable={false}
        >
          <View style={styles.knobInner}>
            <View style={styles.arrows}>
              <View style={[styles.arrow, styles.arrowLeft]} />
              <View style={[styles.arrow, styles.arrowRight]} />
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    zIndex: 100,
  },
  // Before image container (left side)
  beforeContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    overflow: "hidden", // This clips the image
  },
  // After image container (right side)
  afterContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
    overflow: "hidden", // This clips the image
  },
  image: {
    position: "absolute",
    top: 0,
  },
  sliderLine: {
    position: "absolute",
    top: 0,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  knob: {
    position: "absolute",
    top: "50%",
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    transform: [{ translateY: -20 }],
    zIndex: 20,
  },
  knobInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  arrows: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  arrow: {
    width: 0,
    height: 0,
    borderStyle: "solid",
  },
  arrowLeft: {
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderRightWidth: 6,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#666",
  },
  arrowRight: {
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 6,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#666",
  },
});

export default ImageSlider;
