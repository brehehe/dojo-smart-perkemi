---
name: framer-motion-craft
description: "Mastery guide for crafting intentional, high-performance, non-slop interactive animations using Framer Motion in React applications. Covers physics-based springs, gesture states (hover/tap/drag), layout animations, page transitions, modal and drawer overlays, and reduced-motion compliance."
---

# Framer Motion Craft & Interactive Animation Standards

This skill governs the integration of purposeful, responsive, and performance-tuned micro-interactions using Framer Motion in React + Tailwind applications.

## 1. Core Philosophy: Purposeful Motion, Zero Slop
- **Motion Answers Action**: Never animate for the sake of animation. Motion must signify causality: expanding a drawer, opening a modal, confirming an update, tab switching, or revealing drill-down metrics.
- **NO Stagger Slop**: Do not add automatic cascading fade-and-slide up on every card during scroll. It feels slow, distracting, and screams AI generated.
- **Springs Over Easing Curves**: Use natural spring physics (`type: "spring", stiffness: 300, damping: 25`) for interactive elements (cards, buttons, switches). Springs feel alive and responsive.
- **Zero Layout Shifts**: Never animate properties that cause browser reflow (`width`, `height`, `margin`, `top`, `left`). Always animate composited properties (`transform: scale/translate/rotate`, `opacity`).

## 2. Common Interactive Patterns

### A. 3D Card Hover / Parallax Tilt
```tsx
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function InteractiveTiltCard({ children }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="perspective-1000 transition-shadow duration-200"
        >
            {children}
        </motion.div>
    );
}
```

### B. Smooth Animated Tabs / Segment Switcher
Using `layoutId` for smooth pill transitions between tabs:
```tsx
{tabs.map((tab) => (
    <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className="relative px-3 py-1.5 text-xs font-semibold text-slate-700"
    >
        {activeTab === tab.id && (
            <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 rounded-lg bg-red-600 shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
        )}
        <span className={cn('relative z-10', activeTab === tab.id ? 'text-white' : 'text-slate-600')}>
            {tab.label}
        </span>
    </button>
))}
```

### C. Collapsible / Accordion Expand
```tsx
<AnimatePresence initial={false}>
    {isExpanded && (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
        >
            {content}
        </motion.div>
    )}
</AnimatePresence>
```

## 3. Accessibility & Reduced Motion
Always respect user system settings:
```tsx
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();
const transition = shouldReduceMotion ? { duration: 0 } : { type: 'spring', damping: 25 };
```
