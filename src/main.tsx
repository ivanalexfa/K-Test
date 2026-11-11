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

if (urlHasMsalResponse) {
  broadcastResponseToMainFrame().catch(() => {
    mountApp();
  });
} else {
  mountApp();
}
