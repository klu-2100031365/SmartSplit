"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { formatAmount } from '../../lib/formatters';
import Button from '../ui/Button';
import { Settlement } from '../../types';

interface BalanceCardProps {
    settlement: Settlement;
    symbol: string;
    canEdit: boolean;
    onSettleUp: (s: Settlement) => void;
    isLoading?: boolean;
}

const BalanceCard = ({ settlement, symbol, canEdit, onSettleUp, isLoading }: BalanceCardProps) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 w-full sm:w-auto text-lg text-center sm:text-left">
                <div className="flex-1 sm:text-right">
                    <span className="block font-bold text-gray-900 dark:text-white text-xl"> {settlement.from} </span>
                    <span className="text-sm font-bold uppercase tracking-wider text-brand-orange"> Pays(-{symbol}{formatAmount(settlement.amount)})</span>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-400 rotate-90 sm:rotate-0">
                    <ArrowRight size={24} />
                </div>
                <div className="flex-1">
                    <span className="block font-bold text-gray-900 dark:text-white text-xl"> {settlement.to} </span>
                    <span className="text-sm font-bold uppercase tracking-wider text-brand-green"> Receives(+{symbol}{formatAmount(settlement.amount)})</span>
                </div>
            </div>
            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-gray-100 dark:border-gray-700 pt-4 sm:pt-0 mt-2 sm:mt-0">
                <div className="font-bold text-brand-blue text-2xl">
                    {symbol} {formatAmount(settlement.amount)}
                </div>
                {
                    canEdit && (
                        <Button
                            variant="secondary"
                            className="py-2.5 px-5 text-sm"
                            onClick={() => onSettleUp(settlement)}
                            isLoading={isLoading}
                        >
                            Mark Paid
                        </Button>
                    )
                }
            </div>
        </div>
    );
};

export default BalanceCard;
