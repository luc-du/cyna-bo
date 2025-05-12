import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  deleteProduct,
  fetchProducts,
  searchProducts,
  updateProduct,
  deleteMultipleProducts,
  createProduct,
  fetchProductDetails,
} from "../store/productStore";
import { X } from "lucide-react";
import { fetchCategories } from "../store/categoryStore";

export default function Products() {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state: { products: any }) => state.products);
  const { categories } = useAppSelector((state: { categories: any }) => state.categories);

  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    brand: "",
    description: "",
    caracteristics: "",
    pricingModel: "PER_MONTH_PER_USER",
    amount: "",
    categoryId: "",
    status: "AVAILABLE",
    images: [] as File[],
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    brand: "",
    description: "",
    caracteristics: "",
    pricingModel: "PER_MONTH_PER_USER",
    amount: "",
    categoryId: "",
    status: "AVAILABLE",
    images: [] as File[],
  });

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a new timeout to delay the search
    const timeout = setTimeout(() => {
      if (value.trim() === "") {
        dispatch(fetchProducts());
      } else {
        // Use the improved searchProducts function that handles errors
        dispatch(searchProducts(value));
      }
    }, 300); // 300ms debounce
    
    setSearchTimeout(timeout);
  };

  const handleEdit = (productId: number) => {
    const product = products.find((p: { id: number }) => p.id === productId);
    if (product) {
      setEditForm({
        name: product.name,
        brand: product.brand,
        description: product.description,
        caracteristics: product.caracteristics,
        pricingModel: product.pricingModel,
        amount: product.amount.toString(),
        categoryId: product.categoryId ? product.categoryId.toString() : "",
        status: product.status,
        images: [],
      });
      setEditingProduct(productId);
    }
  };

  const handleSave = async () => {
    if (!editingProduct) {
      console.error("Impossible de sauvegarder : aucun produit sélectionné !");
      return;
    }

    if (isNaN(Number(editForm.amount)) || Number(editForm.amount) <= 0) {
      alert("Veuillez entrer un prix valide.");
      return;
    }

    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("brand", editForm.brand);
    formData.append("description", editForm.description);
    formData.append("caracteristics", editForm.caracteristics);
    formData.append("pricingModel", editForm.pricingModel);
    formData.append("amount", editForm.amount);
    if (editForm.categoryId) {
      formData.append("categoryId", editForm.categoryId);
    }
    formData.append("status", editForm.status);
    formData.append("skipStripeOnError", "true");

    editForm.images.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const result = await dispatch(updateProduct({ id: editingProduct, data: formData }));
      
      if (result.payload && typeof result.payload === 'object') {
        if ('message' in result.payload) {
          if (String(result.payload.message).includes('Stripe') || 
              String(result.payload.message).includes('already exists')) {
            console.warn("Product updated but had Stripe integration issues:", result.payload.message);
            alert("Le produit a été mis à jour mais l'intégration Stripe a rencontré un problème. " +
                  "Cela n'affecte pas les données du produit dans votre catalogue.");
          }
        }
      }
      
      setEditingProduct(null);
      dispatch(fetchProducts());
    } catch (err) {
      alert("Erreur lors de la mise à jour du produit");
      console.error(err);
    }
  };

  const getCategoryName = (categoryOrId: any) => {
    if (!categoryOrId) return "Catégorie inconnue";
    if (typeof categoryOrId === "object" && categoryOrId.name) {
      return categoryOrId.name;
    }
    const catId = typeof categoryOrId === "object" ? categoryOrId.id : categoryOrId;
    const found = categories?.find((c: any) => String(c.id) === String(catId));
    return found ? found.name : "Catégorie inconnue";
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Disponible";
      case "DISCONTINUED":
        return "Arrêté";
      case "OUT_OF_STOCK":
        return "Rupture de stock";
      default:
        return "Inconnu";
    }
  };

  const handleCreate = async () => {
    if (!createForm.categoryId) {
      alert("Veuillez sélectionner une catégorie");
      return;
    }

    if (isNaN(Number(createForm.amount)) || Number(createForm.amount) <= 0) {
      alert("Veuillez entrer un prix valide.");
      return;
    }

    const formData = new FormData();
    formData.append("name", createForm.name);
    formData.append("brand", createForm.brand);
    formData.append("description", createForm.description);
    formData.append("caracteristics", createForm.caracteristics);
    formData.append("pricingModel", createForm.pricingModel);
    formData.append("amount", createForm.amount);
    formData.append("categoryId", createForm.categoryId);
    formData.append("status", createForm.status);
    formData.append("skipStripeOnError", "true");
    createForm.images.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const result = await dispatch(createProduct(formData));
      
      if (result.payload && typeof result.payload === 'object') {
        if ('message' in result.payload) {
          if (String(result.payload.message).includes('Stripe') || 
              String(result.payload.message).includes('already exists')) {
            console.warn("Product created but had Stripe integration issues:", result.payload.message);
            alert("Le produit a été créé mais l'intégration Stripe a signalé que le produit existe déjà. " +
                  "Ceci est probablement dû à une tentative précédente. Le produit a été enregistré correctement.");
          }
        }
      }
      
      setCreateForm({
        name: "",
        brand: "",
        description: "",
        caracteristics: "",
        pricingModel: "PER_MONTH_PER_USER",
        amount: "",
        categoryId: "",
        status: "AVAILABLE",
        images: [],
      });
      setCreatingProduct(false);
      dispatch(fetchProducts());
    } catch (err) {
      console.error("Product creation error:", err);
      alert("Erreur lors de la création du produit. Veuillez réessayer.");
    }
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product: any) => product.id));
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleViewDetails = (product: any) => {
    dispatch(fetchProductDetails(product.id));
    setSelectedProduct(product);
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedProducts.length} produit(s) ?`)) {
      dispatch(deleteMultipleProducts(selectedProducts));
      setSelectedProducts([]);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      dispatch(deleteProduct(productId));
    }
  };

  const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCreateForm({ 
        ...createForm, 
        images: [...createForm.images, ...Array.from(e.target.files)] 
      });
      e.target.value = '';
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditForm({ 
        ...editForm, 
        images: [...editForm.images, ...Array.from(e.target.files)] 
      });
      e.target.value = '';
    }
  };

  // Add safeguards to prevent errors if products isn't iterable
  const sortedProducts = Array.isArray(products) 
    ? [...products].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        const order = direction === "asc" ? 1 : -1;
        return a[key] > b[key] ? order : -order;
      })
    : [];

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Produits</h1>
          <p className="mt-2 text-sm text-gray-500">
            Une liste de tous les produits de votre compte.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setCreatingProduct(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto transition-all duration-200"
          >
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* Input de recherche */}
      <div className="mt-6 flex gap-3 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-grow">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Rechercher un produit..."
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pl-10 py-3 text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="mt-4 flex items-center bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
          <span className="mr-3 text-sm text-blue-800 font-medium">
            {selectedProducts.length} produit(s) sélectionné(s)
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

      {/* Image Preview Modal */}
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

      {/* Product Card Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1000] transition-all duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-xl transform transition-all duration-300 animate-fadeIn">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedProduct.name}</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Marque:</span>
                  <span className="font-medium">{selectedProduct.brand}</span>
                </div>
                <div>
                  <span className="text-gray-500">Description:</span>
                  <p className="mt-1 text-gray-800">{selectedProduct.description}</p>
                </div>
                <div>
                  <span className="text-gray-500">Caractéristiques:</span>
                  <p className="mt-1 text-gray-800">{selectedProduct.caracteristics}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Prix:</span>
                  <span className="font-medium text-indigo-600">{selectedProduct.amount} €</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Statut:</span>
                  <span 
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedProduct.status === "AVAILABLE"
                        ? "bg-green-100 text-green-800"
                        : selectedProduct.status === "OUT_OF_STOCK"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {translateStatus(selectedProduct.status)}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Catégorie:</span>
                  <span className="font-medium">
                    {getCategoryName(selectedProduct.category)}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Images</h4>
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedProduct.images.map((image: any, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={`http://localhost:8082${image.url}`}
                          alt={`Produit ${index + 1}`}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(null);
                }}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 mr-3"
              >
                Fermer
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(null);
                  handleEdit(selectedProduct.id);
                }}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {creatingProduct && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-xl transform transition-all duration-300 animate-fadeIn overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-800">Ajouter un produit</h3>
              <button
                onClick={() => setCreatingProduct(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  placeholder="Nom du produit"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Marque</label>
                <input
                  type="text"
                  placeholder="Marque du produit"
                  value={createForm.brand}
                  onChange={(e) => setCreateForm({ ...createForm, brand: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Description détaillée du produit"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">Caractéristiques</label>
                <textarea
                  placeholder="Caractéristiques techniques du produit"
                  value={createForm.caracteristics}
                  onChange={(e) => setCreateForm({ ...createForm, caracteristics: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Modèle de tarification</label>
                <select
                  value={createForm.pricingModel}
                  onChange={(e) => setCreateForm({ ...createForm, pricingModel: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="PER_MONTH_PER_USER">Par mois / utilisateur</option>
                  <option value="PER_YEAR_PER_USER">Par an / utilisateur</option>
                  <option value="PER_MONTH_PER_DEVICE">Par mois / appareil</option>
                  <option value="PER_YEAR_PER_DEVICE">Par an / appareil</option>
                  <option value="PAY_AS_YOU_GO">Payer en une fois</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Prix</label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="number"
                    placeholder="Prix"
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 pl-7 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">€</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                <select
                  value={createForm.categoryId}
                  onChange={(e) => setCreateForm({ ...createForm, categoryId: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories && categories.length > 0 ? (
                    categories.map((category: { id: number; name: string }) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Aucune catégorie disponible</option>
                  )}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="DISCONTINUED">Arrêté</option>
                  <option value="OUT_OF_STOCK">Rupture</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">Images</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Télécharger des fichiers</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          multiple 
                          className="sr-only"
                          onChange={handleCreateImageChange}
                        />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                  </div>
                </div>
                {createForm.images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">{createForm.images.length} fichier(s) sélectionné(s)</p>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {Array.from(createForm.images).map((file, idx) => (
                        <div key={idx} className="relative group">
                          <div className="h-20 w-full rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                            {file.type.startsWith("image/") ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="text-xs text-gray-500 text-center px-2">
                                {file.name}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...createForm.images];
                              newImages.splice(idx, 1);
                              setCreateForm({ ...createForm, images: newImages });
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-2 flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setCreatingProduct(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Ajouter le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct !== null && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-xl transform transition-all duration-300 animate-fadeIn overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-800">Modifier le produit</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  placeholder="Nom du produit"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Marque</label>
                <input
                  type="text"
                  placeholder="Marque du produit"
                  value={editForm.brand}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Description détaillée du produit"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">Caractéristiques</label>
                <textarea
                  placeholder="Caractéristiques techniques du produit"
                  value={editForm.caracteristics}
                  onChange={(e) => setEditForm({ ...editForm, caracteristics: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Modèle de tarification</label>
                <select
                  value={editForm.pricingModel}
                  onChange={(e) => setEditForm({ ...editForm, pricingModel: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="PER_MONTH_PER_USER">Par mois / utilisateur</option>
                  <option value="PER_YEAR_PER_USER">Par an / utilisateur</option>
                  <option value="PER_MONTH_PER_DEVICE">Par mois / appareil</option>
                  <option value="PER_YEAR_PER_DEVICE">Par an / appareil</option>
                  <option value="PAY_AS_YOU_GO">Payer en une fois</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Prix</label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="number"
                    placeholder="Prix"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 pl-7 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">€</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                <select
                  value={editForm.categoryId}
                  onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories && categories.length > 0 ? (
                    categories.map((category: { id: number; name: string }) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Aucune catégorie disponible</option>
                  )}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="DISCONTINUED">Arrêté</option>
                  <option value="OUT_OF_STOCK">Rupture</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">Images existantes</label>
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    const product = products.find((p: any) => p.id === editingProduct);
                    if (product && product.images && product.images.length > 0) {
                      return product.images.map((image: any, idx: number) => (
                        <div key={idx} className="relative group">
                          <img
                            src={`http://localhost:8082${image.url}`}
                            alt={`Produit ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200 cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              setPreviewImage(`http://localhost:8082${image.url}`);
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                        </div>
                      ));
                    }
                    return <div className="col-span-2 text-gray-400">Aucune image existante</div>;
                  })()}
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">Ajouter de nouvelles images</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload-edit" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Télécharger des fichiers</span>
                        <input 
                          id="file-upload-edit" 
                          name="file-upload-edit" 
                          type="file" 
                          multiple 
                          className="sr-only"
                          onChange={handleEditImageChange}
                        />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                  </div>
                </div>
                {editForm.images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">{editForm.images.length} fichier(s) sélectionné(s)</p>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {Array.from(editForm.images).map((file, idx) => (
                        <div key={idx} className="relative group">
                          <div className="h-20 w-full rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                            {file.type.startsWith("image/") ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="text-xs text-gray-500 text-center px-2">
                                {file.name}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...editForm.images];
                              newImages.splice(idx, 1);
                              setEditForm({ ...editForm, images: newImages });
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-2 flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Sauvegarder les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tableau produits */}
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
                        checked={selectedProducts.length === products.length && products.length > 0}
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
                    <th 
                      className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150" 
                      onClick={() => handleSort("categoryId")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Catégorie</span>
                        {sortConfig?.key === "categoryId" && (
                          <span className="text-indigo-600">
                            {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150" 
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Prix</span>
                        {sortConfig?.key === "amount" && (
                          <span className="text-indigo-600">
                            {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150" 
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Statut</span>
                        {sortConfig?.key === "status" && (
                          <span className="text-indigo-600">
                            {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedProducts.map((product: any) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => handleViewDetails(product)}
                    >
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={`http://localhost:8082${product.images[0].url}`}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover mr-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage(`http://localhost:8082${product.images[0].url}`);
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
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-gray-500 text-sm">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {getCategoryName(product.category || product.categoryId)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {product.amount} €
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.status === "AVAILABLE"
                              ? "bg-green-100 text-green-800"
                              : product.status === "OUT_OF_STOCK"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {translateStatus(product.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(product.id);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product.id);
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
              {/* Pagination controls */}
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
              {products.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <div className="inline-flex rounded-full bg-gray-100 p-4 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Aucun produit trouvé</h3>
                  <p className="mt-1 text-gray-500">Commencez par ajouter un produit ou modifiez votre recherche.</p>
                  <button
                    onClick={() => setCreatingProduct(true)}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Ajouter un produit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
