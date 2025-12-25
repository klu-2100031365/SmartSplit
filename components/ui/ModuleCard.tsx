"use client";

import React from 'react';

interface ModuleCardProps {
    title: string;
    desc: string;
    icon: React.ElementType;
    onClick?: () => void;
    disabled?: boolean;
}

const ModuleCard = ({ title, desc, icon: Icon, onClick, disabled }: ModuleCardProps) => (
    <div
        onClick={!disabled ? onClick : undefined}
        className={`
            p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all text-center
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-blue hover:shadow-2xl cursor-pointer group'}
        `}
    >
        <div className={`
            w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-colors
            ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white'}
        `}>
            <Icon size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
);

export default ModuleCard;
