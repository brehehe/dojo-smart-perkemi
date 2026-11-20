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
        <div className={cn('mb-6', className)}>
            {breadcrumbs && <div className="mb-2.5">{breadcrumbs}</div>}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span className="w-1.5 h-6 lg:h-7 bg-[#C51C2A] rounded-full inline-block shrink-0 mt-0.5" />
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#17202D]">{title}</h1>
                            {badge}
                        </div>
                        {description && (
                            <p className="mt-1 text-xs lg:text-sm text-[#718092] leading-relaxed">{description}</p>
                        )}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-2.5 shrink-0 sm:self-center">{actions}</div>}
            </div>
        </div>
    );
};
