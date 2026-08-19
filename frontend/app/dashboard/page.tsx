"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Receipt, Plane, Wallet, Sparkles, TrendingUp, CreditCard } from 'lucide-react';
import { AuthContext, CurrencyContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import { formatAmount } from '../../lib/formatters';
import Card from '../../components/ui/Card';
import ModuleCard from '../../components/ui/ModuleCard';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const Dashboard = () => {
    const defaultPendingByModule = [
        { moduleName: 'Trips', pendingCount: 0 },
        { moduleName: 'Movies', pendingCount: 0 },
        { moduleName: 'Activities', pendingCount: 0 },
        { moduleName: 'Bills & Subscriptions', pendingCount: 0 }
    ];

    const { user } = useContext(AuthContext);
    const { symbol } = useContext(CurrencyContext);
    const router = useRouter();
    const [stats, setStats] = useState({
        totalTracked: 0,
        tripCount: 0,
        pendingSettlements: 0,
        pendingByModule: [] as Array<{ moduleName: string; pendingCount: number }>
    });

    useEffect(() => {
        if (user?.isAdmin) {
            router.push('/admin');
            return;
        }
        if (user) {
            api.getUserStats(user.id).then((data) => {
                setStats({
                    totalTracked: data?.totalTracked ?? 0,
                    tripCount: data?.tripCount ?? 0,
                    pendingSettlements: data?.pendingSettlements ?? 0,
                    pendingByModule: Array.isArray(data?.pendingByModule) ? data.pendingByModule : defaultPendingByModule
                });
            });
        }
    }, [user, router]);

    return (
        <ProtectedRoute>
            <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-white to-white dark:from-brand-blue/5 dark:via-gray-900 dark:to-gray-900" />
                <div className="mx-auto max-w-[1600px] space-y-8 px-4 pb-8 pt-3 sm:space-y-12 sm:px-8 sm:pb-10 sm:pt-4">
                    <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-6 sm:p-8 shadow-xl shadow-brand-blue/10 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/40">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-green/20 blur-3xl dark:bg-brand-green/15" />
                        <div className="pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-brand-blue/20 blur-3xl dark:bg-brand-blue/15" />
                        <div className="relative flex flex-col gap-6">
                        <div>
                            <p className="mb-3 inline-flex rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-brand-orange">
                                Dashboard
                            </p>
                            <h1 className="mb-3 text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-gray-900 to-brand-green dark:from-brand-blue dark:via-white dark:to-brand-green">
                                Welcome back, {user?.name}
                            </h1>
                            <p className="text-gray-700 dark:text-gray-300 text-lg font-medium tracking-tight">Your overview for today.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center rounded-full border border-brand-blue/20 bg-brand-blue/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-brand-blue dark:border-brand-blue/30 dark:bg-brand-blue/20 dark:text-brand-blue">
                                {stats.tripCount} active trips
                            </span>
                            <span className="inline-flex items-center rounded-full border border-brand-green/25 bg-brand-green/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:border-brand-green/30 dark:bg-brand-green/20 dark:text-white/85">
                                {symbol} {formatAmount(stats.totalTracked)} tracked
                            </span>
                        </div>
                    </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <Card className="bg-gradient-to-br from-brand-blue to-brand-green text-gray-900 dark:text-gray-900 border-none shadow-2xl shadow-brand-blue/20 rounded-3xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-800/80 font-semibold mb-2 text-base uppercase tracking-wider"> Total Expenses </p>
                                    <h3 className="text-4xl font-extrabold tracking-tight"> {symbol} {formatAmount(stats.totalTracked)} </h3>
                                </div>
                                <div className="p-4 bg-white/30 rounded-2xl backdrop-blur-sm"> <PieChart size={32} className="text-gray-900" /> </div>
                            </div>
                        </Card>
                        <Card className="bg-white/70 dark:bg-gray-900/40 border border-white/30 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-black/5 rounded-3xl">
                            <div className="flex justify-between items-start gap-6">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 font-semibold mb-2 text-base uppercase tracking-wider"> Pending Settlements </p>
                                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight"> {stats.pendingSettlements}</h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        Open items from your expense modules
                                    </p>
                                </div>
                                <div className="p-4 bg-brand-orange/10 text-brand-orange rounded-2xl"> <Receipt size={32} /></div>
                            </div>
                            <div className="mt-5 space-y-2">
                                {stats.pendingByModule.map((item) => (
                                    <div key={item.moduleName} className="flex items-center justify-between rounded-xl bg-white/75 px-3 py-2 text-sm dark:bg-gray-800/60">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{item.moduleName}</span>
                                        <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 text-xs font-semibold text-brand-orange dark:bg-brand-orange/20">
                                            {item.pendingCount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="rounded-3xl border border-white/50 bg-white/60 p-6 sm:p-8 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/35">
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2"> Quick Access </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">
                            Jump into the modules you use the most.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8">
                            <ModuleCard
                                title="Trips"
                                desc="Manage travels"
                                icon={Plane}
                                onClick={() => router.push('/trips')}
                            />
                            <ModuleCard
                                title="Daily Expense"
                                desc="Track personal spending"
                                icon={Wallet}
                                onClick={() => router.push('/daily-expenses')}
                            />
                            <ModuleCard
                                title="Activities"
                                desc="Dining, movies & play"
                                icon={Sparkles}
                                onClick={() => router.push('/activities')}
                            />
                            <ModuleCard
                                title="Bills & Subscriptions"
                                desc="Due dates, autopay & totals"
                                icon={CreditCard}
                                onClick={() => router.push('/bills')}
                            />
                            <ModuleCard
                                title="SIP's"
                                desc="Investments & goals"
                                icon={TrendingUp}
                                onClick={() => router.push('/sips')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Dashboard;
