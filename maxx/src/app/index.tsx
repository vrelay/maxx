import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "@/src/componants/atoms/LoadingScreen";
import looksmaxxingService from "../services/looksmaxxingService";

const index = () => {
  const {
    isAuthenticated,
    user,
    isLoading,
    isPremium,
    setLooksmaxxingResults,
  } = useAuth();

  const [routingLoading, setRoutingLoading] = useState(true);
  const [routingDecision, setRoutingDecision] = useState<string | null>(null);

  useEffect(() => {
    const determineRouting = async () => {
      if (!isAuthenticated || !user) {
        setRoutingDecision("/(auth)");
        setRoutingLoading(false);
        return;
      }
      //temp redirect here
      // setRoutingDecision("/(tabs)/mainScreen");
      // setRoutingLoading(false);
      // return;

      try {
        // Get the latest AI result document from Firebase
        const aiResultResponse = await looksmaxxingService.getJsonFromFirestore(
          user.uid,
          "looksmaxxing_results"
        );

        // If no document exists, take user to tabs index (camera flow)
        if (!aiResultResponse.success || !aiResultResponse.data) {
          setRoutingDecision("/(tabs)");
          setRoutingLoading(false);
          setLooksmaxxingResults(aiResultResponse.data);
          return;
        }

        const aiResult = aiResultResponse.data;
        const generatedImages = aiResult.generatedImages || {};

        // Count the number of generated right images (after images)
        const rightImageCount = Object.keys(generatedImages).length;

        // Routing logic based on your requirements:
        if (rightImageCount >= 4) {
          // User has four right images generated - take to main screen
          setRoutingDecision("/(tabs)/mainScreen");
        } else if (rightImageCount === 1) {
          // Has only one generated image
          if (isPremium) {
            // User is premium - take to payment success
            setRoutingDecision("/(tabs)/paymentSuccess");
          } else {
            // User not premium - take to aiResult page
            setRoutingDecision("/(tabs)/aiResult");
          }
        } else {
          // User has some other number of images (0, 2, 3) - take to index of tabs
          setRoutingDecision("/(tabs)");
        }
      } catch (error) {
        console.error("Error determining routing:", error);
        // On error, default to tabs index
        setRoutingDecision("/(tabs)");
      } finally {
        setRoutingLoading(false);
      }
    };

    if (!isLoading) {
      determineRouting();
    }
  }, [isAuthenticated, user, isLoading, isPremium]);

  // Show loading while we determine the route
  if (isLoading || routingLoading) {
    return <LoadingScreen />;
  }

  // Redirect based on our routing decision
  if (routingDecision) {
    return <Redirect href={routingDecision as any} />;
  }

  // Fallback (shouldn't reach here)
  return <LoadingScreen />;
};

export default index;
