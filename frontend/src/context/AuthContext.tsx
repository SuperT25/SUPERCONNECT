import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('supert_token'));
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('supert_user');
    return u ? JSON.parse(u) : null;
  });

  const login = (t: string, u: User) => {
    localStorage.setItem('supert_token', t);
    localStorage.setItem('supert_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('supert_token');
    localStorage.removeItem('supert_user');
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
