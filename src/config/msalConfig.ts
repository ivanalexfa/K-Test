import { Configuration, PublicClientApplication } from '@azure/msal-browser';

const env = (import.meta as any).env || {};

export const MSAL_CLIENT_ID: string = (
  env.VITE_MSAL_CLIENT_ID || 'a80687e4-353c-4654-a13e-8f3c21438110'
).trim();
export const MSAL_TENANT_ID: string = (env.VITE_MSAL_TENANT_ID || 'common').trim();
export const MSAL_REDIRECT_URI: string =
  typeof window !== 'undefined'
    ? window.location.origin
    : (env.VITE_MSAL_REDIRECT_URI || 'http://localhost:5173').trim();

/**
 * Returns true if a real Azure Application (Client) ID has been configured in .env
 */
export function isRealMsalConfigured(): boolean {
  return Boolean(
    MSAL_CLIENT_ID &&
      MSAL_CLIENT_ID.length > 10 &&
      !MSAL_CLIENT_ID.startsWith('TU_CLIENT_ID')
  );
}

/**
 * Controls whether the collapsible Demo Accounts section is visible in AuthView.
 * Disappears naturally in production when VITE_ENABLE_DEMO_ACCOUNTS=false or PROD build.
 */
export function isDemoAccountsEnabled(): boolean {
  const flag = (env.VITE_ENABLE_DEMO_ACCOUNTS ?? 'false').toString().toLowerCase();
  return flag === 'true';
}

export const msalConfig: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID || '00000000-0000-0000-0000-000000000000',
    authority: `https://login.microsoftonline.com/${MSAL_TENANT_ID}`,
    redirectUri: MSAL_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

export const microsoftLoginScopes = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  prompt: 'select_account',
};

let msalAppInstance: PublicClientApplication | null = null;
let msalInitPromise: Promise<PublicClientApplication> | null = null;

export async function getInitializedMsalApp(): Promise<PublicClientApplication> {
  if (!msalInitPromise) {
    msalInitPromise = (async () => {
      msalAppInstance = new PublicClientApplication(msalConfig);
      await msalAppInstance.initialize();
      return msalAppInstance;
    })();
  }
  return msalInitPromise;
}

export interface MicrosoftIdentityPayload {
  name: string;
  email: string;
  microsoftOid: string;
  idToken?: string;
  accessToken?: string;
}

/**
 * Launches the real Microsoft Entra ID (Azure AD) OAuth 2.0 / OIDC Popup
 * using @azure/msal-browser when VITE_MSAL_CLIENT_ID is configured.
 */
export async function triggerRealMicrosoftPopup(): Promise<MicrosoftIdentityPayload> {
  const app = await getInitializedMsalApp();
  const result = await app.loginPopup(microsoftLoginScopes);
  const account = result.account;

  if (!account) {
    throw new Error('No se recibió ninguna cuenta desde Microsoft Entra ID.');
  }

  return {
    name: account.name || account.username.split('@')[0],
    email: account.username,
    microsoftOid: account.localAccountId || account.homeAccountId,
    idToken: result.idToken,
    accessToken: result.accessToken,
  };
}
