const env = (import.meta as any).env || {};

export const GOOGLE_CLIENT_ID: string = (
  env.VITE_GOOGLE_CLIENT_ID ||
  '992221704874-eg8ah1q0j8s1a9r1k5sl91o51uhr55ma.apps.googleusercontent.com'
).trim();

export interface GoogleIdentityPayload {
  name: string;
  email: string;
  googleId: string;
  picture?: string;
  accessToken?: string;
  idToken?: string;
}

/**
 * Checks if a real Google Client ID is configured in .env
 */
export function isRealGoogleConfigured(): boolean {
  return Boolean(
    GOOGLE_CLIENT_ID &&
      GOOGLE_CLIENT_ID.length > 15 &&
      GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')
  );
}

let googleScriptLoadingPromise: Promise<void> | null = null;

/**
 * Dynamically loads Google Identity Services (GIS) script
 */
export function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).google?.accounts) return Promise.resolve();

  if (!googleScriptLoadingPromise) {
    googleScriptLoadingPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (err) => reject(err));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(
          new Error('No se pudo cargar el SDK de Google Identity Services.')
        );
      document.head.appendChild(script);
    });
  }

  return googleScriptLoadingPromise;
}

/**
 * Triggers the official Google OAuth 2.0 Identity Popup and retrieves user details
 */
export async function triggerRealGooglePopup(): Promise<GoogleIdentityPayload> {
  await loadGoogleScript();

  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    throw new Error('El cliente de Google Identity no está disponible.');
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(
              new Error(
                tokenResponse.error_description ||
                  tokenResponse.error ||
                  'Inicio de sesión con Google cancelado.'
              )
            );
            return;
          }

          const accessToken = tokenResponse.access_token;
          try {
            // Fetch profile directly from Google Userinfo API
            const res = await fetch(
              'https://www.googleapis.com/oauth2/v3/userinfo',
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (!res.ok) {
              throw new Error('No se pudo obtener el perfil de usuario de Google.');
            }

            const profile = await res.json();
            resolve({
              googleId: profile.sub,
              email: (profile.email || '').toLowerCase(),
              name: profile.name || profile.given_name || profile.email.split('@')[0],
              picture: profile.picture,
              accessToken,
            });
          } catch (fetchErr: any) {
            reject(
              new Error(
                fetchErr?.message || 'Error validando datos de cuenta con Google.'
              )
            );
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      reject(err);
    }
  });
}
