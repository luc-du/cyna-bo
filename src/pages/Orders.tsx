import React, { useState } from "react";
import { mockOrders, mockProducts } from "../mocks/data";
import { formatCurrency } from "../lib/utils";
import { X } from "lucide-react";

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleViewDetails = (orderId: string) => {
    setSelectedOrder(orderId);
  };

  const getProductName = (productId: string) => {
    const product = mockProducts.find((p) => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  const selectedOrderDetails = mockOrders.find(
    (order) => order.id === selectedOrder
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mt-5">Commandes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Une liste de toutes les commandes, y compris leur statut et leur
            montant.
          </p>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && selectedOrderDetails && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Détails de la commande</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  ID de commande
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedOrderDetails.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Produit
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {getProductName(selectedOrderDetails.productId)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Montant
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatCurrency(selectedOrderDetails.amount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Statut
                </label>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      selectedOrderDetails.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : selectedOrderDetails.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedOrderDetails.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      ID de commande
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Produit
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Montant
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Statut
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Date
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
                  {mockOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {order.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getProductName(order.productId)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
