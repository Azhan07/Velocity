import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { useGLTF } from '@react-three/drei';
import App from './App';
import { GarageProvider } from './context/GarageContext';
import { SoundProvider } from './context/SoundContext';
import './index.css';

// The same car model is used on almost every page, so we start downloading it
// immediately. The preloader's tachometer shows the real progress of this download.
useGLTF.preload('/models/ferrari.glb', '/draco/');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GarageProvider>
        <SoundProvider>
          <App />
        </SoundProvider>
      </GarageProvider>
    </BrowserRouter>
  </StrictMode>
);
