"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Utensils,
  TrendingUp,
  Wallet,
  Bot,
  Zap,
  BarChart3,
  Globe,
  Receipt,
  Film,
  Gamepad2
} from 'lucide-react';
import Card from '../components/ui/Card';

const LandingPage = () => {
  const router = useRouter();

  const useCases = [
    {
      title: 'Trips',
      icon: Plane,
      desc: 'The ultimate travel expense manager for groups.',
      features: [
        'Smart Settlements (Who pays whom)',
        'AI Assistant for quick entry',
        'Detailed Category Analytics',
        'Multi-currency support'
      ]
    },
    {
      title: 'Daily Expense',
      icon: Wallet,
      desc: 'Master your personal finances day by day.',
      features: [
        'AI Chatbot for tracking',
        'Monthly Budgeting',
        'Day-wise spending trends',
        'Expense Insights'
      ]
    },
    {
      title: 'Restaurant',
      icon: Utensils,
      desc: 'Dine out without the math headache.',
      features: [
        'Receipt Scanning',
        'Itemized Splitting',
        'Tax & Tip Calculation',
        'Instant Share Generation'
      ]
    },
    {
      title: 'Entertainment',
      icon: Film,
      desc: 'Movies, concerts, and fun times.',
      features: [
        'Quick Ticket Splitting',
        'Group Booking Management',
        'Settlement Reminders',
        'Event History'
      ]
    },
    {
      title: 'Sports & Play',
      icon: Gamepad2,
      desc: 'Turf bookings and equipment sharing.',
      features: [
        'Court Rental Division',
        'Recurring Games',
        'Equipment Cost Sharing',
        'Team Settlements'
      ]
    },
    {
      title: 'Shared Investments',
      icon: TrendingUp,
      desc: 'Track SIPs and group savings goals.',
      features: [
        'Goal Progress Tracking',
        'Contribution History',
        'Growth Projections',
        'Automated Reminders'
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-white dark:bg-gray-900 pt-20 sm:pt-32 pb-16 sm:pb-24 px-6 transition-colors relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-white to-white dark:from-brand-blue/5 dark:via-gray-900 dark:to-gray-900 pointer-events-none"></div>
        <div className="max-w-[1600px] mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 sm:mb-8 leading-tight text-gray-900 dark:text-white tracking-tight">
            Split Bills, <br /><span className="text-brand-green">Not Friendships.</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            The smartest way to track shared expenses for travel, dining, and daily life.
            Settling up has never been this easy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button onClick={() => router.push('/register')} className="px-10 py-4 text-lg font-bold text-white bg-brand-green rounded-full shadow-xl shadow-brand-green/30 hover:bg-brand-green/90 transition-all hover:-translate-y-1">
              Get Started Free
            </button>
            <button onClick={() => router.push('/login')} className="px-10 py-4 text-lg font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-full transition-all">
              Login
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-[1600px] mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-16 text-center">Everything you need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((item, i) => (
            <Card key={i} className="hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full flex flex-col p-8 bg-white dark:bg-gray-800 rounded-[32px]">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-2xl">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
              </div>

              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed h-[50px]">{item.desc}</p>

              <div className="space-y-3 mt-auto">
                {item.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
