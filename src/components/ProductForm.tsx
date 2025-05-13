import React from "react";

interface ProductFormProps {
  form: any;
  errors: { [key: string]: string };
  categories: Array<{ id: number; name: string }>;
  onChange: (field: string, value: any) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (idx: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  mode: "create" | "edit";
}

const ProductForm: React.FC<ProductFormProps> = ({
  form,
  errors,
  categories,
  onChange,
  onImageChange,
  onImageRemove,
  onSubmit,
  mode,
}) => {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Nom</label>
        <input
          type="text"
          placeholder="Nom du produit"
          value={form.name}
          onChange={e => onChange("name", e.target.value)}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Marque</label>
        <input
          type="text"
          placeholder="Marque du produit"
          value={form.brand}
          onChange={e => onChange("brand", e.target.value)}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
      </div>
      <div className="col-span-2 space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          placeholder="Description détaillée du produit"
          value={form.description}
          onChange={e => onChange("description", e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>
      <div className="col-span-2 space-y-1">
        <label className="block text-sm font-medium text-gray-700">Caractéristiques</label>
        <textarea
          placeholder="Caractéristiques techniques du produit"
          value={form.caracteristics}
          onChange={e => onChange("caracteristics", e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.caracteristics && <p className="text-red-500 text-xs mt-1">{errors.caracteristics}</p>}
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Modèle de tarification</label>
        <select
          value={form.pricingModel}
          onChange={e => onChange("pricingModel", e.target.value)}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="PER_MONTH_PER_USER">Par mois / utilisateur</option>
          <option value="PER_YEAR_PER_USER">Par an / utilisateur</option>
          <option value="PER_MONTH_PER_DEVICE">Par mois / appareil</option>
          <option value="PER_YEAR_PER_DEVICE">Par an / appareil</option>
          <option value="PAY_AS_YOU_GO">Payer en une fois</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Prix</label>
        <div className="mt-1 relative rounded-lg shadow-sm">
          <input
            type="number"
            placeholder="Prix"
            value={form.amount}
            onChange={e => onChange("amount", e.target.value)}
            className="block w-full rounded-lg border-gray-300 pl-7 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500">€</span>
          </div>
        </div>
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Catégorie</label>
        <select
          value={form.categoryId}
          onChange={e => onChange("categoryId", e.target.value)}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Sélectionner une catégorie</option>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))
          ) : (
            <option disabled>Aucune catégorie disponible</option>
          )}
        </select>
        {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Statut</label>
        <select
          value={form.status}
          onChange={e => onChange("status", e.target.value)}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="AVAILABLE">Disponible</option>
          <option value="DISCONTINUED">Arrêté</option>
          <option value="OUT_OF_STOCK">Rupture</option>
        </select>
        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Promotion</label>
        <div className="flex items-center mt-1">
          <input
            type="checkbox"
            checked={form.promo}
            onChange={e => onChange("promo", e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            id={mode === "create" ? "create-promo-checkbox" : "edit-promo-checkbox"}
          />
          <label htmlFor={mode === "create" ? "create-promo-checkbox" : "edit-promo-checkbox"} className="ml-2 text-sm text-gray-700">
            Ce produit est en promotion
          </label>
        </div>
      </div>
      <div className="col-span-2 space-y-1">
        <label className="block text-sm font-medium text-gray-700">Images</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label htmlFor={mode === "create" ? "file-upload" : "file-upload-edit"} className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Télécharger des fichiers</span>
                <input
                  id={mode === "create" ? "file-upload" : "file-upload-edit"}
                  name={mode === "create" ? "file-upload" : "file-upload-edit"}
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={onImageChange}
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
            <div className="mt-2 grid grid-cols-4 gap-2">
              {Array.from(form.images as File[]).map((file: File, idx: number) => (
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
                    onClick={() => onImageRemove(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="col-span-2 flex justify-end space-x-3 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={() => onChange("cancel", null)}
          className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          {mode === "create" ? "Ajouter le produit" : "Sauvegarder les modifications"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
