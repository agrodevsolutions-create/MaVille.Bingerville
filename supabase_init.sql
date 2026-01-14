-- =============================================================================
-- MaVille – Schéma de base de données Supabase
-- Conçu pour Bingerville, Dabou, Songon, Bouaké, Daloa… (Côte d’Ivoire)
-- Licence MIT – Projet citoyen horizontal, neutre, transparent
-- =============================================================================

-- =============================================================================
-- MaVille – Schéma Supabase v1.1 (MVP sécurisé)
-- Exécutez EN UN SEUL BLOC
-- =============================================================================

-- 1. PURGE
-- N/A

-- 2. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Tables (sans RLS pour l'instant)
CREATE TABLE cities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'CI',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO cities (id, name) VALUES
('bingerville', 'Bingerville'),
('dabou', 'Dabou'),
('songon', 'Songon'),
('bouake', 'Bouaké'),
('daloa', 'Daloa')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE city_admins (
    city_id TEXT NOT NULL REFERENCES cities (id) ON DELETE CASCADE,
    admin_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (city_id, admin_user_id)
);

CREATE TABLE anonymous_sessions (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
    fingerprint TEXT NOT NULL,
    city_id TEXT NOT NULL REFERENCES cities (id),
    reports_count INT DEFAULT 0 CHECK (reports_count <= 3),
    last_report_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    reputation_score INT DEFAULT 0,
    reports_submitted INT DEFAULT 0,
    polls_voted INT DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
    city_id TEXT NOT NULL REFERENCES cities (id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    session_id UUID REFERENCES anonymous_sessions (id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (
        category IN (
            'eau', 'electricite', 'ordures', 'route', 'securite', 'autre'
        )
    ),
    title TEXT NOT NULL,
    description TEXT,
    location_text TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    photo_storage_path TEXT,
    is_moderated BOOLEAN DEFAULT false,
    moderation_notes TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (
        status IN ('open', 'in_progress', 'resolved', 'rejected')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 months',
    deleted_at TIMESTAMPTZ
);

CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
    city_id TEXT NOT NULL REFERENCES cities (id) ON DELETE CASCADE,
    author_type TEXT NOT NULL CHECK (
        author_type IN ('citizen', 'mairie', 'association')
    ),
    author_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN ('travaux', 'sante', 'evenement', 'alerte', 'education')
    ),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_storage_path TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
    city_id TEXT NOT NULL REFERENCES cities (id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
    poll_id UUID NOT NULL REFERENCES polls (id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users (id),
    session_id UUID REFERENCES anonymous_sessions (id),
    option_index INT NOT NULL,
    voted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_poll_votes_unique_voter
ON poll_votes (poll_id, COALESCE(user_id::TEXT, session_id::TEXT));

ALTER TABLE poll_votes
ADD CONSTRAINT check_user_or_session
CHECK (user_id IS NOT null OR session_id IS NOT null);

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
    city_id TEXT NOT NULL REFERENCES cities (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN (
            'pharmacie',
            'ecole',
            'commissariat',
            'artisan',
            'commerce',
            'sante',
            'transport'
        )
    ),
    phone TEXT,
    address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    hours JSONB,
    is_verified BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE memberships (
    user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    city_id TEXT NOT NULL REFERENCES cities (id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'active', 'expired')
    ),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    badge_url TEXT
);

CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_by UUID REFERENCES auth.users (id),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. INDEX
-- =============================================================================
CREATE INDEX idx_city_admins_city ON city_admins (city_id);
CREATE INDEX idx_anon_sessions_fingerprint ON anonymous_sessions (fingerprint);
CREATE INDEX idx_anon_sessions_city ON anonymous_sessions (city_id);
CREATE INDEX idx_reports_city ON reports (city_id);
CREATE INDEX idx_reports_status ON reports (status);
CREATE INDEX idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX idx_reports_city_status ON reports (city_id, status);
CREATE INDEX idx_reports_expires ON reports (expires_at);
CREATE INDEX idx_news_city ON news (city_id);
CREATE INDEX idx_news_published_at ON news (published_at DESC);
CREATE INDEX idx_polls_city ON polls (city_id);
CREATE INDEX idx_polls_active ON polls (is_active);
CREATE INDEX idx_services_city ON services (city_id);
CREATE INDEX idx_services_category ON services (category);
CREATE INDEX idx_services_city_category ON services (city_id, category);
CREATE INDEX idx_memberships_active ON memberships (city_id) WHERE status
= 'active';

-- =============================================================================
-- 5. POLITIQUES RLS (APPLIQUÉES À LA FIN → TOUTES LES TABLES EXISTENT)
-- =============================================================================
ALTER TABLE city_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON city_admins FOR SELECT USING (true);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Self update" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON reports FOR SELECT USING (deleted_at IS null);
CREATE POLICY "Rate-limited insert" ON reports FOR INSERT WITH CHECK (
    (user_id IS NOT null AND auth.uid() = user_id)
    OR
    (session_id IS NOT null)
);
CREATE POLICY "Admin update/delete" ON reports FOR ALL USING (
    auth.role() = 'authenticated'
    AND auth.uid() IN (
        SELECT city_admins.admin_user_id FROM city_admins
        WHERE city_admins.city_id = reports.city_id
    )
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON news FOR SELECT USING (deleted_at IS null);
CREATE POLICY "Verified users insert" ON news FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND (
        auth.uid() IN (
            SELECT city_admins.admin_user_id FROM city_admins
            WHERE city_admins.city_id = news.city_id
        )
        OR
        EXISTS (
            SELECT 1 FROM memberships
            WHERE
                memberships.user_id = auth.uid()
                AND memberships.city_id = news.city_id
                AND memberships.status = 'active'
        )
    )
);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON polls FOR SELECT USING (
    deleted_at IS null AND is_active = true
);
CREATE POLICY "Admin write" ON polls FOR ALL USING (
    auth.role() = 'authenticated'
    AND auth.uid() IN (
        SELECT city_admins.admin_user_id FROM city_admins
        WHERE city_admins.city_id = polls.city_id
    )
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON services FOR SELECT USING (deleted_at IS null);
CREATE POLICY "Admin write" ON services FOR ALL USING (
    auth.role() = 'authenticated'
    AND auth.uid() IN (
        SELECT city_admins.admin_user_id FROM city_admins
        WHERE city_admins.city_id = services.city_id
    )
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Self access" ON memberships FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- Fin du script
-- ✅ Exécutez EN UN SEUL BLOC
-- =============================================================================
