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

    if (!Array.isArray(linkItems) || linkItems.length <= 1) {
        return null;
    }

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-center justify-between gap-3 py-4 px-1 text-xs text-[#718092]',
                className
            )}
        >
            {displayFrom !== undefined && displayTo !== undefined && displayTotal !== undefined && (
                <p>
                    Menampilkan <span className="font-semibold text-[#17202D]">{displayFrom || 0}</span> -{' '}
                    <span className="font-semibold text-[#17202D]">{displayTo || 0}</span> dari{' '}
                    <span className="font-semibold text-[#17202D]">{displayTotal}</span> data
                </p>
            )}

            <nav className="inline-flex -space-x-px rounded-lg shadow-2xs overflow-hidden" aria-label="Navigasi Halaman">
                {linkItems.map((link, index) => {
                    const rawLabel = String(link.label || '').toLowerCase();
                    const isPrevious =
                        rawLabel.includes('previous') ||
                        rawLabel.includes('&laquo;') ||
                        rawLabel.includes('sebelumnya') ||
                        rawLabel.includes('laquo');
                    const isNext =
                        rawLabel.includes('next') ||
                        rawLabel.includes('&raquo;') ||
                        rawLabel.includes('berikutnya') ||
                        rawLabel.includes('raquo');

                    let content: React.ReactNode = link.label;
                    if (isPrevious) {
                        content = <ChevronLeft className="w-4 h-4" aria-label="Sebelumnya" />;
                    } else if (isNext) {
                        content = <ChevronRight className="w-4 h-4" aria-label="Berikutnya" />;
                    }

                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className={cn(
                                    'inline-flex items-center justify-center min-w-[34px] h-9 px-3 text-xs font-medium text-slate-300 bg-white border border-[#E8EBEF] cursor-not-allowed select-none'
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
                                'inline-flex items-center justify-center min-w-[34px] h-9 px-3 text-xs font-medium transition-colors border select-none',
                                link.active
                                    ? 'z-10 bg-[#C51C2A] border-[#C51C2A] text-white font-bold'
                                    : 'bg-white border-[#E8EBEF] text-[#17202D] hover:bg-slate-50'
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
