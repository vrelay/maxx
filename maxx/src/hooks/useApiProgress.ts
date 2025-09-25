import { useState, useCallback, useRef } from "react";

interface UseApiProgressReturn {
  isApiCallInProgress: boolean;
  apiProgress: number;
  step: number;
  showConfetti: boolean;
  startApiCall: () => void;
  handleApiProgress: (currentStep: number) => void;
  completeApiCall: () => void;
  resetApiProgress: () => void;
}

export const useApiProgress = (): UseApiProgressReturn => {
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);
  const [apiProgress, setApiProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const currentProgressRef = useRef(0);

  const startApiCall = useCallback(() => {
    setIsApiCallInProgress(true);
    setApiProgress(10); // Show initial progress
    currentProgressRef.current = 10; // Update ref
    setStep(0);
    setShowConfetti(false);
  }, []);

  const handleApiProgress = useCallback((currentStep: number) => {
    setStep(currentStep);
    
    // Map steps to progress percentage
    const progressMap: { [key: number]: number } = {
      0: 10,
      1: 20,
      2: 30,
      3: 40,
      4: 60,
      5: 80,
      6: 100,
    };
    
    const targetProgress = progressMap[currentStep] || 0;
    
    // Smooth progress animation
    const animateProgress = (from: number, to: number, duration: number = 1000) => {
      const startTime = Date.now();
      const difference = to - from;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentProgress = from + (difference * easeOutCubic);
        
        setApiProgress(currentProgress);
        currentProgressRef.current = currentProgress; // Update ref
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    };
    
    // Get current progress from ref and animate to target
    const currentProgress = currentProgressRef.current;
    animateProgress(currentProgress, targetProgress, 800);
  }, []);

  const completeApiCall = useCallback(() => {
    setIsApiCallInProgress(false);
    setShowConfetti(true);
  }, []);

  const resetApiProgress = useCallback(() => {
    setIsApiCallInProgress(false);
    setApiProgress(0);
    currentProgressRef.current = 0; // Update ref
    setStep(0);
    setShowConfetti(false);
  }, []);

  return {
    isApiCallInProgress,
    apiProgress,
    step,
    showConfetti,
    startApiCall,
    handleApiProgress,
    completeApiCall,
    resetApiProgress,
  };
};
