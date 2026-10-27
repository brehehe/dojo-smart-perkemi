import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';

export interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon,
    action,
    className,
}) => {
    return (
        <div
            className={cn(
                'flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center',
                className
            )}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-3">
                {icon || <ShieldAlert className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 leading-relaxed">{description}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
};
