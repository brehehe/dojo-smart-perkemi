import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names conditionally with tailwind-merge conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Format date string to Indonesian locale (e.g. '24 Okt 2026' or 'Sabtu, 24 Oktober 2026').
 * Safely parses both plain YYYY-MM-DD and full ISO strings without timezone offsets.
 */
export function formatDate(
    dateString?: string | null,
    options?: { withDay?: boolean; month?: 'short' | 'long' } | 'short' | 'long'
): string {
    if (!dateString) return '-';

    // Normalize options
    const isLong = options === 'long' || (typeof options === 'object' && options.month === 'long');
    const withDay = typeof options === 'object' && Boolean(options.withDay);

    try {
        // Extract YYYY, MM, DD safely
        const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        let date: Date;

        if (isoMatch) {
            const [, year, month, day] = isoMatch;
            // Construct local date without UTC offset issues
            date = new Date(Number(year), Number(month) - 1, Number(day));
        } else {
            date = new Date(dateString);
        }

        if (isNaN(date.getTime())) return dateString;

        return new Intl.DateTimeFormat('id-ID', {
            weekday: withDay ? 'long' : undefined,
            day: 'numeric',
            month: isLong ? 'long' : 'short',
            year: 'numeric',
        }).format(date);
    } catch {
        return dateString;
    }
}

/**
 * Format time string into Indonesian format (e.g. '08:00 WIB').
 */
export function formatTime(timeString?: string | null): string {
    if (!timeString) return '-';

    // Matches '08:00' or '08:00:00'
    const timeMatch = timeString.match(/(\d{2}):(\d{2})/);
    if (timeMatch) {
        return `${timeMatch[1]}:${timeMatch[2]} WIB`;
    }

    try {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return timeString;
        return (
            new Intl.DateTimeFormat('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }).format(date) + ' WIB'
        );
    } catch {
        return timeString;
    }
}

/**
 * Format combined date and time into Indonesian format (e.g. '24 Okt 2026, 08:00 WIB').
 */
export function formatDateTime(dateTimeString?: string | null): string {
    if (!dateTimeString) return '-';
    try {
        const date = formatDate(dateTimeString);
        const time = formatTime(dateTimeString);
        return `${date}, ${time}`;
    } catch {
        return dateTimeString;
    }
}
