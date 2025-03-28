import React, { useState } from "react";
import { mockSupportTickets } from "../mocks/data";
import { X } from "lucide-react";

export default function Support() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const handleViewDetails = (ticketId: string) => {
    setSelectedTicket(ticketId);
  };

  const selectedTicketDetails = mockSupportTickets.find(
    (ticket) => ticket.id === selectedTicket
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Tickets de support
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Une liste de tous les tickets de support et leur statut actuel.
          </p>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && selectedTicketDetails && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Détails du ticket</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Sujet
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedTicketDetails.subject}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Message
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedTicketDetails.message}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Priorité
                </label>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      selectedTicketDetails.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : selectedTicketDetails.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedTicketDetails.priority}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Statut
                </label>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      selectedTicketDetails.status === "open"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedTicketDetails.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedTicketDetails.status.replace("_", " ")}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Créé
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedTicketDetails.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                >
                  Répondre au ticket
                </button>
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
                      Sujet
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Priorité
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
                      Créé
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
                  {mockSupportTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {ticket.subject}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            ticket.status === "open"
                              ? "bg-yellow-100 text-yellow-800"
                              : ticket.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleViewDetails(ticket.id)}
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
