import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'slate' | 'gold' | 'navy';
    size?: 'sm' | 'md';
    withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    className,
    variant = 'slate',
    size = 'md',
    withDot = false,
    ...props
}) => {
    const variants = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
        amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
        blue: 'bg-sky-50 text-sky-700 border-sky-200/80',
        slate: 'bg-slate-100 text-slate-700 border-slate-200',
        gold: 'bg-amber-100/70 text-amber-900 border-amber-300',
        navy: 'bg-[#0B132B]/10 text-[#0B132B] border-[#0B132B]/20',
    };

    const dotColors = {
        emerald: 'bg-emerald-500',
        rose: 'bg-rose-500',
        amber: 'bg-amber-500',
        blue: 'bg-sky-500',
        slate: 'bg-slate-400',
        gold: 'bg-amber-600',
        navy: 'bg-[#0B132B]',
    };

    const sizes = {
        sm: 'text-xs px-2 py-0.5 rounded',
        md: 'text-xs font-medium px-2.5 py-1 rounded-full',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 border leading-none font-medium',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {withDot && (
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
            )}
            {children}
        </span>
    );
};
