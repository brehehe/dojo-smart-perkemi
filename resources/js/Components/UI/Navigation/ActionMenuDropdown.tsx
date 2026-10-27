import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    href?: string;
    onClick?: (e?: React.MouseEvent) => void;
    variant?: 'default' | 'danger';
    show?: boolean;
    disabled?: boolean;
    badge?: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    as?: string;
}

export interface ActionMenuDropdownProps {
    items: ActionMenuItem[];
    align?: 'left' | 'right';
    icon?: React.ComponentType<{ className?: string }>;
    triggerLabel?: string;
    buttonClassName?: string;
    menuClassName?: string;
    size?: 'sm' | 'md';
    title?: string;
}

export const ActionMenuDropdown: React.FC<ActionMenuDropdownProps> = ({
    items,
    align = 'right',
    icon: CustomIcon,
    triggerLabel,
    buttonClassName,
    menuClassName,
    size = 'sm',
    title = 'Opsi Aksi',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    }>({});

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Filter items where show !== false
    const visibleItems = items.filter((item) => item.show !== false);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const padding = 8;
        const menuWidth = 190;
        const estimatedHeight = visibleItems.length * 38 + 16;

        let top: number | undefined = rect.bottom + 4;
        let bottom: number | undefined = undefined;
        let left: number | undefined = undefined;
        let right: number | undefined = undefined;

        // Check vertical collision with viewport
        if (rect.bottom + estimatedHeight > window.innerHeight && rect.top - estimatedHeight > padding) {
            // Flip upwards
            top = undefined;
            bottom = window.innerHeight - rect.top + 4;
        }

        // Horizontal alignment
        if (align === 'right') {
            right = Math.max(padding, window.innerWidth - rect.right);
            if (window.innerWidth - right < menuWidth) {
                right = undefined;
                left = padding;
            }
        } else {
            left = Math.max(padding, rect.left);
            if (left + menuWidth > window.innerWidth - padding) {
                left = undefined;
                right = padding;
            }
        }

        setCoords({ top, bottom, left, right });
    }, [align, visibleItems.length]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isOpen) {
            updatePosition();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    // Close on click outside or escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            if (
                triggerRef.current &&
                !triggerRef.current.contains(target) &&
                menuRef.current &&
                !menuRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        const handleScrollOrResize = () => {
            // Automatically close menu when user scrolls to prevent floating detached menu
            setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('touchstart', handleClickOutside, true);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('touchstart', handleClickOutside, true);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isOpen]);

    // Don't render anything if no items are visible
    if (visibleItems.length === 0) {
        return null;
    }

    const TriggerIcon = CustomIcon || MoreVertical;

    return (
        <div className="relative inline-flex items-center">
            <button
                ref={triggerRef}
                type="button"
                onClick={handleToggle}
                aria-label={title}
                title={title}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className={cn(
                    'inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer select-none',
                    'border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900',
                    'focus:outline-hidden focus:ring-2 focus:ring-slate-300/60 shadow-2xs',
                    size === 'sm' ? 'h-8 px-2 text-xs gap-1.5' : 'h-9 px-3 text-sm gap-2',
                    !triggerLabel && (size === 'sm' ? 'w-8 p-0' : 'w-9 p-0'),
                    isOpen && 'bg-slate-100 border-slate-300 text-slate-900 ring-2 ring-slate-200',
                    buttonClassName
                )}
            >
                <TriggerIcon className={cn(size === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5')} />
                {triggerLabel && <span className="font-semibold">{triggerLabel}</span>}
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={menuRef}
                    role="menu"
                    aria-orientation="vertical"
                    style={{
                        position: 'fixed',
                        top: coords.top !== undefined ? `${coords.top}px` : undefined,
                        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
                        left: coords.left !== undefined ? `${coords.left}px` : undefined,
                        right: coords.right !== undefined ? `${coords.right}px` : undefined,
                        zIndex: 9999,
                    }}
                    className={cn(
                        'min-w-[180px] max-w-xs rounded-xl bg-white p-1.5 shadow-xl border border-slate-200/90',
                        'animate-in fade-in zoom-in-95 duration-100 ease-out select-none',
                        menuClassName
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="space-y-0.5">
                        {visibleItems.map((item, index) => {
                            const ItemIcon = item.icon;
                            const isDanger = item.variant === 'danger';

                            const itemClasses = cn(
                                'flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left',
                                isDanger
                                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                                item.disabled && 'opacity-50 pointer-events-none'
                            );

                            if (item.href) {
                                return (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        method={item.method}
                                        as={item.as}
                                        role="menuitem"
                                        onClick={(e) => {
                                            setIsOpen(false);
                                            item.onClick?.(e);
                                        }}
                                        className={itemClasses}
                                    >
                                        {ItemIcon && (
                                            <ItemIcon
                                                className={cn(
                                                    'w-4 h-4 shrink-0',
                                                    isDanger ? 'text-rose-500' : 'text-slate-400 group-hover:text-slate-600'
                                                )}
                                            />
                                        )}
                                        <span className="flex-1 truncate">{item.label}</span>
                                        {item.badge && (
                                            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            }

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    role="menuitem"
                                    disabled={item.disabled}
                                    onClick={(e) => {
                                        setIsOpen(false);
                                        item.onClick?.(e);
                                    }}
                                    className={itemClasses}
                                >
                                    {ItemIcon && (
                                        <ItemIcon
                                            className={cn(
                                                'w-4 h-4 shrink-0',
                                                isDanger ? 'text-rose-500' : 'text-slate-400'
                                            )}
                                        />
                                    )}
                                    <span className="flex-1 truncate">{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
