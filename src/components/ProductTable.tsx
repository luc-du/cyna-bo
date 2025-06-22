import React from "react";
import { normalizeImageUrl } from "../utils/imageUtils";

interface ProductTableProps {
  products: any[];
  paginatedProducts: any[];
  selectedProducts: number[];
  handleSelectAll: () => void;
  handleSelectProduct: (id: number) => void;
  handleViewDetails: (product: any) => void;
  handleEdit: (id: number) => void;
  handleDeleteProduct: (id: number) => void;
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  handleSort: (key: string) => void;
  getCategoryName: (cat: any) => string;
  translateStatus: (status: string) => string;
  setPreviewImage: (url: string) => void;
  IMAGE_BASE_URL: string;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  paginatedProducts,
  selectedProducts,
  handleSelectAll,
  handleSelectProduct,
  handleViewDetails,
  handleEdit,
  handleDeleteProduct,
  sortConfig,
  handleSort,
  getCategoryName,
  translateStatus,
  setPreviewImage,
  IMAGE_BASE_URL,
}) => (
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="py-4 px-4 text-left">
          <input
            type="checkbox"
            checked={selectedProducts.length === products.length && products.length > 0}
            onChange={handleSelectAll}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </th>
        <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150" onClick={() => handleSort("name")}>Nom {sortConfig?.key === "name" && <span className="text-indigo-600">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}</th>
        <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150" onClick={() => handleSort("categoryId")}>Catégorie {sortConfig?.key === "categoryId" && <span className="text-indigo-600">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}</th>
        <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150" onClick={() => handleSort("amount")}>Prix {sortConfig?.key === "amount" && <span className="text-indigo-600">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}</th>
        <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150" onClick={() => handleSort("status")}>Statut {sortConfig?.key === "status" && <span className="text-indigo-600">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}</th>
        <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150" onClick={() => handleSort("promo")}>En Promotion {sortConfig?.key === "promo" && <span className="text-indigo-600">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}</th>
        <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      {paginatedProducts.map((product: any) => (
        <tr key={product.id} 
            className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${product.active === false ? 'bg-gray-200 text-gray-400 opacity-60' : ''}`}
            onClick={() => handleViewDetails(product)}>
          <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selectedProducts.includes(Number(product.id))}
              onChange={() => handleSelectProduct(Number(product.id))}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </td>
          <td className="px-4 py-4">
            <div className="flex items-center">
              {product.images && product.images.length > 0 ? (
                <div className="relative h-10 w-10 mr-3">
                  <img
                    src={normalizeImageUrl(product.images[0].url)}
                    alt={product.name}
                    className="h-10 w-10 rounded-lg object-cover cursor-pointer bg-gray-200"
                    style={{ display: "block" }}
                    onClick={e => {
                      e.stopPropagation();
                      setPreviewImage(normalizeImageUrl(product.images[0].url));
                    }}
                    onError={e => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null; // Prevent infinite loop
                      img.src = "https://placehold.co/400x300?text=Image+non+disponible";
                      console.warn(`Failed to load image: ${product.images[0].url}`);
                    }}
                  />
                  <div style={{ display: "none" }} className="absolute inset-0 h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-gray-500 text-sm">{product.brand}</div>
              </div>
            </div>
          </td>
          <td className="px-4 py-4 text-sm text-gray-500">{getCategoryName(product.category || product.categoryId)}</td>
          <td className="px-4 py-4 text-sm font-medium text-gray-900">{product.amount} €</td>
          <td className="px-4 py-4 text-sm">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${product.status === "AVAILABLE" ? "bg-green-100 text-green-800" : product.status === "OUT_OF_STOCK" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{translateStatus(product.status)}</span>
          </td>
          <td className="px-4 py-4 text-sm">
            {product.promo ? (
              <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800">Oui</span>
            ) : (
              <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800">Non</span>
            )}
          </td>
          <td className="px-4 py-4 text-sm text-gray-500" onClick={e => e.stopPropagation()}>
            <div className="flex gap-2">
              <button onClick={e => { e.stopPropagation(); handleEdit(product.id); }} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors duration-200">Modifier</button>
              <button onClick={e => { e.stopPropagation(); handleDeleteProduct(product.id); }} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200">Supprimer</button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default ProductTable;

