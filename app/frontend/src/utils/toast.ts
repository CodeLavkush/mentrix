import toast, { type ToastOptions } from 'react-hot-toast';

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      duration: 3500,
      icon: '✅',
      ...options,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      duration: 4500,
      icon: '❌',
      ...options,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast(message, {
      duration: 4000,
      icon: '⚠️',
      style: {
        border: '1px solid rgba(245, 158, 11, 0.4)',
        background: document.documentElement.classList.contains('light')
          ? 'rgba(254, 243, 199, 0.95)'
          : 'rgba(30, 20, 10, 0.95)',
        color: document.documentElement.classList.contains('light') ? '#92400E' : '#FDE68A',
      },
      ...options,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return toast(message, {
      duration: 3000,
      icon: 'ℹ️',
      ...options,
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      ...options,
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

export default showToast;
