# Schéma Supabase (exemple)

Tables proposées :

1) `reports` (signalements)
- `id` : uuid (primary key)
- `author_id` : uuid | nullable
- `anonymous` : boolean
- `category` : text (ex: SODECI, CIE, Embouteillage)
- `description` : text
- `photo_url` : text
- `location` : geography / text (lat,lng) ou lien Google Maps
- `created_at` : timestamp
- `status` : text (open, in_progress, closed)

2) `polls`
- `id` : uuid
- `question` : text
- `options` : jsonb (liste d'options)
- `start_at` / `end_at` : timestamp
- `immutable` : boolean

3) `poll_answers`
- `id` : uuid
- `poll_id` : uuid (fk)
- `option_index` : integer
- `created_at` : timestamp

4) `users` (optionnel)
- `id` : uuid
- `display_name` : text
- `is_member` : boolean

Règles recommandées :
- Activer RLS et autoriser insert public pour `reports` en forçant `anonymous=true` si nécessaire.
- Restreindre accès administratif pour modifier `status`.
