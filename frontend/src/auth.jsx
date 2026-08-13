import { createContext, useContext, useState, useCallback } from 'react';
import { api } from './api/client';

const DEFAULT_USER = {
  id: 'user-current',
  name: 'Iddrisu Miftau',
  email: 'iddrisumiftau204@gmail.com'
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('eventpass_user');

    if (raw) {
      return JSON.parse(raw);
    }

    localStorage.setItem('eventpass_user', JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  });

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('eventpass_token', data.token);
    localStorage.setItem('eventpass_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api.register({ name, email, password });
    localStorage.setItem('eventpass_token', data.token);
    localStorage.setItem('eventpass_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const updateProfile = useCallback((updates = {}) => {
    setUser((currentUser) => {
      const nextUser = {
        ...(currentUser || DEFAULT_USER),
        ...updates
      };

      localStorage.setItem('eventpass_user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('eventpass_token');
    localStorage.removeItem('eventpass_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
