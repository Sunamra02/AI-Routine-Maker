import React from 'react';

/**
 * Toast Component
 * Displays floating notification messages for success, error, warning, and info.
 */
const Toast = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 text-white shadow-emerald-200';
      case 'error':
        return 'bg-red-600 text-white shadow-red-200';
      case 'warning':
        return 'bg-amber-500 text-white shadow-amber-200';
      case 'info':
      default:
        return 'bg-blue-600 text-white shadow-blue-200';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✨';
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border border-white/20 transition-all duration-300 transform translate-y-0 animate-bounce-short ${getTypeStyles(
            toast.type
          )}`}
        >
          <div className="flex items-center space-x-3 pr-2">
            <span className="text-xl shrink-0">{getIcon(toast.type)}</span>
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/80 hover:text-white font-bold text-lg px-2 rounded focus:outline-none shrink-0 cursor-pointer"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
