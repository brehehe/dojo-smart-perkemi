import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable = false, children, ...props }) => {
    return (
        <div
            className={cn(
                'rounded-xl border border-[#E8EBEF] bg-white shadow-2xs overflow-hidden',
                hoverable && 'transition-shadow duration-150 hover:shadow-md cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <div className={cn('border-b border-[#E8EBEF] px-5 py-4', className)} {...props}>
            {children}
        </div>
    );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <h3 className={cn('text-sm lg:text-base font-bold text-[#17202D]', className)} {...props}>
            {children}
        </h3>
    );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <p className={cn('mt-0.5 text-xs text-[#718092]', className)} {...props}>
            {children}
        </p>
    );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <div className={cn('p-5', className)} {...props}>
            {children}
        </div>
    );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <div className={cn('border-t border-[#E8EBEF] bg-[#F8F9FA]/70 px-5 py-3', className)} {...props}>
            {children}
        </div>
    );
};
