import React, { createContext, useCallback, useContext, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

const defaultToastOptions = {
    duration: 5000,
    width: 384,
    height: 76,
    bottom: 20,
    right: 20,
    stackOffset: 14,
    expandedGap: 12,
    padding: 16,
    borderRadius: 12,
    fontSize: 14,
    backgroundColor: null,
    textColor: null,
    borderColor: null,
    icon: null,
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((previousToasts) =>
            previousToasts.filter((toast) => toast.id !== id)
        );
    }, []);

    /**
     * Shows a toast with optional visual and timing overrides.
     *
     * Examples:
     * showToast('Saved successfully.', 'success');
     * showToast('Please try again.', 'error', { duration: 8000, width: 440 });
     * showToast('Legacy call supported.', 'info', 3000);
     */
    const showToast = useCallback((message, type = 'info', options = {}) => {
        const providedOptions = typeof options === 'number'
            ? { duration: options }
            : options;
        const toastOptions = {
            ...defaultToastOptions,
            ...providedOptions,
        };
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        setToasts((previousToasts) => [
            ...previousToasts,
            {
                id,
                message,
                type,
                options: toastOptions,
            },
        ]);

        if (toastOptions.duration > 0) {
            window.setTimeout(() => {
                removeToast(id);
            }, toastOptions.duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return context;
};
