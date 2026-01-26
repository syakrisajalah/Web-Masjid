import { createContext, useContext } from 'react';
import { User, UserRole, MosqueGeneralInfo } from './types';

// Auth Context
export interface AuthContextType {
  user: User;
  login: (role: UserRole, userData?: User) => void; 
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Theme Context
export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

// Mosque Info Context
export interface MosqueContextType {
    info: MosqueGeneralInfo;
    refreshInfo: () => void;
}

export const MosqueContext = createContext<MosqueContextType | undefined>(undefined);

export const useMosqueInfo = () => {
    const context = useContext(MosqueContext);
    if (!context) throw new Error('useMosqueInfo must be used within a MosqueProvider');
    return context.info;
};