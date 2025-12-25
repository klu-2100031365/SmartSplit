"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { Participant, Expense } from '../../types';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    participants: Participant[];
    editingExpense: Expense | null;
    onSave: (expenseData: Omit<Expense, 'id' | 'tripId'>) => Promise<void>;
    isLoading?: boolean;
    error?: string;
}

const AddExpenseModal = ({ isOpen, onClose, participants, editingExpense, onSave, isLoading, error }: AddExpenseModalProps) => {
    const [form, setForm] = useState({ desc: '', amount: '', category: 'Food', paidBy: '', date: '' });
    const [selectedSplit, setSelectedSplit] = useState<string[]>([]);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (editingExpense) {
            setForm({
                desc: editingExpense.description,
                amount: editingExpense.amount.toString(),
                category: editingExpense.category,
                paidBy: editingExpense.paidBy,
                date: editingExpense.date.split('T')[0]
            });
            setSelectedSplit(editingExpense.splitAmong || []);
        } else {
            setForm({
                desc: '',
                amount: '',
                category: 'Food',
                paidBy: '',
                date: new Date().toISOString().split('T')[0]
            });
            setSelectedSplit([]);
        }
        setFormError('');
    }, [editingExpense, isOpen]);

    const handleSave = async () => {
        if (!form.paidBy || !form.amount || !form.desc) {
            setFormError('Please fill all required fields.');
            return;
        }

        const data: Omit<Expense, 'id' | 'tripId'> = {
            description: form.desc,
            amount: parseFloat(form.amount),
            date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
            category: form.category,
            paidBy: form.paidBy,
            splitAmong: selectedSplit.length > 0 ? selectedSplit : participants.map(p => p.id),
            isPayment: false
        };
        await onSave(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingExpense ? "Edit Expense" : "Add Expense"}>
            <div className="space-y-6">
                {(formError || error) && (
                    <div className="p-4 bg-brand-orange/10 text-brand-orange text-sm rounded-xl flex items-center gap-3 font-medium border border-brand-orange/20">
                        <AlertCircle size={20} /> {formError || error}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"> Date </label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                            className="w-full px-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
                        />
                    </div>
                    <Input
                        label="Amount"
                        type="number"
                        value={form.amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, amount: e.target.value })}
                        placeholder="0.00"
                        required
                    />
                </div>
                <Input
                    label="Description"
                    value={form.desc}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, desc: e.target.value })}
                    placeholder="e.g. Dinner at Taj"
                    required
                />
                <Select
                    label="Category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    options={[
                        { value: 'Food', label: 'Food' },
                        { value: 'Travel', label: 'Travel' },
                        { value: 'Rent', label: 'Rent' },
                        { value: 'Entertainment', label: 'Entertainment' },
                        { value: 'Shopping', label: 'Shopping' },
                        { value: 'Others', label: 'Others' }
                    ]}
                />
                <Select
                    label="Paid By"
                    value={form.paidBy}
                    onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
                    options={[
                        { value: '', label: 'Select Payer' },
                        ...participants.map(p => ({ value: p.id, label: p.name }))
                    ]}
                />
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"> Split Among (Optional) </label>
                    <div className="flex flex-wrap gap-3 mb-2">
                        {participants.map(p => {
                            const isSelected = selectedSplit.includes(p.id);
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => isSelected ? setSelectedSplit(selectedSplit.filter(id => id !== p.id)) : setSelectedSplit([...selectedSplit, p.id])}
                                    className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all ${isSelected
                                        ? 'bg-brand-blue text-white border-brand-blue shadow-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-brand-blue/50'
                                        }`}
                                >
                                    {p.name}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400"> Selected: {selectedSplit.length > 0 ? selectedSplit.length : 'All'} people </p>
                </div>
                <Button onClick={handleSave} className="w-full mt-4 py-4" isLoading={isLoading}> {editingExpense ? "Update Expense" : "Save Expense"} </Button>
            </div>
        </Modal>
    );
};

export default AddExpenseModal;
