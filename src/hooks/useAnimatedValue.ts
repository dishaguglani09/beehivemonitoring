import { useState, useEffect, useRef } from 'react';

// Easing function for smooth animation (ease-out cubic)
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export default function useAnimatedValue(targetValue: number, duration: number = 2000): [number, boolean] {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true); // Start animating by default since we animate from 0
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (targetValue === currentValue && !isAnimatingRef.current) {
      setIsAnimating(false);
      return;
    }

    startValueRef.current = currentValue;
    startTimeRef.current = null;
    isAnimatingRef.current = true;
    setIsAnimating(true);

    const animate = (time: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }

      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = easeOutCubic(progress);
      
      const nextValue = startValueRef.current + (targetValue - startValueRef.current) * easeProgress;
      
      setCurrentValue(nextValue);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        isAnimatingRef.current = false;
        setCurrentValue(targetValue);
        setIsAnimating(false);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [targetValue, duration]);

  return [currentValue, isAnimating];
}
