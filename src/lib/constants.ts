/**
 * Constantes pour les URLs de l'API
 * Utilise les variables d'environnement configurées dans le fichier .env
 */

const API_PREFIX = import.meta.env.VITE_API_BASE_URL || '/api';
const VITE_API_URL = import.meta.env.VITE_APP_URL || "http://localhost:8080";
export const API_BASE_URL = `${VITE_API_URL}${API_PREFIX}/v1`;
export const AUTH_API_URL = `${API_BASE_URL}/auth`;
export const USER_API_URL = `${API_BASE_URL}/user`;
export const PRODUCT_API_URL = `${API_BASE_URL}/product`;
export const CATEGORY_API_URL = `${API_BASE_URL}/category`;
export const ORDER_API_URL = `${API_BASE_URL}/order`;
export const SUPPORT_API_URL = `${API_BASE_URL}/support`;

// URL de base pour les images
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8082";

// Image par défaut pour les placeholders
export const DEFAULT_IMAGE_PLACEHOLDER = import.meta.env.VITE_DEFAULT_IMAGE_PLACEHOLDER || "https://placehold.co/400x300?text=Image+non+disponible";

// Autres constantes d'application
export const ITEMS_PER_PAGE = 10;
export const TOAST_DURATION = 5000; // millisecondes
