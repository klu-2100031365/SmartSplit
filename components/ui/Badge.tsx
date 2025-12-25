"use client";

import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
    className?: string;
}

const Badge = ({ children, variant = 'primary', className = '' }: BadgeProps) => {
    const variants = {
        primary: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
        secondary: 'bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
        success: 'bg-brand-green/10 text-brand-green border-brand-green/20',
        warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        danger: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
        ghost: 'bg-transparent text-gray-500 border-transparent'
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
