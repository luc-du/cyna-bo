import { useEffect, useState, useRef, Suspense, lazy } from "react";
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
import ProductForm from "../components/ProductForm";
import Loader from "../components/Loader";
import ProductTable from "../components/ProductTable";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8082";

const LazyProductDetailModal = lazy(() => import("../components/ProductDetailModal"));

export default function Products() {
  const dispatch = useAppDispatch();

  // Sélecteurs Redux sans typage strict pour éviter les erreurs
  const productsState = useAppSelector((state: any) => state.products);
  const products = productsState.products;
  const loading = productsState.loading;
  const categoriesState = useAppSelector((state: any) => state.categories);
  const categories = categoriesState.categories;

  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
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
    promo: false,
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
    promo: false,
  });

  // Validation error states
  const [createErrors, setCreateErrors] = useState<{ [key: string]: string }>({});
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Function to show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const createModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (creatingProduct && createModalRef.current) {
      createModalRef.current.focus();
    }
  }, [creatingProduct]);

  useEffect(() => {
    if (editingProduct !== null && editModalRef.current) {
      editModalRef.current.focus();
    }
  }, [editingProduct]);

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

  const validateForm = (form: typeof createForm | typeof editForm) => {
    const errors: { [key: string]: string } = {};
    if (!form.name.trim()) errors.name = "Le nom est requis.";
    if (!form.brand.trim()) errors.brand = "La marque est requise.";
    if (!form.description.trim()) errors.description = "La description est requise.";
    if (!form.caracteristics.trim()) errors.caracteristics = "Les caractéristiques sont requises.";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) errors.amount = "Veuillez entrer un prix valide.";
    if (!form.categoryId) errors.categoryId = "Veuillez sélectionner une catégorie.";
    if (!form.status) errors.status = "Veuillez sélectionner un statut.";
    return errors;
  };

  const handleEdit = (productId: number) => {
    // Always fetch product details to refresh images and data
    dispatch(fetchProductDetails(productId)).then((action: any) => {
      // Use the payload from fetchProductDetails to get the latest product data
      const product = action.payload;
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
          promo: !!product.promo,
        });
        setEditingProduct(productId);
      }
    });
  };

  const handleSave = async () => {
    if (!editingProduct) {
      showNotification('error', "Impossible de sauvegarder : aucun produit sélectionné !");
      return;
    }

    const errors = validateForm(editForm);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Create form data for submission
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
    formData.append("promo", String(editForm.promo));
    formData.append("skipStripeOnError", "true");

    // N'ajouter le champ images que si des nouvelles images sont sélectionnées
    if (editForm.images && editForm.images.length > 0) {
      editForm.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      const result = await dispatch(updateProduct({ id: editingProduct, data: formData }));
      
      if (result.payload && typeof result.payload === 'object') {
        if ('message' in result.payload) {
          if (String(result.payload.message).includes('Stripe') || 
              String(result.payload.message).includes('already exists')) {
            showNotification('success', "Le produit a été mis à jour mais l'intégration Stripe a rencontré un problème. Cela n'affecte pas les données du produit dans votre catalogue.");
          }
        }
      }
      
      await dispatch(fetchProductDetails(editingProduct));
      await dispatch(fetchProducts());
      setEditingProduct(null);
      setCurrentPage(1);
      showNotification('success', 'Produit modifié avec succès.');
    } catch (err) {
      showNotification('error', "Erreur lors de la mise à jour du produit");
      console.error("Update error:", err);
    }
  };

  const getCategoryName = (categoryOrId: any) => {
    if (!categoryOrId) return "Catégorie inconnue";
    if (typeof categoryOrId === "object" && categoryOrId.name) {
      return categoryOrId.name;
    }
    const catId = typeof categoryOrId === "object" ? categoryOrId.id : categoryOrId;
    const found = categories?.find((c: { id: number }) => String(c.id) === String(catId));
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
    const errors = validateForm(createForm);
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const formData = new FormData();
    formData.append("name", createForm.name);
    formData.append("brand", createForm.brand);
    formData.append("description", createForm.description);
    formData.append("caracteristics", createForm.caracteristics);
    formData.append("pricingModel", createForm.pricingModel);
    formData.append("amount", createForm.amount);
    formData.append("categoryId", createForm.categoryId);
    formData.append("status", createForm.status);
    formData.append("promo", String(createForm.promo));
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
            showNotification('success', "Le produit a été créé mais l'intégration Stripe a signalé que le produit existe déjà. Ceci est probablement dû à une tentative précédente. Le produit a été enregistré correctement.");
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
        promo: false,
      });
      await dispatch(fetchProducts());
      setCreatingProduct(false);
      setCurrentPage(1);
      showNotification('success', 'Produit créé avec succès.');
    } catch (err) {
      console.error("Product creation error:", err);
      showNotification('error', "Erreur lors de la création du produit. Veuillez réessayer.");
    }
  };

  // Reset errors when opening/closing modals
  useEffect(() => {
    if (!creatingProduct) setCreateErrors({});
  }, [creatingProduct]);
  useEffect(() => {
    if (editingProduct === null) setEditErrors({});
  }, [editingProduct]);

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product: any) => Number(product.id)));
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
    setSelectedProductId(Number(product.id));
    dispatch(fetchProductDetails(Number(product.id)));
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

  const sortedProducts = Array.isArray(products) 
    ? [...products].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        const order = direction === "asc" ? 1 : -1;

        // Numeric sort for amount
        if (key === "amount") {
          return (Number(a.amount) - Number(b.amount)) * order;
        }
        // Boolean sort for promo
        if (key === "promo") {
          return (Number(a.promo) - Number(b.promo)) * order;
        }
        // Sort by category name
        if (key === "categoryId") {
          const aCat = getCategoryName(a.category || a.categoryId);
          const bCat = getCategoryName(b.category || b.categoryId);
          return aCat.localeCompare(bCat, "fr", { sensitivity: "base" }) * order;
        }
        // Alphabetical sort (case-insensitive) for name, brand, status, etc.
        const aValue = (a[key] ?? "").toString().toLowerCase();
        const bValue = (b[key] ?? "").toString().toLowerCase();
        return aValue.localeCompare(bValue, "fr", { sensitivity: "base" }) * order;
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
            Liste des produits actuellement sur Cyna IT.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-2">
          <button
            type="button"
            onClick={() => setCreatingProduct(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto transition-all duration-200"
          >
            Ajouter un produit
          </button>
          <button
            type="button"
            onClick={() => dispatch(fetchProducts())}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto transition-all duration-200"
            title="Rafraîchir la liste des produits"
          >
            Rafraîchir
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
      {selectedProductId && (
        (() => {
          const selectedProduct = products.find((p: any) => p.id === selectedProductId);
          return selectedProduct && (
            <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[1000]"><Loader /></div>}>
              <LazyProductDetailModal
                product={selectedProduct}
                categories={categories}
                onClose={() => {
                  setSelectedProductId(null);
                  dispatch(fetchProducts());
                }}
                setPreviewImage={setPreviewImage}
                getCategoryName={getCategoryName}
                translateStatus={translateStatus}
                IMAGE_BASE_URL={IMAGE_BASE_URL}
              />
            </Suspense>
          );
        })()
      )}

      {/* Create Modal */}
      {creatingProduct && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-xl transform transition-all duration-300 animate-fadeIn overflow-y-auto max-h-[90vh]" ref={createModalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Créer un produit">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-800">Ajouter un produit</h3>
              <button
                onClick={() => setCreatingProduct(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <ProductForm
              form={createForm}
              errors={createErrors}
              categories={categories || []}
              mode="create"
              onChange={(field, value) => {
                if (field === "cancel") setCreatingProduct(false);
                else setCreateForm({ ...createForm, [field]: value });
              }}
              onImageChange={handleCreateImageChange}
              onImageRemove={idx => {
                const newImages = [...createForm.images];
                newImages.splice(idx, 1);
                setCreateForm({ ...createForm, images: newImages });
              }}
              onSubmit={e => {
                e.preventDefault();
                handleCreate();
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct !== null && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-xl transform transition-all duration-300 animate-fadeIn overflow-y-auto max-h-[90vh]" ref={editModalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Modifier le produit">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-800">Modifier le produit</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <ProductForm
              form={editForm}
              errors={editErrors}
              categories={categories || []}
              mode="edit"
              onChange={(field, value) => {
                if (field === "cancel") setEditingProduct(null);
                else setEditForm({ ...editForm, [field]: value });
              }}
              onImageChange={handleEditImageChange}
              onImageRemove={idx => {
                const newImages = [...editForm.images];
                newImages.splice(idx, 1);
                setEditForm({ ...editForm, images: newImages });
              }}
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
            />
            {/* Images existantes */}
            <div className="col-span-2 space-y-1 mt-6">
              <label className="block text-sm font-medium text-gray-700">Images existantes</label>
              <div className="grid grid-cols-2 gap-4">
                {(() => {
                  const product = products.find((p: any) => Number(p.id) === editingProduct);
                  if (product && product.images && product.images.length > 0) {
                    return product.images.map((image: any, idx: number) => (
                      <div key={idx} className="relative group">
                        <img
                          src={`${IMAGE_BASE_URL}${image.url}`}
                          alt={`Produit ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            setPreviewImage(`${IMAGE_BASE_URL}${image.url}`);
                          }}
                        />
                      </div>
                    ));
                  }
                  return <div className="col-span-2 text-gray-400">Aucune image existante</div>;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tableau produits */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow-md border border-gray-200 rounded-xl">
              {loading ? (
                <Loader />
              ) : (
                <ProductTable
                  products={products}
                  paginatedProducts={paginatedProducts}
                  selectedProducts={selectedProducts}
                  handleSelectAll={handleSelectAll}
                  handleSelectProduct={handleSelectProduct}
                  handleViewDetails={handleViewDetails}
                  handleEdit={handleEdit}
                  handleDeleteProduct={handleDeleteProduct}
                  sortConfig={sortConfig}
                  handleSort={handleSort}
                  getCategoryName={getCategoryName}
                  translateStatus={translateStatus}
                  setPreviewImage={setPreviewImage}
                  IMAGE_BASE_URL={IMAGE_BASE_URL}
                />
              )}
              {/* Pagination controls et empty state restent ici */}
              {true && ( // Remplace temporairement totalPages > 1 par true pour forcer l'affichage
                <div className="flex flex-col items-center gap-2 mt-4">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Précédent
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded transition-colors duration-200 ${
                            currentPage === page ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Suivant
                    </button>
                  </div>
                  <span>
                    Page {currentPage} sur {totalPages}
                  </span>
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

      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[99999] px-6 py-4 rounded-lg shadow-lg text-white transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
