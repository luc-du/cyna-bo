import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  mockDashboardStats,
  mockOrders,
  mockSupportTickets,
} from "../mocks/data";
import { formatCurrency } from "../lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/authStore";
import type { RootState, AppDispatch } from "../store/store";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useSelector(
    (state: RootState) => state.auth as { user: any; loading: boolean; isAuthenticated: boolean }
  );
  const [profileFetched, setProfileFetched] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !profileFetched && !loading) {
      dispatch(fetchUserProfile())
        .unwrap()
        .then(() => setProfileFetched(true))
        .catch(() => {
          console.error("Redirection due to profile fetch failure");
          navigate("/login");
        });
    }
  }, [isAuthenticated, profileFetched, loading, dispatch, navigate]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user || !user.firstname) {
    return <div>Impossible de charger le profil utilisateur.</div>;
  }

  const stats = [
    {
      name: "Total des ventes",
      value: formatCurrency(mockDashboardStats.totalSales),
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      name: "Total des commandes",
      value: mockDashboardStats.totalOrders,
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      name: "Valeur moyenne des commandes",
      value: formatCurrency(mockDashboardStats.averageOrderValue),
      change: "-3.1%",
      trend: "down",
      icon: BarChart3,
    },
    {
      name: "Produits actifs",
      value: mockDashboardStats.activeProducts,
      change: "+2.3%",
      trend: "up",
      icon: Package,
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mt-5">
            Tableau de bord
          </h1>
          {user && (
            <p className="mt-2 text-lg text-gray-700">
              Bienvenue, {user.firstname}!
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
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    item.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="ml-1">{item.change}</span>
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Commandes récentes */}
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
              {mockOrders.slice(0, 3).map((order) => (
                <li key={order.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Commande #{order.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tickets de support */}
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
              {mockSupportTickets.slice(0, 3).map((ticket) => (
                <li key={ticket.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
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
    </div>
  );
}
