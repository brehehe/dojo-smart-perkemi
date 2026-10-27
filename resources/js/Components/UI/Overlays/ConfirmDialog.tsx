import React from 'react';
import { Modal } from './Modal';
import { Button } from '../Elements/Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    variant = 'danger',
    isLoading = false,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
            <div className="text-center sm:text-left sm:flex sm:items-start gap-4">
                <div className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 sm:mx-0">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="mt-3 sm:mt-0">
                    <h3 className="text-base font-semibold leading-6 text-slate-900">{title}</h3>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>
                </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                    {cancelText}
                </Button>
                <Button
                    variant={variant === 'danger' ? 'danger' : 'primary'}
                    onClick={onConfirm}
                    isLoading={isLoading}
                >
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
};
