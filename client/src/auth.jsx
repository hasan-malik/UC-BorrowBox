import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api('/auth/me', { auth: true })
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  function login(token, user) {
    setToken(token);
    setUser(user);
  }
  function logout() {
    setToken(null);
    setUser(null);
  }
  function updateUser(patch) {
    setUser((u) => ({ ...u, ...patch }));
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
