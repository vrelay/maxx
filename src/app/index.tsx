import { Redirect } from "expo-router";
import React from "react";



const index = () => {
  const isloggedIn = false;
  return <Redirect href={isloggedIn ? "/(tabs)" : "/(auth)"} />;
};

export default index;
