"use client";

import { useRouter } from 'next/navigation';
import { m, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { fadeUp, staggerContainer, viewportOnce } from '../../lib/motion';
import { FlipMotionButton } from '../ui/Text3DFlip';
import TiltCard from './TiltCard';

export default function LandingCTA() {
    const router = useRouter();
    const ref = useRef(null);
    const inView = useInView(ref, viewportOnce);
    const reduceMotion = useReducedMotion();

    return (
        <section ref={ref} className="relative overflow-hidden border-t border-gray-200 bg-[#f4f1ea] px-4 py-20 dark:border-white/10 dark:bg-[#0b0b0b] sm:px-8 sm:py-28">
            <div
                aria-hidden
                className="pointer-events-none absolute -left-24 top-10 h-64 w-64 [perspective:600px]"
            >
                <div className="h-full w-full" style={{ transform: 'rotateX(64deg)' }}>
                    <m.div
                        animate={reduceMotion ? undefined : { rotate: 360 }}
                        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                        className="h-full w-full rounded-full border border-brand-green/25 dark:border-[#d4ff00]/20"
                    />
                </div>
            </div>
            <div
                aria-hidden
                className="pointer-events-none absolute -right-16 bottom-6 h-80 w-80 [perspective:600px]"
            >
                <div className="h-full w-full" style={{ transform: 'rotateX(64deg)' }}>
                    <m.div
                        animate={reduceMotion ? undefined : { rotate: -360 }}
                        transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
                        className="h-full w-full rounded-full border border-sky-400/25 dark:border-sky-300/15"
                    />
                </div>
            </div>

            <div className="relative mx-auto max-w-4xl [perspective:1200px]">
                <TiltCard maxTilt={6} index={3}>
                    <m.div
                        className="relative overflow-hidden rounded-[2rem] border border-gray-900/10 bg-white px-6 py-12 text-center shadow-[0_18px_0_0_rgba(15,23,42,0.08),0_40px_70px_-32px_rgba(0,0,0,0.4)] dark:border-white/10 dark:bg-[#141414] dark:shadow-[0_18px_0_0_rgba(212,255,0,0.12),0_40px_70px_-32px_rgba(0,0,0,0.85)] sm:rounded-[2.5rem] sm:px-14 sm:py-16"
                        style={{ transformStyle: 'preserve-3d' }}
                        variants={staggerContainer}
                        initial="hidden"
                        animate={inView ? 'visible' : 'hidden'}
                    >
                        <m.div
                            aria-hidden
                            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-green/20 blur-3xl dark:bg-[#d4ff00]/15"
                            animate={reduceMotion ? undefined : { scale: [1, 1.25, 1], x: [0, 12, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <m.div
                            aria-hidden
                            className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl"
                            animate={reduceMotion ? undefined : { scale: [1.1, 0.95, 1.1], y: [0, -10, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        <div className="relative" style={{ transform: 'translateZ(28px)' }}>
                            <m.p variants={fadeUp} custom={0} className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-white/45">
                                Ready when you are
                            </m.p>
                            <m.h2
                                variants={fadeUp}
                                custom={1}
                                className="mt-4 font-mier text-[1.85rem] font-semibold tracking-tight text-gray-900 dark:text-[#f2f2ed] sm:text-5xl"
                            >
                                Your group already spends together. Track it like it matters.
                            </m.h2>
                            <m.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-lg text-sm text-gray-600 dark:text-white/55 sm:text-lg">
                                Free to try — set up a trip, roommate house, or night out in minutes. SmartSplit keeps the ledger, so the group chat does not have to.
                            </m.p>
                            <m.div variants={fadeUp} custom={3} className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                                <FlipMotionButton
                                    type="button"
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => router.push('/register')}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-8 py-4 text-sm font-bold text-gray-900 shadow-lg dark:bg-[#d4ff00] sm:text-base"
                                >
                                    Create free account
                                    <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                                </FlipMotionButton>
                                <FlipMotionButton
                                    type="button"
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push('/login')}
                                    className="rounded-full border border-gray-300 px-8 py-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-white/20 dark:text-[#f2f2ed] dark:hover:bg-white/10 sm:text-base"
                                >
                                    Sign in
                                </FlipMotionButton>
                            </m.div>
                        </div>
                    </m.div>
                </TiltCard>
            </div>
        </section>
    );
}
