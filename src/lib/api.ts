import axios from 'axios';
import { toast } from 'react-hot-toast';

// Créer une instance axios sans header Content-Type par défaut
const api = axios.create({
  baseURL: '/api', 
  timeout: 10000
});

// Intercepteur pour les requêtes - ajoute automatiquement le token JWT
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses - gère les erreurs courantes
api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    // Gérer les erreurs basées sur le code de statut
    if (response) {
      switch (response.status) {
        case 401:
          // Non autorisé - rediriger vers la page de connexion
          localStorage.removeItem('token');
          toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - accès non autorisé
          toast.error("Vous n'avez pas les permissions nécessaires pour effectuer cette action.");
          break;
        case 404:
          // Ressource non trouvée
          toast.error('La ressource demandée est introuvable.');
          break;
        case 500:
          // Erreur serveur
          toast.error('Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.');
          break;
        default:
          // Autres erreurs
          if (response.data && response.data.message) {
            toast.error(response.data.message);
          } else {
            toast.error('Une erreur est survenue. Veuillez réessayer.');
          }
      }
    } else {
      // Erreur réseau ou timeout
      toast.error('Impossible de communiquer avec le serveur. Vérifiez votre connexion.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
