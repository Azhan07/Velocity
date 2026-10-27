import { useEffect, useState } from 'react';

let webglSupport = null;

/** Checks ONCE whether the browser can create a WebGL context, then frees the test context. */
export function hasWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl = window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
    webglSupport = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext(); // browsers limit open contexts
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/** Returns true below the given width — used to lighten the 3D scene on phones. */
export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return mobile;
}
