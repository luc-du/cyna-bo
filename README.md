# Cyna Back Office (cyna-bo)

Cyna Back Office (cyna-bo) est une application web d'administration développée avec React, TypeScript, Redux Toolkit et Vite. Elle permet la gestion centralisée des produits, catégories, commandes, utilisateurs, support et paramètres pour la plateforme Cyna.

## Fonctionnalités principales

- **Authentification sécurisée** (connexion, inscription, gestion du token JWT)
- **Dashboard** avec statistiques (ventes, commandes, produits actifs, etc.) et graphiques dynamiques
- **Gestion des produits** (CRUD, recherche, édition, suppression multiple, visualisation détaillée)
- **Gestion des catégories**
- **Gestion des commandes**
- **Gestion des utilisateurs**
- **Support client** (tickets)
- **Gestion du carrousel d’images**
- **Paramètres de l’application**
- **Notifications toast**
- **Interface responsive et moderne (Tailwind CSS)**

## Stack technique

- **React 18** + **TypeScript**
- **Redux Toolkit** (gestion d’état)
- **Vite** (build et développement rapide)
- **Tailwind CSS** (UI)
- **Jest** & **Testing Library** (tests)
- **Axios** (requêtes API)
- **Chart.js** & **Recharts** (visualisation de données)
- **react-router-dom** (navigation)
- **react-hot-toast** (notifications)

## Installation

1. **Cloner le dépôt**

```bash
 git clone <repo-url>
 cd cyna-bo
```

2. **Installer les dépendances**

```bash
 npm install
```

3. **Configurer les variables d’environnement**

Copiez `.env.development` en `.env` et adaptez les variables si besoin.

4. **Lancer l’application en développement**

```bash
 npm run dev
```

L’application sera accessible sur [http://localhost:5173](http://localhost:5173) par défaut.

## Scripts utiles

- `npm run dev` : Démarre le serveur de développement
- `npm run build` : Build de production
- `npm run preview` : Prévisualisation du build
- `npm run lint` : Lint du code
- `npm run test` : Lancer les tests

## Structure du projet

```
cyna-bo/
 ├── src/
 │   ├── assets/           # Images et ressources statiques
 │   ├── components/       # Composants réutilisables et layouts
 │   ├── pages/            # Pages principales (Dashboard, Produits, etc.)
 │   ├── store/            # Redux stores (auth, produits, catégories...)
 │   ├── utils/            # Fonctions utilitaires
 │   ├── styles/           # Styles globaux
 │   └── ...
 ├── public/               # Fichiers statiques publics
 ├── package.json
 ├── vite.config.ts
 └── ...
```

## Tests

Les tests sont écrits avec Jest et Testing Library. Pour lancer les tests :

```bash
npm run test
```

## Contribution

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commitez vos modifications (`git commit -am 'feat: nouvelle fonctionnalité'`)
4. Pushez la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

## Auteurs

- Lucas (Junia)
- Équipe Cyna

## Licence

Ce projet est sous licence MIT.

