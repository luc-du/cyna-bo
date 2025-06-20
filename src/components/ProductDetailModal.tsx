import React from "react";
import { X } from "lucide-react";

interface ProductDetailModalProps {
  product: any;
  categories: any[];
  onClose: () => void;
  getCategoryName: (categoryOrId: any) => string;
  translateStatus: (status: string) => string;
  setPreviewImage: (url: string) => void;
  IMAGE_BASE_URL: string;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  getCategoryName,
  translateStatus,
  setPreviewImage,
  IMAGE_BASE_URL,
}) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1000] transition-all duration-300">
      <div
        className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-xl transform transition-all duration-300 animate-fadeIn"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Détails du produit"
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-gray-500 w-32">Marque:</span>
              <span className="font-medium">{product.brand}</span>
            </div>
            <div>
              <span className="text-gray-500">Description:</span>
              <p className="mt-1 text-gray-800">{product.description}</p>
            </div>
            <div>
              <span className="text-gray-500">Caractéristiques:</span>
              <p className="mt-1 text-gray-800">{product.caracteristics}</p>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 w-32">Prix:</span>
              <span className="font-medium text-indigo-600">{product.amount} €</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 w-32">Statut:</span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  product.status === "AVAILABLE"
                    ? "bg-green-100 text-green-800"
                    : product.status === "OUT_OF_STOCK"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {translateStatus(product.status)}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 w-32">Catégorie:</span>
              <span className="font-medium">
                {getCategoryName(product.category || product.categoryId)}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 w-32">En promotion:</span>
              <span className="font-medium">{product.promo ? "Oui" : "Non"}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Images</h4>
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {product.images.map((image: any, index: number) => {
                  // Les URL sont déjà normalisées par le store
                  return (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Produit ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPreviewImage(image.url);
                        }}
                      />
                      <div
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPreviewImage(image.url);
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
                <p className="text-gray-400">Aucune image disponible</p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 mr-3"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;



