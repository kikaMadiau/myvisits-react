## Prérequis

1. Installer Node.js.
2. Installer les dépendances:

```bash
npm install
```

## Lancer le frontend

```bash
npm run dev
```

Ouvrez ensuite l’URL locale affichée par Vite.

## Configurer le backend

Créez un fichier `.env.local` à la racine du projet:

```bash
VITE_API_BASE_URL=https://myvisit.shop/api
```

Si cette variable n’est pas définie, le frontend utilise `/api`.

## Contrat API attendu

Le frontend envoie le token dans l’en-tête `Authorization: Bearer <token>`.

Routes d’authentification:

```text
POST /auth/login
POST /auth/register
POST /auth/verify-otp
POST /auth/resend-otp
POST /auth/password/forgot
POST /auth/password/reset
GET  /auth/me
PATCH /auth/me
POST /auth/logout
GET  /auth/google?redirect_to=<url>
```

Routes métier:

```text
GET    /visits
POST   /visits
GET    /visits/:id
PATCH  /visits/:id
DELETE /visits/:id
GET    /users
POST   /users/invite
```

Les réponses peuvent être directement le JSON utile ou un objet `{ "data": ... }`.

## Vérifications

```bash
npm run build
npm run lint
```
