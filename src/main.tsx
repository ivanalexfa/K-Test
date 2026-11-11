import React from 'react';
import ReactDOM from 'react-dom/client';
import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge';
import { BrowserRouter } from 'react-router';
import App from './App';
import './index.css';

function mountApp() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// In @azure/msal-browser v5, loginPopup() uses BroadcastChannel via
// broadcastResponseToMainFrame() when Microsoft redirects the popup back to
// redirectUri with ?code=...&state=... or #code=...&state=...
const urlHasMsalResponse =
  (window.location.hash.includes('code=') ||
    window.location.hash.includes('error=') ||
    window.location.search.includes('code=') ||
    window.location.search.includes('error=')) &&
  (window.location.hash.includes('state=') ||
    window.location.search.includes('state='));

// En desarrollo, Google y Microsoft solo aceptan el origen registrado
// (http://localhost:5173): si se abre por 127.0.0.1, se pasa a localhost.
const enOrigenNoRegistrado =
  import.meta.env.DEV && window.location.hostname === '127.0.0.1';

if (enOrigenNoRegistrado) {
  window.location.replace(window.location.href.replace('127.0.0.1', 'localhost'));
} else if (urlHasMsalResponse) {
  broadcastResponseToMainFrame().catch(() => {
    mountApp();
  });
} else {
  mountApp();
}
