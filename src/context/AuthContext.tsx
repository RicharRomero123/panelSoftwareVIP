// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { UserSession } from '../types';
import Cookies from 'js-cookie';
interface AuthContextType {
    user: UserSession | null;
    login: (userData: UserSession) => void;
    logout: () => void;
    isAdmin: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
                localStorage.removeItem('user');
                Cookies.remove('user', { path: '/' });
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: UserSession) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        Cookies.set('user', JSON.stringify(userData), { expires: 7, path: '/' });
        // Cookies.set('jwtToken', response.token, { expires: 7, path: '/' }); // Para JWT
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        Cookies.remove('user', { path: '/' });
        // Cookies.remove('jwtToken', { path: '/' }); // Para JWT
    };

    const isAdmin = user?.rol === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
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