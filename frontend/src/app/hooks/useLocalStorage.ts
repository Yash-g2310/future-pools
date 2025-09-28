import { useState, useEffect } from 'react';

export function useLocalStorage(key: string, initialValue: string | null = null) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<string | null>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: string | null) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        if (valueToStore === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, valueToStore);
        }
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  // Get from local storage then parse stored json or return initialValue
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        setStoredValue(item);
        setIsLoaded(true);
      }
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      setStoredValue(initialValue);
      setIsLoaded(true);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, isLoaded] as const;
}