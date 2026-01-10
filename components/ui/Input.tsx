"use client";

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
}

const Input = ({ label, error, leftElement, rightElement, className = '', ...props }: InputProps) => (
    <div className={`space-y-2 ${className}`}>
        {label && <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>}
        <div className="relative group">
            {leftElement && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">
                    {leftElement}
                </div>
            )}
            <input
                {...props}
                className={`
                    w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl
                    outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                    ${leftElement ? 'pl-12' : ''} ${rightElement ? 'pr-12' : ''}
                `}
            />
            {rightElement && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {rightElement}
                </div>
                
            )}
        </div>
        {error && <p className="text-xs text-brand-orange font-medium ml-1">{error}</p>}
    </div>
);

export default Input;
