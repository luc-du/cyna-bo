/**
 * Types personnalisés pour les erreurs et les réponses API
 */

import { AxiosError } from 'axios';

// Type pour les erreurs d'API
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

// Type pour les erreurs Axios avec typage fort
export type CustomAxiosError = AxiosError<ApiError>;

// Type pour les réponses d'authentification
export interface AuthResponse {
  token: string;
  expiresIn?: number;
}

// Type pour le token décodé
export interface DecodedToken {
  jti: string; // User ID
  sub: string; // Sujet (généralement l'email)
  roles: string[];
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}
