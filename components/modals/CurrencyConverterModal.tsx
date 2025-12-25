"use client";

import React, { useState } from 'react';
import { DollarSign, ArrowRight } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Currency } from '../../types';
import { CURRENCIES } from '../../lib/constants';

const CurrencyConverterModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [amount, setAmount] = useState('1');
    const [from, setFrom] = useState<Currency>('USD');
    const [to, setTo] = useState<Currency>('INR');

    const rates: Record<Currency, number> = {
        USD: 1,
        INR: 84.1,
        EUR: 0.92,
        GBP: 0.77,
        AED: 3.67
    };

    const result = (parseFloat(amount || '0') / rates[from]) * rates[to];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Currency Converter">
            <Input
                label="Amount"
                type="number"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                leftElement={<DollarSign size={20} />}
            />
            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">From</label>
                    <select value={from} onChange={(e) => setFrom(e.target.value as Currency)} className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold border-none outline-none">
                        {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="mt-6 text-brand-blue"><ArrowRight size={24} /></div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">To</label>
                    <select value={to} onChange={(e) => setTo(e.target.value as Currency)} className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold border-none outline-none">
                        {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="bg-brand-blue/5 dark:bg-brand-blue/10 p-6 rounded-2xl text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Converted Amount</p>
                <div className="text-4xl font-extrabold text-brand-blue">
                    {CURRENCIES[to]} {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-400 mt-2">1 {from} = {(rates[to] / rates[from]).toFixed(4)} {to}</p>
            </div>
        </Modal>
    );
};

export default CurrencyConverterModal;
