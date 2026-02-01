"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, Calendar, Bell, CreditCard, AlignLeft } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { RecurringItem, RecurringItemCategory, RecurringItemKind } from '../../types';

interface AddRecurringItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<RecurringItem, 'id' | 'userId'>) => Promise<void>;
    item?: RecurringItem;
}

const AddRecurringItemModal = ({ isOpen, onClose, onSave, item }: AddRecurringItemModalProps) => {
    const [name, setName] = useState('');
    const [kind, setKind] = useState<RecurringItemKind>('bill');
    const [category, setCategory] = useState<RecurringItemCategory>('wifi');
    const [amount, setAmount] = useState('');
    const [dueDay, setDueDay] = useState('1');
    const [reminderDaysBefore, setReminderDaysBefore] = useState('2');
    const [autoPayEnabled, setAutoPayEnabled] = useState<'yes' | 'no'>('no');
    const [isActive, setIsActive] = useState<'yes' | 'no'>('yes');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const categoryOptions = useMemo(() => {
        const billCats: { value: RecurringItemCategory; label: string }[] = [
            { value: 'wifi', label: 'WiFi' },
            { value: 'electricity', label: 'Electricity' },
            { value: 'water', label: 'Water' },
            { value: 'mobile', label: 'Mobile Recharge' },
            { value: 'rent', label: 'Rent' },
            { value: 'emi', label: 'EMI' },
            { value: 'insurance', label: 'Insurance' },
            { value: 'other', label: 'Other' }
        ];

        const subCats: { value: RecurringItemCategory; label: string }[] = [
            { value: 'netflix', label: 'Netflix' },
            { value: 'prime', label: 'Prime' },
            { value: 'spotify', label: 'Spotify' },
            { value: 'hotstar', label: 'Hotstar' },
            { value: 'youtube', label: 'YouTube Premium' },
            { value: 'other', label: 'Other' }
        ];

        return kind === 'bill' ? billCats : subCats;
    }, [kind]);

    useEffect(() => {
        if (item) {
            setName(item.name);
            setKind(item.kind);
            setCategory(item.category);
            setAmount(item.amount.toString());
            setDueDay(item.dueDay.toString());
            setReminderDaysBefore(item.reminderDaysBefore.toString());
            setAutoPayEnabled(item.autoPayEnabled ? 'yes' : 'no');
            setIsActive(item.isActive ? 'yes' : 'no');
            setNotes(item.notes || '');
            setError('');
            return;
        }

        setName('');
        setKind('bill');
        setCategory('wifi');
        setAmount('');
        setDueDay('1');
        setReminderDaysBefore('2');
        setAutoPayEnabled('no');
        setIsActive('yes');
        setNotes('');
        setError('');
    }, [item, isOpen]);

    useEffect(() => {
        const allowed = new Set(categoryOptions.map(o => o.value));
        if (!allowed.has(category)) {
            setCategory(categoryOptions[0]?.value || 'other');
        }
    }, [categoryOptions, category]);

    const handleSave = async () => {
        if (!name.trim() || !amount) {
            setError('Please fill in all mandatory fields.');
            return;
        }

        const due = Number(dueDay);
        const remind = Number(reminderDaysBefore);
        const amt = Number(amount);

        if (!Number.isFinite(amt) || amt < 0) {
            setError('Amount must be a valid number.');
            return;
        }

        if (!Number.isFinite(due) || due < 1 || due > 31) {
            setError('Due day must be between 1 and 31.');
            return;
        }

        if (!Number.isFinite(remind) || remind < 0 || remind > 31) {
            setError('Reminder days must be between 0 and 31.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await onSave({
                name: name.trim(),
                kind,
                category,
                amount: amt,
                dueDay: due,
                reminderDaysBefore: remind,
                autoPayEnabled: autoPayEnabled === 'yes',
                isActive: isActive === 'yes',
                notes: notes.trim() || undefined
            });
            onClose();
        } catch (e: any) {
            setError(e.message || 'Failed to save item');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Recurring Item' : 'Add Recurring Item'}>
            <div className="space-y-6 pt-2">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Type"
                        value={kind}
                        onChange={(e) => setKind(e.target.value as RecurringItemKind)}
                        options={[
                            { value: 'bill', label: 'Bill' },
                            { value: 'subscription', label: 'Subscription' }
                        ]}
                    />

                    <Select
                        label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as RecurringItemCategory)}
                        options={categoryOptions}
                    />
                </div>

                <Input
                    label="Name"
                    placeholder={kind === 'bill' ? 'e.g. Electricity' : 'e.g. Netflix'}
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    leftElement={<AlignLeft size={20} />}
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Amount (Monthly)"
                        type="number"
                        placeholder="0"
                        value={amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                        leftElement={<DollarSign size={20} />}
                        required
                    />

                    <Input
                        label="Due Day (1-31)"
                        type="number"
                        value={dueDay}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDay(e.target.value)}
                        leftElement={<Calendar size={20} />}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Reminder (days before)"
                        type="number"
                        value={reminderDaysBefore}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReminderDaysBefore(e.target.value)}
                        leftElement={<Bell size={18} />}
                    />

                    <Select
                        label="Auto-pay"
                        value={autoPayEnabled}
                        onChange={(e) => setAutoPayEnabled(e.target.value as any)}
                        options={[
                            { value: 'no', label: 'Off' },
                            { value: 'yes', label: 'On' }
                        ]}
                    />

                    <Select
                        label="Active"
                        value={isActive}
                        onChange={(e) => setIsActive(e.target.value as any)}
                        options={[
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' }
                        ]}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Autopay account, billing cycle notes..."
                        className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-brand-blue min-h-[110px] text-sm transition-colors"
                    />
                </div>

                <div className="flex gap-4 pt-2">
                    <Button variant="secondary" onClick={onClose} className="flex-1 py-4"> Cancel </Button>
                    <Button onClick={handleSave} isLoading={isLoading} className="flex-1 py-4">
                        {item ? 'Update' : 'Save'}
                    </Button>
                </div>

                <div className="hidden">
                    <CreditCard size={1} />
                </div>
            </div>
        </Modal>
    );
};

export default AddRecurringItemModal;
