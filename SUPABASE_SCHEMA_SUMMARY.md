## MaVille — Résumé du schéma Supabase

Résumé succinct conçu pour une application multi‑villes (ex: Bingerville, Dabou, Bouaké).

### Principes
- Multi‑tenant léger : une seule base, colonne `city_id` pour filtrer par ville.
- Autoriser l'anonymat pour les signalements ; comptes optionnels via Supabase Auth.
- RLS (Row Level Security) pour isoler les opérations par rôle ville (ex: `admin_bingerville`).
- Conformité : durée de rétention et anonymisation possible (champ `expires_at`).

### Tables clés
- `cities` : répertoire des villes (`id`, `name`, `country`, `is_active`, `created_at`).
- `reports` : signalements citoyens (UUID, `city_id`, `user_id` nullable, `category`, `title`, `description`, `lat`, `lng`, `photo_url`, `status`, `created_at`, `expires_at`).
- `news` : actualités locales (`id`, `city_id`, `author_type`, `author_name`, `category`, `title`, `content`, `image_url`, `published_at`, `is_verified`).
- `polls` : sondages (`id`, `city_id`, `question`, `options` JSONB, `votes` JSONB, `ends_at`, `is_active`).
- `services` : annuaire local (`id`, `city_id`, `name`, `category`, `phone`, `address`, `lat`, `lng`, `hours` JSONB).
- `memberships` : adhésions liées à `auth.users` (`user_id`, `city_id`, `status`, `joined_at`, `badge_url`).

### Sécurité & RLS (extrait)
- `reports` : SELECT public, INSERT public (anonyme), UPDATE/DELETE réservés aux rôles `admin_city_{id}`.
- `news` : lecture publique, création/modération selon rôle (citoyen vs modérateur).
- `memberships` : accès restreint à l'utilisateur concerné.

### Stockage
- Bucket `reports-photos` → chemin `/{city_id}/{report_id}.jpg`.
- Bucket `member-badges` → chemin `/{city_id}/{user_id}.png`.

### Rétention & conformité
- Champ `expires_at` sur les tables sensibles (ex: `reports`).
- Tâche cron (pg_cron) : suppression quotidienne des enregistrements expirés.

### Bonnes pratiques front-end
- Requêtes simples via Supabase JS SDK (ou REST) : filtrer systématiquement par `city_id`.
- Imposer un contrôle CORS et limiter les clés publiques (anon) aux opérations lecture/insert publiques.

### Déploiement d'une nouvelle ville
1. Insérer une ligne dans `cities`.
2. Créer un rôle `admin_<city_id>` et l'attribuer aux modérateurs.
3. Aucune modification applicative nécessaire : utiliser `?city=<id>` côté client.

---

Fichier de référence détaillé : `SUPABASE_SCHEMA.md` (plus complet).
