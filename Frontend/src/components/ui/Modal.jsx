import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { GradientButton } from './GradientButton';

/**
 * Enhanced Modal/Dialog component
 */
export const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'default',
    className,
    closeOnOverlayClick = true,
    showCloseButton = true,
    ...props
}) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        default: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-7xl',
    };

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={handleOverlayClick}
            {...props}
        >
            <div
                className={cn(
                    "card-elevated w-full animate-scale-in",
                    sizes[size],
                    className
                )}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div>
                            {title && (
                                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                            )}
                            {description && (
                                <p className="text-sm text-muted-foreground mt-1">{description}</p>
                            )}
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Confirmation Modal variant
 */
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    loading = false,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            size="sm"
            footer={
                <>
                    <GradientButton
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </GradientButton>
                    <GradientButton
                        variant={variant === 'destructive' ? 'destructive' : 'gradient'}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </GradientButton>
                </>
            }
        />
    );
};

export default Modal;
