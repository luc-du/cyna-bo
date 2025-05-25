import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchOrders, fetchOrderDetails, cancelSubscription, Order } from "../store/orderStore";
import { fetchProducts } from "../store/productStore";
import { fetchCategories } from "../store/categoryStore";
import { X, Search } from "lucide-react";

export default function Orders() {
  const dispatch = useAppDispatch();
  const { orders, loading, selectedOrder, error } = useAppSelector((state) => state.orders);

  // Ajout récupération produits et catégories
  const products = useAppSelector((state: any) => state.products.products);
  const categories = useAppSelector((state: any) => state.categories.categories);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  type OrderSortableKeys = "id" | "product" | "category" | "amount" | "status" | "createdAt";
  // Par défaut, aucun tri appliqué (utilise l'ordre d'origine)
  const [sortConfig, setSortConfig] = useState<{ key: OrderSortableKeys; direction: "asc" | "desc" } | null>(null);

  // Load orders, products, categories when component mounts
  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch order details when selected
  useEffect(() => {
    if (selectedOrderId) {
      dispatch(fetchOrderDetails(selectedOrderId));
    }
  }, [selectedOrderId, dispatch]);

  const handleViewDetails = (orderId: number) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseModal = () => {
    setSelectedOrderId(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Filter locally instead of making API call
    const timeout = setTimeout(() => {
      // Reset to first page when searching
      setCurrentPage(1);
    }, 300); // 300ms debounce
    
    setSearchTimeout(timeout);
  };

  const handleCancelSubscription = async (customerId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      try {
        await dispatch(cancelSubscription(customerId)).unwrap();
        alert("Commande annulée avec succès");
        // Refresh orders list
        dispatch(fetchOrders());
      } catch (error) {
        console.error("Error cancelling subscription:", error);
        alert("Erreur lors de l'annulation de la commande");
      }
    }
  };

  // Helpers pour afficher nom produit et catégorie
  const getProductById = (id: number | string) =>
    Array.isArray(products) ? products.find((p: any) => String(p.id) === String(id)) : undefined;

  const getCategoryName = (categoryOrId: any) => {
    if (!categoryOrId) return "Catégorie inconnue";
    if (typeof categoryOrId === "object" && categoryOrId.name) return categoryOrId.name;
    const catId = typeof categoryOrId === "object" ? categoryOrId.id : categoryOrId;
    return Array.isArray(categories)
      ? (categories.find((c: any) => String(c.id) === String(catId))?.name || "Catégorie inconnue")
      : "Catégorie inconnue";
  };

  // Filter orders by search term
  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order: any) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
          order.id?.toString().includes(searchLower) ||
          (order.productName && order.productName.toLowerCase().includes(searchLower)) ||
          (order.status && order.status.toLowerCase().includes(searchLower)) ||
          (order.customerId && order.customerId.toLowerCase().includes(searchLower))
        );
      })
    : [];

  // Tri des commandes selon la colonne sélectionnée
  const sortedOrders = sortConfig
    ? [...filteredOrders].sort((a, b) => {
        const { key, direction } = sortConfig;
        const order = direction === "asc" ? 1 : -1;

        if (key === "product") {
          const aProd = getProductById(a.productId);
          const bProd = getProductById(b.productId);
          const normalize = (str: string) =>
            str
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .trim();
          const aName = aProd?.name ? normalize(String(aProd.name)) : normalize(a.productName || "");
          const bName = bProd?.name ? normalize(String(bProd.name)) : normalize(b.productName || "");
          return aName.localeCompare(bName, "fr", { sensitivity: "base" }) * order;
        }
        if (key === "category") {
          const aProd = getProductById(a.productId);
          const bProd = getProductById(b.productId);
          const aCat = getCategoryName(aProd?.category || aProd?.categoryId);
          const bCat = getCategoryName(bProd?.category || bProd?.categoryId);
          return aCat.localeCompare(bCat, "fr", { sensitivity: "base" }) * order;
        }
        if (key === "amount") {
          return (Number(a.amount) - Number(b.amount)) * order;
        }
        if (key === "status") {
          return (a.status || "").localeCompare(b.status || "", "fr", { sensitivity: "base" }) * order;
        }
        if (key === "createdAt") {
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
        }
        if (key === "id") {
          return (Number(a.id) - Number(b.id)) * order;
        }
        return 0;
      })
    : filteredOrders;

  // Paginate orders
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  // Get status class based on status
  const getStatusClass = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return "bg-green-100 text-green-800";
      case 'CANCELED':
        return "bg-red-100 text-red-800";
      case 'ENDED':
        return "bg-gray-300 text-gray-800";
      case 'INCOMPLETE':
      case 'INCOMPLETE_EXPIRED':
      case 'PAST_DUE':
        return "bg-yellow-100 text-yellow-800";
      case 'PAUSED':
        return "bg-blue-100 text-blue-800";
      case 'TRIALING':
        return "bg-purple-100 text-purple-800";
      case 'UNPAID':
        return "bg-orange-100 text-orange-800";
      case 'ALL':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    if (!status) return "Inconnu";
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return "Actif";
      case 'CANCELED':
        return "Annulé";
      case 'ENDED':
        return "Terminé";
      case 'INCOMPLETE':
        return "Incomplet";
      case 'INCOMPLETE_EXPIRED':
        return "Incomplet (expiré)";
      case 'PAST_DUE':
        return "En retard";
      case 'PAUSED':
        return "En pause";
      case 'TRIALING':
        return "Essai";
      case 'UNPAID':
        return "Impayé";
      case 'ALL':
        return "Tous";
      default:
        return status;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handler pour le tri
  const handleSort = (key: OrderSortableKeys) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Commandes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Une liste de tous les commandes, y compris leur statut et leur
            montant.
          </p>
        </div>
      </div>

      {/* Search input */}
      <div className="mt-6 flex gap-3 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-grow">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Rechercher une commande..."
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pl-10 py-3 text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderId && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Détails de la commande</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  ID
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedOrder.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Produit
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {/* Affichage du nom du produit */}
                  {getProductById(selectedOrder.productId)?.name || selectedOrder.productName || `Produit #${selectedOrder.productId}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Catégorie du produit
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {/* Affichage de la catégorie associée */}
                  {getCategoryName(getProductById(selectedOrder.productId)?.category || getProductById(selectedOrder.productId)?.categoryId)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Montant
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedOrder.amount} €
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Statut
                </label>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      getStatusClass(selectedOrder.status)
                    }`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  ID Client
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedOrder.customerId || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date de création
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <div className="mt-6">
                {!selectedOrder.status && (
                  <button
                    onClick={() => {
                      handleCloseModal();
                      if (selectedOrder.customerId) {
                        handleCancelSubscription(selectedOrder.customerId);
                      }
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:text-sm"
                  >
                    Annuler la commande
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow-md border border-gray-200 rounded-xl">
              {loading && (
                <div className="p-4 text-center">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-indigo-800 transition ease-in-out duration-150">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Chargement...
                  </div>
                </div>
              )}
              
              {error && (
                <div className="p-4 text-center bg-red-50 text-red-700">
                  <p>Erreur: {error}</p>
                  <button 
                    onClick={() => dispatch(fetchOrders())}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                    Réessayer
                  </button>
                </div>
              )}
              
              {!loading && !error && paginatedOrders.length > 0 && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("id")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>ID</span>
                          {sortConfig?.key === "id" && (
                            <span className="text-indigo-600">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                          )}
                        </div>
                      </th>
                     <th
  scope="col"
  className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
  style={{ cursor: 'pointer' }}
  onClick={(e) => {
    // onStoppe toute navigation initiée plus haut dans le DOM
    e.stopPropagation();
    // si c’était dans un <a> ou un <Link>, on évite aussi le comportement par défaut
    e.preventDefault();
    handleSort('product');
  }}
>
  <div className="flex items-center space-x-1">
    <span>Produit</span>
    {sortConfig?.key === 'product' && (
      <span className="text-indigo-600">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    )}
  </div>
</th>

                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={e => { e.preventDefault(); e.stopPropagation(); handleSort("category"); }}
                        tabIndex={-1}
                        style={{ userSelect: "none", cursor: "pointer" }}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Catégorie</span>
                          {sortConfig?.key === "category" && (
                            <span className="text-indigo-600">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Montant</span>
                          {sortConfig?.key === "amount" && (
                            <span className="text-indigo-600">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Statut</span>
                          {sortConfig?.key === "status" && (
                            <span className="text-indigo-600">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          {sortConfig?.key === "createdAt" && (
                            <span className="text-indigo-600">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {order.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {getProductById(order.productId)?.name || order.productName || `Produit #${order.productId}`}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {getCategoryName(getProductById(order.productId)?.category || getProductById(order.productId)?.categoryId)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.amount}  €
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${
                              getStatusClass(order.status)
                            }`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleViewDetails(order.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Voir les détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              {!loading && !error && paginatedOrders.length === 0 && (
                <div className="p-8 text-center">
                  <div className="inline-flex rounded-full bg-gray-100 p-4 mb-4">
                    <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Aucunes commandes trouvées</h3>
                  <p className="text-gray-500">
                    {search ? "Aucun résultat ne correspond à votre recherche" : "Il n'y a pas encore de commandes"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </button>
          <span>
            Page {currentPage} sur {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
