import { Variants, Transition } from 'framer-motion';

// Smooth, buttery easing curves
export const easing = {
  smooth: [0.4, 0, 0.2, 1] as const,      // Standard Material Design easing
  decelerate: [0, 0, 0.2, 1] as const,    // Enter animations
  accelerate: [0.4, 0, 1, 1] as const,    // Exit animations
  spring: { type: 'spring', stiffness: 200, damping: 25 } as const,
  springBouncy: { type: 'spring', stiffness: 300, damping: 20 } as const,
  springGentle: { type: 'spring', stiffness: 120, damping: 20 } as const,
};

// Consistent transition presets
export const transitions = {
  fast: { duration: 0.2, ease: easing.smooth } as Transition,
  normal: { duration: 0.35, ease: easing.smooth } as Transition,
  slow: { duration: 0.5, ease: easing.smooth } as Transition,
  slower: { duration: 0.7, ease: easing.smooth } as Transition,
  enter: { duration: 0.4, ease: easing.decelerate } as Transition,
  exit: { duration: 0.25, ease: easing.accelerate } as Transition,
  spring: easing.spring as Transition,
  springGentle: easing.springGentle as Transition,
};

// Page transition variants
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: easing.decelerate }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: 0.3, ease: easing.accelerate }
  },
};

// Card/item variants with stagger support
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easing.decelerate },
  },
};

// List container for staggered children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Fade variants
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitions.normal,
  },
  exit: { 
    opacity: 0,
    transition: transitions.exit,
  },
};

// Scale variants (for modals, popovers)
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.enter,
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: transitions.exit,
  },
};

// Slide variants
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.enter,
  },
  exit: { 
    opacity: 0, 
    y: 8,
    transition: transitions.exit,
  },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.enter,
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: transitions.exit,
  },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.enter,
  },
  exit: { 
    opacity: 0, 
    x: -16,
    transition: transitions.exit,
  },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.enter,
  },
  exit: { 
    opacity: 0, 
    x: 16,
    transition: transitions.exit,
  },
};

// Sidebar slide variants
export const sidebarVariants: Variants = {
  hidden: { x: -280, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { ...easing.springGentle, duration: 0.5 },
  },
  exit: { 
    x: -280, 
    opacity: 0,
    transition: transitions.exit,
  },
};

// Hover animations (to be used with whileHover)
export const hoverScale = {
  scale: 1.02,
  transition: transitions.fast,
};

export const hoverLift = {
  y: -4,
  transition: transitions.normal,
};

export const hoverLiftMore = {
  y: -8,
  transition: transitions.normal,
};

// Tap animations (to be used with whileTap)
export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// Button preset combining hover and tap
export const buttonAnimation = {
  whileHover: { scale: 1.02, y: -2, transition: transitions.fast },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
};

export const cardAnimation = {
  whileHover: { y: -6, transition: transitions.normal },
  whileTap: { scale: 0.99, transition: { duration: 0.1 } },
};

// Dropdown/popover animation
export const dropdownVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -8,
    scale: 0.98,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: easing.decelerate },
  },
  exit: { 
    opacity: 0, 
    y: -4,
    scale: 0.98,
    transition: { duration: 0.15, ease: easing.accelerate },
  },
};

// Modal/overlay variants
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.25 },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, delay: 0.1 },
  },
};

export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.96,
    y: 8,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: easing.decelerate },
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    y: 4,
    transition: { duration: 0.2, ease: easing.accelerate },
  },
};

// Background gradient animation
export const gradientVariants: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 1.2, ease: easing.smooth },
  },
};

// Tag/chip enter animation
export const tagVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.25, ease: easing.decelerate },
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.15 },
  },
};
