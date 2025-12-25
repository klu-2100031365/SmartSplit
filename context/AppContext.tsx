"use client";

import React, { createContext, useState, useEffect } from 'react';
import { UserData, Currency } from '../types';
import { CURRENCIES } from '../lib/constants';

export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => { } });
export const CurrencyContext = createContext({ currency: 'INR' as Currency, setCurrency: (_c: Currency) => { }, symbol: '₹' });
export const AuthContext = createContext({
    user: null as UserData | null,
    guestName: null as string | null,
    setGuestName: (_name: string | null) => { },
    login: (_u: UserData, _t: string) => { },
    logout: () => { },
    isAuthenticated: false
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [guestName, setGuestName] = useState<string | null>(null);
    const [currency, setCurrency] = useState<Currency>('INR');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    const login = (u: UserData, t: string) => {
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('token', t);
        setUser(u);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setGuestName(null);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light') }}>
            <CurrencyContext.Provider value={{ currency, setCurrency, symbol: CURRENCIES[currency] }}>
                <AuthContext.Provider value={{ user, guestName, setGuestName, login, logout, isAuthenticated: !!user }}>
                    {children}
                </AuthContext.Provider>
            </CurrencyContext.Provider>
        </ThemeContext.Provider>
    );
};
