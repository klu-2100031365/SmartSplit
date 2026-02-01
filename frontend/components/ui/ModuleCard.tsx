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
        className={`relative overflow-hidden text-left p-7 sm:p-8 rounded-3xl transition-all duration-300
            bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-white/10 backdrop-blur-xl
            shadow-[0_20px_60px_-40px_rgba(0,0,0,0.25)]
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group hover:-translate-y-1 hover:shadow-[0_28px_70px_-40px_rgba(0,0,0,0.35)] hover:border-brand-blue/30'}
        `}
    >
        <div className={`pointer-events-none absolute inset-0 opacity-100 transition-opacity duration-300
            ${disabled ? 'opacity-0' : 'group-hover:opacity-100'}
        `}>
            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-brand-blue/25 via-brand-skyblue/10 to-transparent blur-2xl" />
            <div className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-gradient-to-tr from-brand-green/20 via-white/5 to-transparent blur-2xl" />
        </div>

        <div className="relative flex items-start justify-between gap-6">
            <div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>

            <div className={`
                shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors
                ${disabled ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white'}
            `}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

export default ModuleCard;
