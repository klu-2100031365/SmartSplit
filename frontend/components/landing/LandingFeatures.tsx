"use client";

import { m, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
    Plane,
    LayoutDashboard,
    Wallet,
    UtensilsCrossed,
    Receipt,
    Share2,
} from 'lucide-react';
import { fadeUp, fadeUp3d, staggerContainer, viewportOnce } from '../../lib/motion';
import TiltCard, { FloatIcon } from './TiltCard';

const features = [
    {
        icon: Plane,
        kicker: 'Trips',
        title: 'Trip ledgers, not a dump of receipts',
        description:
            'Each trip has its own space — flights, hotels, meals, multi-payer tabs, and live settlements. Typical split apps throw everything into one generic group.',
        vs: 'One messy group for everything',
    },
    {
        icon: LayoutDashboard,
        kicker: 'Overview',
        title: 'One dashboard for every module',
        description:
            'See spend, active trips, and who still owes — across trips, bills, and nights out — instead of hunting through chats.',
        vs: 'Buried in group-chat history',
    },
    {
        icon: Wallet,
        kicker: 'Personal',
        title: 'Your daily spend, not only group IOUs',
        description:
            'Track your own money with categories and salary insights. Most splitters ignore the rest of your budget.',
        vs: 'Shared bills only',
    },
    {
        icon: UtensilsCrossed,
        kicker: 'Nights out',
        title: 'Dining, movies, and play — separately',
        description:
            'Nights out get their own event logs so a dinner does not pollute a trip ledger or a roommate bill.',
        vs: 'Every outing in the same list',
    },
    {
        icon: Receipt,
        kicker: 'Roommates',
        title: 'Recurring life: rent and subscriptions',
        description:
            'Shared bills with due dates, reminders, and roommate splits — built for monthly living, not one-off receipts.',
        vs: 'No memory for rent day',
    },
    {
        icon: Share2,
        kicker: 'Settle',
        title: 'Settle in the fewest payments',
        description:
            'Balances update the moment an expense changes. Share a summary, convert currencies, and close the books without chasing anyone.',
        vs: 'A web of leftover IOUs',
    },
];

export default function LandingFeatures() {
    const ref = useRef(null);
    const inView = useInView(ref, viewportOnce);

    return (
        <section
            id="features"
            ref={ref}
            className="relative overflow-hidden border-t border-gray-200 bg-[#f4f1ea] px-4 py-20 transition-colors dark:border-white/10 dark:bg-[#0b0b0b] sm:px-8 sm:py-28"
        >
            <m.div
                aria-hidden
                className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-brand-green/20 blur-[90px] dark:bg-[#d4ff00]/10"
                animate={{ y: [0, 24, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <m.div
                aria-hidden
                className="pointer-events-none absolute -right-10 bottom-10 h-64 w-64 rounded-full bg-sky-400/20 blur-[100px] dark:bg-sky-500/10"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            />

            <m.div
                className="relative mx-auto max-w-6xl"
                variants={staggerContainer}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
            >
                <m.p variants={fadeUp} custom={0} className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-white/45">
                    What you get
                </m.p>
                <m.h2
                    variants={fadeUp}
                    custom={1}
                    className="max-w-3xl font-mier text-[2rem] font-semibold leading-[1.08] tracking-tight text-gray-900 dark:text-[#f2f2ed] sm:text-5xl md:text-6xl"
                >
                    A living ledger —{' '}
                    <span className="text-brand-green dark:text-[#d4ff00]">not a calculator.</span>
                </m.h2>
                <m.p
                    variants={fadeUp}
                    custom={2}
                    className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-white/55 sm:text-xl"
                >
                    Typical money-splitting apps stop at “who paid last night.” SmartSplit gives trips, roommates, nights out, recurring bills, and your own daily spend their own place — then settles who owes whom automatically.
                </m.p>

                <div className="mt-12 flex flex-col gap-5 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <m.div
                            key={feature.title}
                            variants={fadeUp3d}
                            custom={i}
                            className={`[perspective:1100px] ${i % 2 === 1 ? 'sm:mt-8' : ''}`}
                        >
                            <TiltCard className="h-full" index={i}>
                                <article
                                    className="relative flex h-full flex-col rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_14px_0_0_rgba(15,23,42,0.08),0_30px_48px_-28px_rgba(0,0,0,0.4)] dark:border-white/10 dark:bg-[#141414] dark:shadow-[0_14px_0_0_rgba(212,255,0,0.12),0_30px_48px_-28px_rgba(0,0,0,0.85)] sm:rounded-[2rem] sm:p-8"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <div className="flex items-start justify-between gap-4" style={{ transform: 'translateZ(26px)' }}>
                                        <FloatIcon icon={feature.icon} index={i} />
                                        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/45">
                                            {feature.kicker}
                                        </span>
                                    </div>
                                    <h3
                                        className="mt-6 font-mier text-xl font-semibold leading-snug text-gray-900 dark:text-[#f2f2ed] sm:text-2xl"
                                        style={{ transform: 'translateZ(20px)' }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p
                                        className="mt-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-white/50 sm:text-base"
                                        style={{ transform: 'translateZ(16px)' }}
                                    >
                                        {feature.description}
                                    </p>
                                    <p
                                        className="mt-5 border-t border-dashed border-gray-200 pt-4 text-xs font-medium text-gray-500 dark:border-white/10 dark:text-white/40"
                                        style={{ transform: 'translateZ(12px)' }}
                                    >
                                        Typical apps:{' '}
                                        <span className="text-gray-800 dark:text-white/70">{feature.vs}</span>
                                    </p>
                                </article>
                            </TiltCard>
                        </m.div>
                    ))}
                </div>
            </m.div>
        </section>
    );
}
