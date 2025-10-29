import { router } from "expo-router";
import { Alert } from "react-native";

/**
 * Safe navigation utilities to prevent crashes
 */
export class SafeNavigation {
  /**
   * Safely navigate back with error handling
   */
  static goBack(fallbackRoute?: string) {
    try {
      // Check if we can go back
      if (router.canGoBack()) {
        router.back();
      } else if (fallbackRoute) {
        // If no back history and fallback provided, navigate to fallback
        router.replace(fallbackRoute as any);
      } else {
        // If no back history and no fallback, show error
        console.warn("No previous screen to go back to");
        Alert.alert(
          "Navigation Error",
          "No previous screen to go back to",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert(
        "Navigation Error",
        "Unable to navigate back. Please try again.",
        [{ text: "OK" }]
      );
    }
  }

  /**
   * Safely navigate to a route with error handling
   */
  static navigate(route: string, params?: any) {
    try {
      if (params) {
        router.push({ pathname: route, params } as any);
      } else {
        router.push(route as any);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert(
        "Navigation Error",
        "Unable to navigate to the requested screen. Please try again.",
        [{ text: "OK" }]
      );
    }
  }

  /**
   * Safely replace current route with error handling
   */
  static replace(route: string, params?: any) {
    try {
      if (params) {
        router.replace({ pathname: route, params } as any);
      } else {
        router.replace(route as any);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert(
        "Navigation Error",
        "Unable to navigate to the requested screen. Please try again.",
        [{ text: "OK" }]
      );
    }
  }

  /**
   * Check if navigation is safe
   */
  static canNavigate(): boolean {
    try {
      return router.canGoBack();
    } catch (error) {
      console.error("Navigation check error:", error);
      return false;
    }
  }
}
