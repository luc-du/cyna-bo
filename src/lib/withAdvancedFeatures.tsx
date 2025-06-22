import React from 'react';
import { ConfirmProvider } from './confirmContext';

/**
 * HOC pour intégrer les fonctionnalités avancées (confirmations, notifications) 
 * dans les composants de pages existants
 * 
 * @param WrappedComponent Le composant à enrichir
 * @returns Le composant enrichi avec les confirmations et notifications
 */
const withAdvancedFeatures = (WrappedComponent: React.ComponentType<any>) => {
  const WithAdvancedFeatures = (props: any) => {
    return (
      <ConfirmProvider>
        <WrappedComponent {...props} />
      </ConfirmProvider>
    );
  };
  
  // Définir un nom d'affichage pour les outils de développement
  WithAdvancedFeatures.displayName = `WithAdvancedFeatures(${getDisplayName(WrappedComponent)})`;
  
  return WithAdvancedFeatures;
};

// Utilitaire pour récupérer le nom d'affichage du composant
function getDisplayName(WrappedComponent: React.ComponentType<any>) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withAdvancedFeatures;
