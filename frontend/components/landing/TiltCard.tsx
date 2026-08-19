"use client";

import {
    m,
    useAnimationFrame,
    useInView,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from 'framer-motion';
import { useCallback, useRef, type PointerEvent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type TiltCardProps = {
    children: ReactNode;
    className?: string;
    maxTilt?: number;
    index?: number;
};

export default function TiltCard({ children, className = '', maxTilt = 10, index = 0 }: TiltCardProps) {
    const reduceMotion = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: false, margin: '-12% 0px -12% 0px' });
    const interacting = useRef(false);

    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const x = useSpring(px, { stiffness: 160, damping: 18, mass: 0.45 });
    const y = useSpring(py, { stiffness: 160, damping: 18, mass: 0.45 });
    const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);
    const floatY = useMotionValue(0);

    useAnimationFrame((t) => {
        if (reduceMotion) {
            px.set(0);
            py.set(0);
            floatY.set(0);
            return;
        }
        if (!inView) return;
        if (interacting.current) return;
        const phase = index * 0.85;
        px.set(Math.sin(t / 1050 + phase) * 0.34);
        py.set(Math.cos(t / 1320 + phase) * 0.3);
        floatY.set(Math.sin(t / 880 + phase) * 7);
    });

    const setFromPoint = (clientX: number, clientY: number) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        px.set((clientX - rect.left) / rect.width - 0.5);
        py.set((clientY - rect.top) / rect.height - 0.5);
    };

    const onPointerMove = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            if (reduceMotion) return;
            if (event.pointerType === 'touch') return;
            interacting.current = true;
            setFromPoint(event.clientX, event.clientY);
        },
        [reduceMotion],
    );

    const onPointerLeave = useCallback(() => {
        interacting.current = false;
    }, []);

    return (
        <div className={`[perspective:1100px] ${className}`}>
            <m.div
                ref={ref}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                style={
                    reduceMotion
                        ? undefined
                        : { rotateX, rotateY, y: floatY, transformStyle: 'preserve-3d' }
                }
                className="relative h-full touch-pan-y will-change-transform [transform-style:preserve-3d]"
            >
                {children}
            </m.div>
        </div>
    );
}

type FloatIconProps = {
    icon: LucideIcon;
    index?: number;
    className?: string;
};

export function FloatIcon({ icon: Icon, index = 0, className = '' }: FloatIconProps) {
    const reduceMotion = useReducedMotion();

    return (
        <div className={`[perspective:700px] ${className}`}>
            <m.div
                animate={
                    reduceMotion
                        ? undefined
                        : {
                              rotateX: [12, 20, 8, 16, 12],
                              rotateY: [-22, 18, -14, 24, -22],
                              y: [0, -8, 3, -5, 0],
                          }
                }
                transition={{ duration: 5.2 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                className="relative grid h-14 w-14 place-items-center rounded-2xl bg-brand-green text-gray-900 shadow-[7px_9px_0_0_rgba(15,23,42,0.12)] dark:bg-[#d4ff00] dark:shadow-[7px_9px_0_0_rgba(212,255,0,0.18)] sm:h-16 sm:w-16"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <span
                    aria-hidden
                    className="absolute inset-0 rounded-2xl border border-black/10 dark:border-black/20"
                    style={{ transform: 'translateZ(10px)' }}
                />
                <Icon className="relative h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.5} style={{ transform: 'translateZ(18px)' }} />
            </m.div>
        </div>
    );
}
