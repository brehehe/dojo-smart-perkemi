import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SelectSearchOption {
    value: string | number;
    label: string;
    sublabel?: string;
    badge?: string;
}

export interface SelectSearchProps {
    label?: string;
    value?: string | number | null;
    onChange: (value: string) => void;
    options: SelectSearchOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    error?: string | null;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    id?: string;
}

export const SelectSearch: React.FC<SelectSearchProps> = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Pilih salah satu...',
    searchPlaceholder = 'Cari...',
    error,
    hint,
    required = false,
    disabled = false,
    className,
    id,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Selected option object
    const selectedOption = useMemo(
        () => options.find((opt) => String(opt.value) === String(value)),
        [options, value]
    );

    // Filter options based on query
    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase();
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(q) ||
                (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
        );
    }, [options, searchQuery]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Auto-focus search input on open
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        } else {
            setSearchQuery('');
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const handleSelect = (optValue: string | number) => {
        onChange(String(optValue));
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={cn('relative w-full space-y-1.5', className)}>
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                    {label}
                    {required && <span className="text-red-600 ml-1">*</span>}
                </label>
            )}

            {/* Trigger Button */}
            <button
                id={selectId}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    'w-full flex items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left text-xs sm:text-sm text-slate-900 shadow-2xs transition-all',
                    'focus:outline-hidden focus:ring-2 focus:ring-offset-1',
                    disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200',
                    !disabled && 'cursor-pointer hover:border-slate-300',
                    error
                        ? 'border-rose-400 focus:ring-rose-500'
                        : isOpen
                        ? 'border-red-600 ring-2 ring-red-500/20'
                        : 'border-slate-300 focus:ring-red-500'
                )}
            >
                <div className="flex items-center gap-2 truncate flex-1 mr-2">
                    {selectedOption ? (
                        <div className="flex items-center gap-2 truncate">
                            <span className="font-semibold text-slate-900 truncate">
                                {selectedOption.label}
                            </span>
                            {selectedOption.sublabel && (
                                <span className="text-xs text-slate-400 font-mono shrink-0">
                                    ({selectedOption.sublabel})
                                </span>
                            )}
                            {selectedOption.badge && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                                    {selectedOption.badge}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-slate-400 font-normal">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    <ChevronDown
                        className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180 text-red-600')}
                    />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Field */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                        <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full text-xs rounded-lg border border-slate-200 pl-8 pr-7 py-2 focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-white text-slate-900 placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-56 overflow-y-auto custom-scrollbar divide-y divide-slate-50 p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <div
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        className={cn(
                                            'flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors',
                                            isSelected
                                                ? 'bg-red-50 text-red-700 font-semibold'
                                                : 'hover:bg-slate-100/80 text-slate-700'
                                        )}
                                    >
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <span className="truncate">{opt.label}</span>
                                            {opt.sublabel && (
                                                <span className="text-[11px] text-slate-400 font-mono truncate">
                                                    {opt.sublabel}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {opt.badge && (
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                                    {opt.badge}
                                                </span>
                                            )}
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-red-600 shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-3 py-6 text-center text-xs text-slate-400">
                                Tidak ada data yang sesuai &quot;{searchQuery}&quot;
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
            {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
        </div>
    );
};
