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
                'rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow',
                className
            )}
        >
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
                {icon && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        {icon}
                    </div>
                )}
            </div>
            <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
                {trend && (
                    <span
                        className={cn(
                            'inline-flex items-center text-xs font-semibold gap-0.5',
                            trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
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
                <p className="mt-1 text-xs text-slate-500">
                    {trend?.label ? `${trend.label} ` : ''}
                    {description}
                </p>
            )}
        </div>
    );
};
