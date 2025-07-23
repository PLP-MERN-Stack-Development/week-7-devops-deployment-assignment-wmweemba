import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker, showInstallPrompt, checkOnlineStatus } from './utils/pwa';

// Register service worker for PWA functionality
registerServiceWorker();

// Show install prompt
showInstallPrompt();

// Check online status
checkOnlineStatus();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);