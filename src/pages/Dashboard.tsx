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

      <div className="mt-8">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {item.value}
                </p>
              </dd>
            </div>
          ))}
        </dl>
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
                            src={`http://localhost:8082${product.images[0].url}`}
                            alt={product.name}
                            className="h-12 w-12 rounded-md object-cover"
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
                            src={`http://localhost:8082${category.images[0].url}`}
                            alt={category.name}
                            className="h-12 w-12 rounded-md object-cover"
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
