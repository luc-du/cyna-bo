import React from "react";
import { useConfirmation } from "../lib/confirmContext";
import notification from "../lib/notification";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  enabled: boolean;
}

interface UserTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onToggleActive?: (user: User, activate: boolean) => void;
  loading?: boolean;
}

/**
 * Table des utilisateurs avec confirmation pour les actions critiques
 */
const UserTableEnhanced: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  onToggleActive,
  loading = false,
}) => {
  const { confirm } = useConfirmation();

  // Gestion de la suppression avec confirmation
  const handleDelete = async (user: User) => {
    const confirmed = await confirm({
      title: "Supprimer cet utilisateur",
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ? Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      variant: "danger",
    });

    if (confirmed && onDelete) {
      try {
        onDelete(user);
        notification.success(`L'utilisateur ${user.firstName} ${user.lastName} a été supprimé avec succès`);
      } catch (error: any) {
        notification.error(`Erreur lors de la suppression : ${error?.message || error}`);
      }
    }
  };

  // Gestion de l'activation/désactivation avec confirmation
  const handleToggleActive = async (user: User) => {
    const action = user.enabled ? "désactiver" : "activer";
    const confirmed = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} cet utilisateur`,
      message: `Êtes-vous sûr de vouloir ${action} le compte de ${user.firstName} ${user.lastName} ?`,
      confirmLabel: action.charAt(0).toUpperCase() + action.slice(1),
      cancelLabel: "Annuler",
      variant: user.enabled ? "warning" : "info",
    });

    if (confirmed && onToggleActive) {
      try {
        onToggleActive(user, !user.enabled);
        notification.success(`Le compte de ${user.firstName} ${user.lastName} a été ${user.enabled ? "désactivé" : "activé"} avec succès`);
      } catch (error: any) {
        notification.error(`Erreur lors de la mise à jour du statut : ${error?.message || error}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
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
        {users.length === 0 ? (
          <tr>
            <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
              Aucun utilisateur trouvé
            </td>
          </tr>
        ) : (
          users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="py-4 px-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                {user.email}
              </td>
              <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                {user.phoneNumber || "-"}
              </td>
              <td className="py-4 px-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                }`}>
                  {user.role === "ADMIN" ? "Admin" : "Client"}
                </span>
              </td>
              <td className="py-4 px-4 whitespace-nowrap text-sm">
                <span 
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                    user.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                  onClick={() => onToggleActive && handleToggleActive(user)}
                >
                  {user.enabled ? "Actif" : "Inactif"}
                </span>
              </td>
              <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors duration-200"
                    >
                      Modifier
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(user)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default UserTableEnhanced;
