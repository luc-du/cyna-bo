import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, createUser, updateUser, deleteUser, searchUsers } from "../store/userStore";
import type { RootState, AppDispatch } from "../store/store";

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector((state: RootState) => state.users);
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    role: "",
    enabled: false,
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === "") {
      dispatch(fetchUsers());
    } else {
      dispatch(searchUsers(value));
    }
  };

  const handleEdit = (user: any) => {
    setEditForm({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      role: user.role,
      enabled: user.enabled,
    });
    setEditingUser(user);
  };

  const handleSave = async () => {
    await dispatch(updateUser({ id: editingUser.id, userData: editForm }));
    setEditingUser(null);
    dispatch(fetchUsers()); 
  };
  

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mt-5 mb-4">Gestion des utilisateurs</h1>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Modifier l'utilisateur</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    value={editForm.firstname ||"" }
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstname: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={editForm.lastname || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastname: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="text"
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rôle</label>
                  <select
                    value={editForm.role || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">-- Rôle --</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="CLIENT">CLIENT</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editForm.enabled}
                      onChange={(e) =>
                        setEditForm({ ...editForm, enabled: e.target.checked })
                      }
                    />
                    <span>Compte activé</span>
                  </label>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="submit"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                >
                  Sauvegarder les changements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Confirmation de suppression</h3>
              <button
                onClick={async () => {
                  await dispatch(deleteUser(userToDelete.id));
                  setUserToDelete(null);
                  dispatch(fetchUsers());
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="mb-4">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  await dispatch(deleteUser(userToDelete.id));
                  setUserToDelete(null);
                  dispatch(fetchUsers());
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  dispatch(deleteUser(userToDelete.id));
                  setUserToDelete(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <input type="text" placeholder="Rechercher par nom..." value={searchTerm} onChange={handleSearch} className="mb-4 border px-3 py-2 rounded w-full max-w-md" />

      <table className="min-w-full divide-y divide-gray-300 rounded-lg overflow-hidden shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-4 px-4 text-left text-sm font-semibold">Nom</th>
            <th className="py-4 px-4 text-left text-sm font-semibold">Email</th>
            <th className="py-4 px-4 text-left text-sm font-semibold">Téléphone</th>
            <th className="py-4 px-4 text-left text-sm font-semibold">Rôle</th>
            <th className="py-4 px-4 text-left text-sm font-semibold">Activé</th>
            <th className="py-4 px-4 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.filter((u) => u.id !== Number(loggedInUser?.id)).map((user) => (
            <tr key={user.id} className="hover:bg-gray-100">
              <td className="py-4 px-4">{user.firstname} {user.lastname}</td>
              <td className="py-4 px-4">{user.email}</td>
              <td className="py-4 px-4">{user.phone}</td>
              <td className="py-4 px-4">{user.roles}</td>
              <td className="py-4 px-4">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    user.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.enabled ? "Oui" : "Non"}
                </span>
              </td>
              <td className="py-4 px-4 flex gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors duration-200"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setUserToDelete(user)}
                  className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
