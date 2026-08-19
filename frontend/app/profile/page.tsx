"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { LogOut, Mail, History, ArrowRight, ArrowLeft, User, Settings, Bell, Globe, Phone, Save, Check, LayoutDashboard } from 'lucide-react';
import { AuthContext, CurrencyContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import { formatAmount } from '../../lib/formatters';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const ProfileChatbot = dynamic(() => import('../../components/chat/ProfileChatbot'), {
    ssr: false,
    loading: () => (
        <div className="h-40 animate-pulse rounded-[28px] border border-gray-100 bg-gray-50 dark:border-white/10 dark:bg-white/5" />
    ),
});

const DEFAULT_NOTIFS = {
    expenseAdded: true,
    expenseEdited: true,
    paymentReceived: true,
    monthlySummary: true,
};

const ProfilePage = () => {
    const { user, logout } = useContext(AuthContext);
    const { symbol } = useContext(CurrencyContext);
    const router = useRouter();
    
    const [profileData, setProfileData] = useState<any>(null);
    const [editData, setEditData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (!user) return;

        setEditData((prev: any) => prev ?? {
            name: user.name,
            phoneNumber: '',
            defaultCurrency: 'INR',
            timezone: 'IST',
            language: 'en',
            notificationSettings: DEFAULT_NOTIFS,
        });

        let cancelled = false;
        api.getUserProfileData(user.id)
            .then(data => {
                if (cancelled) return;
                setProfileData(data);
                setEditData({
                    name: data.name,
                    phoneNumber: data.phoneNumber || '',
                    defaultCurrency: data.defaultCurrency,
                    timezone: data.timezone,
                    language: data.language,
                    notificationSettings: data.notificationSettings || DEFAULT_NOTIFS,
                });
            })
            .catch(() => {
                if (cancelled) return;
                setProfileData({
                    name: user.name,
                    email: user.email,
                    trips: [],
                });
            });

        return () => {
            cancelled = true;
        };
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.updateProfileData(editData);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user || !editData) return (
        <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
            </div>
        </ProtectedRoute>
    );

    const trips = profileData?.trips || [];

    const toggleNotif = (key: string) => {
        setEditData({
            ...editData,
            notificationSettings: {
                ...editData.notificationSettings,
                [key]: !editData.notificationSettings[key]
            }
        });
    };

    return (
        <ProtectedRoute>
            <motion.div className="mx-auto max-w-6xl px-4 pb-32 pt-3 sm:px-8 sm:pt-4">
                <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="mb-6 inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white/80 px-4 py-2.5 text-sm font-bold text-gray-800 shadow-sm transition hover:border-brand-blue/30 hover:text-brand-blue dark:border-white/10 dark:bg-gray-900/60 dark:text-white dark:hover:text-brand-blue"
                >
                    <ArrowLeft size={18} />
                    <LayoutDashboard size={18} />
                    Go to Dashboard
                </button>

                {/* Header */}
                <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight"> My Account </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-bold mt-1"> Manage your personal details and app preferences </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={handleSave} 
                            isLoading={isSaving}
                            className={`px-6 py-3 shadow-xl ${saveSuccess ? 'bg-green-500 hover:bg-green-600' : 'shadow-brand-blue/20'}`}
                        >
                            {saveSuccess ? <><Check size={20} /> Saved</> : <><Save size={20} /> Save Changes</>}
                        </Button>
                        <Button onClick={() => { logout(); router.push('/'); }} variant="secondary" className="px-5 py-3 border-gray-200 dark:border-gray-700">
                            <LogOut size={20} />
                        </Button>
                    </div>
                </motion.div>

                <motion.div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Profile Summary Card */}
                        <Card className="flex flex-col items-center text-center py-10 bg-gradient-to-b from-brand-blue/5 to-transparent border-brand-blue/10">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-brand-blue to-brand-skyblue text-white flex items-center justify-center text-5xl font-black shadow-2xl shadow-brand-blue/30 border-4 border-white dark:border-gray-800 transition-transform group-hover:scale-105 duration-500">
                                    {editData.name.charAt(0).toUpperCase()}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-brand-blue hover:text-brand-orange transition-colors">
                                    <User size={18} />
                                </button>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-6 mb-1">{editData.name}</h2>
                            <p className="text-gray-500 font-bold mb-8">{profileData?.email || user.email}</p>
                            
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1"> Active Trips </p>
                                    <p className="text-2xl font-black text-brand-blue">{trips.length}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1"> Shared With </p>
                                    <p className="text-2xl font-black text-brand-orange">12</p>
                                </div>
                            </div>
                        </Card>

                        {/* Preferences Card */}
                        <Card className="p-8">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <Globe size={22} className="text-brand-blue" /> Preferences
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block"> Default Currency </label>
                                    <select 
                                        value={editData.defaultCurrency}
                                        onChange={(e) => setEditData({...editData, defaultCurrency: e.target.value})}
                                        className="w-full h-12 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-blue outline-none transition-all appearance-none"
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block"> Timezone </label>
                                    <select 
                                        value={editData.timezone}
                                        onChange={(e) => setEditData({...editData, timezone: e.target.value})}
                                        className="w-full h-12 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-blue outline-none transition-all appearance-none"
                                    >
                                        <option value="UTC">UTC (GMT +00:00)</option>
                                        <option value="IST">Chennai, Mumbai (GMT +05:30)</option>
                                        <option value="EST">Eastern Time (GMT -05:00)</option>
                                    </select>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-8">
                        <ProfileChatbot userName={editData.name} />

                        {/* Personal Information Section */}
                        <Card className="p-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <Settings size={26} className="text-brand-blue" /> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input 
                                    label="Full Name" 
                                    value={editData.name} 
                                    onChange={(e: any) => setEditData({...editData, name: e.target.value})}
                                    placeholder="Your Display Name"
                                    leftElement={<User size={20} />}
                                />
                                <Input 
                                    label="Email Address" 
                                    value={profileData?.email || user.email} 
                                    disabled
                                    placeholder="Your Email"
                                    leftElement={<Mail size={20} />}
                                />
                                <Input 
                                    label="Phone Number" 
                                    value={editData.phoneNumber} 
                                    onChange={(e: any) => setEditData({...editData, phoneNumber: e.target.value})}
                                    placeholder="+91 00000 00000"
                                    leftElement={<Phone size={20} />}
                                />
                                <Input 
                                    label="Account Language" 
                                    value={editData.language === 'en' ? 'English (US)' : 'Hindi (IN)'} 
                                    disabled
                                    placeholder="English"
                                    leftElement={<Globe size={20} />}
                                />
                            </div>
                            <p className="mt-6 text-xs text-gray-400 font-bold bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <span className="text-brand-orange">Note:</span> Email address is verified and cannot be changed. Contact support for help.
                            </p>
                        </Card>

                        {/* Notifications Section */}
                        <Card className="p-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <Bell size={26} className="text-brand-blue" /> Notifications Center
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {[
                                    { id: 'expenseAdded', label: 'Expense Added', desc: 'When someone adds an expense to your trip.' },
                                    { id: 'expenseEdited', label: 'Expense Updates', desc: 'When an expense is modified or deleted.' },
                                    { id: 'paymentReceived', label: 'Payments', desc: 'When someone settles their debt with you.' },
                                    { id: 'monthlySummary', label: 'Activity Reports', desc: 'Get a monthly summary of your total activity.' },
                                ].map((notif) => (
                                    <div key={notif.id} className="flex items-center justify-between group">
                                        <div className="pr-4">
                                            <p className="font-extrabold text-gray-900 dark:text-white mb-0.5"> {notif.label} </p>
                                            <p className="text-xs text-gray-400 font-bold"> {notif.desc} </p>
                                        </div>
                                        <button 
                                            onClick={() => toggleNotif(notif.id)}
                                            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${editData.notificationSettings[notif.id] ? 'bg-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-gray-200 dark:bg-gray-700'}`}
                                        >
                                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 transform ${editData.notificationSettings[notif.id] ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Trips History Section (Re-added but minimal) */}
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <History size={26} className="text-brand-blue" /> Recent Journeys
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {trips.slice(0, 4).map((trip: any) => (
                                    <motion.div
                                        key={trip.id}
                                        whileHover={{ y: -4 }}
                                        onClick={() => router.push(`/trips?id=${trip.id}`)}
                                        className="cursor-pointer group flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl hover:shadow-brand-blue/10 transition-all duration-300"
                                    >
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors truncate mb-1"> {trip.name} </h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400"> {trip.date} </p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="font-black text-gray-900 dark:text-white mb-0.5"> {symbol}{formatAmount(trip.totalCost)} </p>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-1">
                                                Go <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </ProtectedRoute>
    );
};

export default ProfilePage;
