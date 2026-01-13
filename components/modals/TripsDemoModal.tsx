"use client";

import React, { useState } from 'react';
import {
    Zap,
    Calculator as CalcIcon,
    Users,
    PieChart,
    ShieldCheck,
    Bot,
    Plus,
    Minus,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Sparkles,
    TrendingUp,
    BarChart3,
    Share2,
    Cloud,
    Lock
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface Participant {
    id: string;
    name: string;
    share: string;
}

interface TripsDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TripsDemoModal = ({ isOpen, onClose }: TripsDemoModalProps) => {
    const [amount, setAmount] = useState('6000');
    const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
    const [isAIExpanded, setIsAIExpanded] = useState(false);

    // Dynamic Participants State
    const [participants, setParticipants] = useState<Participant[]>([
        { id: '1', name: 'You', share: '2000' },
        { id: '2', name: 'Rahul', share: '2000' },
        { id: '3', name: 'Sudeep', share: '2000' }
    ]);

    // Handle name change
    const updateName = (id: string, newName: string) => {
        setParticipants(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    };

    // Handle share change for custom mode
    const updateShare = (id: string, newShare: string) => {
        setParticipants(prev => prev.map(p => p.id === id ? { ...p, share: newShare } : p));
    };

    // Add new participant
    const addParticipant = () => {
        const newId = (participants.length + 1).toString();
        const newPerson = {
            id: newId,
            name: `Person ${newId}`,
            share: '0'
        };
        setParticipants([...participants, newPerson]);
    };

    // Remove latest participant
    const removeLatestParticipant = () => {
        if (participants.length <= 1) return;
        setParticipants(participants.slice(0, -1));
    };

    // Auto-calculate equal shares
    const equalShare = (parseFloat(amount || '0') / participants.length).toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="SmartSplit Demo">
            <div className="font-mier space-y-6 sm:space-y-8 max-h-[85vh] overflow-y-auto pr-2 scrollbar-hide pb-8 animate-in fade-in duration-500">

                {/* 1. Calm Input Section */}
                <div className="space-y-6 pt-4 text-center">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Total Bill Amount</p>
                        <div className="flex items-center justify-center">
                            <span className="text-3xl font-light text-gray-300 mr-2">₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white bg-transparent border-none outline-none text-center w-full max-w-[200px] sm:max-w-[250px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center gap-2">
                        {['equal', 'custom'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setSplitMode(mode as any)}
                                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${splitMode === mode ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Dynamic Participants List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Users size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Trip Members ({participants.length})</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <button onClick={removeLatestParticipant} className="text-gray-400 hover:text-brand-orange transition-colors"><Minus size={14} /></button>
                            <span className="text-xs font-black min-w-[20px] text-center">{participants.length}</span>
                            <button onClick={addParticipant} className="text-gray-400 hover:text-brand-blue transition-colors"><Plus size={14} /></button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {participants.map((p, idx) => (
                            <div key={p.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-3xl border border-gray-50 dark:border-gray-700 shadow-sm transition-all hover:border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${idx % 3 === 0 ? 'bg-brand-blue' : idx % 3 === 1 ? 'bg-brand-orange' : 'bg-brand-green'}`}>
                                        {p.name[0] || '?'}
                                    </div>
                                    <input
                                        value={p.name}
                                        onChange={(e) => updateName(p.id, e.target.value)}
                                        className="text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent border-none outline-none flex-1 min-w-0 focus:text-brand-blue"
                                        placeholder="Name"
                                    />
                                </div>
                                <div className="text-right">
                                    {splitMode === 'equal' ? (
                                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">₹{equalShare}</span>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-black text-gray-300">₹</span>
                                            <input
                                                type="number"
                                                value={p.share}
                                                onChange={(e) => updateShare(p.id, e.target.value)}
                                                className="w-20 text-right bg-transparent border-b border-dashed border-gray-200 dark:border-gray-700 text-sm font-black text-brand-blue outline-none focus:border-brand-blue"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. The Integrated Smart Outcome Section */}
                <div className="bg-gradient-to-br from-brand-blue/[0.04] to-brand-purple/[0.04] p-5 sm:p-8 rounded-3xl sm:rounded-[40px] border border-brand-blue/10 space-y-7 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                        <ShieldCheck size={120} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-brand-blue" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Smart Outcome</h4>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Optimized & Settled</h3>
                    </div>

                    {/* Intelligence Info */}
                    <div className="p-5 bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-brand-blue/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Intelligence Check</p>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-green/10 text-brand-green rounded-full text-[9px] font-black uppercase">
                                <Zap size={10} fill="currentColor" /> Strategy Active
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-2"><TrendingUp size={14} className="text-brand-orange" /> {splitMode === 'equal' ? 'Equal' : 'Custom'} split logic</span>
                                <span className="text-brand-orange font-black">Active</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-2"><Zap size={14} className="text-brand-blue" /> Minimized settlements</span>
                                <span className="text-brand-blue font-black">{participants.length > 1 ? participants.length - 1 : 0} Payments</span>
                            </div>
                        </div>
                    </div>

                    {/* Why this result Dropdown */}
                    <div className="rounded-[28px] border border-gray-100 dark:border-gray-800 transition-all overflow-hidden bg-white/50 dark:bg-gray-800/30">
                        <button
                            onClick={() => setIsAIExpanded(!isAIExpanded)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Bot size={18} className="text-gray-400" />
                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Why this result?</span>
                            </div>
                            {isAIExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </button>
                        {isAIExpanded && (
                            <div className="p-4 pt-0 text-xs text-gray-500 font-medium leading-relaxed animate-in slide-in-from-top-2 duration-300">
                                "I've analyzed the ₹{parseFloat(amount || '0').toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} total and calculated the most efficient settlement plan. By collapsing redundant group debts across {participants.length} members, I've ensured everyone pays their exact share with the fewest possible transfers."
                            </div>
                        )}
                    </div>

                    {/* Blurred Charts with Login Message */}
                    <div className="relative group/charts">
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 px-4 text-center">
                            <Lock size={16} className="text-gray-400 mb-1" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">These features will</p>
                            <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest leading-tight">appear after login</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 blur-[2px] grayscale-[0.5] opacity-40 pointer-events-none">
                            <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                                    <PieChart size={10} /> Category Split
                                </p>
                                <div className="h-24 bg-white/40 dark:bg-gray-900/40 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                    <div className="w-12 h-12 rounded-full border-[6px] border-brand-blue border-r-brand-purple"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                                    <BarChart3 size={10} /> Daily Spend
                                </p>
                                <div className="h-24 bg-white/40 dark:bg-gray-900/40 rounded-2xl flex items-end gap-1 px-2 pb-2 border border-gray-100 dark:border-gray-800">
                                    <div className="flex-1 bg-brand-blue/30 h-[20%] rounded-t-sm"></div>
                                    <div className="flex-1 bg-brand-blue h-[60%] rounded-t-sm"></div>
                                    <div className="flex-1 bg-brand-purple/30 h-[40%] rounded-t-sm"></div>
                                    <div className="flex-1 bg-brand-purple h-[80%] rounded-t-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ecosystem Integrated Features */}
                    <div className="pt-2 space-y-5 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Share2 size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Collaborate Instantly</p>
                                <p className="text-[10px] text-gray-500 font-medium">Share unique expense links with your friends. Everyone stays in the loop.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Cloud size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Cloud Sync & Security</p>
                                <p className="text-[10px] text-gray-500 font-medium">Every calculation and history is saved to your profile forever.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pulsing Login Message */}
                <div className="text-center py-2 animate-pulse">
                    <p className="text-[11px] font-black text-brand-purple uppercase tracking-[0.3em]">Login to access full features</p>
                </div>

                {/* 5. Final CTA */}
                <div className="text-center">
                    <Button
                        onClick={() => window.location.href = '/register'}
                        className="w-full py-5 sm:py-6 text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none rounded-2xl sm:rounded-[32px] shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 group"
                    >
                        Create My Account
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default TripsDemoModal;
