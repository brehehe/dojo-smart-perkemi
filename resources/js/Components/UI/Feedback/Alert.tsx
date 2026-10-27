import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export interface AlertProps {
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message?: string;
    children?: React.ReactNode;
    onClose?: () => void;
    className?: string;
}

export const Alert: React.FC<AlertProps> = ({
    variant = 'info',
    title,
    message,
    children,
    onClose,
    className,
}) => {
    const variants = {
        info: {
            container: 'bg-sky-50 border-sky-200 text-sky-800',
            icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
        },
        success: {
            container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
        },
        warning: {
            container: 'bg-amber-50 border-amber-200 text-amber-900',
            icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
        },
        error: {
            container: 'bg-rose-50 border-rose-200 text-rose-900',
            icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
        },
    };

    const config = variants[variant];

    return (
        <div
            role="alert"
            className={cn(
                'relative flex items-start gap-3 rounded-xl border p-4 text-sm',
                config.container,
                className
            )}
        >
            <div className="pt-0.5">{config.icon}</div>
            <div className="flex-1">
                {title && <h4 className="font-semibold leading-none mb-1">{title}</h4>}
                <div className="leading-relaxed opacity-95">{message || children}</div>
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
