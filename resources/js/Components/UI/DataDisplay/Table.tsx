import React from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    containerClassName?: string;
}

export const Table: React.FC<TableProps> = ({ className, containerClassName, children, ...props }) => {
    return (
        <div className={cn('w-full max-w-full overflow-x-auto rounded-xl border border-[#E8EBEF] bg-white shadow-2xs', containerClassName)}>
            <table className={cn('w-full min-w-full text-left text-sm text-[#17202D]', className)} {...props}>
                {children}
            </table>
        </div>
    );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <thead
            className={cn('bg-[#F8F9FA] border-b border-[#E8EBEF] text-[10px] sm:text-xs uppercase font-bold text-[#718092] tracking-wider', className)}
            {...props}
        >
            {children}
        </thead>
    );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <tbody className={cn('divide-y divide-[#E8EBEF]', className)} {...props}>
            {children}
        </tbody>
    );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <tr
            className={cn(
                'transition-colors duration-100 hover:bg-slate-50/70',
                className
            )}
            {...props}
        >
            {children}
        </tr>
    );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <th
            className={cn(
                'px-3 sm:px-4 py-3 select-none font-bold text-[#718092] whitespace-nowrap text-[10px] sm:text-xs uppercase tracking-wider',
                className
            )}
            {...props}
        >
            {children}
        </th>
    );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <td
            className={cn(
                'px-3 sm:px-4 py-3 align-middle text-xs sm:text-sm text-[#17202D]',
                className
            )}
            {...props}
        >
            {children}
        </td>
    );
};
