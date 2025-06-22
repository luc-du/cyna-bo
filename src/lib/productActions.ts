import { useDispatch } from "react-redux";
import { useConfirmation } from "./confirmContext";
import notification from "./notification";
import { 
  deleteProduct, 
  deleteMultipleProducts, 
  updateProduct,
  fetchProducts
} from "../store/productStore";
import type { AppDispatch } from "../store/store";

/**
 * Hook personnalisé pour les actions sur les produits
 */
export const useProductActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { confirm } = useConfirmation();

  /**
   * Supprimer un produit
   */
  const handleDeleteProduct = async (productId: number, productName: string) => {
    const confirmed = await confirm({
      title: "Désactiver ce produit",
      message: `Êtes-vous sûr de vouloir désactiver "${productName}" ? Cette action le retirera de la boutique.`,
      confirmLabel: "Désactiver",
      cancelLabel: "Annuler",
      variant: "warning"
    });

    if (confirmed) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        notification.success(`Le produit "${productName}" a été désactivé avec succès`);
        dispatch(fetchProducts());
      } catch (error: any) {
        notification.error(`Erreur lors de la désactivation du produit: ${error?.message || "Erreur inconnue"}`);
      }
    }
  };

  /**
   * Supprimer plusieurs produits à la fois
   */
  const handleBulkDeleteProducts = async (productIds: number[]) => {
    if (productIds.length === 0) return;
    
    const confirmed = await confirm({
      title: "Suppression en masse",
      message: `Êtes-vous sûr de vouloir désactiver ${productIds.length} produit(s) ?`,
      confirmLabel: "Désactiver",
      cancelLabel: "Annuler",
      variant: "danger"
    });

    if (confirmed) {
      try {
        await dispatch(deleteMultipleProducts(productIds)).unwrap();
        notification.success(`${productIds.length} produit(s) ont été désactivés avec succès`);
        dispatch(fetchProducts());
      } catch (error: any) {
        notification.error(`Erreur lors de la désactivation des produits: ${error?.message || "Erreur inconnue"}`);
      }
    }
  };

  /**
   * Désactiver/activer un produit
   */
  const handleToggleProductStatus = async (product: any, activate: boolean) => {
    const confirmed = await confirm({
      title: activate ? "Activer ce produit" : "Désactiver ce produit",
      message: `Êtes-vous sûr de vouloir ${activate ? 'activer' : 'désactiver'} "${product.name}" ?`,
      confirmLabel: activate ? "Activer" : "Désactiver",
      cancelLabel: "Annuler",
      variant: activate ? "info" : "warning"
    });

    if (confirmed) {
      try {
        const formData = new FormData();
        formData.append("id", String(product.id));
        formData.append("name", product.name);
        formData.append("brand", product.brand || "");
        formData.append("description", product.description || "");
        formData.append("caracteristics", product.caracteristics || "");
        formData.append("pricingModel", product.pricingModel);
        formData.append("amount", String(product.amount));
        formData.append("categoryId", String(product.categoryId || (product.category?.id || "")));
        formData.append("status", product.status);
        formData.append("promo", String(product.promo || false));
        formData.append("active", String(activate));
        formData.append("skipStripeOnError", "true");
        
        await dispatch(updateProduct({ id: product.id, data: formData })).unwrap();
        notification.success(`Le produit "${product.name}" a été ${activate ? 'activé' : 'désactivé'} avec succès`);
        dispatch(fetchProducts());
      } catch (error: any) {
        notification.error(`Erreur lors de la mise à jour du statut: ${error?.message || "Erreur inconnue"}`);
      }
    }
  };

  return {
    handleDeleteProduct,
    handleBulkDeleteProducts,
    handleToggleProductStatus
  };
};
