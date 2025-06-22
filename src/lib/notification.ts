import { toast, ToastOptions } from 'react-hot-toast';

/**
 * Options par défaut pour les toasts
 */
const defaultOptions: ToastOptions = {
  duration: 5000,
  position: 'top-right',
  style: {
    minWidth: '250px',
    maxWidth: '400px'
  },
};

/**
 * Utilitaire pour afficher différents types de notifications
 */
const notification = {
  /**
   * Affiche un message de succès
   * @param message Le message à afficher
   * @param options Options supplémentaires pour le toast
   */
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      ...defaultOptions,
      ...options,
      style: {
        ...defaultOptions.style,
        background: '#ecfdf5',
        color: '#065f46',
        borderLeft: '4px solid #10b981',
      },
    });
  },

  /**
   * Affiche un message d'erreur
   * @param message Le message à afficher
   * @param options Options supplémentaires pour le toast
   */
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      ...defaultOptions,
      ...options,
      duration: 7000, // Les erreurs restent affichées plus longtemps
      style: {
        ...defaultOptions.style,
        background: '#fef2f2',
        color: '#991b1b',
        borderLeft: '4px solid #ef4444',
      },
    });
  },

  /**
   * Affiche un message d'information
   * @param message Le message à afficher
   * @param options Options supplémentaires pour le toast
   */
  info: (message: string, options?: ToastOptions) => {
    return toast(message, {
      ...defaultOptions,
      ...options,
      style: {
        ...defaultOptions.style,
        background: '#eff6ff',
        color: '#1e40af',
        borderLeft: '4px solid #3b82f6',
      },
      icon: '📢',
    });
  },

  /**
   * Affiche un message d'avertissement
   * @param message Le message à afficher
   * @param options Options supplémentaires pour le toast
   */
  warning: (message: string, options?: ToastOptions) => {
    return toast(message, {
      ...defaultOptions,
      ...options,
      style: {
        ...defaultOptions.style,
        background: '#fffbeb',
        color: '#92400e',
        borderLeft: '4px solid #f59e0b',
      },
      icon: '⚠️',
    });
  },

  /**
   * Affiche un message de chargement qui peut être mis à jour
   * @param message Le message à afficher
   * @returns ID du toast pour le mettre à jour plus tard
   */
  loading: (message: string) => {
    return toast.loading(message, {
      ...defaultOptions,
      style: {
        ...defaultOptions.style,
        background: '#f3f4f6',
        color: '#4b5563',
        borderLeft: '4px solid #6b7280',
      },
    });
  },

  /**
   * Met à jour un toast existant
   * @param id ID du toast à mettre à jour
   * @param message Nouveau message
   * @param type Type du toast (success, error, etc.)
   */
  update: (id: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    toast.dismiss(id);
    
    switch (type) {
      case 'success':
        return notification.success(message);
      case 'error':
        return notification.error(message);
      case 'info':
        return notification.info(message);
      case 'warning':
        return notification.warning(message);
      default:
        return toast(message);
    }
  },
};

export default notification;
