import { useDispatch } from "react-redux";
import { useConfirmation } from "./confirmContext";
import notification from "./notification";
import { 
  cancelSubscription,
  fetchOrders
} from "../store/orderStore";
import type { AppDispatch } from "../store/store";

/**
 * Hook personnalisé pour les actions sur les commandes
 */
export const useOrderActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { confirm } = useConfirmation();

  /**
   * Annuler une commande/abonnement
   */
  const handleCancelSubscription = async (customerId: string, orderNumber: string) => {
    const confirmed = await confirm({
      title: "Annuler cette commande",
      message: `Êtes-vous sûr de vouloir annuler la commande #${orderNumber} ? Cette action est irréversible.`,
      confirmLabel: "Annuler la commande",
      cancelLabel: "Retour",
      variant: "danger"
    });

    if (confirmed) {
      try {
        await dispatch(cancelSubscription(customerId)).unwrap();
        notification.success(`La commande #${orderNumber} a été annulée avec succès`);
        dispatch(fetchOrders());
      } catch (error: any) {
        notification.error(`Erreur lors de l'annulation de la commande: ${error?.message || "Erreur inconnue"}`);
      }
    }
  };

  return {
    handleCancelSubscription
  };
};
