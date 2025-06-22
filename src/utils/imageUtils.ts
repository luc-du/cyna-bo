import { IMAGE_BASE_URL, DEFAULT_IMAGE_PLACEHOLDER } from '../lib/constants';

/**
 * Normalise une URL d'image en ajoutant l'URL de base si nécessaire
 * @param url URL de l'image à normaliser
 * @returns URL normalisée
 */
export const normalizeImageUrl = (url: string): string => {
  // Si l'URL est vide ou non définie, retourner une image par défaut
  if (!url) return DEFAULT_IMAGE_PLACEHOLDER;
  
  // Si l'URL commence déjà par http ou https, elle est complète
  if (url.startsWith('http')) {
    return url;
  }
  
  // Pour les chemins commençant par /images/ ou tout autre chemin relatif
  // S'assurer qu'il n'y a pas de double slash entre BASE_URL et le chemin
  return url.startsWith('/') 
    ? `${IMAGE_BASE_URL}${url}`
    : `${IMAGE_BASE_URL}/${url}`;
};

/**
 * Traite un tableau d'objets contenant des URLs d'images et normalise ces URLs
 * @param items Tableau d'objets avec une propriété url
 * @returns Le même tableau avec des URLs normalisées
 */
export const normalizeImageUrls = <T extends {url: string}>(items: T[]): T[] => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => ({
    ...item,
    url: normalizeImageUrl(item.url)
  }));
};

/**
 * Interface pour représenter une image d'un produit
 */
export interface ProductImage {
  id?: string;
  name?: string;
  url: string;
  uploadDate?: string;
}

/**
 * Interface pour représenter un produit avec ses images
 */
export interface ProductWithImages {
  id?: string;
  name?: string;
  images?: ProductImage[];
  [key: string]: any; // Autres propriétés dynamiques
}

/**
 * Normalise les URLs d'images dans un objet produit
 * @param product Objet produit avec potentiellement un tableau d'images
 * @returns Produit avec URLs d'images normalisées
 */
export const normalizeProductImages = (product: ProductWithImages): ProductWithImages => {
  if (!product) return product;
  
  const normalizedProduct = { ...product };
  
  if (normalizedProduct.images && Array.isArray(normalizedProduct.images)) {
    normalizedProduct.images = normalizedProduct.images.map((img: ProductImage) => {
      if (!img || typeof img !== 'object') {
        return { url: '' };
      }
      return {
        ...img,
        url: img.url ? normalizeImageUrl(img.url) : ''
      };
    });
  }
  
  return normalizedProduct;
}

/**
 * Interface générique pour représenter tout élément avec une image
 */
export interface WithImage {
  id?: string | number;
  url: string;
  [key: string]: any; // Autres propriétés dynamiques
}

/**
 * Interface pour représenter un élément avec des images
 */
export interface WithImages {
  id?: string | number;
  name?: string;
  images?: WithImage[];
  [key: string]: any; // Autres propriétés dynamiques
}

/**
 * Normalise les URLs d'images dans un objet avec des images
 * @param item Objet avec potentiellement un tableau d'images
 * @returns Objet avec URLs d'images normalisées
 */
export const normalizeItemImages = <T extends WithImages>(item: T): T => {
  if (!item) return item;
  
  const normalizedItem = { ...item };
  
  if (normalizedItem.images && Array.isArray(normalizedItem.images)) {
    normalizedItem.images = normalizedItem.images.map((img: WithImage) => {
      if (!img || typeof img !== 'object') {
        return { url: '' };
      }
      return {
        ...img,
        url: img.url ? normalizeImageUrl(img.url) : ''
      };
    });
  }
  
  return normalizedItem;
};
