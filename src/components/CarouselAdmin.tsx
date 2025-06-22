import React, { useEffect, useState } from "react";
import { X, GripVertical, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { normalizeImageUrl } from "@/utils/imageUtils";

// API base for carousel endpoints
const API_BASE = "/api/v1/carousel";
// Helper to get auth headers from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  return { Authorization: `Bearer ${token}` };
};

type CarouselSection = {
  id?: number;
  title: string;
  text: string;
  imageUrl?: string;
  image?: File | null;
  productId?: number;
  categoryId?: number;
};

export default function CarouselAdmin() {
  // State for carousel sections
  const [sections, setSections] = useState<CarouselSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CarouselSection | null>(null);
  const [addForm, setAddForm] = useState<CarouselSection>({
    title: "",
    text: "",
    image: null,
    productId: undefined,
    categoryId: undefined,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  // Supprimer la pagination : plus de page ni pageSize
  // const [page, setPage] = useState(1);
  // const pageSize = 10;

  // Fetch all carousel sections from API
  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      // Appel simple sans paramètres de pagination
      const res = await fetch(API_BASE, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Error loading carousel");
      const data = await res.json();
      setSections(Array.isArray(data) ? data : []);
      // Ajout d'un log pour vérifier si le dernier élément créé est bien dans la liste
      if (Array.isArray(data)) {
        const last = data.find(
          (item: any) =>
            item.title === addForm.title &&
            item.text === addForm.text
        );
        if (!last) {
          console.warn("[fetchSections] L'élément créé n'est pas dans la liste reçue !");
        } else {
          console.log("[fetchSections] L'élément créé est bien présent dans la liste.");
        }
      }
    } catch (e: any) {
      setError(e?.message || "Error loading carousel");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line
  }, []); // <-- plus de dépendance à page

  // Drag and drop handlers for reordering sections
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newSections = [...sections];
    const [removed] = newSections.splice(dragIdx, 1);
    newSections.splice(idx, 0, removed);
    setSections(newSections);
    setDragIdx(idx);
  };
  const handleDragEnd = async () => {
    setDragIdx(null);
    // Optionally: update order in backend if needed
  };

  // Edit section handlers
  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditForm({ ...sections[idx], image: null });
  };
  const handleEditChange = (field: keyof CarouselSection, value: any) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  };
  const handleEditImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditForm((prev) => prev ? { ...prev, image: e.target.files![0] } : prev);
    }
  };
  const handleEditSave = async () => {
    if (!editForm || editIdx === null) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("id", String(editForm.id));
      formData.append("title", editForm.title);
      formData.append("text", editForm.text);
      if (editForm.productId) formData.append("productId", String(editForm.productId));
      if (editForm.categoryId) formData.append("categoryId", String(editForm.categoryId));
      // Correction : n'envoyer l'image et replaceImage que si une nouvelle image est sélectionnée
      if (editForm.image) {
        formData.append("images", editForm.image);
        formData.append("replaceImage", "true");
      } else {
        formData.append("replaceImage", "false");
      }
      const res = await fetch(API_BASE, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: formData,
      } as any);
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Error updating section");
      }
      setEditIdx(null);
      setEditForm(null);
      fetchSections();
    } catch (e: any) {
      setError(e?.message || "Error updating section");
    }
    setLoading(false);
  };

  // Delete section handler
  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Delete this carousel section?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Error deleting section");
      fetchSections();
    } catch (e: any) {
      setError(e?.message || "Error deleting section");
    }
    setLoading(false);
  };

  // Add section handlers
  const handleAddChange = (field: keyof CarouselSection, value: any) => {
    setAddForm({ ...addForm, [field]: value });
  };
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAddForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", addForm.title);
      formData.append("text", addForm.text);
      if (addForm.image) {
        formData.append("images", addForm.image);
      } else {
        setAddLoading(false);
        setError("Veuillez sélectionner une image.");
        return;
      }
      if (addForm.productId) formData.append("productId", String(addForm.productId));
      if (addForm.categoryId) formData.append("categoryId", String(addForm.categoryId));

      // LOG: Affichage du contenu du FormData
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`[FormData] ${key}:`, value.name, value.type, value.size);
        } else {
          console.log(`[FormData] ${key}:`, value);
        }
      }
      console.log("[Fetch] Authorization header:", getAuthHeaders().Authorization);

      const res = await fetch(API_BASE, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: getAuthHeaders().Authorization
        },
      });
      // LOG: Affichage du status de la réponse
      console.log("[Fetch] Status:", res.status);
      if (!res.ok) {
        const msg = await res.text();
        console.error("[Fetch] Error response:", msg);
        throw new Error(msg || "Error adding section");
      }
      // Ajout d'un log pour la réponse du POST
      const responseBody = await res.json().catch(() => null);
      console.log("[handleAdd] POST response body:", responseBody);
      setAddForm({ title: "", text: "", image: null, productId: undefined, categoryId: undefined });
      fetchSections();
    } catch (e: any) {
      setError(e?.message || "Error adding section");
      console.error("[handleAdd] Exception:", e);
    }
    setAddLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Carousel Management</h2>
      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-lg shadow p-4 mb-8 flex flex-col gap-3"
        encType="multipart/form-data"
      >
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Title"
            value={addForm.title}
            onChange={e => handleAddChange("title", e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={addForm.text}
            onChange={e => handleAddChange("text", e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            required
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleAddImage}
            className="block"
            required
          />
          {addForm.image && (
            <img
              src={URL.createObjectURL(addForm.image as File)}
              alt="Preview"
              className="h-16 w-16 object-cover rounded"
            />
          )}
          <button
            type="submit"
            className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
            disabled={addLoading}
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </form>
      {/* Error/Loading */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {loading && (
        <div className="mb-4 flex items-center gap-2 text-indigo-600">
          <Loader2 className="animate-spin" /> Loading...
        </div>
      )}
      {/* Carousel sections */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div
            key={section.id || idx}
            className="bg-white rounded-lg shadow p-4 flex items-center gap-4 relative"
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            style={{
              opacity: dragIdx === idx ? 0.5 : 1,
              border: dragIdx === idx ? "2px dashed #6366f1" : undefined,
            }}
          >
            <div className="cursor-grab mr-2 text-gray-400">
              <GripVertical />
            </div>
              <img
              src={normalizeImageUrl(section.imageUrl || "")}
              alt={section.title}
              className="h-20 w-20 object-cover rounded"
            />
            {editIdx === idx ? (
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={editForm?.title || ""}
                  onChange={e => handleEditChange("title", e.target.value)}
                  className="border rounded px-2 py-1"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={editForm?.text || ""}
                  onChange={e => handleEditChange("text", e.target.value)}
                  className="border rounded px-2 py-1"
                  placeholder="Description"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImage}
                  className="block"
                />
                {editForm?.image ? (
                  <img
                    src={URL.createObjectURL(editForm.image as File)}
                    alt="Preview"
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  section.imageUrl && (
                    <img
                      src={normalizeImageUrl(section.imageUrl || "")}
                      alt="Current"
                      className="h-12 w-12 object-cover rounded"
                    />
                  )
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleEditSave}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    disabled={loading}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditIdx(null);
                      setEditForm(null);
                    }}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <div className="font-bold">{section.title}</div>
                <div className="text-gray-600">{section.text}</div>
              </div>
            )}
            {editIdx !== idx && (
              <div className="flex flex-col gap-2 ml-2">
                <button
                  onClick={() => handleEdit(idx)}
                  className="text-indigo-600 hover:bg-indigo-50 rounded p-1"
                  title="Edit"
                >
                  <Edit2 />
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="text-red-600 hover:bg-red-50 rounded p-1"
                  title="Delete"
                >
                  <Trash2 />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Pagination controls */}
      {/* 
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Précédent
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Suivant
        </button>
      </div>
      */}
    </div>
  );
}
