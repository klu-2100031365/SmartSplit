"use client";

import { m, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users, PlusCircle, HandCoins } from 'lucide-react';
import { fadeUp, fadeUp3d, staggerContainer, viewportOnce } from '../../lib/motion';
import TiltCard, { FloatIcon } from './TiltCard';

const steps = [
    {
        icon: Users,
        step: '01',
        title: 'Give each shared life its own space',
        body: 'Start a trip, a roommate house, or a night-out event. Other apps dump every receipt into one messy group. SmartSplit keeps the context.',
    },
    {
        icon: PlusCircle,
        step: '02',
        title: 'Log once — split any way',
        body: 'Equal, custom, or multi-payer. The ledger updates the moment you save, so you never rebuild a spreadsheet at the end of the trip.',
    },
    {
        icon: HandCoins,
        step: '03',
        title: 'Settle with the fewest payments',
        body: 'See who owes whom at a glance, share a summary, convert currencies, and close the books — without awkward follow-ups in the group chat.',
    },
];

export default function LandingHowItWorks() {
    const ref = useRef(null);
    const inView = useInView(ref, viewportOnce);

    return (
        <section
            id="how-it-works"
            ref={ref}
            className="relative overflow-hidden border-t border-gray-200 bg-white px-4 py-20 transition-colors dark:border-white/10 dark:bg-[#050505] sm:px-8 sm:py-28"
        >
            <m.div
                className="relative mx-auto max-w-5xl"
                variants={staggerContainer}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
            >
                <m.p variants={fadeUp} custom={0} className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-white/45">
                    How it works
                </m.p>
                <m.h2
                    variants={fadeUp}
                    custom={1}
                    className="max-w-2xl font-mier text-[2rem] font-semibold leading-[1.08] tracking-tight text-gray-900 dark:text-[#f2f2ed] sm:text-5xl"
                >
                    Built unlike a typical splitter.
                </m.h2>

                <div className="relative mt-12 sm:mt-16">
                    <div className="absolute bottom-6 left-[19px] top-6 w-4 md:left-1/2 md:-translate-x-1/2">
                        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-brand-green via-brand-green/35 to-transparent dark:from-[#d4ff00] dark:via-[#d4ff00]/30" />
                        <m.div
                            aria-hidden
                            animate={{ top: ['0%', '88%'] }}
                            transition={{ duration: 4.8, repeat: Infinity, ease: 'linear' }}
                            className="absolute left-1/2 h-10 w-1.5 -translate-x-1/2 rounded-full bg-brand-green shadow-[0_0_18px_rgba(249,107,0,0.7)] dark:bg-[#d4ff00] dark:shadow-[0_0_18px_rgba(212,255,0,0.55)]"
                        />
                    </div>

                    <div className="flex flex-col gap-8 md:gap-16">
                        {steps.map((item, i) => (
                            <m.div
                                key={item.step}
                                variants={fadeUp3d}
                                custom={i}
                                className={`relative flex items-stretch gap-5 md:grid md:grid-cols-2 md:gap-16 ${i % 2 === 1 ? 'md:[&>div:last-child]:col-start-1 md:[&>div:last-child]:row-start-1' : ''}`}
                            >
                                <div className="relative z-10 mt-2 grid h-[54px] w-[54px] shrink-0 place-items-center md:absolute md:left-1/2 md:top-10 md:-translate-x-1/2">
                                    <m.span
                                        animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.08, 0.35] }}
                                        transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 }}
                                        className="absolute inset-0 rounded-full bg-brand-green dark:bg-[#d4ff00]"
                                    />
                                    <span className="relative grid h-8 w-8 place-items-center rounded-full border-2 border-brand-green bg-white font-mier text-xs font-bold text-gray-900 dark:border-[#d4ff00] dark:bg-[#050505] dark:text-[#d4ff00]">
                                        {item.step}
                                    </span>
                                </div>

                                <div className={`hidden md:block ${i % 2 === 1 ? 'md:col-start-2' : ''}`} />

                                <div className={`min-w-0 flex-1 ${i % 2 === 1 ? 'md:col-start-1 md:pr-16 md:text-right' : 'md:pl-16'}`}>
                                    <TiltCard index={i} maxTilt={9}>
                                        <article
                                            className="rounded-[1.75rem] border border-gray-200 bg-[#f4f1ea] p-6 shadow-[0_14px_0_0_rgba(15,23,42,0.07),0_28px_40px_-24px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#121212] dark:shadow-[0_14px_0_0_rgba(255,255,255,0.06),0_28px_40px_-24px_rgba(0,0,0,0.8)] sm:p-8"
                                            style={{ transformStyle: 'preserve-3d' }}
                                        >
                                            <div className={`flex items-center gap-4 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`} style={{ transform: 'translateZ(24px)' }}>
                                                <FloatIcon icon={item.icon} index={i} />
                                                <p className="font-mier text-4xl font-bold leading-none text-brand-green/25 dark:text-[#d4ff00]/20">{item.step}</p>
                                            </div>
                                            <h3
                                                className="mt-5 font-mier text-xl font-semibold text-gray-900 dark:text-[#f2f2ed] sm:text-2xl"
                                                style={{ transform: 'translateZ(18px)' }}
                                            >
                                                {item.title}
                                            </h3>
                                            <p
                                                className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-white/50 sm:text-base"
                                                style={{ transform: 'translateZ(14px)' }}
                                            >
                                                {item.body}
                                            </p>
                                        </article>
                                    </TiltCard>
                                </div>
                            </m.div>
                        ))}
                    </div>
                </div>
            </m.div>
        </section>
    );
}
