import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { uid } from '../utils/format';

/**
 * Global "garage" state: favourite cars, saved builds and the compare pair.
 * Everything is persisted to LocalStorage — no login or database needed.
 */
const GarageContext = createContext(null);

export function GarageProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage('velocity:favorites', []);
  const [builds, setBuilds] = useLocalStorage('velocity:builds', []);
  const [compare, setCompare] = useLocalStorage('velocity:compare', ['velocity-vx1', 'aurion-e9']);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback(
    (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
    [setFavorites]
  );

  const clearFavorites = useCallback(() => setFavorites([]), [setFavorites]);

  /** Save a new build, or update an existing one when build.id is given. */
  const saveBuild = useCallback(
    (build) => {
      const now = new Date().toISOString();
      const exists = build.id && builds.some((b) => b.id === build.id);
      const savedId = exists ? build.id : uid();
      setBuilds((list) =>
        exists
          ? list.map((b) => (b.id === savedId ? { ...b, ...build, updatedAt: now } : b))
          : [{ ...build, id: savedId, createdAt: now, updatedAt: now }, ...list]
      );
      return savedId;
    },
    [builds, setBuilds]
  );

  const removeBuild = useCallback((id) => setBuilds((list) => list.filter((b) => b.id !== id)), [setBuilds]);

  /** Put a car in compare slot 0 or 1 */
  const setCompareSlot = useCallback(
    (slot, carId) =>
      setCompare((pair) => {
        const next = [...pair];
        next[slot] = carId;
        return next;
      }),
    [setCompare]
  );

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, clearFavorites, builds, saveBuild, removeBuild, compare, setCompareSlot }),
    [favorites, isFavorite, toggleFavorite, clearFavorites, builds, saveBuild, removeBuild, compare, setCompareSlot]
  );

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>;
}

export const useGarage = () => {
  const ctx = useContext(GarageContext);
  if (!ctx) throw new Error('useGarage must be used inside <GarageProvider>');
  return ctx;
};
