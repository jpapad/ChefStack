
import { useState, useEffect } from 'react';

export function useDarkMode(): [boolean, () => void] {
  const [isDarkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Set initial state based on localStorage or system preference
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    // Apply the theme class to the html element
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return [isDarkMode, toggleDarkMode];
}
