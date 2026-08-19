"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowRight, Mail, Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import SmartSplitLogo from '../ui/SmartSplitLogo';
import { FlipMotionButton } from '../ui/Text3DFlip';
import { fadeUp, staggerContainer, viewportOnce } from '../../lib/motion';

const Footer = () => {
    const router = useRouter();

    return (
        <footer
            id="contact"
            className="w-full border-t border-gray-200 bg-white text-gray-900 transition-colors duration-200 dark:border-white/10 dark:bg-[#050505] dark:text-[#f2f2ed]"
        >
            <m.div
                className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
            >
                <m.div variants={fadeUp} custom={0} className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] lg:gap-8">
                    <m.div variants={fadeUp} custom={0} className="max-w-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <SmartSplitLogo className="h-10 w-10" />
                            <span className="font-mier text-xl font-semibold tracking-tight">SmartSplit</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-600 dark:text-white/55 sm:text-base">
                            Not a calculator with a group chat — a live ledger for trips, roommates, nights out, bills, and your own daily spend.
                        </p>

                        <FlipMotionButton
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/register')}
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f96b00] px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#de6800] dark:bg-[#d4ff00] dark:text-gray-900 dark:hover:bg-[#d4ff00]/90"
                        >
                            Get started free
                            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                        </FlipMotionButton>
                    </m.div>

                    <m.div variants={fadeUp} custom={1}>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-white/40">Product</p>
                        <ul className="flex flex-col gap-2.5 text-sm">
                            <li>
                                <Link href="/trips" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Trip expenses
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Dashboard & settlements
                                </Link>
                            </li>
                            <li>
                                <Link href="/daily-expenses" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Daily spending
                                </Link>
                            </li>
                            <li>
                                <Link href="/activities" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Activities & outings
                                </Link>
                            </li>
                            <li>
                                <Link href="/bills" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Bills & subscriptions
                                </Link>
                            </li>
                            <li>
                                <Link href="/sips" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Smart Splits
                                </Link>
                            </li>
                        </ul>
                    </m.div>

                    <m.div variants={fadeUp} custom={2}>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-white/40">Features</p>
                        <ul className="flex flex-col gap-2.5 text-sm">
                            <li>
                                <Link href="/features/real-time-settling" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Real-time settling
                                </Link>
                            </li>
                            <li>
                                <Link href="/features/smart-reminders" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Smart reminders
                                </Link>
                            </li>
                            <li>
                                <Link href="/features/multi-currency-support" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Multi-currency support
                                </Link>
                            </li>
                            <li>
                                <Link href="/features/activity-timelines" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Activity timelines
                                </Link>
                            </li>
                            <li>
                                <Link href="/features/group-chats" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Group chats
                                </Link>
                            </li>
                        </ul>
                    </m.div>

                    <m.div variants={fadeUp} custom={3}>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-white/40">Company</p>
                        <ul className="flex flex-col gap-2.5 text-sm">
                            <li>
                                <a href="#" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00] inline-flex items-center gap-1.5">
                                    Careers
                                    <span className="inline-flex items-center rounded-md bg-[#f96b00]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#f96b00] ring-1 ring-inset ring-[#f96b00]/20 dark:bg-[#d4ff00]/10 dark:text-[#d4ff00] dark:ring-[#d4ff00]/20">
                                        Hiring
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Press kit
                                </a>
                            </li>
                            <li>
                                <Link href="/admin" className="text-gray-600 dark:text-white/65 transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Admin portal
                                </Link>
                            </li>
                        </ul>
                    </m.div>

                    <m.div variants={fadeUp} custom={4}>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-white/40">Support</p>
                        <ul className="flex flex-col gap-2.5 text-sm text-gray-600 dark:text-white/65 mb-6">
                            <li>
                                <a
                                    href="mailto:hello@smartsplit.app"
                                    className="inline-flex items-center gap-2 font-medium text-[#f96b00] transition-colors hover:text-[#de6800] dark:text-[#d4ff00] dark:hover:text-[#e8ff4d]"
                                >
                                    <Mail className="h-4 w-4" strokeWidth={1.5} />
                                    hello@smartsplit.app
                                </a>
                            </li>
                            <li>
                                <a href="#" className="transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Help Center / FAQs
                                </a>
                            </li>
                            <li>
                                <a href="#" className="transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Developer API
                                </a>
                            </li>
                            <li>
                                <a href="#" className="transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00] inline-flex items-center gap-1.5">
                                    System status
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                </a>
                            </li>
                        </ul>

                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-white/40">Legal</p>
                        <ul className="flex flex-col gap-2 text-sm text-gray-600 dark:text-white/65">
                            <li>
                                <a href="#" className="transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Privacy policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="transition-colors hover:text-[#f96b00] dark:hover:text-[#d4ff00]">
                                    Terms of service
                                </a>
                            </li>
                        </ul>
                    </m.div>
                </m.div>

                <m.div
                    variants={fadeUp}
                    custom={5}
                    className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-gray-200/70 dark:border-white/10 pt-8 text-xs text-gray-500 dark:text-white/40 sm:flex-row sm:text-sm"
                >
                    <div className="flex flex-col gap-1 items-center sm:items-start">
                        <p>© {new Date().getFullYear()} SmartSplit. All rights reserved.</p>
                        <p className="text-gray-400 dark:text-white/30 text-[11px]">Bill splitting, without the drama.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <m.a 
                            href="https://github.com" 
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <Github className="h-4 w-4" />
                        </m.a>
                        <m.a 
                            href="https://twitter.com" 
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.15, rotate: -5 }}
                            className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-[#f96b00] dark:hover:text-[#d4ff00] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <Twitter className="h-4 w-4" />
                        </m.a>
                        <m.a 
                            href="https://linkedin.com" 
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-[#f96b00] dark:hover:text-[#d4ff00] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <Linkedin className="h-4 w-4" />
                        </m.a>
                        <m.a 
                            href="https://instagram.com" 
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.15, rotate: -5 }}
                            className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-[#f96b00] dark:hover:text-[#d4ff00] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <Instagram className="h-4 w-4" />
                        </m.a>
                    </div>

                    <p className="text-center sm:text-right text-[11px] text-gray-400 dark:text-white/30">
                        Made with ❤️ for modern groups.
                    </p>
                </m.div>
            </m.div>
        </footer>
    );
};

export default Footer;
