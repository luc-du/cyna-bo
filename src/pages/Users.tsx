import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../store/userStore";
import type { RootState, AppDispatch } from "../store/store";

// Composant Modal simple pour la confirmation
const Modal = ({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md max-w-sm">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.users
  );

  const [newUser, setNewUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    roles: "ADMIN",
  });
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleCreateUser = () => {
    // Validation basique
    if (!newUser.firstname || !newUser.lastname || !newUser.email) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    dispatch(createUser(newUser));
    setNewUser({ firstname: "", lastname: "", email: "", roles: "ADMIN" });
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      const userData = {
        firstname: editingUser.firstname,
        lastname: editingUser.lastname,
        email: editingUser.email,
        phone: editingUser.phone || null,
        roles: editingUser.roles, // Utilisation de "roles" de manière cohérente
        password: editingUser.password || null,
        profile: editingUser.profile || null,
        enabled: editingUser.enabled,
      };
      dispatch(updateUser({ id: editingUser.id, userData }));
      setEditingUser(null);
    }
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete.id));
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Modal de confirmation pour la suppression */}
      <Modal
        isOpen={!!userToDelete}
        title="Confirmation de suppression"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
      <h1 className="text-2xl font-semibold text-gray-900">
        Gestion des utilisateurs
      </h1>
      <p className="mt-2 text-sm text-gray-700">
        Liste des utilisateurs enregistrés dans l'application.
      </p>
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="mt-8">
          {/* Formulaire de création d'utilisateur */}
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Créer un nouvel utilisateur
            </h2>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Prénom"
                value={newUser.firstname}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstname: e.target.value })
                }
                className="border rounded px-2 py-1"
              />
              <input
                type="text"
                placeholder="Nom"
                value={newUser.lastname}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastname: e.target.value })
                }
                className="border rounded px-2 py-1"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="border rounded px-2 py-1"
              />
              <button
                onClick={handleCreateUser}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Créer
              </button>
            </div>
          </div>
          {/* Tableau des utilisateurs */}
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Nom
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Rôle
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {editingUser?.id === user.id ? (
                      <input
                        type="text"
                        value={editingUser.firstname}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            firstname: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      `${user.firstname} ${user.lastname}`
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {editingUser?.id === user.id ? (
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            email: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {editingUser?.id === user.id ? (
                      <input
                        type="text"
                        value={editingUser.roles}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            roles: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      user.roles || user.role
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 space-x-2">
                    {editingUser?.id === user.id ? (
                      <>
                        <button
                          onClick={handleUpdateUser}
                          className="bg-green-600 text-white px-4 py-2 rounded"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="bg-yellow-600 text-white px-4 py-2 rounded"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="bg-red-600 text-white px-4 py-2 rounded"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
