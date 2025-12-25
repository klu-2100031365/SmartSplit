"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
    error?: string;
}

const Select = ({ label, options, error, className = '', ...props }: SelectProps) => (
    <div className={`space-y-2 ${className}`}>
        {label && <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>}
        <div className="relative">
            <select
                {...props}
                className={`
                    w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl
                    outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all text-gray-900 dark:text-white
                    appearance-none cursor-pointer text-base
                    ${error ? 'border-brand-orange' : ''}
                `}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ArrowRight size={16} className="rotate-90" />
            </div>
        </div>
        {error && <p className="text-xs text-brand-orange font-medium ml-1">{error}</p>}
    </div>
);

export default Select;
