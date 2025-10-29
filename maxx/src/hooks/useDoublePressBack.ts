import { useFocusEffect } from "expo-router";
import React, { useRef } from "react";
import { BackHandler, Platform, Alert } from "react-native";

export const useDoublePressBack = (message: string = "Press back again to exit") => {
  const backPressCount = useRef(0);
  const backPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        backPressCount.current += 1;
        
        if (backPressCount.current === 1) {
          // Use platform-appropriate toast/alert
          if (Platform.OS === 'android') {
            // For Android, we can use a simple console log or a toast library
            console.log(message);
          } else {
            // For iOS, show a brief alert or use a toast library
            console.log(message);
          }
          
          // Reset counter after 2 seconds
          backPressTimer.current = setTimeout(() => {
            backPressCount.current = 0;
          }, 2000);
          
          return true; // Prevent default back action
        } else if (backPressCount.current === 2) {
          // Clear timer and allow exit
          if (backPressTimer.current) {
            clearTimeout(backPressTimer.current);
          }
          backPressCount.current = 0;
          return false; // Allow default back action
        }
        
        return true; // Prevent default back action
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        subscription.remove();
        if (backPressTimer.current) {
          clearTimeout(backPressTimer.current);
        }
      };
    }, [message])
  );
};
