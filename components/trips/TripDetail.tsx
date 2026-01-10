"use client";

import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Users, Receipt, Clock, Share2, Plus, MoreVertical, Edit2, Trash2, CheckCircle, ArrowRight, ChevronUp, ChevronDown, Wallet, PieChart, BarChart3 } from 'lucide-react';
import { AuthContext, CurrencyContext } from '../../context/AppContext';
import { api, calculateSettlements } from '../../lib/utils';
import { formatAmount, formatDateWithDay } from '../../lib/formatters';
import { Trip, Participant, Expense, ChangeLog, Settlement, SharePermission } from '../../types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import ShareModal from '../modals/ShareModal';
import ActivityLogModal from '../modals/ActivityLogModal';
import AddExpenseModal from '../modals/AddExpenseModal';
import ExpenseCard from '../cards/ExpenseCard';
import BalanceCard from '../cards/BalanceCard';
import ExpenseChart from '../charts/ExpenseChart';
import BalanceChart from '../charts/BalanceChart';
import Card from '../ui/Card';

const TripDetail = ({ tripId, isSharedView = false }: { tripId: string, isSharedView?: boolean }) => {
    const { user, guestName } = useContext(AuthContext);
    const { symbol } = useContext(CurrencyContext);
    const [data, setData] = useState<{ trip: Trip, participants: Participant[], expenses: Expense[], logs: ChangeLog[] } | null>(null);
    const [activeTab, setActiveTab] = useState<'expenses' | 'settlements' | 'analytics'>('expenses');

    const [showAddPart, setShowAddPart] = useState(false);
    const [showAddExp, setShowAddExp] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);

    const [newPartName, setNewPartName] = useState('');
    const [editingPart, setEditingPart] = useState<Participant | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [isSavingPart, setIsSavingPart] = useState(false);

    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [formError, setFormError] = useState('');
    const [isSavingExp, setIsSavingExp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [showDailyBreakdown, setShowDailyBreakdown] = useState(false);
    const [settlingId, setSettlingId] = useState<string | null>(null);

    const refresh = () => {
        api.getTripDetails(tripId).then(setData).catch(console.error);
    };

    useEffect(refresh, [tripId]);

    const settlementData = useMemo(() => {
        if (!data) return {
            settlements: [] as Settlement[],
            stats: {} as Record<string, { paid: number, share: number }>,
            balances: {} as Record<string, number>
        };
        return calculateSettlements(data.participants, data.expenses);
    }, [data]);

    const dailyBalances = useMemo((): { date: string, balances: Record<string, number> }[] => {
        if (!data) return [];

        const sortedExpenses = [...data.expenses]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const balancesByDate: { date: string, balances: Record<string, number> }[] = [];
        const runningBalances: Record<string, number> = {};

        data.participants.forEach(p => runningBalances[p.id] = 0);

        const expensesByDate: Record<string, Expense[]> = {};
        sortedExpenses.forEach(exp => {
            const dateKey = exp.date ? exp.date.split('T')[0] : 'Unknown';
            if (!expensesByDate[dateKey]) expensesByDate[dateKey] = [];
            expensesByDate[dateKey].push(exp);
        });

        const sortedDates = Object.keys(expensesByDate).sort();

        sortedDates.forEach(date => {
            const daysExpenses = expensesByDate[date];

            daysExpenses.forEach(exp => {
                const amount = exp.amount || 0;
                const splitAmong = exp.splitAmong || [];
                const splitCount = splitAmong.length;

                if (splitCount === 0) return;

                if (exp.paidBy) {
                    runningBalances[exp.paidBy] = (runningBalances[exp.paidBy] || 0) + amount;
                }

                const splitAmount = amount / splitCount;
                splitAmong.forEach(pid => {
                    runningBalances[pid] = (runningBalances[pid] || 0) - splitAmount;
                });
            });

            balancesByDate.push({
                date,
                balances: { ...runningBalances }
            });
        });

        return balancesByDate.reverse();
    }, [data]);

    const groupedExpenses = useMemo(() => {
        if (!data) return [];
        const groups: Record<string, Expense[]> = {};
        data.expenses.forEach(exp => {
            const dateKey = exp.date ? exp.date.split('T')[0] : 'Unknown';
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(exp);
        });
        return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    }, [data]);

    const analyticsData = useMemo(() => {
        if (!data) return { participantStats: [], dailyStats: [], categoryStats: [], totalTripCost: 0, totalPayerStats: [], individualShareStats: [] };

        const totalTripCost = data.expenses.filter(e => !e.isPayment).reduce((acc, curr) => acc + (curr.amount || 0), 0);

        const pStats = data.participants.map(p => {
            const share = settlementData.stats[p.id]?.share || 0;
            return {
                label: p.name,
                value: share,
                color: ['#4ADE80', '#60A5FA', '#FB923C', '#A78BFA', '#F472B6', '#FACC15'][data.participants.indexOf(p) % 6]
            };
        });

        const dStats = groupedExpenses.map(([date, exps]) => ({
            label: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            value: exps.filter(e => !e.isPayment).reduce((acc, curr) => acc + (curr.amount || 0), 0)
        })).reverse();

        const cStats: Record<string, { total: number, payers: Record<string, number> }> = {};
        data.expenses.filter(e => !e.isPayment).forEach(exp => {
            if (!cStats[exp.category]) cStats[exp.category] = { total: 0, payers: {} };
            const amount = exp.amount || 0;
            cStats[exp.category].total += amount;

            const payerName = data.participants.find(p => p.id === exp.paidBy)?.name || 'Unknown';
            if (!cStats[exp.category].payers[payerName]) cStats[exp.category].payers[payerName] = 0;
            cStats[exp.category].payers[payerName] += amount;
        });

        const cStatsArray = Object.entries(cStats).map(([cat, stat]) => ({
            category: cat,
            total: stat.total,
            payers: stat.payers
        })).sort((a, b) => b.total - a.total);

        const totalPayerStats = data.participants.map(p => {
            const paid = settlementData.stats[p.id]?.paid || 0;
            return { name: p.name, amount: paid };
        }).sort((a, b) => b.amount - a.amount);

        const shareStats: Record<string, { total: number, categories: Record<string, number> }> = {};
        data.participants.forEach(p => {
            shareStats[p.id] = { total: 0, categories: {} };
        });

        data.expenses.filter(e => !e.isPayment).forEach(exp => {
            const splitCount = (exp.splitAmong || []).length;
            if (splitCount === 0) return;
            const shareAmount = (exp.amount || 0) / splitCount;

            (exp.splitAmong || []).forEach(pid => {
                if (shareStats[pid]) {
                    shareStats[pid].total += shareAmount;
                    shareStats[pid].categories[exp.category] = (shareStats[pid].categories[exp.category] || 0) + shareAmount;
                }
            });
        });

        const individualShareStats = data.participants.map(p => {
            const stat = shareStats[p.id];
            return {
                participant: p,
                total: stat.total,
                categories: Object.entries(stat.categories).sort((a, b) => b[1] - a[1])
            };
        }).sort((a, b) => b.total - a.total);

        return { participantStats: pStats, dailyStats: dStats, categoryStats: cStatsArray, totalTripCost, totalPayerStats, individualShareStats };
    }, [data, settlementData, groupedExpenses]);


    if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg"> Loading trip details...</div>;

    const isOwner = user?.id === data.trip.ownerId;
    const canEdit = isOwner || (!isSharedView) || (isSharedView && data.trip.sharePermission === 'edit');
    const actor = user ? { id: user.id, name: user.name } : { id: 'guest', name: guestName || 'Guest' };

    const handleShareGenerate = async (perm: SharePermission) => {
        setIsLoading(true);
        try {
            await api.generateShareLink(tripId, perm);
            refresh();
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevert = async (logId: string) => {
        if (!confirm("Are you sure you want to revert this change?")) return;
        setIsLoading(true);
        try {
            await api.revertChange(logId);
            refresh();
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevertAll = async () => {
        if (!confirm("This will undo ALL changes made by shared users. This action cannot be undone. Are you sure?")) return;
        setIsLoading(true);
        try {
            await api.revertAllChanges(tripId);
            refresh();
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddParticipant = async () => {
        if (!newPartName) return;
        setIsSavingPart(true);
        try {
            if (editingPart) {
                await api.updateParticipant(editingPart.id, newPartName);
                setEditingPart(null);
            } else {
                await api.addParticipant(tripId, newPartName);
            }
            setNewPartName('');
            setShowAddPart(false);
            refresh();
        } finally {
            setIsSavingPart(false);
        }
    };

    const handleEditPart = (p: Participant) => {
        setEditingPart(p);
        setNewPartName(p.name);
        setShowAddPart(true);
    };

    const handleRemovePart = async (pId: string) => {
        if (!confirm("Are you sure you want to remove this participant?")) return;
        try {
            await api.removeParticipant(pId, tripId);
            refresh();
        } catch (e: unknown) {
            const error = e as Error;
            alert(error.message);
        }
    };

    const handleEditExpense = (expense: Expense) => {
        if (!canEdit) return;
        setEditingExpense(expense);
        setShowAddExp(true);
    };

    const handleAddExpense = async (expenseData: Omit<Expense, 'id' | 'tripId'>) => {
        setFormError('');
        setIsSavingExp(true);
        try {
            if (editingExpense) {
                await api.updateExpense(tripId, editingExpense.id, expenseData, actor);
                setEditingExpense(null);
            } else {
                await api.addExpense(tripId, expenseData, actor);
            }

            setShowAddExp(false);
            refresh();
        } finally {
            setIsSavingExp(false);
        }
    };

    const handleSettleUp = async (settlement: Settlement) => {
        if (!canEdit) return;
        const confirmMsg = `Record full payment of ${symbol}${formatAmount(settlement.amount)} from ${settlement.from} to ${settlement.to}?`;
        if (!confirm(confirmMsg)) return;

        const id = `${settlement.fromId}-${settlement.toId}`;
        setSettlingId(id);
        try {
            await api.addExpense(tripId, {
                description: 'Settlement Payment',
                amount: settlement.amount,
                date: new Date().toISOString(),
                category: 'Payment',
                paidBy: settlement.fromId,
                splitAmong: [settlement.toId],
                isPayment: true
            }, actor);
            await refresh();
        } finally {
            setSettlingId(null);
        }
    };

    const handleUndoSettlement = async (expenseId: string) => {
        if (!canEdit) return;
        if (!confirm("Are you sure you want to undo this payment?")) return;
        try {
            await api.deleteExpense(tripId, expenseId, actor);
            refresh();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto pb-32 min-h-screen" onClick={() => setActiveMenuId(null)}>
            <div className="mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-5xl font-bold text-gray-900 dark:text-white"> {data.trip.name} </h1>
                            {
                                isSharedView && (
                                    <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-sm font-bold rounded-lg border border-brand-orange/20">
                                        {canEdit ? 'Edit Mode' : 'View Only'}
                                    </span>
                                )
                            }
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-3 text-lg">
                            <Users size={20} /> {data.participants.length} Participants • <Receipt size={20} /> {data.expenses.length} Expenses
                        </p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        {isOwner && (
                            <>
                                <Button variant="secondary" onClick={() => setShowLogModal(true)} className="flex-1 md:flex-none py-4 px-4 text-lg">
                                    <Clock size={20} />
                                </Button>
                                <Button variant="secondary" onClick={() => setShowShareModal(true)} className="flex-1 md:flex-none py-4 px-4 text-lg">
                                    <Share2 size={20} /> Share
                                </Button>
                            </>
                        )}

                        {
                            canEdit && (
                                <>
                                    <Button variant="secondary" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditingPart(null); setNewPartName(''); setShowAddPart(true); }} className="flex-1 md:flex-none py-4 px-6 text-lg">
                                        <Users size={20} /> Manage People
                                    </Button>
                                    <Button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditingExpense(null); setShowAddExp(true); }} className="flex-1 md:flex-none py-4 px-6 text-lg">
                                        <Plus size={20} /> Add Expense
                                    </Button>
                                </>
                            )
                        }
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    {
                        data.participants.map(p => (
                            <div key={p.id} className="relative z-10 group">
                                <div className="flex items-center gap-3 px-3 py-2 pr-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:border-brand-blue transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-skyblue text-white flex items-center justify-center text-lg font-bold shadow-sm">
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-base whitespace-nowrap"> {p.name} </span>
                                    {canEdit && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === p.id ? null : p.id);
                                            }}
                                            className="absolute right-1.5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                    )}
                                </div>
                                {
                                    activeMenuId === p.id && canEdit && (
                                        <div
                                            className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleEditPart(p); }}
                                                className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center gap-3"
                                            >
                                                <Edit2 size={16} /> Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleRemovePart(p.id); }}
                                                className="w-full text-left px-5 py-3 text-sm font-medium text-brand-orange hover:bg-brand-orange/10 flex items-center gap-3"
                                            >
                                                <Trash2 size={16} /> Remove
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        ))
                    }
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 inline-flex mb-10 shadow-sm w-full md:w-auto overflow-x-auto">
                {
                    ['expenses', 'settlements', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as 'expenses' | 'settlements' | 'analytics')}
                            className={`flex-1 md:flex-none px-8 md:px-12 py-3.5 rounded-xl font-mier font-bold text-base transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-brand-blue text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))
                }
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeTab === 'expenses' && (
                    <div className="space-y-10">
                        {
                            data.expenses.length === 0 ? (
                                <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <Receipt size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                                    <p className="text-xl text-gray-500 dark:text-gray-400 font-medium"> No expenses yet. Tap "Add Expense" to start.</p>
                                </div>
                            ) : (
                                groupedExpenses.map(([date, exps]) => {
                                    const dayTotal = exps.reduce((acc, curr) => acc + (curr.amount || 0), 0);
                                    return (
                                        <div key={date}>
                                            <div className="flex items-center justify-between mb-6 px-3">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="secondary" className="px-4 py-1.5 text-base">
                                                        {formatDateWithDay(date)}
                                                    </Badge>
                                                </div>
                                                <div className="text-base font-bold text-gray-500 dark:text-gray-400">
                                                    Daily Total: <span className="text-gray-900 dark:text-white ml-2"> {symbol} {formatAmount(dayTotal)} </span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {
                                                    exps.map(exp => (
                                                        <ExpenseCard
                                                            key={exp.id}
                                                            expense={exp}
                                                            participants={data.participants}
                                                            symbol={symbol}
                                                            canEdit={canEdit}
                                                            onEdit={handleEditExpense}
                                                        />
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    );
                                })
                            )
                        }
                    </div>
                )}

                {
                    activeTab === 'settlements' && (
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6"> Final Settlement Plan </h3>
                                <div className="space-y-5">
                                    {
                                        settlementData.settlements.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-brand-green bg-brand-green/10 rounded-3xl border border-brand-green/20">
                                                <CheckCircle size={56} className="mb-4" />
                                                <p className="font-bold text-2xl"> All settled up! </p>
                                            </div>
                                        ) : (
                                            settlementData.settlements.map((s, i) => (
                                                <BalanceCard
                                                    key={i}
                                                    settlement={s}
                                                    symbol={symbol}
                                                    canEdit={canEdit}
                                                    onSettleUp={handleSettleUp}
                                                    isLoading={settlingId === `${s.fromId}-${s.toId}`}
                                                />
                                            ))
                                        )
                                    }
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6"> Spending Summary </h3>
                                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden overflow-x-auto">
                                        <table className="w-full text-base text-left min-w-[500px]">
                                            <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold">
                                                <tr>
                                                    <th className="px-6 py-4"> Person </th>
                                                    <th className="px-6 py-4 text-right"> Paid </th>
                                                    <th className="px-6 py-4 text-right"> Share </th>
                                                    <th className="px-6 py-4 text-right"> Net </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {
                                                    data.participants.map(p => {
                                                        const stats = settlementData.stats[p.id] || { paid: 0, share: 0 };
                                                        const net = stats.paid - stats.share;
                                                        return (
                                                            <tr key={p.id}>
                                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white"> {p.name} </td>
                                                                <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400"> {symbol} {formatAmount(stats.paid)} </td>
                                                                <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400"> {symbol} {formatAmount(stats.share)} </td>
                                                                <td className={`px-6 py-4 text-right font-bold ${net >= 0 ? 'text-brand-green' : 'text-brand-orange'}`}>
                                                                    {net >= 0 ? '+' : ''}{symbol} {formatAmount(Math.abs(net))}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6"> Settled Payments </h3>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {
                                            data.expenses.filter(e => e.isPayment).length === 0 ? (
                                                <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-500">
                                                    No payments recorded yet.
                                                </div>
                                            ) : (
                                                data.expenses.filter(e => e.isPayment).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(pay => (
                                                    <div key={pay.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm opacity-90 hover:opacity-100 transition-opacity gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2 bg-brand-green/10 rounded-full text-brand-green shrink-0">
                                                                <CheckCircle size={20} />
                                                            </div>
                                                            <div className="text-base">
                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                    <span className="font-bold text-gray-900 dark:text-white"> {data.participants.find(p => p.id === pay.paidBy)?.name} </span>
                                                                    <ArrowRight size={14} className="text-gray-400" />
                                                                    <span className="font-bold text-gray-900 dark:text-white"> {data.participants.find(p => p.id === (pay.splitAmong || [])[0])?.name} </span>
                                                                </div>
                                                                <span className="bg-brand-green/10 text-brand-green text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border border-brand-green/20"> Settled </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-gray-100 pt-3 sm:pt-0">
                                                            <div className="font-bold text-gray-900 dark:text-white text-lg"> {symbol} {formatAmount(pay.amount || 0)}</div>
                                                            {
                                                                canEdit && (
                                                                    <button onClick={() => handleUndoSettlement(pay.id)} className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-colors" title="Undo Payment">
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                ))
                                            )
                                        }
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    onClick={() => setShowDailyBreakdown(!showDailyBreakdown)}
                                    className="flex items-center gap-2 text-brand-blue font-bold text-lg hover:underline py-2"
                                >
                                    {showDailyBreakdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    {showDailyBreakdown ? "Hide Daily Breakdown (Carry-forward)" : "View Daily Breakdown (Carry-forward)"}
                                </button>

                                {
                                    showDailyBreakdown && (
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                                            {
                                                dailyBalances.length === 0 ? (
                                                    <p className="text-gray-500"> No data.</p>
                                                ) : (
                                                    dailyBalances.map(({ date, balances }) => (
                                                        <div key={date} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                                                            <div className="font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-3 text-lg">
                                                                {formatDateWithDay(date)}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                                                {
                                                                    Object.entries(balances).map(([pid, amount]) => {
                                                                        const val = amount as number;
                                                                        const pName = data.participants.find(p => p.id === pid)?.name || 'Unknown';
                                                                        if (Math.abs(val) < 0.01) return null;
                                                                        return (
                                                                            <div key={pid} className="flex justify-between items-center text-base">
                                                                                <span className="text-gray-600 dark:text-gray-300 font-medium"> {pName} </span>
                                                                                <span className={`font-bold ${val >= 0 ? 'text-brand-green' : 'text-brand-orange'}`}>
                                                                                    {val >= 0 ? '+' : ''}{symbol} {formatAmount(Math.abs(val))}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })
                                                                }
                                                            </div>
                                                        </div>
                                                    ))
                                                )
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'analytics' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Card>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Wallet size={28} /> Total Trip Cost
                                </h3>
                                <div className="mb-8">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1"> Total Spent </p>
                                    <p className="text-5xl font-extrabold text-brand-blue"> {symbol} {formatAmount(analyticsData.totalTripCost)} </p>
                                </div>

                                <div className="space-y-4">
                                    {
                                        analyticsData.totalPayerStats.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                                                        {i + 1}
                                                    </div>
                                                    <span className="font-bold text-gray-900 dark:text-white text-lg"> {p.name} </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900 dark:text-white text-lg"> {symbol} {formatAmount(p.amount)} </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                        {analyticsData.totalTripCost > 0 ? Math.round((p.amount / analyticsData.totalTripCost) * 100) : 0}% of total
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <Card className="flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                        <PieChart size={28} /> Spending Share (Consumption)
                                    </h3>
                                    <div className="flex-1 flex items-center justify-center">
                                        <ExpenseChart data={analyticsData.participantStats} symbol={symbol} totalAmount={analyticsData.totalTripCost} />
                                    </div>
                                </Card>

                                <Card className="flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                        <BarChart3 size={28} /> Daily Trends
                                    </h3>
                                    <div className="flex-1 flex items-end">
                                        <BalanceChart data={analyticsData.dailyStats} symbol={symbol} />
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )
                }
            </div>

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                trip={data.trip}
                onGenerate={handleShareGenerate}
                isLoading={isLoading}
            />

            <ActivityLogModal
                isOpen={showLogModal}
                onClose={() => setShowLogModal(false)}
                logs={data.logs}
                onRevert={handleRevert}
                onRevertAll={handleRevertAll}
                isLoading={isLoading}
            />

            {canEdit && (
                <Modal isOpen={showAddPart} onClose={() => setShowAddPart(false)} title={editingPart ? "Edit Participant" : "Add Participant"}>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1"> Name </label>
                            <input
                                value={newPartName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPartName(e.target.value)}
                                placeholder="Enter name"
                                autoFocus
                                className="w-full px-4 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                            />
                        </div>
                        <Button onClick={handleAddParticipant} className="w-full py-4" isLoading={isSavingPart}> {editingPart ? "Update" : "Add"} Person </Button>
                    </div>
                </Modal>
            )}

            <AddExpenseModal
                isOpen={showAddExp}
                onClose={() => setShowAddExp(false)}
                participants={data.participants}
                editingExpense={editingExpense}
                onSave={handleAddExpense}
                isLoading={isSavingExp}
                error={formError}
            />
        </div>
    );
};

export default TripDetail;
