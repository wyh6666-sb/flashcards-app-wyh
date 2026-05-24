import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
    setReady(true);
  }, []);

  const persist = (u, token) => {
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', token);
    setUser(u);
  };

  const login = async (username, password) => {
    const data = await api.login({ username, password });
    persist(data.user, data.token);
  };

  const register = async (username, email, password) => {
    const data = await api.register({ username, email, password });
    persist(data.user, data.token);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
