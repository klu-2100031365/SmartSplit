"use client";

import React, { useContext, useState, useEffect, useMemo } from 'react';
import {
    Wallet,
    PieChart,
    BarChart3,
    Plus,
    Filter,
    Search,
    ArrowLeft,
    Calendar,
    ChevronRight,
    TrendingUp,
    MoreHorizontal,
    Edit2,
    Trash2,
    ShoppingBag,
    Pizza,
    Car,
    Zap,
    Home,
    Heart,
    Frown,
    RefreshCw,
    Globe,
    Gamepad2,
    Utensils,
    Film
} from 'lucide-react';
import { AuthContext, ThemeContext, CurrencyContext } from '../../context/AppContext';
import { api } from '../../lib/utils';
import { DailyExpense, DailyCategory } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import AddDailyExpenseModal from '../../components/modals/AddDailyExpenseModal';
import SyncSourcesModal from '../../components/modals/SyncSourcesModal';
import { formatAmount } from '../../lib/formatters';
import Link from 'next/link';

export default function DailyExpensesPage() {
    const { user } = useContext(AuthContext);
    const { symbol } = useContext(CurrencyContext);
    const [expenses, setExpenses] = useState<DailyExpense[]>([]);
    const [categories, setCategories] = useState<DailyCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [monthlySalary, setMonthlySalary] = useState<number>(0);
    const [isSavingSalary, setIsSavingSalary] = useState(false);
    const [showSalaryInput, setShowSalaryInput] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<DailyExpense | undefined>(undefined);

    const refresh = () => {
        if (user) {
            Promise.all([
                api.getDailyExpenses(user.id),
                api.getDailyCategories(user.id),
                api.getMonthlySalary(user.id)
            ]).then(([expList, catList, salary]) => {
                setExpenses(expList);
                setCategories(catList);
                setMonthlySalary(salary || 0);
                setIsLoading(false);
            });
        }
    };

    useEffect(refresh, [user]);

    const stats = useMemo(() => {
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        const monthlySpent = expenses
            .filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);

        const categoryBreakdown = expenses.reduce((acc, e) => {
            acc[e.categoryId] = (acc[e.categoryId] || 0) + e.amount;
            return acc;
        }, {} as Record<string, number>);

        return { totalSpent, monthlySpent, categoryBreakdown };
    }, [expenses]);

    const filteredExpenses = expenses.filter(e =>
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSaveExpense = async (data: Omit<DailyExpense, 'id' | 'userId'>) => {
        if (!user) return;
        if (editingExpense) {
            await api.updateDailyExpense(user.id, editingExpense.id, data);
        } else {
            await api.addDailyExpense(user.id, data);
        }
        refresh();
    };

    const handleDeleteExpense = async (id: string) => {
        if (!user || !confirm("Are you sure you want to delete this expense?")) return;
        await api.deleteDailyExpense(user.id, id);
        refresh();
    };

    const handleUpdateSalary = async (val: number) => {
        if (!user) return;
        setIsSavingSalary(true);
        try {
            await api.updateMonthlySalary(user.id, val);
            setMonthlySalary(val);
            setShowSalaryInput(false);
        } finally {
            setIsSavingSalary(false);
        }
    };

    const handleSync = async (sources: string[]) => {
        if (!user) return;
        setIsSyncing(true);
        try {
            const count = await api.syncTripExpenses(user.id, sources);
            alert(`Synced ${count} new expenses from selected modules!`);
            setShowSyncModal(false);
            refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to sync expenses.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleEditClick = (expense: DailyExpense) => {
        setEditingExpense(expense);
        setShowAddModal(true);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Daily Expenses...</div>;
    }

    return (
        <div className="p-4 sm:p-10 max-w-7xl mx-auto pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Daily Expenses</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Track your personal everyday spending</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={() => setShowSyncModal(true)}
                    >
                        <RefreshCw size={20} />
                        Sync from Modules
                    </Button>
                    <Button className="flex items-center gap-2 group relative overflow-hidden px-8" onClick={() => { setEditingExpense(undefined); setShowAddModal(true); }}>
                        <Plus size={20} /> Add Expense
                    </Button>
                </div>
            </div>

            {/* Salary Section */}
            <div className="mb-12">
                {!monthlySalary && !showSalaryInput ? (
                    <Card className="bg-brand-blue/5 border-dashed border-brand-blue/30 flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-full">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Enable Financial Insights</h4>
                                <p className="text-sm text-gray-500">Set your monthly salary to get smart spending suggestions.</p>
                            </div>
                        </div>
                        <Button variant="secondary" onClick={() => setShowSalaryInput(true)}>Set Monthly Salary</Button>
                    </Card>
                ) : (
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Financial Overview</h3>
                            {monthlySalary > 0 && !showSalaryInput && (
                                <button
                                    onClick={() => setShowSalaryInput(true)}
                                    className="text-xs font-bold text-brand-blue hover:underline"
                                >
                                    Update Salary
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {showSalaryInput && (
                    <Card className="mb-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col sm:flex-row items-end gap-4">
                            <div className="flex-1 w-full">
                                <Input
                                    label="Monthly Salary Amount"
                                    type="number"
                                    value={monthlySalary || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonthlySalary(Number(e.target.value))}
                                    placeholder="Enter your monthly salary"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button variant="secondary" onClick={() => setShowSalaryInput(false)} className="flex-1 sm:flex-none">Cancel</Button>
                                <Button onClick={() => handleUpdateSalary(monthlySalary)} isLoading={isSavingSalary} className="flex-1 sm:flex-none">Save Salary</Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="bg-gradient-to-br from-brand-blue to-brand-skyblue text-white border-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Wallet size={20} />
                        </div>
                        <span className="font-bold opacity-90">Total Spent</span>
                    </div>
                    <p className="text-3xl font-extrabold">{symbol}{formatAmount(stats.totalSpent)}</p>
                </Card>

                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-green/10 text-brand-green rounded-lg">
                            <Calendar size={20} />
                        </div>
                        <span className="font-bold text-gray-600 dark:text-gray-400">This Month</span>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{symbol}{formatAmount(stats.monthlySpent)}</p>
                </Card>

                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-orange/10 text-brand-orange rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <span className="font-bold text-gray-600 dark:text-gray-400">Avg. Daily</span>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {symbol}{formatAmount(stats.monthlySpent / 30)}
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Expenses */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Expenses</h3>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search expenses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-brand-blue transition-colors text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredExpenses.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No expenses found.</p>
                            </div>
                        ) : (
                            filteredExpenses.map(expense => {
                                const category = categories.find(c => c.id === expense.categoryId);
                                const isSynced = expense.sourceType && expense.sourceType !== 'manual';
                                const metadataItems = expense.metadata?.items || [];

                                return (
                                    <div
                                        key={expense.id}
                                        className={`bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between group hover:border-brand-blue transition-all ${isSynced ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 w-full">
                                            <div className={`p-4 rounded-2xl bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 shrink-0`}>
                                                <ShoppingBag size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-gray-900 dark:text-white capitalize truncate">{expense.description}</h4>
                                                    <Badge variant="secondary" className="text-[10px] py-0 px-2 shrink-0">{expense.paymentMethod}</Badge>
                                                    {isSynced && (
                                                        <Badge variant="primary" className="text-[9px] py-0 px-1 border-brand-blue text-brand-blue bg-brand-blue/5 shrink-0">
                                                            {expense.sourceType === 'trip' && <Globe size={10} className="mr-1" />}
                                                            {expense.sourceType === 'play' && <Gamepad2 size={10} className="mr-1" />}
                                                            {expense.sourceType === 'dining' && <Utensils size={10} className="mr-1" />}
                                                            {expense.sourceType === 'entertainment' && <Film size={10} className="mr-1" />}
                                                            {expense.sourceType === 'investments' && <TrendingUp size={10} className="mr-1" />}
                                                            {expense.sourceType!.toUpperCase()}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {isSynced && metadataItems.length > 0 ? (
                                                    <div className="space-y-1 mt-2">
                                                        {metadataItems.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex flex-col gap-0.5">
                                                                <div className="flex items-center justify-between group/item">
                                                                    <div
                                                                        onClick={(e) => {
                                                                            if (item.type === 'trip' && item.id) {
                                                                                e.stopPropagation();
                                                                                window.location.href = `/trips/${item.id}`;
                                                                            }
                                                                        }}
                                                                        className="text-sm font-bold text-gray-800 dark:text-gray-200 hover:text-brand-blue hover:underline cursor-pointer"
                                                                    >
                                                                        {item.name}
                                                                    </div>
                                                                    <div className="text-sm font-black text-brand-blue">
                                                                        {symbol}{item.amount.toFixed(1)}
                                                                    </div>
                                                                </div>
                                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                                    {item.dates.map((d: string) => new Date(d).toLocaleDateString()).join(', ')}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase">Total Consolidated</span>
                                                            <span className="text-base font-black text-brand-orange">{symbol}{formatAmount(expense.amount)}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span className="uppercase tracking-wider">{category?.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 ml-4">
                                            <div className="text-right flex flex-col items-end">
                                                {!isSynced && <p className="font-bold text-gray-900 dark:text-white text-lg">{symbol}{formatAmount(expense.amount)}</p>}
                                                <div className="flex items-center gap-2 mt-1">
                                                    {!isSynced && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(expense); }} className="text-gray-400 hover:text-brand-blue p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all" title="Edit">
                                                            <Edit2 size={16} />
                                                        </button>
                                                    )}
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteExpense(expense.id); }} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Categorical Breakdown */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Breakdown</h3>
                    <Card className="space-y-6">
                        {Object.entries(stats.categoryBreakdown)
                            .sort((a, b) => b[1] - a[1])
                            .map(([catId, amount]) => {
                                const category = categories.find(c => c.id === catId);
                                const percentage = (amount / stats.totalSpent) * 100;
                                return (
                                    <div key={catId} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-gray-700 dark:text-gray-300">{category?.name || 'Unknown'}</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{symbol}{formatAmount(amount)}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-brand-blue transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        }
                        {Object.keys(stats.categoryBreakdown).length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-10">No spending data</p>
                        )}
                    </Card>

                    {monthlySalary > 0 ? (
                        <Card className="bg-brand-blue/5 border-brand-blue/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg">
                                    <PieChart size={18} />
                                </div>
                                <h4 className="font-bold text-brand-blue">Expense Spends Data</h4>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-gray-500">Spent vs. Salary</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-white">
                                            {((stats.monthlySpent / monthlySalary) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${(stats.monthlySpent / monthlySalary) > 0.7 ? 'bg-red-500' :
                                                (stats.monthlySpent / monthlySalary) > 0.4 ? 'bg-brand-orange' : 'bg-brand-green'
                                                }`}
                                            style={{ width: `${Math.min((stats.monthlySpent / monthlySalary) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Remaining</p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white">
                                            {symbol}{formatAmount(Math.max(monthlySalary - stats.monthlySpent, 0))}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Status</p>
                                        <p className={`text-sm font-black ${(stats.monthlySpent / monthlySalary) > 0.7 ? 'text-red-500' : (stats.monthlySpent / monthlySalary) > 0.4 ? 'text-brand-orange' : 'text-brand-green'}`}>
                                            {(stats.monthlySpent / monthlySalary) > 0.7 ? 'Overspending' : (stats.monthlySpent / monthlySalary) > 0.4 ? 'Caution' : 'Safe Zone'}
                                        </p>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-2xl border ${(stats.monthlySpent / monthlySalary) > 0.7 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-brand-blue/5 border-brand-blue/10 text-brand-blue'}`}>
                                    <div className="flex gap-3">
                                        <TrendingUp size={16} className="shrink-0 mt-0.5" />
                                        <p className="text-xs font-bold leading-relaxed">
                                            {(stats.monthlySpent / monthlySalary) > 0.7
                                                ? "You've spent more than 70% of your salary. We suggest cutting down on non-essential expenses."
                                                : (stats.monthlySpent / monthlySalary) > 0.4
                                                    ? "You're in the caution zone. Keep track of your upcoming bills and try to save more this month."
                                                    : "Great job! Your spending is well within the safe zone. You're doing excellent with your finances!"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="bg-gray-50 dark:bg-gray-800/50 border-dashed border-gray-200 dark:border-gray-700 py-12 text-center">
                            <PieChart size={32} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500 font-bold px-4">Set your monthly salary to see spending insights and remaining balance.</p>
                        </Card>
                    )}
                </div>
            </div>

            <AddDailyExpenseModal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); setEditingExpense(undefined); }}
                onSave={handleSaveExpense}
                categories={categories}
                expense={editingExpense}
            />

            <SyncSourcesModal
                isOpen={showSyncModal}
                onClose={() => setShowSyncModal(false)}
                onSync={handleSync}
                isLoading={isSyncing}
            />
        </div>
    );
}
