'use client';

import CloseIcon from '@/assets/images/wallets/close.svg';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
    warning: 'alert-warning',
  };

  return createPortal(
    <div className="toast toast-top toast-end z-50">
      <div className={`alert ${typeStyles[type]} max-w-sm`}>
        <span>{message}</span>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>
          <CloseIcon className="size-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default Toast;
