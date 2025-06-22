import notification from "./notification";

/**
 * Utilitaires pour gérer les opérations critiques avec confirmation et notifications
 */
const confirmationUtils = {
  /**
   * Gestion de la suppression d'un élément avec confirmation et gestion des erreurs
   * 
   * @param options Configuration de la suppression
   * @returns Promise qui se résout quand l'opération est terminée
   */
  deleteItem: async <T>({
    itemName,
    itemId,
    deleteFunction,
    onSuccess,
    confirmMessage,
    successMessage,
    errorMessage = "Une erreur est survenue lors de la suppression",
    refreshFunction,
    withoutConfirm = false,
  }: {
    itemName: string;
    itemId: number | string;
    deleteFunction: (id: any) => Promise<any>;
    onSuccess?: () => void;
    confirmMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    refreshFunction?: () => Promise<any>;
    withoutConfirm?: boolean;
  }): Promise<boolean> => {
    try {
      // Si pas de confirmation requise ou si l'utilisateur confirme
      if (withoutConfirm || window.confirm(confirmMessage || `Êtes-vous sûr de vouloir supprimer "${itemName}" ?`)) {
        // Exécute la fonction de suppression
        await deleteFunction(itemId);
        
        // Notification de succès
        notification.success(successMessage || `"${itemName}" a été supprimé avec succès`);
        
        // Rafraîchit les données si nécessaire
        if (refreshFunction) {
          await refreshFunction();
        }
        
        // Exécute le callback de succès si fourni
        if (onSuccess) {
          onSuccess();
        }
        
        return true;
      }
      return false;
    } catch (error: any) {
      // Affiche une notification d'erreur
      notification.error(`${errorMessage}: ${error?.message || error}`);
      console.error("Error during delete operation:", error);
      return false;
    }
  },
  
  /**
   * Gestion de la suppression multiple avec confirmation et gestion des erreurs
   * 
   * @param options Configuration de la suppression multiple
   * @returns Promise qui se résout quand l'opération est terminée
   */
  deleteMultipleItems: async <T>({
    itemsCount,
    itemsIds,
    itemsType = "éléments",
    deleteFunction,
    onSuccess,
    confirmMessage,
    successMessage,
    errorMessage = "Une erreur est survenue lors de la suppression",
    refreshFunction,
    withoutConfirm = false,
  }: {
    itemsCount: number;
    itemsIds: (number | string)[];
    itemsType?: string;
    deleteFunction: (ids: any[]) => Promise<any>;
    onSuccess?: () => void;
    confirmMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    refreshFunction?: () => Promise<any>;
    withoutConfirm?: boolean;
  }): Promise<boolean> => {
    if (itemsIds.length === 0) return false;
    
    try {
      // Si pas de confirmation requise ou si l'utilisateur confirme
      if (withoutConfirm || window.confirm(confirmMessage || `Êtes-vous sûr de vouloir supprimer ${itemsCount} ${itemsType} ?`)) {
        // Exécute la fonction de suppression
        await deleteFunction(itemsIds);
        
        // Notification de succès
        notification.success(successMessage || `${itemsCount} ${itemsType} ont été supprimés avec succès`);
        
        // Rafraîchit les données si nécessaire
        if (refreshFunction) {
          await refreshFunction();
        }
        
        // Exécute le callback de succès si fourni
        if (onSuccess) {
          onSuccess();
        }
        
        return true;
      }
      return false;
    } catch (error: any) {
      // Affiche une notification d'erreur
      notification.error(`${errorMessage}: ${error?.message || error}`);
      console.error("Error during bulk delete operation:", error);
      return false;
    }
  },
  
  /**
   * Exécute une action critique avec confirmation et gestion des erreurs
   * 
   * @param options Configuration de l'action
   * @returns Promise qui se résout quand l'opération est terminée
   */
  performCriticalAction: async <T>({
    actionName,
    targetName,
    confirmMessage,
    actionFunction,
    onSuccess,
    successMessage,
    errorMessage,
    refreshFunction,
    withoutConfirm = false,
  }: {
    actionName: string;
    targetName: string;
    confirmMessage?: string;
    actionFunction: () => Promise<any>;
    onSuccess?: () => void;
    successMessage?: string;
    errorMessage?: string;
    refreshFunction?: () => Promise<any>;
    withoutConfirm?: boolean;
  }): Promise<boolean> => {
    try {
      // Si pas de confirmation requise ou si l'utilisateur confirme
      if (withoutConfirm || window.confirm(confirmMessage || `Êtes-vous sûr de vouloir ${actionName} "${targetName}" ?`)) {
        // Exécute la fonction d'action
        await actionFunction();
        
        // Notification de succès
        notification.success(successMessage || `Action "${actionName}" réalisée avec succès sur "${targetName}"`);
        
        // Rafraîchit les données si nécessaire
        if (refreshFunction) {
          await refreshFunction();
        }
        
        // Exécute le callback de succès si fourni
        if (onSuccess) {
          onSuccess();
        }
        
        return true;
      }
      return false;
    } catch (error: any) {
      // Affiche une notification d'erreur
      notification.error(`${errorMessage || `Erreur lors de l'action "${actionName}"`}: ${error?.message || error}`);
      console.error(`Error during ${actionName} operation:`, error);
      return false;
    }
  }
};

export default confirmationUtils;
