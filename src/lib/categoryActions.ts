import { useDispatch } from "react-redux";
import { useConfirmation } from "./confirmContext";
import notification from "./notification";
import { 
  deleteCategory, 
  deleteMultipleCategories, 
  fetchCategories 
} from "../store/categoryStore";
import type { AppDispatch } from "../store/store";

/**
 * Hook personnalisé pour les actions sur les catégories
 */
export const useCategoryActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { confirm } = useConfirmation();

  /**
   * Supprimer une catégorie
   */
  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    const confirmed = await confirm({
      title: "Supprimer cette catégorie",
      message: `Êtes-vous sûr de vouloir supprimer "${categoryName}" ? Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      variant: "danger"
    });

    if (confirmed) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        notification.success(`La catégorie "${categoryName}" a été supprimée avec succès`);
        dispatch(fetchCategories());
      } catch (error: any) {
        notification.error(`Erreur lors de la suppression de la catégorie: ${error?.message || "Erreur inconnue"}`);
      }
    }
  };

  /**
   * Supprimer plusieurs catégories à la fois
   */
  const handleBulkDeleteCategories = async (categoryIds: number[]) => {
    if (categoryIds.length === 0) return;
    
    const confirmed = await confirm({
      title: "Suppression en masse",
      message: `Êtes-vous sûr de vouloir supprimer ${categoryIds.length} catégorie(s) ? Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      variant: "danger"
    });

    if (confirmed) {
      try {
        await dispatch(deleteMultipleCategories(categoryIds)).unwrap();
        notification.success(`${categoryIds.length} catégorie(s) ont été supprimées avec succès`);
        dispatch(fetchCategories());
      } catch (error: any) {
        notification.error(`Erreur lors de la suppression des catégories: ${error?.message || "Erreur inconnue"}`);
      }
    }
  };

  return {
    handleDeleteCategory,
    handleBulkDeleteCategories
  };
};
