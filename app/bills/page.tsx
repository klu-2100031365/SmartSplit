"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, CreditCard, Pencil, Plus, Trash2 } from 'lucide-react';
import { AuthContext, CurrencyContext } from '../../context/AppContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import AddRecurringItemModal from '../../components/modals/AddRecurringItemModal';
import { api } from '../../lib/api';
import { RecurringOverview } from '../../lib/api/types';
import { formatAmount } from '../../lib/formatters';
import { RecurringItem } from '../../types';

export default function BillsPage() {
    const { user } = useContext(AuthContext);
    const { symbol } = useContext(CurrencyContext);
    const router = useRouter();

    const [items, setItems] = useState<RecurringItem[]>([]);
    const [monthlyTotals, setMonthlyTotals] = useState({ bills: 0, subs: 0, total: 0 });
    const [upcoming, setUpcoming] = useState<{ item: RecurringItem, due: Date, daysUntilDue: number, reminderDate: Date, daysUntilReminder: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<RecurringItem | undefined>(undefined);

    const refresh = () => {
        if (!user) return;
        setIsLoading(true);
        api.getRecurringOverview(user.id)
            .then((overview: RecurringOverview) => {
                setItems(overview.items);
                setMonthlyTotals(overview.monthlyTotals);
                setUpcoming(
                    overview.upcoming.map((u) => ({
                        item: u.item,
                        due: new Date(u.dueDate),
                        daysUntilDue: u.daysUntilDue,
                        reminderDate: new Date(u.reminderDate),
                        daysUntilReminder: u.daysUntilReminder
                    }))
                );
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        refresh();
    }, [user]);

    const handleSave = async (data: Omit<RecurringItem, 'id' | 'userId'>) => {
        if (!user) return;
        if (editingItem) {
            await api.updateRecurringItem(user.id, editingItem.id, data);
        } else {
            await api.addRecurringItem(user.id, data);
        }
        setEditingItem(undefined);
        refresh();
    };

    const handleDelete = async (itemId: string) => {
        if (!user) return;
        if (!confirm('Delete this item?')) return;
        await api.deleteRecurringItem(user.id, itemId);
        refresh();
    };

    const toggleAutoPay = async (it: RecurringItem) => {
        if (!user) return;
        await api.updateRecurringItem(user.id, it.id, { autoPayEnabled: !it.autoPayEnabled });
        refresh();
    };

    const toggleActive = async (it: RecurringItem) => {
        if (!user) return;
        await api.updateRecurringItem(user.id, it.id, { isActive: !it.isActive });
        refresh();
    };

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
                                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3">Bills & Subscriptions</h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">Due dates, reminders, auto-pay status, and monthly totals.</p>
                            </div>
                        </div>

                        <Button
                            onClick={() => { setEditingItem(undefined); setShowModal(true); }}
                            className="px-6 py-3 text-base"
                        >
                            <Plus size={20} /> Add Item
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        <Card className="bg-gradient-to-br from-brand-blue to-brand-green text-gray-900 dark:text-gray-900 border-none shadow-2xl shadow-brand-blue/20">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <p className="text-gray-800/80 font-bold mb-2 text-base">Monthly Total</p>
                                    <h3 className="text-4xl font-extrabold tracking-tight">{symbol} {formatAmount(monthlyTotals.total)}</h3>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-xl bg-white/30 text-gray-900 text-xs font-black">Bills: {symbol}{formatAmount(monthlyTotals.bills)}</span>
                                        <span className="px-3 py-1 rounded-xl bg-white/30 text-gray-900 text-xs font-black">Subs: {symbol}{formatAmount(monthlyTotals.subs)}</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/30 rounded-2xl backdrop-blur-sm">
                                    <CreditCard size={32} className="text-gray-900" />
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-white/70 dark:bg-gray-900/40 border border-white/30 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-black/5 lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-2xl">
                                        <Bell size={18} />
                                    </div>
                                    <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Upcoming</h2>
                                </div>
                                <Badge variant="secondary">Next 6</Badge>
                            </div>

                            {isLoading ? (
                                <p className="text-sm text-gray-500">Loading...</p>
                            ) : upcoming.length === 0 ? (
                                <div className="text-center py-10 bg-white/40 dark:bg-gray-900/30 rounded-3xl border border-white/30 dark:border-white/10">
                                    <p className="text-gray-600 dark:text-gray-400 font-bold">No active items yet</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Add a bill or subscription to start tracking.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcoming.map(({ item, due, daysUntilDue, reminderDate, daysUntilReminder }) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white/60 dark:bg-gray-950/30 border border-white/30 dark:border-white/10"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                                                    <Badge variant={item.kind === 'bill' ? 'primary' : 'success'}>{item.kind}</Badge>
                                                    <Badge variant={item.autoPayEnabled ? 'success' : 'warning'}>{item.autoPayEnabled ? 'autopay' : 'manual'}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    Due on {due.toLocaleDateString()} • Reminder {daysUntilReminder <= 0 ? 'today' : `in ${daysUntilReminder}d`} ({reminderDate.toLocaleDateString()})
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Amount</p>
                                                    <p className="text-lg font-black text-gray-900 dark:text-white">{symbol}{formatAmount(item.amount)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Due</p>
                                                    <p className={`text-lg font-black ${daysUntilDue <= 3 ? 'text-brand-orange' : 'text-gray-900 dark:text-white'}`}>{daysUntilDue <= 0 ? 'today' : `${daysUntilDue}d`}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    <Card className="bg-white/70 dark:bg-gray-900/40 border border-white/30 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-black/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Manage Items</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Toggle active status, autopay, and edit details.</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <p className="text-sm text-gray-500">Loading...</p>
                        ) : items.length === 0 ? (
                            <div className="text-center py-16 bg-white/40 dark:bg-gray-900/30 rounded-3xl border border-white/30 dark:border-white/10">
                                <p className="text-gray-700 dark:text-gray-300 font-bold">No items yet</p>
                                <p className="text-sm text-gray-500 mt-1">Add WiFi, electricity, Netflix, Spotify… and track everything monthly.</p>
                                <div className="mt-6 flex justify-center">
                                    <Button onClick={() => { setEditingItem(undefined); setShowModal(true); }}>
                                        <Plus size={18} /> Add your first item
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {items.map((it) => (
                                    <div
                                        key={it.id}
                                        className={`p-4 rounded-3xl border transition-all bg-white/60 dark:bg-gray-950/30 ${it.isActive ? 'border-white/30 dark:border-white/10' : 'border-dashed border-white/40 dark:border-white/10 opacity-75'}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-gray-900 dark:text-white truncate">{it.name}</p>
                                                    <Badge variant={it.kind === 'bill' ? 'primary' : 'success'}>{it.kind}</Badge>
                                                    <Badge variant={it.autoPayEnabled ? 'success' : 'warning'}>{it.autoPayEnabled ? 'autopay' : 'manual'}</Badge>
                                                    <Badge variant={it.isActive ? 'secondary' : 'ghost'}>{it.isActive ? 'active' : 'paused'}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {symbol}{formatAmount(it.amount)} / month • Due day {it.dueDay} • Remind {it.reminderDaysBefore}d before
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => { setEditingItem(it); setShowModal(true); }}
                                                    className="p-2 rounded-2xl bg-white/70 dark:bg-gray-900/40 border border-white/30 dark:border-white/10 hover:shadow-md transition-all"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} className="text-gray-700 dark:text-gray-200" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(it.id)}
                                                    className="p-2 rounded-2xl bg-white/70 dark:bg-gray-900/40 border border-white/30 dark:border-white/10 hover:shadow-md transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} className="text-brand-orange" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                            <Button
                                                variant="secondary"
                                                className="flex-1"
                                                onClick={() => toggleAutoPay(it)}
                                            >
                                                {it.autoPayEnabled ? 'Disable Auto-pay' : 'Enable Auto-pay'}
                                            </Button>
                                            <Button
                                                variant={it.isActive ? 'danger' : 'success'}
                                                className="flex-1"
                                                onClick={() => toggleActive(it)}
                                            >
                                                {it.isActive ? 'Pause' : 'Activate'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <AddRecurringItemModal
                        isOpen={showModal}
                        onClose={() => { setShowModal(false); setEditingItem(undefined); }}
                        onSave={handleSave}
                        item={editingItem}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
}
