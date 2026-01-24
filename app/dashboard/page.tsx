"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Users, Receipt, Plane, Plus, Wallet, Utensils } from 'lucide-react';
import { AuthContext, CurrencyContext } from '../../context/AppContext';
import { api } from '../../lib/utils';
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
            <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 sm:space-y-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3"> Hi, {user?.name} 👋</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg"> Here&apos;s what&apos;s happening with your expenses.</p>
                    </div>
                    <Button onClick={() => router.push('/profile')} className="px-6 py-3 text-base"> View All Expenses </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-gradient-to-br from-brand-blue to-brand-green text-gray-900 dark:text-gray-900 border-none shadow-brand-blue/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-800/80 font-bold mb-2 text-base"> Total Expenses </p>
                                <h3 className="text-4xl font-extrabold tracking-tight"> {symbol} {formatAmount(stats.totalTracked)} </h3>
                            </div>
                            <div className="p-4 bg-white/30 rounded-2xl backdrop-blur-sm"> <PieChart size={32} className="text-gray-900" /> </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 font-bold mb-2 text-base"> Active Trips </p>
                                <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight"> {stats.tripCount} </h3>
                            </div>
                            <div className="p-4 bg-brand-green/10 text-brand-green rounded-2xl"> <Users size={32} /></div>
                        </div>
                    </Card>
                    <Card>
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8"> Quick Access </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
                            title="Dining"
                            desc="Food & drinks"
                            icon={Utensils}
                            onClick={() => router.push('/dining')}
                        />
                        {
                            ['Movies', 'Play'].map((item, i) => (
                                <ModuleCard
                                    key={i}
                                    title={item}
                                    desc="Coming soon"
                                    icon={Plus}
                                    disabled
                                />
                            ))
                        }
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Dashboard;
