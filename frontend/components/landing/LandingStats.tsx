"use client";

import { m, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { fadeUp, fadeUp3d, staggerContainer, viewportOnce } from '../../lib/motion';
import TiltCard from './TiltCard';

const comparison = {
    them: {
        label: 'Ordinary split apps',
        items: [
            'One generic group for every receipt',
            'Math dumped on you at the end',
            'Group IOUs only — no personal budget',
            'Awkward chase-ups in chat',
        ],
    },
    us: {
        label: 'SmartSplit',
        items: [
            'Separate ledgers for trips, bills, nights out',
            'Balances update the second money moves',
            'Shared life and your own daily spend',
            'Fewest-payment settle-up + share links',
        ],
    },
};

const highlights = [
    { value: 'Live', label: 'Balances', detail: 'Recalculates as soon as an expense changes' },
    { value: 'Least', label: 'Transfers', detail: 'Settle with the fewest payments, not a web of IOUs' },
    { value: 'Both', label: 'Ledgers', detail: 'Group money and your personal daily budget' },
    { value: 'Any', label: 'Currency', detail: 'Trips stay fair across borders' },
];

export default function LandingStats() {
    const ref = useRef(null);
    const inView = useInView(ref, viewportOnce);

    return (
        <section
            ref={ref}
            className="relative overflow-hidden border-t border-gray-800 bg-[#111827] px-4 py-20 text-[#f2f2ed] dark:border-white/10 dark:bg-[#0a1210] sm:px-8 sm:py-28"
        >
            <m.div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-green/20 blur-[100px] dark:bg-[#d4ff00]/12"
                animate={{ scale: [1, 1.2, 1], opacity: [0.45, 0.75, 0.45] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <m.div
                className="relative mx-auto max-w-6xl"
                variants={staggerContainer}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
            >
                <m.h2
                    variants={fadeUp}
                    custom={0}
                    className="text-center font-mier text-[1.85rem] font-semibold tracking-tight sm:text-4xl"
                >
                    Why groups leave ordinary split apps
                </m.h2>

                <div className="mt-12 grid gap-4 sm:mt-14 md:grid-cols-2 md:gap-6">
                    <m.div variants={fadeUp3d} custom={0} className="[perspective:1000px]">
                        <TiltCard index={0} maxTilt={7}>
                            <div
                                className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">{comparison.them.label}</p>
                                <ul className="mt-5 space-y-4" style={{ transform: 'translateZ(16px)' }}>
                                    {comparison.them.items.map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-white/55 sm:text-base">
                                            <Minus className="mt-0.5 h-4 w-4 shrink-0 text-white/30" strokeWidth={2} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </TiltCard>
                    </m.div>

                    <m.div variants={fadeUp3d} custom={1} className="[perspective:1000px]">
                        <TiltCard index={1} maxTilt={7}>
                            <div
                                className="h-full rounded-[1.75rem] border border-brand-green/40 bg-brand-green/10 p-6 shadow-[0_18px_0_0_rgba(249,107,0,0.18)] dark:border-[#d4ff00]/35 dark:bg-[#d4ff00]/8 dark:shadow-[0_18px_0_0_rgba(212,255,0,0.12)] sm:p-8"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-green dark:text-[#d4ff00]">{comparison.us.label}</p>
                                <ul className="mt-5 space-y-4" style={{ transform: 'translateZ(16px)' }}>
                                    {comparison.us.items.map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-[#f2f2ed] sm:text-base">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green dark:text-[#d4ff00]" strokeWidth={2.5} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </TiltCard>
                    </m.div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4">
                    {highlights.map((item, i) => (
                        <m.div key={item.label} variants={fadeUp3d} custom={2 + i} className="[perspective:900px]">
                            <TiltCard index={i + 2} maxTilt={11}>
                                <div
                                    className="h-full rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center sm:rounded-3xl sm:p-6"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <div style={{ transform: 'translateZ(22px)' }}>
                                        <p className="font-mier text-3xl font-bold text-brand-green dark:text-[#d4ff00] sm:text-4xl">{item.value}</p>
                                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-xs">
                                            {item.label}
                                        </p>
                                        <p className="mt-2 text-[11px] leading-relaxed text-white/45 sm:text-sm">{item.detail}</p>
                                    </div>
                                </div>
                            </TiltCard>
                        </m.div>
                    ))}
                </div>
            </m.div>
        </section>
    );
}
