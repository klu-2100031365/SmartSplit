"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Film, Gamepad2, Utensils } from 'lucide-react';
import ModuleCard from '../../components/ui/ModuleCard';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const ActivitiesPage = () => {
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
                                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3">Activities</h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">Dining, movies, and play in one place.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        <ModuleCard
                            title="Dining"
                            desc="Food & drinks"
                            icon={Utensils}
                            onClick={() => router.push('/dining')}
                        />
                        <ModuleCard
                            title="Movies"
                            desc="Cinema & events"
                            icon={Film}
                            onClick={() => router.push('/movies')}
                        />
                        <ModuleCard
                            title="Play & Chill"
                            desc="Sports, games & fun"
                            icon={Gamepad2}
                            onClick={() => router.push('/play')}
                        />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ActivitiesPage;
