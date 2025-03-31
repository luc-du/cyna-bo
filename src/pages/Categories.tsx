import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, searchCategories } from "../store/categoryStore";
import type { RootState, AppDispatch } from "../store/store";

export default function Categories() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    categories = [],
    loading,
    error,
  } = useSelector(
    (state: RootState) => state.categories || {} // Add fallback for undefined state
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      dispatch(fetchCategories());
    } else {
      dispatch(searchCategories(searchQuery));
    }
  };

  if (loading) {
    return <div>Chargement des catégories...</div>;
  }

  if (error) {
    return <div className="text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Catégories</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste des catégories et leurs produits associés.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white shadow rounded-lg p-6 border border-gray-200"
          >
            <div className="flex items-center space-x-4">
              {category.images.length > 0 && (
                <img
                  src={category.images[0].url}
                  alt={category.images[0].name}
                  className="h-16 w-16 rounded-md object-cover"
                />
              )}
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {category.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {category.products.length} produit(s)
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-700">
                Produits associés
              </h3>
              <ul className="mt-2 space-y-2">
                {category.products.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-md shadow-sm"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                      <p className="text-sm text-gray-500">
                        {product.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        Prix: {product.price} €
                      </p>
                    </div>
                    {product.images.length > 0 && (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
