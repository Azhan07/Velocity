import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { engine } from '../utils/engineSound';

/** Global on/off switch for the (synthesised) engine sound. OFF by default. */
const SoundContext = createContext({ enabled: false, toggle: () => {} });

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(false);

  const toggle = useCallback(() => {
    if (enabled) engine.stop();
    else {
      engine.start();
      engine.rev();
    }
    setEnabled(!enabled);
  }, [enabled]);

  useEffect(() => () => engine.stop(), []);

  return <SoundContext.Provider value={{ enabled, toggle }}>{children}</SoundContext.Provider>;
}

export const useSound = () => useContext(SoundContext);
