import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    status?: 'online' | 'offline' | 'busy';
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = '',
    name = '',
    size = 'md',
    status,
    className,
    ...props
}) => {
    const initials = name
        ? name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
        : 'K';

    const sizes = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    const statusSizes = {
        xs: 'w-1.5 h-1.5 right-0 bottom-0',
        sm: 'w-2 h-2 right-0 bottom-0',
        md: 'w-2.5 h-2.5 right-0.5 bottom-0.5',
        lg: 'w-3 h-3 right-0.5 bottom-0.5',
        xl: 'w-3.5 h-3.5 right-1 bottom-1',
    };

    const statusColors = {
        online: 'bg-emerald-500',
        offline: 'bg-slate-400',
        busy: 'bg-rose-500',
    };

    return (
        <div className={cn('relative inline-flex shrink-0 select-none', className)} {...props}>
            <div
                className={cn(
                    'rounded-full overflow-hidden flex items-center justify-center font-semibold border border-slate-200 bg-[#0B132B] text-white',
                    sizes[size]
                )}
            >
                {src ? (
                    <img src={src} alt={alt || name} className="w-full h-full object-cover" />
                ) : (
                    <span>{initials}</span>
                )}
            </div>
            {status && (
                <span
                    className={cn(
                        'absolute rounded-full ring-2 ring-white',
                        statusSizes[size],
                        statusColors[status]
                    )}
                />
            )}
        </div>
    );
};
