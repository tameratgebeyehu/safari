export interface AuthContext {
  userId?: string;
  userRole?: 'sender' | 'receiver' | 'admin';
  sessionToken?: string;
}

export interface AuthSession {
  userId: string;
  role: 'sender' | 'receiver' | 'admin';
  name: string;
  token: string;
  expiresAt: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthProviderInterface {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  refreshSession(): Promise<AuthSession | null>;
  getSession(): AuthSession | null;
  isAuthenticated(): boolean;
  getAuthContext(): AuthContext;
  onSessionExpired?(callback: () => void): void;
}

let currentSession: AuthSession | null = null;

async function loginWithProvider(provider: AuthProviderInterface, credentials: LoginCredentials): Promise<AuthSession> {
  const session = await provider.login(credentials);
  currentSession = session;
  return session;
}

async function logoutCurrentSession(provider: AuthProviderInterface): Promise<void> {
  await provider.logout();
  currentSession = null;
}

function getSession(): AuthSession | null {
  return currentSession;
}

function isAuthenticated(): boolean {
  if (!currentSession) return false;
  if (Date.now() > currentSession.expiresAt) {
    currentSession = null;
    return false;
  }
  return true;
}

function getAuthContext(): AuthContext {
  if (!currentSession) return {};
  return {
    userId: currentSession.userId,
    userRole: currentSession.role,
    sessionToken: currentSession.token,
  };
}

const AuthService = {
  loginWithProvider,
  logoutCurrentSession,
  getSession,
  isAuthenticated,
  getAuthContext,
};

export default AuthService;