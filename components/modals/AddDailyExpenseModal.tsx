"use client";

import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, CreditCard, AlignLeft } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { DailyExpense, DailyCategory } from '../../types';

interface AddDailyExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<DailyExpense, 'id' | 'userId'>) => Promise<void>;
    categories: DailyCategory[];
    expense?: DailyExpense;
}

const AddDailyExpenseModal = ({ isOpen, onClose, onSave, categories, expense }: AddDailyExpenseModalProps) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Net Banking' | 'Other'>('Cash');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (expense) {
            setAmount(expense.amount.toString());
            setDescription(expense.description);
            setDate(expense.date.split('T')[0]);
            setCategoryId(expense.categoryId);
            setPaymentMethod(expense.paymentMethod);
            setNotes(expense.notes || '');
        } else {
            setAmount('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
            setCategoryId(categories[0]?.id || '');
            setPaymentMethod('Cash');
            setNotes('');
        }
    }, [expense, categories, isOpen]);

    const handleSave = async () => {
        if (!amount || !description || !categoryId) {
            setError('Please fill in all mandatory fields.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await onSave({
                amount: parseFloat(amount),
                description,
                date: new Date(date).toISOString(),
                categoryId,
                paymentMethod,
                notes
            });
            onClose();
        } catch (e: any) {
            setError(e.message || 'Failed to save expense');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={expense ? "Edit Expense" : "Add New Expense"}>
            <div className="space-y-6 pt-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        Amount <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <DollarSign size={20} />
                        </div>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 text-3xl font-bold bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Description"
                        placeholder="What was this for?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        leftElement={<AlignLeft size={20} />}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            leftElement={<Calendar size={20} />}
                            required
                        />

                        <Select
                            label="Payment Method"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            options={[
                                { value: 'Cash', label: 'Cash' },
                                { value: 'Card', label: 'Card' },
                                { value: 'UPI', label: 'UPI' },
                                { value: 'Net Banking', label: 'Net Banking' },
                                { value: 'Other', label: 'Other' }
                            ]}
                        />
                    </div>

                    <Select
                        label="Category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        options={categories.map(cat => ({
                            value: cat.id,
                            label: cat.name
                        }))}
                        required
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add more details..."
                            className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-brand-blue min-h-[100px] text-sm transition-colors"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button variant="secondary" onClick={onClose} className="flex-1 py-4"> Cancel </Button>
                    <Button onClick={handleSave} isLoading={isLoading} className="flex-1 py-4"> {expense ? 'Update' : 'Save'} Expense </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddDailyExpenseModal;
