"use client";

import React from 'react';
import { formatAmount } from '../../lib/formatters';

const SimpleBarChart = ({ data, symbol }: { data: { label: string; value: number }[], symbol: string }) => {
    const maxVal = Math.max(...(data || []).map(d => d.value), 1);

    if (!data || data.length === 0) {
        return <div className="w-full h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded-xl">No trend data yet.</div>;
    }

    return (
        <div className="h-64 md:h-72 w-full flex items-end gap-3 sm:gap-6 overflow-x-auto pb-6 pt-10 px-4 scrollbar-hide">
            {data.map((d, i) => (
                <div key={i} className="flex-1 min-w-[50px] max-w-[100px] h-full flex flex-col justify-end items-center group relative">
                    <div className="absolute -top-10 bg-gray-800 text-white text-xs font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 shadow-lg z-20 whitespace-nowrap">
                        {symbol} {formatAmount(d.value)}
                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45"></div>
                    </div>
                    <div
                        className="w-full bg-gradient-to-t from-brand-blue to-brand-skyblue/80 rounded-t-xl transition-all duration-300 group-hover:shadow-lg group-hover:brightness-110 relative"
                        style={{ height: `${Math.max((d.value / maxVal) * 100, 2)}%` }}
                    ></div>
                    <span className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 mt-2.5 truncate w-full text-center">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

export default SimpleBarChart;
