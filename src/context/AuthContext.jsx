import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSession, getCurrentUser, getStoredUser, getToken, loginUser, registerUser,
  saveSession, setUnauthorizedHandler, storeUser
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));
  // While a stored token is being checked with the server we do not know yet if the user is logged in.
  const [checking, setChecking] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // On page load: ask the server who this token belongs to. This is what keeps you logged in after a refresh
  // and also logs you out if the token has expired or the account was removed.
  useEffect(() => {
    let cancelled = false;
    if (!getToken()) { setChecking(false); return undefined; }
    getCurrentUser()
      .then(({ user: fresh }) => { if (!cancelled) { storeUser(fresh); setUser(fresh); } })
      .catch((err) => {
        // Only a real "not logged in" answer ends the session. If the server is just unreachable we keep the cached user.
        if (!cancelled && err.status === 401) logout();
      })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [logout]);

  // Any later API call that returns 401 (expired token) logs the user out immediately.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(() => {});
  }, [logout]);

  // Keep several browser tabs in sync: logging out in one tab logs out the others.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'campusbridge_token' && !e.newValue) setUser(null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await loginUser(credentials);
    saveSession(result);
    setUser(result.user);
    return result.user;
  }, []);

  // Registering only creates the account. The page calls startSession() afterwards, so it can show a
  // success message first (logging in immediately would redirect away from the registration page).
  const register = useCallback((details) => registerUser(details), []);

  const startSession = useCallback((result) => {
    saveSession(result);
    setUser(result.user);
  }, []);

  const updateUser = useCallback((fresh) => {
    storeUser(fresh);
    setUser(fresh);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), checking, login, register, startSession, logout, updateUser }),
    [user, checking, login, register, startSession, logout, updateUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
