# SavoirBox - Plateforme de Gestion Multimédia

Application full-stack de gestion de vidéos YouTube, documents PDF, et fichiers audio avec système de monétisation gratuit/payant.

## Stack Technique

| Composant   | Technologie                               |
| ----------- | ----------------------------------------- |
| Frontend    | React 18, Vite, TailwindCSS, DaisyUI      |
| Backend     | Node.js, Express                          |
| Base de données | PostgreSQL (Supabase/Neon)            |
| Auth        | JWT (JSON Web Tokens) + bcrypt            |
| Déploiement Frontend | Vercel                         |
| Déploiement Backend  | Render                         |

## Structure du Projet

```
SavoirBox/
├── backend/             # API Express
│   ├── src/
│   │   ├── config/      # Connexion DB
│   │   ├── controllers/ # Logique métier
│   │   ├── middleware/   # Auth, upload
│   │   └── routes/      # Endpoints
│   ├── scripts/         # Seed admin
│   ├── migrations/      # SQL
│   └── uploads/         # Fichiers uploadés
├── frontend/            # Application React
│   └── src/
│       ├── components/
│       ├── context/     # AuthContext
│       ├── pages/       # Pages publiques + admin
│       └── services/    # API client (axios)
└── database/            # Schéma SQL
```

## Installation Locale

### 1. Prérequis

- Node.js 18+
- PostgreSQL (localement ou via Supabase/Neon)

### 2. Base de données

```bash
# Créer la base PostgreSQL
createdb sitevideo

# Exécuter les migrations (dans backend/)
npm run migrate
```

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env  # Modifier DATABASE_URL et JWT_SECRET
npm run dev           # Lance sur http://localhost:5000
```

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev           # Lance sur http://localhost:5173
```

### 5. Créer l'admin

```bash
cd backend
node scripts/seed.js
# Email: admin@savoirbox.com
# Mot de passe: Admin123!
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil (auth requis)
- `PUT /api/auth/profile` - Modifier profil (auth requis)

### Contenus
- `GET /api/contents` - Liste (filtres: type, status, category, search, page, limit)
- `GET /api/contents/categories` - Liste des catégories
- `GET /api/contents/:id` - Détail
- `POST /api/contents` - Créer (auth requis)
- `PUT /api/contents/:id` - Modifier (auth requis)
- `DELETE /api/contents/:id` - Supprimer (auth requis)

### Achats
- `POST /api/purchases` - Acheter un contenu
- `GET /api/purchases/mine` - Mes achats
- `GET /api/purchases/check/:content_id` - Vérifier accès

### Admin
- `GET /api/admin/stats` - Statistiques dashboard
- `GET /api/admin/users` - Liste utilisateurs
- `PUT /api/admin/users/:id` - Modifier utilisateur (ban/rôle)
- `GET /api/admin/contents` - Tous les contenus
- `GET /api/admin/purchases` - Historique ventes
- `POST /api/admin/categories` - Créer catégorie
- `DELETE /api/admin/categories/:id` - Supprimer catégorie

## Déploiement

### Frontend → Vercel

```bash
cd frontend
npm run build
# Connecter le dépôt GitHub à Vercel
# Variable d'environnement: VITE_API_URL=https://votre-api.render.com/api
```

### Backend → Render

```bash
# 1. Créer un Web Service sur Render
# 2. Build Command: npm install
# 3. Start Command: node server.js
# 4. Variables d'environnement:
#    - DATABASE_URL: PostgreSQL URL (Neon.tech ou Supabase)
#    - JWT_SECRET: Clé secrète aléatoire
#    - FRONTEND_URL: https://votre-app.vercel.app
#    - NODE_ENV: production
```

### Base de données → Neon.tech (gratuite à vie)

1. Créer compte sur https://neon.tech
2. Créer un projet
3. Copier la connexion string (DATABASE_URL)

## Sécurité

- **Mots de passe**: Hashés avec bcrypt (12 rounds)
- **JWT**: Token signé, expire après 7 jours
- **SQL**: Requêtes paramétrées (prévention injections)
- **Headers HTTP**: Helmet.js (XSS, clickjacking)
- **CORS**: Restreint au domaine frontend
- **Rate Limiting**: 100 requêtes/15 min par IP
- **Fichiers**: Validation de type et taille max 100MB
