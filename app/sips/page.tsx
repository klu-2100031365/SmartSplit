"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Card from '../../components/ui/Card';

const SipsPage = () => {
    const router = useRouter();

    return (
        <ProtectedRoute>
            <div className="relative min-h-screen">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-white to-white dark:from-brand-blue/5 dark:via-gray-900 dark:to-gray-900" />
                <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 sm:space-y-12 pb-24">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                        <div className="flex items-start gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="mt-1 p-2 rounded-2xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-white/10 backdrop-blur-xl shadow-sm hover:shadow-md transition-all"
                            >
                                <ArrowLeft size={18} className="text-gray-700 dark:text-gray-200" />
                            </button>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3">SIP's</h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">Investments & goals (UI coming soon).</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        <Card className="bg-white/70 dark:bg-gray-900/40 border border-white/30 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-black/5 lg:col-span-2">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Overview</p>
                                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Track your SIPs</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">This module is currently under development.</p>
                                </div>
                                <div className="p-4 bg-brand-blue/10 text-brand-blue rounded-2xl">
                                    <TrendingUp size={28} />
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-brand-blue to-brand-green text-gray-900 dark:text-gray-900 border-none shadow-2xl shadow-brand-blue/20">
                            <div className="space-y-3">
                                <p className="text-gray-800/80 font-bold text-base">Next step</p>
                                <p className="text-sm text-gray-800/80">Tell me what SIP fields you want (amount, fund, date, goal, etc.) and I’ll wire it up.</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default SipsPage;
