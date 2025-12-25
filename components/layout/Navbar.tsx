"use client";

import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun, ArrowLeftRight, Calculator as CalcIcon } from 'lucide-react';
import SmartSplitLogo from '../ui/SmartSplitLogo';
import Button from '../ui/Button';
import CalculatorModal from '../modals/CalculatorModal';
import CurrencyConverterModal from '../modals/CurrencyConverterModal';
import { AuthContext, ThemeContext, CurrencyContext } from '../../context/AppContext';
import { CURRENCIES } from '../../lib/constants';
import { Currency } from '../../types';

const Navbar = () => {
    const { user, guestName } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { currency, setCurrency } = useContext(CurrencyContext);
    const router = useRouter();
    const [showCalc, setShowCalc] = useState(false);
    const [showConv, setShowConv] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors">
                <div className="max-w-[1600px] mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => user ? router.push('/dashboard') : router.push('/')}>
                        <SmartSplitLogo />
                        <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white hidden sm:block">SmartSplit</span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                            <button onClick={() => setShowCalc(true)} className="p-2 text-gray-500 hover:text-brand-blue hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all" title="Calculator">
                                <CalcIcon size={20} />
                            </button>
                            <button onClick={() => setShowConv(true)} className="p-2 text-gray-500 hover:text-brand-blue hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all" title="Currency Converter">
                                <ArrowLeftRight size={20} />
                            </button>
                        </div>

                        <div className="hidden md:block h-8 w-px bg-gray-200 dark:bg-gray-800"></div>

                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as Currency)}
                            className="bg-transparent font-bold text-gray-700 dark:text-gray-200 text-sm outline-none cursor-pointer hover:text-brand-blue transition-colors"
                        >
                            {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-100 dark:border-gray-800">
                                <button onClick={() => router.push('/profile')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-blue to-brand-skyblue text-white flex items-center justify-center font-bold shadow-md shadow-brand-blue/20">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200 hidden md:block">{user.name}</span>
                                </button>
                            </div>
                        ) : (
                            guestName ? (
                                <div className="flex items-center gap-3 bg-brand-orange/10 px-4 py-2 rounded-full">
                                    <span className="text-sm text-brand-orange font-bold">Guest: {guestName}</span>
                                </div>
                            ) : (
                                <Button onClick={() => router.push('/login')} className="hidden sm:flex py-2.5 px-6 text-sm">Sign In</Button>
                            )
                        )}
                    </div>
                </div>
            </nav>
            <CalculatorModal isOpen={showCalc} onClose={() => setShowCalc(false)} />
            <CurrencyConverterModal isOpen={showConv} onClose={() => setShowConv(false)} />
        </>
    );
};

export default Navbar;
