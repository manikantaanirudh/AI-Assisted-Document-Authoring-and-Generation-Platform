import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.access_token);
      setToken(response.access_token);
      
      // Get user data - if this fails, login still succeeded
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (userError) {
        console.warn('Could not fetch user data after login:', userError);
        // Login succeeded, just couldn't fetch user info immediately
        // User will be fetched on next page load or can retry
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error; // Re-throw to be handled by the component
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await authService.register({ email, password });
      localStorage.setItem('token', response.access_token);
      setToken(response.access_token);
      // Get user data - if this fails, registration still succeeded
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (userError) {
        console.warn('Could not fetch user data after registration:', userError);
        // Registration succeeded, just couldn't fetch user info
        // User will be fetched on next page load
      }
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      throw error; // Re-throw to be handled by the component
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

