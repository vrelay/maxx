// services/ToastService.tsx
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";

export const ToastService: React.FC = () => {
  const { error, success } = useAuth();

  useEffect(() => {
    if (error) {
      console.log("showing error toast", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error,
        position: "top",
      });
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: success,
        position: "top",
      });
    }
  }, [success]);

  return null;
};
