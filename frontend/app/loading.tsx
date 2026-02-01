"use client";

import React from 'react';
import SmartSplitLogo from '../components/ui/SmartSplitLogo';

export default function Loading() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
            <div className="animate-pulse mb-6">
                <SmartSplitLogo />
            </div>
            <div className="w-48 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-brand-blue rounded-full animate-progress" />
            </div>
            <p className="mt-4 text-gray-500 font-medium font-mier"> Loading SmartSplit... </p>
        </div>
    );
}
