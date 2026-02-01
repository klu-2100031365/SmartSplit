"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Mail, History } from 'lucide-react';
import { AuthContext, CurrencyContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import { getCategoryStyles } from '../../lib/constants';
import { formatAmount, formatDateWithDay } from '../../lib/formatters';
import { Trip, Expense } from '../../types';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const ProfilePage = () => {
    const { user, logout } = useContext(AuthContext);
    const { symbol } = useContext(CurrencyContext);
    const router = useRouter();
    const [profileData, setProfileData] = useState<{ trips: Trip[], expenses: (Expense & { tripName?: string })[] } | null>(null);

    useEffect(() => {
        if (user) {
            api.getUserProfileData(user.id).then(setProfileData);
        }
    }, [user]);

    if (!user || !profileData) return <div className="p-8"> Loading...</div>;

    const totalSpent = profileData.expenses.reduce((sum: number, e: { amount?: number }) => sum + (e.amount || 0), 0);

    return (
        <ProtectedRoute>
            <div className="p-8 max-w-[1600px] mx-auto pb-24">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white"> My Profile </h1>
                    <Button onClick={() => { logout(); router.push('/'); }} variant="secondary" className="px-6 py-3">
                        <LogOut size={20} /> Sign Out
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
                    <Card className="col-span-1 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-blue to-brand-skyblue text-white flex items-center justify-center text-4xl font-bold mb-6 shadow-xl shadow-brand-blue/20">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-2">
                            <Mail size={16} /> {user.email}
                        </p>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1"> Trips </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.trips.length}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1"> Spent </p>
                                <p className="text-2xl font-bold text-brand-green">{symbol} {formatAmount(totalSpent)}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="col-span-1 lg:col-span-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <History size={24} /> Expense History
                        </h3>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {profileData.expenses.length === 0 ? (
                                <div className="text-center py-20 text-gray-500"> No expenses recorded yet.</div>
                            ) : (
                                profileData.expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => {
                                    const style = getCategoryStyles(exp.category);
                                    const Icon = style.icon;
                                    return (
                                        <div key={exp.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${style.bg} ${style.color}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-lg">{exp.description}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDateWithDay(exp.date)} • <span className="font-medium text-gray-700 dark:text-gray-300">{exp.tripName}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="font-bold text-gray-900 dark:text-white text-xl">
                                                {symbol} {formatAmount(exp.amount)}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ProfilePage;
