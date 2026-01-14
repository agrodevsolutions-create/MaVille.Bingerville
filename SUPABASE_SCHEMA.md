# Schéma Supabase — MaVille (détaillé)

Ce document décrit le schéma recommandé pour MaVille : multi‑villes, respect de la vie privée, extensible et optimisé pour une PWA cliente.

## Principes

- Multi‑tenant léger : une seule base avec colonne `city_id` / `city` pour filtrer par ville.
- Anonymat possible : `reports.user_id` est nullable (signalements anonymes).
- RLS activé sur les tables sensibles ; rôles par ville (`admin_<city_id>`).
- Rétention et anonymisation : champ `expires_at` et tâches cron pour purge.

## Tables (résumé)

### `cities`
- `id` TEXT PRIMARY KEY — code court (ex: `bingerville`).
- `name` TEXT — nom lisible.
- `country` TEXT — ex: `CI`.
- `is_active` BOOLEAN.
- `created_at` TIMESTAMPTZ.

### `reports` (signalements)
- `id` UUID PRIMARY KEY.
- `city_id` TEXT REFERENCES `cities(id)`.
- `user_id` UUID REFERENCES `auth.users(id)` — nullable (anonyme).
- `category` TEXT (ex: `eau`, `electricite`, `ordures`, `route`, `securite`, `autre`).
- `title` TEXT, `description` TEXT.
- `location_text` TEXT, `lat` DOUBLE PRECISION, `lng` DOUBLE PRECISION.
- `photo_url` TEXT (Supabase Storage url).
- `status` TEXT (`open`, `in_progress`, `resolved`, `rejected`).
- `created_at` TIMESTAMPTZ, `expires_at` TIMESTAMPTZ (ex: +24 months).

Indexes utiles : `city_id`, `status`, `expires_at`.

RLS suggérée :
- SELECT : public
- INSERT : public (anonyme)
- UPDATE / DELETE : restreint aux `admin` de la ville (via table `city_admins` ou rôle)

### `news` (actualités)
- `id` UUID, `city_id` TEXT, `author_type` TEXT (`citizen`|`mairie`|`association`), `author_name` TEXT.
- `category` TEXT (`travaux`, `sante`, `evenement`, `alerte`...), `title` TEXT, `content` TEXT, `image_url` TEXT.
- `published_at` TIMESTAMPTZ, `is_verified` BOOLEAN.

RLS exemple : lecture publique, insert par utilisateurs authentifiés (with moderation).

### `polls` (sondages)
- `id` UUID, `city_id` TEXT, `question` TEXT.
- `options` JSONB, `votes` JSONB (agrégation côté serveur), `ends_at` TIMESTAMPTZ, `is_active` BOOLEAN.

`polls` : lecture publique ; création/écriture réservée aux admins.

### `services` (annuaire)
- `id` UUID, `city_id` TEXT, `name` TEXT, `category` TEXT, `phone`, `address`, `lat`, `lng`, `hours` JSONB, `is_verified` BOOLEAN.

### `memberships`
- `user_id` UUID PRIMARY KEY (FK → `auth.users`), `city_id` TEXT, `status` (`pending`,`active`,`expired`), `joined_at`, `badge_url`.

### `city_admins` (mapping des responsables locaux)
- `city_id`, `admin_user_id` UUID, `created_at` — PK (city_id, admin_user_id).

## Stockage

- Bucket `reports-photos` : `/{city_id}/{report_id}.jpg`.
- Bucket `member-badges` : `/{city_id}/{user_id}.png`.

Politiques : lecture publique possible, écriture restreinte.

## RLS (extrait)

- `reports` :
	- SELECT public
	- INSERT public
	- UPDATE/DELETE → vérifie si `auth.uid()` est dans `city_admins` pour `reports.city_id`.

- `news` : SELECT public ; INSERT authentifié ; UPDATE/DELETE modérateur/admin.

- `polls` / `services` : lecture publique ; write/update/delete réservé aux admins.

## Indexes & perf

- Indexes recommandés : `reports(city_id)`, `reports(status)`, `reports(expires_at)`, `news(city_id)`, `polls(city_id)`, `services(city_id)`, `city_admins(city_id)`.

## Rétention & conformité

- Champ `expires_at` sur `reports` (par défaut 24 mois). Planifier une tâche pg_cron quotidienne pour purge.

Exemple :
```sql
DELETE FROM reports WHERE expires_at < NOW();
```

## Déploiement d'une nouvelle ville

1. `INSERT INTO cities (id, name) VALUES ('daloa','Daloa');`
2. Créer ou assigner un `admin` en insérant dans `city_admins`.
3. Le front envoie `?city=daloa` ou inclut `city_id` dans ses requêtes.

## Intégration front-end

- Utiliser Supabase JS SDK (ou REST) et toujours filtrer par `city_id`.
- Pour les opérations anonymes (INSERT reports), autoriser l'anon key mais limiter les scopes côté RLS.

---

Pour le script SQL prêt à exécuter, voir `supabase_init.sql` dans la racine du dépôt.
