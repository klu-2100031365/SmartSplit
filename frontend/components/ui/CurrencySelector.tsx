"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { CURRENCIES } from '../../lib/constants';
import { Currency } from '../../types';

interface CurrencySelectorProps {
    value: Currency;
    onChange: (currency: Currency) => void;
    label?: string;
    className?: string;
}

const CurrencySelector = ({ value, onChange, label, className = '' }: CurrencySelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const currencies = Object.keys(CURRENCIES) as Currency[];

    return (
        <div className={`space-y-2 ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl
                        flex items-center justify-between
                        outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all 
                        text-gray-900 dark:text-white text-base
                        ${isOpen ? 'ring-4 ring-brand-blue/10 border-brand-blue' : ''}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-sm font-medium">
                            {CURRENCIES[value]}
                        </span>
                        <span className="font-medium">{value}</span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-1">
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {currencies.map((currency) => (
                                <button
                                    key={currency}
                                    type="button"
                                    onClick={() => {
                                        onChange(currency);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full px-3 py-3 flex items-center justify-between rounded-xl transition-colors
                                        ${value === currency
                                            ? 'bg-brand-blue/10 text-brand-blue'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`
                                            w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium
                                            ${value === currency
                                                ? 'bg-brand-blue/20 text-brand-blue'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                                        `}>
                                            {CURRENCIES[currency]}
                                        </span>
                                        <span className="font-medium">{currency}</span>
                                    </div>
                                    {value === currency && <Check size={18} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrencySelector;
