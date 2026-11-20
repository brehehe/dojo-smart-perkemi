import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

export interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: {
        value: string | number;
        isPositive: boolean;
        label?: string;
    };
    className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    description,
    icon,
    trend,
    className,
}) => {
    return (
        <div
            className={cn(
                'rounded-xl border border-[#E8EBEF] bg-white p-5 shadow-2xs transition-all hover:border-slate-300',
                className
            )}
        >
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#718092]">{title}</p>
                {icon && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-[#17202D]">
                        {icon}
                    </div>
                )}
            </div>
            <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-extrabold font-mono tracking-tight text-[#17202D]">{value}</span>
                {trend && (
                    <span
                        className={cn(
                            'inline-flex items-center text-xs font-semibold gap-0.5',
                            trend.isPositive ? 'text-[#16865C]' : 'text-[#DC3545]'
                        )}
                    >
                        {trend.isPositive ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {trend.value}
                    </span>
                )}
            </div>
            {(description || trend?.label) && (
                <p className="mt-1 text-xs text-[#718092]">
                    {trend?.label ? `${trend.label} ` : ''}
                    {description}
                </p>
            )}
        </div>
    );
};
