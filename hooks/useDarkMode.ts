
import { useState, useEffect } from 'react';

export function useDarkMode(): [boolean, () => void] {
  // Initialize with current state from DOM/localStorage
  const [isDarkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply the theme class to the html element
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('✅ Dark mode class added to <html>');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('✅ Light mode - dark class removed from <html>');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      console.log('🌓 Dark mode toggled:', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  return [isDarkMode, toggleDarkMode];
}
