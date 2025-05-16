import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState, LoginCredentials, RegisterData, User } from '../types/auth';
import { AuthService } from '../services/auth.service';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updatePassword: (passwords: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const user = await AuthService.getCurrentUser();
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired. Please login again.',
          });
        }
      } else {
        setAuthState({
          ...initialState,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user, token } = await AuthService.login(credentials);

      console.log(user, token);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      toast.success(`Welcome back, ${user.name}!`, {
        description: "Login successful"
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to login. Please check your credentials.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error("Login failed", {
        description: errorMessage
      });
    }
  };

  const register = async (userData: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user, token } = await AuthService.register(userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      toast.success(`Welcome, ${user.name}!`, {
        description: "Registration successful"
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to register. Please try again.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error("Registration failed", {
        description: errorMessage
      });
    }
  };

  const logout = () => {
    AuthService.logout();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    toast.success("Logged out", {
      description: "You have been logged out successfully."
    });
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!authState.user) return;
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const updatedUser = await AuthService.updateProfile(authState.user.id, userData);
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
      
      toast.success("Profile updated", {
        description: "Your profile has been updated successfully."
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error("Update failed", {
        description: errorMessage
      });
    }
  };

  const updatePassword = async (passwords: { currentPassword: string; newPassword: string }) => {
    if (!authState.user) return;
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await AuthService.updatePassword(authState.user.id, passwords);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      toast.success("Password updated", {
        description: "Your password has been updated successfully."
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update password.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error("Update failed", {
        description: errorMessage
      });
    }
  };

  const value = {
    authState,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
