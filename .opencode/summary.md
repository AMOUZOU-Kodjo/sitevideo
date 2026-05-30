## Goal
- Développer une plateforme full-stack de gestion de vidéos YouTube, documents PDF et audios avec système de monétisation gratuit/payant.

## Constraints & Preferences
- Stack : ReactJS, TailwindCSS, DaisyUI (custom themes), React Router, Node.js/Express, PostgreSQL
- Déploiement : frontend Vercel, backend Render, DB Neon.tech, fichiers Cloudinary
- Sécurité : requêtes paramétrées, JWT, bcrypt, helmet, CORS, rate limiting
- Vidéos/documents payants verrouillés jusqu'au paiement ; aperçu PDF visible avant achat
- Mode light/dark avec persistance localStorage
- Chaîne YouTube dynamique sur la page d'accueil (dernières vidéos + live indicator)

## Progress
### Done
- Architecture full-stack complète (frontend React/Vite + backend Express + PostgreSQL Neon)
- Base de données : 5 tables (users, categories, contents, purchases, reviews)
- Système d'auth JWT complet avec rôles user/admin
- CRUD contenus avec pagination, filtres type/statut/catégorie/recherche
- Upload fichiers vers Cloudinary (documents, audio, thumbnails) via multer-storage-cloudinary
- Backend routes : auth, contents, purchases, admin
- Frontend : AuthContext, ThemeContext, pages publiques + dashboard admin
- Correction Helmet CSP pour embedding PDF et YouTube
- Lecteur PDF avec embed + overlay achat ; extraction auto ID YouTube
- Génération thumbnails PDF : pdfjs-dist côté frontend → canvas → Blob → upload Cloudinary
- ContentCard.jsx : 3 variants (grille, horizontal, mobile) + skeleton loading, badges, boutons Voir/Télécharger/Acheter
- Catalog.jsx : grille responsive (1-5 colonnes) + toggle grille/liste + squelettes
- Cloudinary : stockage fichiers dans dossiers `sitevideo/documents/`, `sitevideo/audio/`, `sitevideo/thumbnails/`
- Home.jsx : 8 sections (hero animé, stats compteurs, features, nouveautés, fonctionnement, premium, carrousel témoignages, CTA)
- Footer.jsx : grille 12 colonnes, newsletter, badges confiance, réseaux sociaux, liens par type
- ThemeContext : toggle light/dark avec `data-theme` sur `<html>` + localStorage
- DaisyUI custom : thèmes light/dark personnalisés (indigo/violet), Inter font, arrondis modernes
- Navbar.jsx : drawer mobile latéral, dropdown Types, user menu avec header gradient
- Admin seedé : `admin@sitevideo.com` / `Admin123!`
- YouTube intégré : backend (RSS feed → fast-xml-parser, scraping channel page pour avatar), route `/api/youtube/latest`, détection live
- YoutubeSection.jsx : player embed, miniature cliquable, live indicator animé, grille vidéos, avatar chaîne
- **Bannière chaîne** : section bannière YouTube entre Hero et Stats sur l'accueil, avec image fournie par l'utilisateur

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Passage de `sharp` à `pdfjs-dist` côté frontend pour les thumbnails PDF (pas de dépendance native lourde sur Render)
- Upload thumbnail comme fichier Blob plutôt que data URL string
- Cloudinary pour le stockage distant plutôt que local `uploads/` (Render = filesystem éphémère)
- `multer-storage-cloudinary` avec `fields()` pour accepter fichier + thumbnail simultanément
- DaisyUI conservé mais thèmes entièrement personnalisés (indigo primary, slate base, Inter font)
- Navigation avec refs + event listener `mousedown` pour fermeture des menus
- YouTube via flux RSS public + scraping channel page pour avatar (oEmbed ne retournait pas author_thumbnail_url)
- Bannière YouTube définie manuellement (non extractible du HTML YouTube car chargée dynamiquement)

## Next Steps
- Tester upload PDF avec génération thumbnail + stockage Cloudinary
- Déployer sur Vercel + Render
- Ajouter gestion des utilisateurs (profil, bibliothèque)

## Critical Context
- Port 5000 souvent occupé après arrêt → `taskkill /PID [PID] /F` nécessaire avant `npm run dev`
- Neon DB free tier mise en veille après inactivité (30s timeout configuré)
- Cloudinary free tier : 25GB storage, 25GB bandwidth/mois
- Le thème est persisté dans localStorage sous la clé `sitevideo-theme`
- Les fichiers Cloudinary ne sont pas automatiquement supprimés à la suppression d'un contenu

## Relevant Files
- `frontend/src/pages/Home.jsx`: Hero, section bannière YouTube, stats, features, nouveautés, fonctionnement, premium, témoignages, CTA
- `frontend/src/components/YoutubeSection.jsx`: Player/thumbnail YouTube, live indicator, grille vidéos, avatar chaîne
- `frontend/src/components/ContentCard.jsx`: 3 variants de carte + skeleton, badges, boutons
- `frontend/src/components/layout/Navbar.jsx`: Drawer mobile, dropdown Types, user menu, theme toggle
- `frontend/src/components/layout/Footer.jsx`: Grille 12 cols, newsletter, badges confiance, réseaux
- `backend/src/services/youtube.js`: RSS feed parser, scraping avatar, détection live
- `backend/src/routes/youtube.js`: Route GET /api/youtube/latest
