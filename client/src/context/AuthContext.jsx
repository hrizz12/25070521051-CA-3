import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we ask the server "who am I?"

  // When the page loads (or is refreshed) ask the server whether the cookie is still valid.
  // The login state lives in the server-checked cookie, NOT in localStorage.
  useEffect(() => {
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // If any API call comes back 401 later (cookie expired), drop the user so the app redirects to login.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const register = useCallback(async (form) => {
    const data = await api.register(form);
    setUser(data.user);
    return data;
  }, []);

  const login = useCallback(async (form) => {
    const data = await api.login(form);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout(); // server clears the cookie
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, register, login, logout }),
    [user, loading, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
