"use client";

import React from 'react';
import { PieChart } from 'lucide-react';
import { formatAmount } from '../../lib/formatters';

const SimplePieChart = ({ data, symbol, totalAmount }: { data: { label: string; value: number; color: string }[], symbol: string, totalAmount: number }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-64 text-gray-400">
                <PieChart size={48} className="mb-2 opacity-50" />
                <p>No data available</p>
            </div>
        );
    }

    const { gradientParts } = data.reduce((acc, item) => {
        const deg = total > 0 ? (item.value / total) * 360 : 0;
        const part = `${item.color} ${acc.accumulatedDeg}deg ${acc.accumulatedDeg + deg}deg`;
        return {
            gradientParts: [...acc.gradientParts, part],
            accumulatedDeg: acc.accumulatedDeg + deg
        };
    }, { gradientParts: [] as string[], accumulatedDeg: 0 });

    const gradient = gradientParts.length > 0 ? `conic-gradient(${gradientParts.join(', ')})` : 'none';

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full h-full min-h-[300px]">
            <div className="flex flex-col items-center">
                <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0">
                    <div
                        className="w-full h-full rounded-full shadow-2xl relative"
                        style={{ background: total > 0 ? gradient : '#e5e7eb' }}
                    >
                        {total === 0 && <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium z-20">No Data</div>}
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-sm mb-2">Total Expenses</p>
                    <p className="text-4xl font-extrabold text-brand-blue">{symbol} {formatAmount(totalAmount)}</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                            <span className="text-gray-700 dark:text-gray-200 font-semibold">{item.label}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-900 dark:text-white font-bold">{symbol} {formatAmount(item.value)}</div>
                            <div className="text-xs text-gray-500 font-medium">({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimplePieChart;
