"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Utensils, Film, Gamepad2, PiggyBank, TrendingUp, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage = () => {
  const router = useRouter();
  const modules = [
    { title: 'Trips', icon: Plane, desc: 'Split vacation costs seamlessly.', route: '/trips' },
    { title: 'Restaurant', icon: Utensils, desc: 'Split the bill instantly.' },
    { title: 'Movies', icon: Film, desc: 'Share ticket prices.' },
    { title: 'Play Time', icon: Gamepad2, desc: 'Divide court rentals.' },
    { title: 'Chit Funds', icon: PiggyBank, desc: 'Manage group savings.' },
    { title: 'SIP', icon: TrendingUp, desc: 'Track shared investments.' },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-white dark:bg-gray-900 pt-32 pb-24 px-6 transition-colors relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-white to-white dark:from-brand-blue/5 dark:via-gray-900 dark:to-gray-900 pointer-events-none"></div>
        <div className="max-w-[1600px] mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-extrabold mb-10 leading-tight text-gray-900 dark:text-white tracking-tight">
            Split Bills, <br /><span className="text-brand-green">Not Friendships.</span>
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            The smartest way to track shared expenses for travel, dining, and daily life.
            Settling up has never been this easy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button onClick={() => router.push('/register')} variant="success" className="px-12 py-5 text-xl text-white shadow-xl shadow-brand-green/30">
              Get Started Free
            </Button>
            <Button onClick={() => router.push('/login')} variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-12 py-5 text-xl">
              Login
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-[1600px] mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-16 text-center">Everything you need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {modules.map((m, i) => (
            <Card key={i} className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-5 mb-6">
                  <div className="p-4 bg-brand-blue/10 text-brand-blue rounded-2xl group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                    <m.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{m.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">{m.desc}</p>
              </div>
              {m.route && (
                <Button onClick={() => router.push(m.route)} className="w-full py-4 text-lg" variant="secondary">
                  Launch App <ArrowRight size={20} />
                </Button>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
