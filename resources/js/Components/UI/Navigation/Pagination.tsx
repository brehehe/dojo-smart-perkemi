import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { PaginationLinks } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
    links?: PaginationLinks[] | any;
    meta?: {
        links?: PaginationLinks[];
        from?: number | null;
        to?: number | null;
        total?: number;
    };
    from?: number | null;
    to?: number | null;
    total?: number;
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    links,
    meta,
    from,
    to,
    total,
    className,
}) => {
    // Safely resolve the link array whether from JsonResource (meta.links) or standard Paginator (links)
    const linkItems: PaginationLinks[] = Array.isArray(links)
        ? links
        : Array.isArray(meta?.links)
        ? meta.links
        : [];

    const displayFrom = from ?? meta?.from;
    const displayTo = to ?? meta?.to;
    const displayTotal = total ?? meta?.total;

    if (!Array.isArray(linkItems) || linkItems.length <= 3) {
        return null;
    }

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2',
                className
            )}
        >
            {displayFrom !== undefined && displayTo !== undefined && displayTotal !== undefined && (
                <p className="text-xs text-slate-500">
                    Menampilkan <span className="font-semibold text-slate-700">{displayFrom || 0}</span> -{' '}
                    <span className="font-semibold text-slate-700">{displayTo || 0}</span> dari{' '}
                    <span className="font-semibold text-slate-700">{displayTotal}</span> data
                </p>
            )}

            <nav className="inline-flex -space-x-px rounded-lg shadow-xs" aria-label="Pagination">
                {linkItems.map((link, index) => {
                    const isPrevious = link.label.includes('Previous') || link.label.includes('&laquo;');
                    const isNext = link.label.includes('Next') || link.label.includes('&raquo;');

                    let content: React.ReactNode = link.label;
                    if (isPrevious) {
                        content = <ChevronLeft className="w-4 h-4" />;
                    } else if (isNext) {
                        content = <ChevronRight className="w-4 h-4" />;
                    }

                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className={cn(
                                    'inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 cursor-not-allowed select-none',
                                    index === 0 && 'rounded-l-lg',
                                    index === linkItems.length - 1 && 'rounded-r-lg'
                                )}
                            >
                                {content}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={cn(
                                'inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium transition-colors border select-none',
                                index === 0 && 'rounded-l-lg',
                                index === linkItems.length - 1 && 'rounded-r-lg',
                                link.active
                                    ? 'z-10 bg-red-600 border-red-600 text-white font-semibold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            )}
                        >
                            {content}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
