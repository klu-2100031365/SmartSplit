"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Users, Receipt, Plane, Wallet, Sparkles, TrendingUp, CreditCard } from 'lucide-react';
import { AuthContext, CurrencyContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import { formatAmount } from '../../lib/formatters';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ModuleCard from '../../components/ui/ModuleCard';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { symbol } = useContext(CurrencyContext);
    const router = useRouter();
    const [stats, setStats] = useState({ totalTracked: 0, tripCount: 0 });

    useEffect(() => {
        if (user) {
            api.getUserStats(user.id).then(setStats);
        }
    }, [user]);

    return (
        <ProtectedRoute>
            <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-white to-white dark:from-brand-blue/5 dark:via-gray-900 dark:to-gray-900" />
                <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 sm:space-y-12">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3">Welcome back, {user?.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">Your overview for today.</p>
                        </div>
                        <Button onClick={() => router.push('/profile')} className="px-6 py-3 text-base"> View All Expenses </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        <Card className="bg-gradient-to-br from-brand-blue to-brand-green text-gray-900 dark:text-gray-900 border-none shadow-2xl shadow-brand-blue/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-800/80 font-bold mb-2 text-base"> Total Expenses </p>
                                <h3 className="text-4xl font-extrabold tracking-tight"> {symbol} {formatAmount(stats.totalTracked)} </h3>
                            </div>
                            <div className="p-4 bg-white/30 rounded-2xl backdrop-blur-sm"> <PieChart size={32} className="text-gray-900" /> </div>
                        </div>
                    </Card>
                        <Card className="bg-white/70 dark:bg-gray-900/40 border border-white/30 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-black/5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 font-bold mb-2 text-base"> Active Trips </p>
                                <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight"> {stats.tripCount} </h3>
                            </div>
                            <div className="p-4 bg-brand-green/10 text-brand-green rounded-2xl"> <Users size={32} /></div>
                        </div>
                    </Card>
                        <Card className="bg-white/70 dark:bg-gray-900/40 border border-white/30 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-black/5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 font-bold mb-2 text-base"> Pending Settlements </p>
                                <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight"> --</h3>
                            </div>
                            <div className="p-4 bg-brand-orange/10 text-brand-orange rounded-2xl"> <Receipt size={32} /></div>
                        </div>
                    </Card>
                </div>

                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-8"> Quick Access </h2>
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
