import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";

interface ConfettiBurstProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const ConfettiBurst: React.FC<ConfettiBurstProps> = ({
  isVisible,
  onComplete,
}) => {
  const confettiAnimation = new Animated.Value(0);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const burstY = 50;
  const burstX = screenWidth / 2;
  const paperPieces = [
    { color: "#FFD700", size: 12, shape: "square" },
    { color: "#FF6B6B", size: 8, shape: "circle" },
    { color: "#4ECDC4", size: 15, shape: "rectangle" },
    { color: "#45B7D1", size: 10, shape: "triangle" },
    { color: "#96CEB4", size: 14, shape: "square" },
    { color: "#FFEAA7", size: 6, shape: "circle" },
    { color: "#DDA0DD", size: 11, shape: "rectangle" },
    { color: "#98D8C8", size: 9, shape: "triangle" },
    { color: "#FF9F43", size: 13, shape: "square" },
    { color: "#6C5CE7", size: 7, shape: "circle" },
    { color: "#A29BFE", size: 16, shape: "rectangle" },
    { color: "#FD79A8", size: 5, shape: "triangle" },
  ];

  useEffect(() => {
    if (isVisible) {
      Animated.timing(confettiAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();
      
      // Call onComplete after confetti animation
      setTimeout(() => {
        onComplete?.();
      }, 2500);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <View style={styles.confettiContainer}>
      {[...Array(60)].map((_, i) => {
        const piece = paperPieces[i % paperPieces.length];

        const randomAngle = Math.random() * 2 * Math.PI;
        const randomDistance = 100 + Math.random() * 200;

        const endX = burstX + Math.cos(randomAngle) * randomDistance;
        const endY = burstY + Math.sin(randomAngle) * randomDistance;

        const extraRandomX = (Math.random() - 0.5) * 80;
        const extraRandomY = (Math.random() - 0.5) * 80;
        const finalEndX = endX + extraRandomX;
        const finalEndY = endY + extraRandomY;

        return (
          <Animated.View
            key={i}
            style={[
              styles.paperPiece,
              {
                left: burstX - piece.size / 2,
                top: burstY - piece.size / 2,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: piece.shape === "circle" ? piece.size / 2 : 2,
                transform: [
                  {
                    translateX: confettiAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, finalEndX - burstX],
                    }),
                  },
                  {
                    translateY: confettiAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, finalEndY - burstY],
                    }),
                  },
                  {
                    rotate: confettiAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "720deg"],
                    }),
                  },
                  {
                    scale: confettiAnimation.interpolate({
                      inputRange: [0, 0.1, 0.8, 1],
                      outputRange: [0, 1.2, 1, 0.3],
                    }),
                  },
                ],
                opacity: confettiAnimation.interpolate({
                  inputRange: [0, 0.1, 0.7, 1],
                  outputRange: [0, 1, 1, 0],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    zIndex: 1000,
  },
  paperPiece: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default ConfettiBurst;
