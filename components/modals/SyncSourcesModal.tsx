"use client";

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Plane, Utensils, Gamepad2, Film, Check, TrendingUp } from 'lucide-react';

interface SyncSourcesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSync: (sources: string[]) => void;
    isLoading: boolean;
}

const SyncSourcesModal = ({ isOpen, onClose, onSync, isLoading }: SyncSourcesModalProps) => {
    const [selectedSources, setSelectedSources] = useState<string[]>(['trip']);

    const sources = [
        { id: 'trip', name: 'Trips', icon: Plane, color: 'text-brand-blue' },
        { id: 'dining', name: 'Dining', icon: Utensils, color: 'text-brand-orange' },
        { id: 'play', name: 'Playtime', icon: Gamepad2, color: 'text-brand-green' },
        { id: 'entertainment', name: 'Entertainment', icon: Film, color: 'text-brand-purple' },
        { id: 'investments', name: 'SIP / Investments', icon: TrendingUp, color: 'text-brand-blue' },
    ];

    const toggleSource = (id: string) => {
        if (selectedSources.includes(id)) {
            setSelectedSources(selectedSources.filter(s => s !== id));
        } else {
            setSelectedSources([...selectedSources, id]);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sync Expenses from Modules">
            <div className="space-y-6">
                <p className="text-sm text-gray-500">Select the modules you want to import your expenses from for this month.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sources.map(source => {
                        const isSelected = selectedSources.includes(source.id);
                        return (
                            <button
                                key={source.id}
                                onClick={() => toggleSource(source.id)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSelected
                                    ? 'border-brand-blue bg-brand-blue/5'
                                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${source.color}`}>
                                        <source.icon size={20} />
                                    </div>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">{source.name}</span>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-blue border-brand-blue' : 'border-gray-200 dark:border-gray-700'
                                    }`}>
                                    {isSelected && <Check size={14} className="text-white" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="pt-4 flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button
                        className="flex-1"
                        onClick={() => onSync(selectedSources)}
                        isLoading={isLoading}
                        disabled={selectedSources.length === 0}
                    >
                        Sync Now
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SyncSourcesModal;
