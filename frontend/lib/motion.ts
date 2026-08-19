import type { Transition, Variants } from 'framer-motion';

export const easeOut = [0.25, 0.1, 0.25, 1] as const;

export const springTransition: Transition = {
    type: 'spring',
    stiffness: 380,
    damping: 32,
};

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, delay: i * 0.08, ease: easeOut },
    }),
};

export const fadeUp3d: Variants = {
    hidden: { opacity: 0, y: 44, rotateX: 28, scale: 0.96 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        transition: { duration: 0.7, delay: i * 0.1, ease: easeOut },
    }),
};

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.45, ease: easeOut } },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
};

export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.06 },
    },
};

export const pageVariants: Variants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: easeOut } },
};

export const viewportOnce = { once: true, margin: '-80px' as const };
