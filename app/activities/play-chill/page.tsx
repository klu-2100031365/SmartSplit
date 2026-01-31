"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Gamepad2, Plus } from 'lucide-react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import Card from '../../../components/ui/Card';

const PlayChillPage = () => {
    const router = useRouter();

    const activities = [
        'Badminton',
        'Cricket',
        'Football',
        'Bowling',
        'Snooker',
        'Go-karting',
        'Gaming cafés',
        'Indoor games',
        'Adventure parks',
        'Parks / picnic spots',
        'Long drives'
    ];

    return (
        <ProtectedRoute>
            <div className="relative min-h-screen">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-white to-white dark:from-brand-blue/5 dark:via-gray-900 dark:to-gray-900" />

                <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 sm:space-y-12 pb-24">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                        <div className="flex items-start gap-4">
                            <button
                                onClick={() => router.push('/activities')}
                                className="mt-1 p-2 rounded-2xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-white/10 backdrop-blur-xl shadow-sm hover:shadow-md transition-all"
                            >
                                <ArrowLeft size={18} className="text-gray-700 dark:text-gray-200" />
                            </button>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3">Play & Chill</h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">Sports, games & fun</p>
                            </div>
                        </div>
                    </div>

                    <Card className="bg-white/70 dark:bg-gray-900/40 border border-white/30 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-black/5">
                        <div className="flex items-start justify-between gap-6 mb-6">
                            <div>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Popular activities</p>
                                <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Pick something for today</h2>
                            </div>
                            <div className="p-4 bg-brand-blue/10 text-brand-blue rounded-2xl">
                                <Gamepad2 size={24} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {activities.map((label) => (
                                <div
                                    key={label}
                                    className="px-4 py-3 rounded-2xl bg-white/60 dark:bg-gray-950/30 border border-white/30 dark:border-white/10 text-sm font-bold text-gray-700 dark:text-gray-200"
                                >
                                    {label}
                                </div>
                            ))}

                            <button
                                className="px-4 py-3 rounded-2xl bg-brand-blue/5 border border-dashed border-brand-blue/30 text-sm font-bold text-brand-blue flex items-center gap-2 justify-center"
                            >
                                <Plus size={16} /> Custom activity
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default PlayChillPage;
