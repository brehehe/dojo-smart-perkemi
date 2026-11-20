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
        emerald: 'bg-emerald-50 text-[#16865C] border-emerald-200/80',
        rose: 'bg-red-50 text-[#C51C2A] border-red-200/80',
        amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
        blue: 'bg-sky-50 text-sky-700 border-sky-200/80',
        slate: 'bg-slate-100 text-[#718092] border-[#E8EBEF]',
        gold: 'bg-amber-100/70 text-amber-900 border-amber-300',
        navy: 'bg-[#102B40]/10 text-[#102B40] border-[#102B40]/20',
    };

    const dotColors = {
        emerald: 'bg-[#16865C]',
        rose: 'bg-[#C51C2A]',
        amber: 'bg-amber-500',
        blue: 'bg-sky-500',
        slate: 'bg-[#718092]',
        gold: 'bg-amber-600',
        navy: 'bg-[#102B40]',
    };

    const sizes = {
        sm: 'text-xs px-2 py-0.5 rounded',
        md: 'text-xs font-medium px-2.5 py-1 rounded-full',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 border leading-none font-medium whitespace-nowrap shrink-0',
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
