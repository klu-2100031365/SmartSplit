"use client";

import React from 'react';
import {
    Zap,
    Users,
    PieChart,
    ShieldCheck,
    Bot,
    ArrowRight,
    Sparkles,
    TrendingUp,
    Globe,
    Lock,
    Receipt,
    Wallet
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface TripsDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TripsDemoModal = ({ isOpen, onClose }: TripsDemoModalProps) => {
    const features = [
        {
            title: "Smart Settlements",
            desc: "Our engine calculates the absolute minimum number of payments to settle all group debts.",
            icon: Zap,
            color: "text-brand-blue",
            bg: "bg-brand-blue/10"
        },
        {
            title: "Real-time Sync",
            desc: "Collaborate with friends instantly. Everyone sees updates as they happen.",
            icon: Users,
            color: "text-brand-orange",
            bg: "bg-brand-orange/10"
        },
        {
            title: "Advanced Analytics",
            desc: "Beautiful category breakdowns and daily spending trends for every trip.",
            icon: PieChart,
            color: "text-brand-green",
            bg: "bg-brand-green/10"
        },
        {
            title: "AI Assistant",
            desc: "Get natural language insights and automated expense categorization.",
            icon: Bot,
            color: "text-brand-purple",
            bg: "bg-brand-purple/10"
        },
        {
            title: "Multi-Currency",
            desc: "Travel anywhere! Support for over 150 currencies with live exchange rates.",
            icon: Globe,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Receipt Scanning",
            desc: "Just snap a photo. We'll extract details and split them automatically.",
            icon: Receipt,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Unlock Premium Features">
            <div className="font-mier space-y-8 max-h-[85vh] overflow-y-auto pr-2 scrollbar-hide pb-8 animate-in fade-in duration-500">

                {/* Hero section */}
                <div className="text-center space-y-4 pt-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue/5 rounded-full border border-brand-blue/10">
                        <Sparkles size={14} className="text-brand-blue" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Core Features</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                        Experience the <span className="text-brand-blue">Smart</span> Split
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                        Beyond simple calculations, SmartSplit offers a complete ecosystem for managing group travels and shared lives.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((f, i) => (
                        <div key={i} className="p-5 bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm hover:border-brand-blue/20 transition-all hover:shadow-md group">
                            <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <f.icon size={24} />
                            </div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">{f.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Secure & Cloud */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-brand-blue/20 dark:to-brand-purple/20 p-6 rounded-[32px] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Lock size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest mb-1">Cloud Sync & Security</p>
                            <p className="text-[11px] text-gray-300">Your data is encrypted and synced across all your devices in real-time.</p>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="space-y-4">
                    <Button
                        onClick={() => window.location.href = '/register'}
                        className="w-full py-6 text-sm font-black uppercase tracking-[0.2em] bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none rounded-[32px] shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 group"
                    >
                        Create My Account
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Join 50,000+ users splitting smarter
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default TripsDemoModal;
