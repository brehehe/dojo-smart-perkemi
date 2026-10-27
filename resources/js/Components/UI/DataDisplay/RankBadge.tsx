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
    const beltStyles: Record<string, string> = {
        white: 'bg-slate-100 text-slate-800 border-slate-300',
        yellow: 'bg-amber-100 text-amber-900 border-amber-300',
        green: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        blue: 'bg-sky-100 text-sky-900 border-sky-300',
        brown: 'bg-[#5c3d2e]/15 text-[#5c3d2e] border-[#5c3d2e]/40',
        black: 'bg-slate-900 text-amber-400 border-amber-500/50 shadow-xs',
    };

    const beltDots: Record<string, string> = {
        white: 'bg-slate-400',
        yellow: 'bg-amber-500',
        green: 'bg-emerald-600',
        blue: 'bg-sky-500',
        brown: 'bg-[#5c3d2e]',
        black: 'bg-amber-400',
    };

    const style = beltStyles[beltColor] || beltStyles.white;
    const dot = beltDots[beltColor] || beltDots.white;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold select-none',
                style,
                className
            )}
        >
            <span className={cn('h-2 w-2 rounded-full shrink-0', dot)} />
            <span>{label}</span>
            {isDan && <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">★</span>}
        </span>
    );
};
