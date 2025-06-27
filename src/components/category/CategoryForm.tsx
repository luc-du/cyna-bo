import { useState, useEffect } from "react";
import { useAppDispatch } from "../../store/hooks";
import { createCategory, updateCategory } from "../../store/categoryStore";
import { X } from "lucide-react";

interface CategoryFormProps {
  mode: "create" | "edit";
  onClose: () => void;
  categoryId?: number;
  initialValues?: any;
}

export const CategoryForm = ({ 
  mode, 
  onClose, 
  categoryId, 
  initialValues 
}: CategoryFormProps) => {
  const dispatch = useAppDispatch();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    images: [] as File[]
  });

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setForm({
        name: initialValues.name || "",
        description: initialValues.description || "",
        images: [] 
      });
    }
  }, [mode, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("name", form.name);

    // Always include description, even if empty
    formData.append("description", form.description || "");
    
    if (form.images && form.images.length > 0) {
      const imageFiles = [...form.images];
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      if (mode === "edit" && categoryId) {
        formData.append("id", categoryId.toString());
        await dispatch(updateCategory({ categoryId, formData })).unwrap();
      } else {
        await dispatch(createCategory(formData)).unwrap();
      }
      onClose();
    } catch (error: any) {
      console.error("Error submitting category form:", error);
      setError(error.message || "Une erreur s'est produite lors de la soumission du formulaire");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const currentImages = [...form.images];
      const newImages = Array.from(e.target.files);
      
      setForm({ 
        ...form, 
        images: [...currentImages, ...newImages] 
      });
      
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl transform transition-all duration-300 animate-fadeIn overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {mode === "create" ? "Ajouter une catégorie" : "Modifier la catégorie"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Nom de la catégorie"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Description de la catégorie"
            ></textarea>
          </div>
          
          {mode === "edit" && initialValues?.images && initialValues.images.length > 0 && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Images existantes</label>
              <div className="grid grid-cols-3 gap-4">
                {initialValues.images.map((image: any, idx: number) => {
                  const imageUrl = image.url?.startsWith("http")
                    ? image.url
                    : `http://localhost:8082${image.url}`;
                  return (
                    <div key={idx} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Catégorie ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => setPreviewImage(imageUrl)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {mode === "edit" ? "Ajouter de nouvelles images" : "Images"}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="category-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Télécharger des fichiers</span>
                    <input 
                      id="category-file-upload" 
                      name="category-file-upload" 
                      type="file" 
                      multiple 
                      className="sr-only"
                      onChange={(e) => handleImageChange(e)}
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
              </div>
            </div>
            {form.images.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">{form.images.length} fichier(s) sélectionné(s)</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {Array.from(form.images).map((file, idx) => (
                    <div key={idx} className="relative group">
                      <div className="h-20 w-full rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-gray-500 text-center px-2">
                            {file.name}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...form.images];
                          newImages.splice(idx, 1);
                          setForm({ ...form, images: newImages });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              <p className="font-medium">Erreur:</p>
              <p>{error}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              {mode === "create" ? "Créer" : "Modifier"}
            </button>
          </div>
        </form>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 transition-all duration-300 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-full max-h-full w-full h-full flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                className="text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(null);
                }}
              >
                <X className="h-8 w-8" />
              </button>
            </div>
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
              <img
                src={previewImage}
                alt="Aperçu plein écran"
                className="max-w-full max-h-full object-contain cursor-zoom-in hover:scale-110 transition-transform duration-300"
                onClick={(e) => e.stopPropagation()}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
              Cliquez pour fermer
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
