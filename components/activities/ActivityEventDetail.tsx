"use client";

import React, { useContext, useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, CheckCircle, ChevronDown, ChevronUp, Edit2, MoreVertical, PieChart, Plus, Receipt, Trash2, Users, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthContext, CurrencyContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import { getCategoryStyles } from '../../lib/constants';
import { formatAmount, formatDateWithDay } from '../../lib/formatters';
import { ChangeLog, Expense, Participant, Settlement, Trip } from '../../types';
import { TripDetailsView } from '../../lib/api/types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import AddExpenseModal from '../modals/AddExpenseModal';
import ExpenseCard from '../cards/ExpenseCard';
import BalanceCard from '../cards/BalanceCard';
import ExpenseChart from '../charts/ExpenseChart';
import BalanceChart from '../charts/BalanceChart';
import Card from '../ui/Card';
import Input from '../ui/Input';

const PayerRow = ({ p, i, symbol, totalTripCost, shareAmount }: { p: { id: string, name: string, amount: number, categories: [string, number][] }, i: number, symbol: string, totalTripCost: number, shareAmount: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-gray-50 dark:bg-gray-750/50 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-start gap-140 p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
                <div className="flex items-center gap-4 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                        {i + 1}
                    </div>
                    <div className="min-w-[120px]">
                        <span className="font-bold text-gray-900 dark:text-white text-base"> {p.name} </span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                <ChevronDown size={12} className="text-gray-400" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight"> Details </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-0.5">
                    <div className="text-sm font-bold text-brand-blue flex items-center gap-2">
                        <span>Paid: {symbol}{formatAmount(p.amount)}</span>
                        <span className="text-brand-orange text-[11px]">({totalTripCost > 0 ? ((p.amount / totalTripCost) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div className="text-sm font-bold text-brand-green flex items-center gap-2">
                        <span>Share: {symbol}{formatAmount(shareAmount)}</span>
                        <span className="text-brand-orange text-[11px]">({totalTripCost > 0 ? ((shareAmount / totalTripCost) * 100).toFixed(1) : 0}%)</span>
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="px-14 pb-5 pt-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2 border-l-2 border-brand-blue/20 pl-4 py-1">
                        {p.categories.map(([cat, amount]: [string, number], idx: number) => (
                            <div key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                                <span className="text-gray-400"> {idx === 0 ? '' : '+'} </span>
                                <span className="text-gray-900 dark:text-white"> {symbol}{formatAmount(amount)} </span>
                                <span className="text-xs uppercase tracking-wider text-gray-400"> for {cat} </span>
                            </div>
                        ))}
                        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 text-sm font-black text-brand-orange">
                                <span> = </span>
                                <span> {symbol}{formatAmount(p.amount)} </span>
                                <span className="text-xs uppercase tracking-widest px-2 py-0.5 bg-brand-green/10 rounded"> Total </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ActivityEventDetail = ({ eventId, backHref }: { eventId: string, backHref: string }) => {
    const { user, guestName } = useContext(AuthContext);
    const { symbol } = useContext(CurrencyContext);
    const router = useRouter();

    const [data, setData] = useState<TripDetailsView | null>(null);
    const [activeTab, setActiveTab] = useState<'expenses' | 'settlements' | 'analytics'>('expenses');

    const [showAddPart, setShowAddPart] = useState(false);
    const [showAddExp, setShowAddExp] = useState(false);

    const [newPartName, setNewPartName] = useState('');
    const [editingPart, setEditingPart] = useState<Participant | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [isSavingPart, setIsSavingPart] = useState(false);

    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [formError, setFormError] = useState('');
    const [isSavingExp, setIsSavingExp] = useState(false);

    const [showDailyBreakdown, setShowDailyBreakdown] = useState(false);
    const [settlingId, setSettlingId] = useState<string | null>(null);

    const refresh = () => {
        api.getTripDetails(eventId).then(setData).catch(console.error);
    };

    useEffect(refresh, [eventId]);

    if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg"> Loading event details...</div>;

    const { settlementData, dailyBalances, groupedExpenses, analyticsData, userShare } = data;

    const isOwner = user?.id === data.trip.ownerId;
    const canEdit = isOwner;
    const actor = user ? { id: user.id, name: user.name } : { id: 'guest', name: guestName || 'Guest' };

    const handleAddParticipant = async () => {
        if (!newPartName) return;
        setIsSavingPart(true);
        try {
            if (editingPart) {
                await api.updateParticipant(editingPart.id, newPartName);
                setEditingPart(null);
            } else {
                await api.addParticipant(data.trip.id, newPartName);
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
            await api.removeParticipant(pId, data.trip.id);
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
                await api.updateExpense(data.trip.id, editingExpense.id, expenseData, actor);
                setEditingExpense(null);
            } else {
                await api.addExpense(data.trip.id, expenseData, actor);
            }

            setShowAddExp(false);
            refresh();
        } finally {
            setIsSavingExp(false);
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;
        try {
            await api.deleteExpense(data.trip.id, expenseId, actor);
            refresh();
        } catch (e: unknown) {
            const error = e as Error;
            alert(error.message);
        }
    };

    const handleSettleUp = async (settlement: Settlement) => {
        if (!canEdit) return;
        const confirmMsg = `Record full payment of ${symbol}${formatAmount(settlement.amount)} from ${settlement.from} to ${settlement.to}?`;
        if (!confirm(confirmMsg)) return;

        const id = `${settlement.fromId}-${settlement.toId}`;
        setSettlingId(id);
        try {
            await api.addExpense(data.trip.id, {
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
            await api.deleteExpense(data.trip.id, expenseId, actor);
            refresh();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-4 sm:p-10 max-w-[1600px] mx-auto pb-32 min-h-screen" onClick={() => setActiveMenuId(null)}>
            <div className="mb-8">
                <button
                    onClick={() => router.push(backHref)}
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-blue font-bold mb-6"
                >
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                {data.trip.name}
                                {userShare > 0 && (
                                    <span className="text-xl font-bold text-brand-blue bg-brand-blue/5 px-3 py-1 rounded-full border border-brand-blue/10 flex items-center gap-1">
                                        <span className="text-sm font-bold text-brand-blue/70 uppercase tracking-wider">Your Share:</span>
                                        {symbol}{formatAmount(userShare)}
                                    </span>
                                )}
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-3 text-base">
                            <Users size={18} /> {data.participants.length} Participants • <Receipt size={18} /> {data.expenses.length} Expenses
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        {canEdit && (
                            <div className="flex gap-2 flex-1 md:flex-none">
                                <Button
                                    variant="secondary"
                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditingPart(null); setNewPartName(''); setShowAddPart(true); }}
                                    className="flex-1 md:flex-none py-2 px-3 sm:py-3 sm:px-4 text-sm sm:text-base"
                                >
                                    <Users size={16} /> <span className="hidden xs:inline">People</span>
                                </Button>
                                <Button
                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditingExpense(null); setShowAddExp(true); }}
                                    className="flex-1 md:flex-none py-2 px-3 sm:py-3 sm:px-4 text-sm sm:text-base"
                                >
                                    <Plus size={16} /> <span className="hidden xs:inline">Expense</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    {data.participants.map(p => (
                        <div key={p.id} className="relative z-10 group">
                            <div className="flex items-center gap-3 px-3 py-2 pr-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:border-brand-blue transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-skyblue text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                    {p.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-sm whitespace-nowrap"> {p.name} </span>
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

                            {activeMenuId === p.id && canEdit && (
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
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 flex mb-10 shadow-sm w-full md:w-auto overflow-x-auto whitespace-nowrap">
                {['expenses', 'settlements', 'analytics'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 md:flex-none px-6 md:px-10 py-2.5 rounded-xl font-mier font-bold text-sm transition-all shrink-0 ${activeTab === tab
                            ? 'bg-brand-blue text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeTab === 'expenses' && (
                    <div className="space-y-10">
                        {data.expenses.length === 0 ? (
                            <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                <Receipt size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium"> No expenses yet. Tap &quot;Expense&quot; to start.</p>
                            </div>
                        ) : (
                            groupedExpenses.map(([date, exps]) => {
                                const dayTotal = exps.reduce((acc, curr) => acc + (curr.amount || 0), 0);
                                return (
                                    <div key={date}>
                                        <div className="flex items-center justify-between mb-6 px-3 gap-4 flex-wrap">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                                                    {formatDateWithDay(date)}
                                                </Badge>
                                            </div>
                                            <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                                Daily Total: <span className="text-gray-900 dark:text-white ml-2"> {symbol} {formatAmount(dayTotal)} </span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {exps.map(exp => (
                                                <ExpenseCard
                                                    key={exp.id}
                                                    expense={exp}
                                                    participants={data.participants}
                                                    symbol={symbol}
                                                    canEdit={canEdit}
                                                    onEdit={handleEditExpense}
                                                    onDelete={handleDeleteExpense}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'settlements' && (
                    <div className="space-y-12">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6"> Final Settlement Plan </h3>
                            <div className="space-y-5">
                                {settlementData.settlements.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-brand-green bg-brand-green/10 rounded-3xl border border-brand-green/20">
                                        <CheckCircle size={48} className="mb-4" />
                                        <p className="font-bold text-xl"> All settled up! </p>
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
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6"> Spending Summary </h3>
                                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden overflow-x-auto">
                                    <table className="w-full text-sm text-left min-w-[500px]">
                                        <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold">
                                            <tr>
                                                <th className="px-6 py-4"> Person </th>
                                                <th className="px-6 py-4 text-right"> Paid </th>
                                                <th className="px-6 py-4 text-right"> Share </th>
                                                <th className="px-6 py-4 text-right"> Net </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {data.participants.map(p => {
                                                const stats = settlementData.stats[p.id] || { paid: 0, share: 0, received: 0 };
                                                const net = stats.paid - stats.share - (stats.received || 0);
                                                const isPositive = net > 0.01;
                                                const isNegative = net < -0.01;
                                                const absNet = Math.abs(net);

                                                return (
                                                    <tr key={p.id}>
                                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white"> {p.name} </td>
                                                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400 font-medium"> {symbol} {formatAmount(stats.paid)} </td>
                                                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400 font-medium"> {symbol} {formatAmount(stats.share)} </td>
                                                        <td className={`px-6 py-4 text-right font-bold ${isPositive ? 'text-brand-green' : isNegative ? 'text-brand-orange' : 'text-gray-400'}`}>
                                                            {isNegative ? '- ' : isPositive ? '+ ' : ''}{symbol} {formatAmount(absNet)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6"> Settled Payments </h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {data.expenses.filter(e => e.isPayment).length === 0 ? (
                                        <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-500">
                                            No payments recorded yet.
                                        </div>
                                    ) : (
                                        data.expenses.filter(e => e.isPayment).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(pay => (
                                            <div key={pay.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm opacity-90 hover:opacity-100 transition-opacity gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-brand-green/10 rounded-full text-brand-green shrink-0">
                                                        <CheckCircle size={18} />
                                                    </div>
                                                    <div className="text-sm">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="font-bold text-gray-900 dark:text-white"> {data.participants.find(p => p.id === pay.paidBy)?.name} </span>
                                                            <span className="text-gray-400">→</span>
                                                            <span className="font-bold text-gray-900 dark:text-white"> {data.participants.find(p => p.id === (pay.splitAmong || [])[0])?.name} </span>
                                                        </div>
                                                        <span className="bg-brand-green/10 text-brand-green text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border border-brand-green/20"> Settled </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-gray-100 pt-3 sm:pt-0">
                                                    <div className="font-bold text-gray-900 dark:text-white text-base"> {symbol} {formatAmount(pay.amount || 0)}</div>
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => handleUndoSettlement(pay.id)}
                                                            className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-colors"
                                                            title="Undo Payment"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={() => setShowDailyBreakdown(!showDailyBreakdown)}
                                className="flex items-center gap-2 text-brand-blue font-bold text-base hover:underline py-2"
                            >
                                {showDailyBreakdown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                {showDailyBreakdown ? "Hide Daily Breakdown (Carry-forward)" : "View Daily Breakdown (Carry-forward)"}
                            </button>

                            {showDailyBreakdown && (
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                                    {dailyBalances.length === 0 ? (
                                        <p className="text-gray-500"> No data.</p>
                                    ) : (
                                        dailyBalances.map(({ date, balances }) => (
                                            <div key={date} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                                                <div className="font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-3 text-base">
                                                    {formatDateWithDay(date)}
                                                </div>
                                                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                                    {Object.entries(balances).map(([pid, amount]) => {
                                                        const val = amount as number;
                                                        const pName = data.participants.find(p => p.id === pid)?.name || 'Unknown';
                                                        if (Math.abs(val) < 0.01) return null;
                                                        return (
                                                            <div key={pid} className="flex justify-between items-center text-sm">
                                                                <span className="text-gray-600 dark:text-gray-300 font-medium"> {pName} </span>
                                                                <span className={`font-bold ${val >= 0 ? 'text-brand-green' : 'text-brand-orange'}`}>
                                                                    {val >= 0 ? '+' : ''}{symbol} {formatAmount(Math.abs(val))}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <Wallet size={24} /> Total Paid (Upfront Payments)
                            </h3>
                            <div className="mb-8">
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1"> Total Paid  </p>
                                <p className="text-4xl font-extrabold text-brand-blue mb-2"> {symbol} {formatAmount(analyticsData.totalTripCost)} </p>
                            </div>

                            <div className="space-y-4">
                                {analyticsData.totalPayerStats.map((p, i) => {
                                    const shareStat = analyticsData.individualShareStats.find(s => s.participant.id === p.id);
                                    return (
                                        <PayerRow
                                            key={i}
                                            p={p}
                                            i={i}
                                            symbol={symbol}
                                            totalTripCost={analyticsData.totalTripCost}
                                            shareAmount={shareStat?.total || 0}
                                        />
                                    );
                                })}
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <Card className="flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                    <PieChart size={24} /> Fair Share (After Split)
                                </h3>
                                <div className="flex-1 flex items-center justify-center">
                                    <ExpenseChart data={analyticsData.participantStats} symbol={symbol} totalAmount={analyticsData.totalTripCost} />
                                </div>
                            </Card>

                            <Card className="flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                    <BarChart3 size={24} /> Daily Trends
                                </h3>
                                <div className="flex-1 flex items-end">
                                    <BalanceChart data={analyticsData.dailyStats} symbol={symbol} />
                                </div>
                            </Card>
                        </div>

                        <Card className="mt-10">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-10 flex items-center gap-3">
                                <PieChart size={24} className="text-brand-purple" /> Category Breakdown
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                {analyticsData.categoryStats.length === 0 ? (
                                    <div className="col-span-full text-center py-10 text-gray-400">No category data available</div>
                                ) : (
                                    analyticsData.categoryStats.map((cat, i) => {
                                        const styles = getCategoryStyles(cat.category);
                                        const CatIcon = styles.icon;

                                        return (
                                            <div key={i} className="space-y-6">
                                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2.5 rounded-xl ${styles.bg} ${styles.color}`}>
                                                            <CatIcon size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1.5"> {cat.category} </p>
                                                            <p className="text-lg font-black text-gray-900 dark:text-white leading-none"> {symbol}{formatAmount(cat.total)} </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {Object.entries(cat.involved).sort((a, b) => b[1] - a[1]).map(([member, amount], idx) => (
                                                        <div key={idx} className="flex items-center justify-between group">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500 border border-gray-200 dark:border-gray-700">
                                                                    {member[0].toUpperCase()}
                                                                </div>
                                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-brand-blue transition-colors truncate max-w-[120px]"> {member} </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-black text-gray-900 dark:text-white leading-none"> {symbol}{formatAmount(amount)} </p>
                                                                <p className="text-xs font-bold text-gray-400 leading-none mt-1.5">
                                                                    {cat.total > 0 ? ((amount / cat.total) * 100).toFixed(0) : 0}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {canEdit && (
                <Modal isOpen={showAddPart} onClose={() => setShowAddPart(false)} title={editingPart ? "Edit Participant" : "Add Participant"}>
                    <div className="space-y-6">
                        <Input
                            label="Name"
                            value={newPartName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPartName(e.target.value)}
                            placeholder="Enter name"
                            autoFocus
                            required
                        />
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

export default ActivityEventDetail;
