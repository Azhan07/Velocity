import { useEffect, useState } from 'react';

/**
 * Like useState, but the value is saved to LocalStorage so it survives a refresh.
 * Wrapped in try/catch because storage can be blocked (private mode, etc.).
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — keep working in memory */
    }
  }, [key, value]);

  return [value, setValue];
}
