import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    className,
}) => {
    return (
        <div className={cn('flex items-center justify-between gap-3', className)}>
            {(label || description) && (
                <div className="flex flex-col">
                    {label && (
                        <span
                            onClick={() => !disabled && onChange(!checked)}
                            className={cn(
                                'text-sm font-medium text-slate-800 select-none cursor-pointer',
                                disabled && 'opacity-60 cursor-not-allowed'
                            )}
                        >
                            {label}
                        </span>
                    )}
                    {description && <span className="text-xs text-slate-500">{description}</span>}
                </div>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    checked ? 'bg-red-600' : 'bg-slate-300'
                )}
            >
                <span
                    className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        checked ? 'translate-x-5' : 'translate-x-0'
                    )}
                />
            </button>
        </div>
    );
};
