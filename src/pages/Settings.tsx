import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Lock, User, X } from "lucide-react";

const USER_API_BASE_URL = "/api/v1/user";
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export default function Settings() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    profile: {
      firstname: "",
      lastname: "",
      email: "",
      profile: "",
    },
    security: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    notifications: {
      email: true,
      push: false,
      sms: true,
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${USER_API_BASE_URL}/me`, {
          headers: getAuthHeaders(),
        });
        const user = response.data;
        setFormData({
          profile: {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            profile: user.profile,
          },
          security: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          },
          notifications: {
            email: true, // Default values, adjust based on API response if available
            push: false,
            sms: true,
          },
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur :", error);
      }
    };

    fetchUserData();
  }, []);

  const sections = [
    {
      id: "profile",
      name: "Paramètres du profil",
      icon: User,
      description:
        "Mettez à jour vos informations de profil et vos préférences.",
    },
    {
      id: "security",
      name: "Sécurité",
      icon: Lock,
      description: "Gérez votre mot de passe et vos paramètres de sécurité.",
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: Bell,
      description: "Configurez comment vous recevez les notifications.",
    },
  ];

  const handleSave = async (section: string) => {
    try {
      if (section === "profile") {
        await axios.patch(
          `${USER_API_BASE_URL}/me`,
          {
            firstname: formData.profile.firstname,
            lastname: formData.profile.lastname,
            email: formData.profile.email,
            profile: formData.profile.profile,
          },
          { headers: getAuthHeaders() }
        );
      } else if (section === "security") {
        await axios.patch(
          `${USER_API_BASE_URL}/me/password`,
          {
            currentPassword: formData.security.currentPassword,
            newPassword: formData.security.newPassword,
          },
          { headers: getAuthHeaders() }
        );
      }
      setEditingSection(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des données utilisateur :", error);
    }
  };

  const renderEditForm = (section: string) => {
    switch (section) {
      case "profile":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                type="text"
                value={formData.profile.firstname}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, firstname: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                value={formData.profile.lastname}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, lastname: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.profile.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, email: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profil</label>
              <textarea
                value={formData.profile.profile}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, profile: e.target.value },
                  })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
              <input
                type="password"
                value={formData.security.currentPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    security: {
                      ...formData.security,
                      currentPassword: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
              <input
                type="password"
                value={formData.security.newPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    security: {
                      ...formData.security,
                      newPassword: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={formData.security.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    security: {
                      ...formData.security,
                      confirmPassword: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        email: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Notifications email
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.push}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        push: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Notifications Push
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.sms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        sms: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Notifications SMS
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mt-5">Paramètres</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez les paramètres et les préférences de votre compte.
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {sections.find((s) => s.id === editingSection)?.name}
              </h3>
              <button
                onClick={() => setEditingSection(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(editingSection);
              }}
            >
              {renderEditForm(editingSection)}
              <div className="mt-5 sm:mt-6">
                <button
                  type="submit"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8 divide-y divide-gray-200">
        {sections.map((section) => (
          <div
            key={section.id}
            className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
          >
            <div className="flex items-center">
              <section.icon className="h-5 w-5 text-gray-400 mr-2" />
              <dt className="text-sm font-medium text-gray-500">
                {section.name}
              </dt>
            </div>
            <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <span className="flex-grow">{section.description}</span>
              <span className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingSection(section.id)}
                  className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Mettre à jour
                </button>
              </span>
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}
