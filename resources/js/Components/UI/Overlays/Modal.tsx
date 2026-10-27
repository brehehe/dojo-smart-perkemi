import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
    bodyClassName?: string;
    headerClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    icon,
    children,
    footer,
    maxWidth = 'lg',
    className,
    bodyClassName,
    headerClassName,
}) => {
    // ESC key closes modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scrolling when modal is active
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const maxWidths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-5">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                    />

                    {/* Dialog Card - Pinned within viewport height, never clipped at top/bottom */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className={cn(
                            'relative w-full rounded-2xl bg-white shadow-2xl border border-slate-200 z-10 flex flex-col',
                            'max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] my-auto overflow-hidden',
                            maxWidths[maxWidth],
                            className
                        )}
                    >
                        {/* Pinned Sticky Header */}
                        {(title || description || icon) && (
                            <div
                                className={cn(
                                    'flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-4 shrink-0 bg-white',
                                    headerClassName
                                )}
                            >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    {icon && <div className="shrink-0">{icon}</div>}
                                    <div className="min-w-0">
                                        {title && (
                                            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                                {title}
                                            </h3>
                                        )}
                                        {description && (
                                            <p className="mt-0.5 text-xs text-slate-500 truncate">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer shrink-0"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        )}

                        {/* Scrollable Content Body with Custom Scrollbar */}
                        <div
                            className={cn(
                                'p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0',
                                bodyClassName
                            )}
                        >
                            {children}
                        </div>

                        {/* Pinned Sticky Footer if Provided */}
                        {footer && (
                            <div className="border-t border-slate-100 bg-slate-50/80 px-5 sm:px-6 py-3.5 shrink-0 flex items-center justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
