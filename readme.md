# 🏙️ MaVille – PWA Civique Participative

> **Une infrastructure numérique citoyenne pour Bingerville, Dabou, Songon… en Côte d’Ivoire**  
> Plateforme horizontale, neutre et transparente où **les habitants co-construisent la ville** avec les autorités — sans intermédiaire, sans parti pris.

---

## 🎯 Vision

MaVille n’est pas une app municipale descendante. C’est un **réseau social urbain d’utilité publique**, alimenté par les citoyens eux-mêmes :
- Une information partagée par un voisin a plus de poids qu’un communiqué officiel.
- Un signalement devient une **preuve publique** visible par tous.
- Les décisions locales s’appuient sur des **données réelles, en temps réel**.

✅ **Neutre** – Aucune affiliation politique  
✅ **Transparente** – Tous les contenus sont publics  
✅ **Inclusive** – Accessible sur tout smartphone, sans téléchargement (PWA)  
✅ **Légale** – Conforme à l’**Ordonnance 2024-368** et aux standards internationaux (ODD 11 & 16)

---

## 📱 Fonctionnalités (5 piliers)

### 1. **🏠 Maville (Accueil)**
Flux d’actualités locales vérifiées :  
- Travaux municipaux, campagnes de santé, alertes communautaires  
- Cartes blanches sur fond gris très clair  
- Badges **Vert Émeraude `#064E3B`** pour catégoriser (Travaux, Santé, etc.)

### 2. **🗳️ Avis (Sondages de proximité)**
Démocratie participative anonyme :  
- Questions locales simples : *« Faut-il installer des lampadaires solaires rue Gbagba ? »*  
- Résultats publics, immuables  
- **Moratoire automatique 60 jours avant toute élection** (neutralité garantie)

### 3. **🚨 Signaler (Preuve citoyenne)**
Signalez en 30 secondes avec preuve :  
- Photo + lieu (texte ou lien Google Maps)  
- Catégories : SODECI, CIE, Pompiers, Embouteillages…  
- Interface robuste, typographie anthracite très lisible  
- → Votre signalement devient une **preuve publique**

### 4. **🗺️ Proximité (Annuaire local)**
Services utiles de votre quartier :  
- Pharmacies, écoles, centres de santé, commissariats, artisans  
- Boutons d’appel direct et itinéraires  
- Potentiel de **monétisation éthique** (partenariats locaux discrets)

### 5. **👤 Moi (Espace personnel)**
- Suivi de vos contributions  
- Gestion du thème sombre / notifications  
- **Badge “Membre IciMaVille”** (activé après adhésion à l’association locale)  
- Aucun compte obligatoire pour signaler — mais espace sécurisé pour les engagés  
- **Carte de membre** : affichée en verre dépoli tant que l’association **IciMaVille** n’est pas légalement constituée

---

## 🛠️ Technologies

| Couche | Stack |
|-------|------|
| **Frontend** | HTML5, CSS3 (classes utilitaires), JavaScript ES6+ |
| **UI/UX** | Design sobre, corporate, mobile-first, navigation tactile (onglets en bas) |
| **PWA** | Service Worker, Web Manifest, Géolocalisation, Notifications, Hors-ligne |
| **Stockage** | `localStorage` (préférences), Supabase (signalements, sondages) |
| **Performance** | Lazy loading, cache intelligent, animations fluides |
| **Accessibilité** | Navigation clavier, lecteurs d’écran, contraste ≥ 4.5:1 (WCAG AA) |

> 🖼️ **Images** : photos urbaines africaines réelles (pas de stock générique)

---

## 🧑‍💻 Développement local

Ce projet est **100 % statique** — **aucun framework, aucune dépendance npm**.

### Option 1 : Serveur local simple
```bash
# Depuis le dossier racine
python -m http.server 8000
# ou
npx serve .

---

## 🧑‍💻 Dev Setup (détaillé)

Ce projet est 100% statique. Instructions rapides pour le développement et le déploiement :

- Branch recommandée : `main`

- Pour Netlify :
	- **Branch** : `main`
	- **Build command** : (laisser vide)
	- **Publish directory** : `/` (ou configurer via `netlify.toml`)
	- Un fichier `netlify.toml` est inclus pour :
		- définir `publish = "."` (site statique)
		- rediriger toutes les routes vers `/index.html` (SPA)
		- forcer `Cache-Control: no-cache` sur `sw.js` et `manifest.json`

Commandes locales :

```bash
# Cloner le dépôt
git clone https://github.com/<votre-utilisateur>/MaVille.Bingerville.git
cd MaVille.Bingerville

# Lancer un serveur HTTP simple (port 8000)
python -m http.server 8000

# ou, si vous avez `serve` installé :
npx serve .
```

Fichiers utiles ajoutés au dépôt : `CONTRIBUTING.md`, `SUPABASE_SCHEMA.md`, `.env.example`, `PRIVACY.md`, `netlify.toml`.

## 🔒 Privacy & gestion des données

La politique de gestion des données et des preuves (photos, géolocalisation) est documentée dans `PRIVACY.md`. Elle décrit : anonymisation, rétention, accès administratif, et procédure de suppression sur demande.

---

Merci de consulter `CONTRIBUTING.md` pour les conventions de contribution et les étapes pour proposer des changements.