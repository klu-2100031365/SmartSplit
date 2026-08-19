"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Play } from 'lucide-react';
import { FlipMotionButton } from '../ui/Text3DFlip';

const HeroSection = () => {
    const router = useRouter();
    const [particles, setParticles] = useState<{ x: number; y: number; op: number; dur: number }[]>([]);
    const [email, setEmail] = useState('');

    useEffect(() => {
        setParticles(
            [...Array(14)].map(() => ({
                x: Math.random() * 100,
                y: Math.random() * 100,
                op: 0.04 + Math.random() * 0.12,
                dur: 15 + Math.random() * 20,
            })),
        );
    }, []);

    const goRegister = () => {
        const q = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : '';
        router.push(`/register${q}`);
    };

    return (
        <section className="relative z-0 bg-[#8dc6e4] pb-24 pt-28 sm:pb-32 sm:pt-32 dark:bg-[#5a8eb0]">

            <div
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.22] dark:opacity-[0.28]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 -z-10 hidden opacity-[0.2] dark:block"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />

            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.06, 0.12, 0.06],
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -left-[15%] -top-[25%] h-[70%] w-[70%] rounded-full bg-gradient-to-br from-brand-green/25 via-sky-400/15 to-violet-500/15 blur-[100px] will-change-transform transform-gpu dark:from-[#d4ff00]/15 dark:via-emerald-500/10 dark:to-violet-600/10"
                />
            </div>

            <div className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden">
                {particles.map((p, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: `${p.x}%`,
                            y: `${p.y}%`,
                            opacity: p.op,
                        }}
                        animate={{
                            y: ['-20px', '20px', '-20px'],
                            x: ['-20px', '20px', '-20px'],
                            rotate: [0, 180, 360],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: p.dur,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        className="absolute h-3 w-3 rounded-md border border-gray-300/50 bg-gray-900/[0.03] backdrop-blur-sm will-change-transform dark:border-white/15 dark:bg-white/[0.04] sm:h-5 sm:w-5"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 mx-auto max-w-[1100px] px-4 pt-6 sm:px-6 sm:pt-10">
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-gray-500 dark:text-white/45"
                >
                    Not another split calculator
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 40, rotateX: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1, type: 'spring', bounce: 0.38 }}
                    style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
                >
                    <h1 className="font-mier text-[clamp(2.25rem,6vw,5.5rem)] font-semibold leading-[1.02] tracking-tight text-gray-900 dark:text-[#f2f2ed]">
                        <span className="block text-gray-900 dark:text-white/90">Split</span>
                        <span className="relative mx-auto mt-1 inline-block h-[1.06em] overflow-hidden align-bottom sm:mt-2">
                            <motion.div
                                animate={{ y: ['0%', '-33.33%', '-66.66%', '0%'] }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: [0.76, 0, 0.24, 1],
                                    times: [0, 0.3, 0.6, 1],
                                }}
                                className="flex flex-col"
                            >
                                <span className="text-brand-green dark:text-[#d4ff00]">rent,</span>
                                <span className="text-brand-green dark:text-[#d4ff00]">trips,</span>
                                <span className="text-brand-green dark:text-[#d4ff00]">bills</span>
                            </motion.div>
                        </span>
                        <span className="mt-2 block text-gray-900 dark:text-white/90 sm:mt-3">simple.</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.75 }}
                    className="mt-8 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-white/55 sm:mt-10 sm:text-xl"
                >
                    Typical split apps only divide a receipt. SmartSplit is a live ledger for trips, roommates, nights out, recurring bills — and your own daily spend.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                    className="mt-10 flex flex-wrap items-center gap-4 sm:mt-12"
                >
                    <FlipMotionButton
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push('/register')}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-green px-7 py-3.5 text-sm font-bold text-gray-900 shadow-[0_0_40px_-8px_rgba(249,107,0,0.45)] transition-shadow hover:shadow-[0_0_50px_-6px_rgba(249,107,0,0.5)] dark:bg-[#d4ff00] dark:shadow-[0_0_40px_-8px_rgba(212,255,0,0.55)] dark:hover:shadow-[0_0_50px_-6px_rgba(212,255,0,0.65)] sm:text-base"
                    >
                        Get started
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                    </FlipMotionButton>
                    <FlipMotionButton
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3.5 text-sm font-semibold text-gray-900 shadow-sm backdrop-blur-sm transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-white/20 dark:bg-white/5 dark:text-[#f2f2ed] dark:hover:border-white/35 dark:hover:bg-white/10 sm:text-base"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-white/25 dark:bg-white/10">
                            <Play className="h-4 w-4 fill-current pl-0.5 text-gray-900 dark:text-white" />
                        </span>
                        See the flow
                    </FlipMotionButton>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.75, duration: 0.55 }}
                    className="mx-auto mt-14 max-w-xl sm:mt-16"
                >
                    <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-white/40">
                        Start your first shared ledger
                    </p>
                    <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm backdrop-blur-md dark:border-white/12 dark:bg-white/[0.04] sm:flex-row sm:items-center sm:rounded-full sm:pl-5">
                        <div className="flex min-h-[3rem] flex-1 items-center gap-3 px-4 sm:px-0">
                            <Mail className="h-5 w-5 shrink-0 text-gray-400 dark:text-white/35" aria-hidden />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="What's your email?"
                                className="min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-[#f2f2ed] dark:placeholder:text-white/35"
                                autoComplete="email"
                            />
                        </div>
                        <FlipMotionButton
                            type="button"
                            whileTap={{ scale: 0.97 }}
                            onClick={goRegister}
                            className="rounded-xl bg-brand-green px-6 py-3.5 text-sm font-bold text-gray-900 dark:bg-[#d4ff00] sm:mr-1 sm:rounded-full sm:py-3"
                        >
                            Next step
                        </FlipMotionButton>
                    </div>
                    <FlipMotionButton
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.95 }}
                        onClick={() => router.push('/login')}
                        className="mt-5 w-full text-center text-sm font-medium text-gray-500 transition-colors hover:text-gray-800 dark:text-white/50 dark:hover:text-white/80"
                    >
                        Already in?{' '}
                        <span className="font-semibold text-brand-green dark:text-[#d4ff00]">Sign in</span>
                    </FlipMotionButton>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
