/**
 * Tiny event helper: the preloader calls markReady() when it opens,
 * and the homepage waits for it before starting the intro animation
 * (so nobody misses the car's entrance behind the loading screen).
 */
let ready = false;
const listeners = new Set();

export function markReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

export function onReady(fn) {
  if (ready) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const isReady = () => ready;
