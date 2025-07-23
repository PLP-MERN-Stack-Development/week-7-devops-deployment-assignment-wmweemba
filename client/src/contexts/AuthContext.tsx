import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '@/types';
import { apiService } from '@/services/api';
import { storageService } from '@/services/storage';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } };

const initialState: AuthState & { loading: boolean; error: string | null } = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

function authReducer(state: typeof initialState, action: AuthAction): typeof initialState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Restore session from localStorage
    const user = storageService.get<User>('user');
    const token = storageService.get<string>('token');
    
    if (user && token) {
      // Verify token is not expired
      try {
        const payload = JSON.parse(atob(token));
        if (payload.exp > Date.now()) {
          dispatch({ type: 'RESTORE_SESSION', payload: { user, token } });
        } else {
          // Token expired, clear storage
          storageService.remove('user');
          storageService.remove('token');
        }
      } catch (error) {
        // Invalid token, clear storage
        storageService.remove('user');
        storageService.remove('token');
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const result = await apiService.login(username, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: result });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    }
  };

  const logout = async () => {
    await apiService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}