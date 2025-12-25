"use client";

import React from 'react';
import { Edit2 } from 'lucide-react';
import { CATEGORY_STYLES } from '../../lib/constants';
import { formatAmount } from '../../lib/formatters';
import Badge from '../ui/Badge';
import { Expense, Participant } from '../../types';

interface ExpenseCardProps {
    expense: Expense;
    participants: Participant[];
    symbol: string;
    canEdit: boolean;
    onEdit: (expense: Expense) => void;
}

const ExpenseCard = ({ expense, participants, symbol, canEdit, onEdit }: ExpenseCardProps) => {
    const style = CATEGORY_STYLES[expense.category] || CATEGORY_STYLES['Others'];
    const Icon = style.icon;
    const splitAmong = expense.splitAmong || [];
    const splitNames = splitAmong.length === participants.length
        ? 'Everyone'
        : splitAmong.map(id => participants.find(p => p.id === id)?.name).join(', ');
    const payerName = participants.find(p => p.id === expense.paidBy)?.name || 'Unknown';

    return (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm hover:shadow-lg transition-all group relative gap-4">
            <div className="flex items-start sm:items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}>
                    <Icon size={28} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-xl mb-1"> {expense.description} </h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Badge variant="secondary"> {expense.category} </Badge>
                        <span className="text-base text-gray-500 dark:text-gray-400">
                            paid by <span className="font-bold text-gray-800 dark:text-gray-200"> {payerName} </span>
                        </span>
                        <span className="text-sm text-gray-400 dark:text-gray-500 hidden sm:inline">•</span>
                        <span className="text-base text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-none">
                            for {splitNames}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between w-full sm:auto gap-6 ml-auto sm:ml-0 pl-20 sm:pl-0">
                <div className={`font-bold text-2xl ${expense.isPayment ? 'text-brand-green' : 'text-gray-900 dark:text-white'}`}>
                    {symbol} {formatAmount(expense.amount || 0)}
                </div>
                {
                    canEdit && (
                        <button onClick={() => onEdit(expense)} className="p-3 text-gray-400 hover:text-brand-blue hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">
                            <Edit2 size={20} />
                        </button>
                    )
                }
            </div>
        </div>
    );
};

export default ExpenseCard;
