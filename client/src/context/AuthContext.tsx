import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'STUDENT' | 'ADMIN' | 'AGENT' | 'CONTROLLER';

interface User {
  id: string;
  phoneNumber: string;
  role: UserRole;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('bts_user');
    if (storedUser) {
      try { return JSON.parse(storedUser); } catch(e) { return null; }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bts_token') || null;
  });

  useEffect(() => {
    const handleAuthError = () => {
      logout();
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const login = (userData: User, jwtToken: string) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('bts_token', jwtToken);
    localStorage.setItem('bts_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bts_token');
    localStorage.removeItem('bts_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
