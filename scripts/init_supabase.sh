#!/bin/bash
# =============================================================================
# Script d'initialisation Supabase pour MaVille – GitHub Codespaces
# Exécutez ce script une fois après avoir cloné le repo
# =============================================================================

echo "🚀 Configuration de Supabase pour MaVille..."

# 1. Créer le dossier js si absent
mkdir -p js

# 2. Générer supabaseClient.js
cat > js/supabaseClient.js << 'EOF'
// =============================================================================
// Client Supabase pour MaVille – Vanilla JS
// À utiliser dans tous les onglets de index.html
// =============================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Charger les variables depuis .env.local (via import.meta.env en développement local)
// En production (Netlify), utilisez les environment variables de Netlify
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =============================================================================
// Fonctions utilitaires par onglet
// =============================================================================

/**
 * Onglet "MaVille" – Charger les actualités
 */
export async function loadNews(cityId = 'bingerville') {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('city_id', cityId)
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .limit(10);
  
  if (error) console.error('Erreur chargement news:', error);
  return data || [];
}

/**
 * Onglet "Proximité" – Charger les services
 */
export async function loadServices(cityId = 'bingerville', category = null) {
  let query = supabase
    .from('services')
    .select('*')
    .eq('city_id', cityId)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (category) query = query.eq('category', category);
  
  const { data, error } = await query;
  if (error) console.error('Erreur chargement services:', error);
  return data || [];
}

/**
 * Onglet "Signaler" – Soumettre un signalement
 */
export async function submitReport(reportData) {
  // Vérifier si utilisateur connecté
  const {  { user } } = await supabase.auth.getUser();
  
  const report = {
    city_id: 'bingerville',
    user_id: user?.id || null,
    session_id: null, // à implémenter avec fingerprint si anonyme
    ...reportData
  };

  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single();

  if (error) {
    console.error('Erreur soumission signalement:', error);
    throw error;
  }
  return data;
}

/**
 * Onglet "Avis" – Charger un sondage actif
 */
export async function loadActivePoll(cityId = 'bingerville') {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .gt('ends_at', new Date().toISOString())
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) console.error('Erreur chargement sondage:', error);
  return data?.[0] || null;
}

/**
 * Onglet "Avis" – Voter à un sondage
 */
export async function votePoll(pollId, optionIndex) {
  const {  { user } } = await supabase.auth.getUser();
  
  // Pour MVP : vote anonyme non tracé (à améliorer avec sessions)
  const { error } = await supabase.rpc('vote_poll', {
    _poll_id: pollId,
    _option_index: optionIndex
  });

  if (error) {
    console.error('Erreur vote:', error);
    throw error;
  }
}

/**
 * Authentification (optionnelle pour "Moi")
 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) console.error('Erreur login:', error);
}

export async function signOut() {
  await supabase.auth.signOut();
}
EOF

# 3. Instructions pour .env.local
echo ""
echo "🔑 Étape suivante :"
echo "Créez un fichier .env.local à la racine avec :"
echo "VITE_SUPABASE_URL=your-project-url"
echo "VITE_SUPABASE_ANON_KEY=your-anon-key"
echo ""
echo "💡 Vous trouverez ces clés dans Supabase > Project Settings > API"
echo ""
echo "✅ Configuration terminée ! Utilisez les fonctions dans index.html."

