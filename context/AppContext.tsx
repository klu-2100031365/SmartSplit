"use client";

import React, { createContext, useState, useEffect } from 'react';
import { UserData, Currency } from '../types';
import { CURRENCIES } from '../lib/constants';

export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => { } });
export const CurrencyContext = createContext({ currency: 'INR' as Currency, setCurrency: (_c: Currency) => { void _c; }, symbol: '₹' });
export const AuthContext = createContext({
    user: null as UserData | null,
    guestName: null as string | null,
    setGuestName: (_name: string | null) => { void _name; },
    login: (_u: UserData, _t: string) => { void _u; void _t; },
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

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <CurrencyContext.Provider value={{ currency, setCurrency, symbol: CURRENCIES[currency] }}>
                <AuthContext.Provider value={{ user, guestName, setGuestName, login, logout, isAuthenticated: !!user }}>
                    {children}
                </AuthContext.Provider>
            </CurrencyContext.Provider>
        </ThemeContext.Provider>
    );
};
