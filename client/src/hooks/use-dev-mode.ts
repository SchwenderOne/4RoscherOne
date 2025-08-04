import { useState, useEffect } from 'react';

export function useDevMode() {
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Check localStorage for dev mode setting
    const saved = localStorage.getItem('devMode');
    if (saved === 'true') {
      setIsDevMode(true);
    }
  }, []);

  const toggleDevMode = () => {
    const newDevMode = !isDevMode;
    setIsDevMode(newDevMode);
    localStorage.setItem('devMode', newDevMode.toString());
  };

  return {
    isDevMode,
    toggleDevMode,
  };
}