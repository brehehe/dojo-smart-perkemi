import React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeadingProps {
    title: string;
    description?: string;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
    breadcrumbs?: React.ReactNode;
    className?: string;
}

export const PageHeading: React.FC<PageHeadingProps> = ({
    title,
    description,
    badge,
    actions,
    breadcrumbs,
    className,
}) => {
    return (
        <div className={cn('mb-6 space-y-2', className)}>
            {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                        {badge}
                    </div>
                    {description && (
                        <p className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
            </div>
        </div>
    );
};
