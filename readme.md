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
| **Accessibilité** | Navigation clavier, lecteurs d’écran, contraste élevé |

> 🖼️ **Images** : photos urbaines africaines réelles (pas de stock générique)

---

## 🚀 Déploiement

### Prérequis
- Compte GitHub
- Compte Netlify (gratuit)
- Projet Supabase (gratuit)

### Étapes
1. Push du code sur GitHub
2. Dans Netlify : **“Add new site” → “Import an existing project”**
3. Configuration :
   - **Branch** : `main`
   - **Build command** : *laisser vide*
   - **Publish directory** : `/`
4. Déploiement automatique → URL publique prête

✅ **Installation PWA** : Sur mobile, “Ajouter à l’écran d’accueil”

---

## 🧪 Développement local (via GitHub Codespaces)

```bash
# Cloner le repo
git clone https://github.com/votre-nom/maville-bingerville.git
cd maville-bingerville

# Lancer un serveur local
python -m http.server 8000
# ou
npx serve .
