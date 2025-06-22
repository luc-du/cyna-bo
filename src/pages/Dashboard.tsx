import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  Folder,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/authStore";
import { fetchProducts } from "../store/productStore";
import { fetchCategories } from "../store/categoryStore";
import { fetchOrders } from "../store/orderStore";
import type { RootState, AppDispatch } from "../store/store";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { mockSupportTickets } from "../mocks/data";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid } from "recharts";
import { normalizeImageUrl } from "../utils/imageUtils";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useSelector(
    (state: RootState) => state.auth as { user: any; loading: boolean; isAuthenticated: boolean }
  );
  const { products } = useSelector((state: RootState) => state.products);
  const { categories } = useSelector((state: RootState) => state.categories);
  const { orders } = useSelector((state: RootState) => state.orders);

  const [profileFetched, setProfileFetched] = useState(false);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !profileFetched && !loading && !isRedirectingRef.current) {
      dispatch(fetchUserProfile())
        .unwrap()
        .then(() => {
          setProfileFetched(true);
          dispatch(fetchProducts());
          dispatch(fetchCategories());
          dispatch(fetchOrders());
        })
        .catch(() => {
          console.error("Redirection due to profile fetch failure");
          isRedirectingRef.current = true;
          navigate("/login");
        });
    }
  }, [isAuthenticated, profileFetched, loading, dispatch, navigate]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!user || !user.firstname) {
    return <div>Impossible de charger le profil utilisateur.</div>;
  }

  const totalSales = Array.isArray(orders)
    ? orders
        .filter((order: any) =>
          ["active", "ended", "ACTIVE", "ENDED"].includes(
            String(order.status).toLowerCase()
          )
        )
        .reduce((sum: number, order: any) => sum + Number(order.amount || 0), 0)
    : 0;

  const totalOrders = Array.isArray(orders) ? orders.length : 0;

  const averageOrderValue =
    totalOrders > 0
      ? (
          orders.reduce(
            (sum: number, order: any) => sum + Number(order.amount || 0),
            0
          ) / totalOrders
        ).toFixed(2)
      : 0;

  const activeProducts = Array.isArray(products)
    ? products.filter(
        (product: any) =>
          String(product.status).toUpperCase() === "AVAILABLE"
      ).length
    : 0;

  const stats = [
    {
      name: "Total des ventes",
      value: totalSales + " €",
      icon: DollarSign,
    },
    {
      name: "Total des commandes",
      value: totalOrders,
      icon: ShoppingCart,
    },
    {
      name: "Valeur moyenne des commandes",
      value: averageOrderValue + " €",
      icon: BarChart3,
    },
    {
      name: "Produits actifs",
      value: activeProducts,
      icon: Package,
    }
  ];

  const recentProducts = Array.isArray(products)
    ? [...products]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 3)
    : [];

  const recentCategories = Array.isArray(categories)
    ? [...categories]
        .sort((a, b) => b.id - a.id)
        .slice(0, 3)
    : [];

  const recentOrders = Array.isArray(orders)
    ? [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
    : [];

  // Use mocked support tickets for now
  const recentSupportTickets = mockSupportTickets.slice(0, 3);

  // --- Préparation des données pour les graphiques ---

  // 1. Histogramme des ventes par jour/semaine
  const salesByDay: Record<string, number> = {};
  const salesByWeek: Record<string, number> = {};
  if (Array.isArray(orders)) {
    orders.forEach((order: any) => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      // Format YYYY-MM-DD
      const dayKey = date.toISOString().slice(0, 10);
      salesByDay[dayKey] = (salesByDay[dayKey] || 0) + Number(order.amount || 0);

      // Format YYYY-WW (ISO week)
      const week = `${date.getFullYear()}-W${String(Math.ceil(
        ((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(date.getFullYear(), 0, 1).getDay() + 1) / 7
      )).padStart(2, "0")}`;
      salesByWeek[week] = (salesByWeek[week] || 0) + Number(order.amount || 0);
    });
  }
  const salesByDayData = Object.entries(salesByDay).map(([date, amount]) => ({ date, amount }));
  const salesByWeekData = Object.entries(salesByWeek).map(([week, amount]) => ({ week, amount }));

  // 2. Panier moyen par catégorie (multi-barres)
  let avgBasketByCategory: Array<{ category: string; avg: number }> = [];
  if (Array.isArray(categories)) {
    avgBasketByCategory = categories.map((cat: any) => {
      // Trouver tous les produits de cette catégorie
      const catProducts = Array.isArray(products)
        ? products.filter((p: any) =>
            // Supporte p.category (objet ou id) ou p.categoryId
            (typeof p.category === "object" && p.category?.id === cat.id) ||
            (typeof p.category === "string" && String(p.category) === String(cat.id)) ||
            (typeof p.category === "number" && p.category === cat.id) ||
            (p.categoryId && String(p.categoryId) === String(cat.id))
          )
        : [];
      // Trouver toutes les commandes pour ces produits
      const catOrders = Array.isArray(orders)
        ? orders.filter((order: any) =>
            catProducts.some((p: any) => String(p.id) === String(order.productId))
          )
        : [];
      const avg =
        catOrders.length > 0
          ? catOrders.reduce((sum: number, o: any) => sum + Number(o.amount || 0), 0) / catOrders.length
          : 0;
      return { category: cat.name, avg: Number(avg.toFixed(2)) };
    });
  }

  // 3. Répartition des ventes par catégorie (camembert)
  let salesByCategory: Array<{ category: string; value: number }> = [];
  if (Array.isArray(categories)) {
    salesByCategory = categories.map((cat: any) => {
      // Trouver tous les produits de cette catégorie
      const catProducts = Array.isArray(products)
        ? products.filter((p: any) =>
            (typeof p.category === "object" && p.category?.id === cat.id) ||
            (typeof p.category === "string" && String(p.category) === String(cat.id)) ||
            (typeof p.category === "number" && p.category === cat.id) ||
            (p.categoryId && String(p.categoryId) === String(cat.id))
          )
        : [];
      // Trouver toutes les commandes pour ces produits
      const catOrders = Array.isArray(orders)
        ? orders.filter((order: any) =>
            catProducts.some((p: any) => String(p.id) === String(order.productId))
          )
        : [];
      const total = catOrders.reduce((sum: number, o: any) => sum + Number(o.amount || 0), 0);
      return { category: cat.name, value: total };
    }).filter(c => c.value > 0);
  }

  const COLORS = ["#6366f1", "#f59e42", "#10b981", "#ef4444", "#fbbf24", "#3b82f6", "#a21caf", "#eab308"];

  // Ajout de la constante IMAGE_BASE_URL
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8082";

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mt-5">
            Tableau de bord
          </h1>
          {user && (
            <p className="mt-2 text-lg text-gray-700">
              Bonjour, {user.firstname}!
            </p>
          )}
        </div>
      </div>

      {/* Cartes stats compactes */}
      <div className="mt-8">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white px-3 pt-3 pb-4 shadow flex flex-col items-center"
              style={{ minWidth: 0 }}
            >
              <div className="flex items-center space-x-2">
                <div className="rounded-md bg-indigo-500 p-2">
                  <item.icon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="truncate text-xs text-gray-500">{item.name}</p>
                  <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </dl>
      </div>

      {/* --- Statistiques avancées --- */}
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Histogramme des ventes par jour */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ventes par jour</h2>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesByDayData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" name="Ventes (€)" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Histogramme multi-couches du panier moyen par catégorie */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Panier moyen par catégorie</h2>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={avgBasketByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" name="Panier moyen (€)" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Camembert répartition des ventes par catégorie */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Répartition des ventes par catégorie</h2>
          <div className="flex-1 min-h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ category }) => category}
                >
                  {salesByCategory.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Commandes récentes
            </h2>
            <span
              onClick={() => navigate("/dashboard/orders")}
              className="text-sm text-indigo-600 hover:text-indigo-900 cursor-pointer"
            >
              Voir tout
            </span>
          </div>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {recentOrders.map((order: any) => (
                <li key={order.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Commande #{order.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-sm font-medium text-gray-900">
                        {order.amount} €
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Tickets de support
            </h2>
            <span
              onClick={() => navigate("/dashboard/support")}
              className="text-sm text-indigo-600 hover:text-indigo-900 cursor-pointer"
            >
              Voir tout
            </span>
          </div>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {recentSupportTickets.map((ticket: any) => (
                <li key={ticket.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          ticket.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : ticket.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Produits récents
            </h2>
            <span
              onClick={() => navigate("/dashboard/products")}
              className="text-sm text-indigo-600 hover:text-indigo-900 cursor-pointer"
            >
              Voir tout
            </span>
          </div>
          <div className="flow-root">
            {recentProducts && recentProducts.length > 0 ? (
              <ul className="-my-5 divide-y divide-gray-200">
                {recentProducts.map((product) => (
                  <li key={product.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={normalizeImageUrl(product.images[0].url)}
                            alt={product.name}
                            className="h-12 w-12 rounded-md object-cover"
                            onError={e => {
                              const img = e.target as HTMLImageElement;
                              img.onerror = null;
                              img.src = "https://placehold.co/400x300?text=Image+non+disponible";
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {product.description || "Non spécifié"}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-sm font-medium text-gray-900">
                          {product.price}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Aucun produit disponible
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Catégories récentes
            </h2>
            <span
              onClick={() => navigate("/dashboard/categories")}
              className="text-sm text-indigo-600 hover:text-indigo-900 cursor-pointer"
            >
              Voir tout
            </span>
          </div>
          <div className="flow-root">
            {recentCategories && recentCategories.length > 0 ? (
              <ul className="-my-5 divide-y divide-gray-200">
                {recentCategories.map((category) => (
                  <li key={category.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {category.images && category.images.length > 0 ? (
                          <img
                            src={normalizeImageUrl(category.images[0].url)}
                            alt={category.name}
                            className="h-12 w-12 rounded-md object-cover"
                            onError={e => {
                              const img = e.target as HTMLImageElement;
                              img.onerror = null;
                              img.src = "https://placehold.co/400x300?text=Image+non+disponible";
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                            <Folder className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {category.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {category.products.length || 0} produits
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Aucune catégorie disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
