/**
 * Normalise une URL d'image en ajoutant l'URL de base si nécessaire
 * @param url URL de l'image à normaliser
 * @returns URL normalisée
 */
export const normalizeImageUrl = (url: string): string => {
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8082";
  if (!url) return "";
  return url.startsWith('http') ? url : `${IMAGE_BASE_URL}${url}`;
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
 * Normalise les URLs d'images dans un objet produit
 * @param product Objet produit avec potentiellement un tableau d'images
 * @returns Produit avec URLs d'images normalisées
 */
export const normalizeProductImages = (product: any): any => {
  if (!product) return product;
  
  const normalizedProduct = { ...product };
  
  if (normalizedProduct.images && Array.isArray(normalizedProduct.images)) {
    normalizedProduct.images = normalizeImageUrls(normalizedProduct.images);
  }
  
  return normalizedProduct;
};
