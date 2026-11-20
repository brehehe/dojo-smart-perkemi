import React from 'react';
import { cn } from '@/lib/utils';

export interface RankBadgeProps {
    label: string;
    beltColor?: string;
    isDan?: boolean;
    className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
    label,
    beltColor = 'white',
    isDan = false,
    className,
}) => {
    const beltDots: Record<string, string> = {
        white: 'bg-slate-300 ring-1 ring-slate-400/60',
        yellow: 'bg-amber-500',
        green: 'bg-emerald-600',
        blue: 'bg-sky-600',
        brown: 'bg-[#78350f]',
        black: isDan ? 'bg-amber-400 ring-1 ring-amber-300/40' : 'bg-slate-900',
    };

    const dot = beltDots[beltColor] || beltDots.white;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold select-none transition-colors',
                isDan
                    ? 'bg-[#102B40] text-white border-[#102B40] shadow-2xs'
                    : 'bg-slate-50 text-slate-800 border-slate-200/90',
                className
            )}
        >
            <span className={cn('h-2 w-2 rounded-full shrink-0', dot)} />
            <span>{label}</span>
        </span>
    );
};
