-- 1. Activer l'extension uuid-ossp si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table des villes
CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'CI',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les villes de départ
INSERT INTO cities (id, name) VALUES
  ('bingerville', 'Bingerville'),
  ('dabou', 'Dabou'),
  ('songon', 'Songon'),
  ('bouake', 'Bouaké'),
  ('daloa', 'Daloa')
ON CONFLICT (id) DO NOTHING;

-- 3. Table des signalements
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('eau', 'electricite', 'ordures', 'route', 'securite', 'autre')),
  title TEXT NOT NULL,
  description TEXT,
  location_text TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 months'
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_reports_city ON reports(city_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_expires ON reports(expires_at);

-- Activer RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read access" ON reports FOR SELECT USING (true);
CREATE POLICY "Anonyme insert" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update" ON reports FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  auth.uid() IN (
    SELECT admin_user_id FROM city_admins WHERE city_id = reports.city_id
  )
);
CREATE POLICY "Admin delete" ON reports FOR DELETE USING (
  auth.role() = 'authenticated' AND
  auth.uid() IN (
    SELECT admin_user_id FROM city_admins WHERE city_id = reports.city_id
  )
);

-- 4. Table des actualités
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('citizen', 'mairie', 'association')),
  author_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('travaux', 'sante', 'evenement', 'alerte', 'education')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_news_city ON news(city_id);
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON news FOR SELECT USING (true);
CREATE POLICY "Citizen or mairie insert" ON news FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Table des sondages
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  votes JSONB NOT NULL DEFAULT '{}',
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_polls_city ON polls(city_id);
CREATE INDEX IF NOT EXISTS idx_polls_active ON polls(is_active);
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON polls FOR SELECT USING (true);
CREATE POLICY "Admin only write" ON polls FOR ALL USING (
  auth.role() = 'authenticated' AND
  auth.uid() IN (
    SELECT admin_user_id FROM city_admins WHERE city_id = polls.city_id
  )
);

-- 6. Table des services (annuaire)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('pharmacie', 'ecole', 'commissariat', 'artisan', 'commerce', 'sante', 'transport')),
  phone TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  hours JSONB,
  is_verified BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_services_city ON services(city_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON services FOR SELECT USING (true);
CREATE POLICY "Admin write" ON services FOR ALL USING (
  auth.role() = 'authenticated' AND
  auth.uid() IN (
    SELECT admin_user_id FROM city_admins WHERE city_id = services.city_id
  )
);

-- 7. Table des adhésions (IciMaVille)
CREATE TABLE IF NOT EXISTS memberships (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  badge_url TEXT
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Self access" ON memberships FOR ALL USING (auth.uid() = user_id);

-- 8. Table des administrateurs par ville (optionnel mais recommandé)
CREATE TABLE IF NOT EXISTS city_admins (
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (city_id, admin_user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_city_admins_city ON city_admins(city_id);

-- RLS sur city_admins (lecture publique, écriture admin global)
ALTER TABLE city_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON city_admins FOR SELECT USING (true);

-- 9. Nettoyage automatique (optionnel – nécessite pg_cron activé)
-- Supprime les signalements expirés
-- SELECT cron.schedule('cleanup-reports', '0 2 * * *', $$DELETE FROM reports WHERE expires_at < NOW();$$);
