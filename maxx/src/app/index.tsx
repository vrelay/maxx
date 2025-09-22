import { Redirect } from "expo-router";
import React from "react";
import { useAuth } from "../context/AuthContext";



const index = () => {
  const { isAuthenticated, user } = useAuth();

  return <Redirect href={isAuthenticated && user?.emailVerified ? "/(tabs)" : "/(auth)"} />;
};

export default index;
