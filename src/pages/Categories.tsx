import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  deleteCategory,
  fetchCategories,
  searchCategories,
  deleteMultipleCategories,
  fetchCategoryDetails,
} from "../store/categoryStore";
import { X } from "lucide-react";
import { CategoryForm } from "../components/category";

export default function Categories() {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.categories);

  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (value.trim() === "") {
        dispatch(fetchCategories());
      } else {
        dispatch(searchCategories(value));
      }
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleEdit = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setEditingCategory(categoryId);
    }
  };

  const handleViewDetails = async (category: any) => {
    const result = await dispatch(fetchCategoryDetails(category.id));
    if (result.payload) {
      setSelectedCategory(result.payload);
    } else {
      setSelectedCategory(category);
    }
  };

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((category) => category.id));
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      dispatch(deleteCategory(categoryId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedCategories.length === 0) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedCategories.length} catégorie(s) ?`)) {
      dispatch(deleteMultipleCategories(selectedCategories));
      setSelectedCategories([]);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const order = direction === "asc" ? 1 : -1;
    return ((a[key as keyof typeof a] ?? "") > (b[key as keyof typeof b] ?? "") ? order : -order) as number;
  });

  const paginatedCategories = sortedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Catégories</h1>
          <p className="mt-2 text-sm text-gray-500">
            Liste de toutes les catégories de votre compte.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setCreatingCategory(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto transition-all duration-200"
          >
            Ajouter une catégorie
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-3 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-grow">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Rechercher une catégorie..."
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pl-10 py-3 text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="mt-4 flex items-center bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
          <span className="mr-3 text-sm text-blue-800 font-medium">
            {selectedCategories.length} catégorie(s) sélectionnée(s)
          </span>
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer la sélection
          </button>
        </div>
      )}

      {selectedCategory && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-xl transform transition-all duration-300 animate-fadeIn">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedCategory.name}</h3>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Description:</span>
                  <p className="font-medium">{selectedCategory.description || "Aucune description disponible"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Produits dans cette catégorie:</span>
                  <p className="mt-1 text-gray-800">
                    {selectedCategory.products && selectedCategory.products.length > 0 ? 
                      `${selectedCategory.products.length} produits` : 
                      "0 produit"}
                  </p>
                  {selectedCategory.products && selectedCategory.products.length > 0 ? (
                    <div className="mt-4">
                      <ul className="space-y-2">
                        {selectedCategory.products.map((product: any) => (
                          <li key={product.id} className="flex items-center">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            {product.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-500 italic">Aucun produit dans cette catégorie</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Images</h4>
                {selectedCategory.images && selectedCategory.images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {selectedCategory.images.map((image: any, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={`http://localhost:8082${image.url}`}
                          alt={`Catégorie ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPreviewImage(`http://localhost:8082${image.url}`);
                          }}
                        />
                        <div 
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPreviewImage(`http://localhost:8082${image.url}`);
                          }}
                        ></div>
                      </div>
                    ))}
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
                onClick={() => setSelectedCategory(null)}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 mr-3"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  handleEdit(selectedCategory.id);
                }}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {creatingCategory && (
        <CategoryForm
          mode="create"
          onClose={() => {
            setCreatingCategory(false);
            dispatch(fetchCategories());
          }}
        />
      )}

      {editingCategory !== null && (
        <CategoryForm
          mode="edit"
          categoryId={editingCategory}
          initialValues={categories.find((c) => c.id === editingCategory)}
          onClose={() => {
            setEditingCategory(null);
            dispatch(fetchCategories());
          }}
        />
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow-md border border-gray-200 rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCategories.length === categories.length && categories.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th 
                      className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150" 
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Nom</span>
                        {sortConfig?.key === "name" && (
                          <span className="text-indigo-600">
                            {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre de produits
                    </th>
                    <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedCategories.map((category) => (
                    <tr 
                      key={category.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => handleViewDetails(category)}
                    >
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleSelectCategory(category.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {category.images && category.images.length > 0 ? (
                            <img
                              src={`http://localhost:8082${category.images[0].url}`}
                              alt={category.name}
                              className="h-10 w-10 rounded-lg object-cover mr-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage && setPreviewImage(`http://localhost:8082${category.images[0].url}`);
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{category.name}</div>
                            <div className="text-gray-500 text-sm truncate max-w-xs">{category.description || "Aucune description"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <span className="font-medium">{category.products.length|| 0}</span> produits
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(category.id);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(category.id);
                            }}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Précédent
                  </button>
                  <span>
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Suivant
                  </button>
                </div>
              )}
              {categories.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <div className="inline-flex rounded-full bg-gray-100 p-4 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Aucune catégorie trouvée</h3>
                  <p className="mt-1 text-gray-500">
                    {search.trim() ? "Aucun résultat pour cette recherche" : "Commencez par ajouter une catégorie"}
                  </p>
                  <button
                    onClick={() => setCreatingCategory(true)}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Ajouter une catégorie
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 transition-all duration-300 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-full max-h-full w-full h-full flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                className="text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(null);
                }}
              >
                <X className="h-8 w-8" />
              </button>
            </div>
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
              <img
                src={previewImage}
                alt="Aperçu plein écran"
                className="max-w-full max-h-full object-contain cursor-zoom-in hover:scale-110 transition-transform duration-300"
                onClick={(e) => e.stopPropagation()}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
              Cliquez sur l'image pour zoomer, ou n'importe où ailleurs pour fermer
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
