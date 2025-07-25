import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '@/types';
import { apiService } from '@/services/api';

interface AuthContextType extends AuthState {
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    error: string | null;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const user = await apiService.getCurrentUser();
                    dispatch({ 
                        type: 'RESTORE_SESSION', 
                        payload: { user, token } 
                    });
                }
            } catch (error) {
                localStorage.removeItem('token');
            }
        };
        restoreSession();
    }, []);

    const login = async (username: string, password: string) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const { user, token } = await apiService.login(username, password);
            localStorage.setItem('token', token);
            dispatch({ 
                type: 'LOGIN_SUCCESS', 
                payload: { user, token } 
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            dispatch({ 
                type: 'LOGIN_FAILURE', 
                payload: message 
            });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiService.logout();
        } finally {
            localStorage.removeItem('token');
            dispatch({ type: 'LOGOUT' });
        }
    };

    const value = {
        ...state,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};