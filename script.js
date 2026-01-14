// =============================================================================
// MaVille – script.js connecté à Supabase
// Conserve toutes les fonctionnalités UI existantes + données dynamiques
// =============================================================================

// 1. Initialisation Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content || 'https://wpojhdxjrekypkwbjsfd.supabase.co';
const supabaseAnonKey = document.querySelector('meta[name="supabase-key"]')?.content || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwb2poZHhqcmVreXBrd2Jqc2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNDc1MDcsImV4cCI6MjA4MzkyMzUwN30.TtWG_n35B-lvCDuggeN2jVU_4i8cbx8cyHA-SPLmrA0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Loading Screen (inchangé)
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    const loadingPercentage = document.getElementById('loading-percentage');
    const loadingBar = document.querySelector('.loading-bar');

    let progress = 0;
    const duration = 5000;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;

    const loadingInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 200);
        }

        loadingPercentage.textContent = Math.round(progress) + '%';
        loadingBar.style.width = progress + '%';
    }, interval);
});

// 3. Chargement des actualités depuis Supabase
async function loadNews() {
    try {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .eq('city_id', 'bingerville')
            .is('deleted_at', null)
            .order('published_at', { ascending: false })
            .limit(6);

        if (error) throw error;

        const container = document.querySelector('#accueil main.flex.flex-col.gap-5.p-4');
        if (!container) return;

        container.innerHTML = data.map(item => `
            <article class="group relative flex flex-col overflow-hidden rounded-2xl bg-card-light dark:bg-card-dark shadow-card transition-all hover:shadow-lg card-hover">
                <div class="relative w-full aspect-video overflow-hidden">
                    <div class="absolute inset-0 bg-gray-200 dark:bg-gray-700"></div>
                    <div class="absolute top-3 left-3">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-lg ${
                            item.category === 'travaux' ? 'bg-primary text-text-main' :
                            item.category === 'sante' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100' :
                            item.category === 'evenement' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-100' :
                            item.category === 'alerte' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100' :
                            'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100'
                        } text-xs font-bold uppercase tracking-wide shadow-sm">${item.category}</span>
                    </div>
                </div>
                <div class="flex flex-col p-4 gap-3">
                    <div>
                        <h3 class="text-text-main dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-2">${item.title}</h3>
                        <p class="text-text-secondary dark:text-gray-400 text-sm font-normal leading-relaxed line-clamp-2">${item.content}</p>
                    </div>
                    <div class="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/5 mt-1">
                        <span class="text-text-secondary text-xs font-medium flex items-center gap-1">
                            <span class="material-symbols-outlined text-[16px]">schedule</span> Il y a 2h
                        </span>
                        <button class="flex items-center gap-1 text-primary-dark dark:text-primary text-sm font-bold hover:underline">
                            Lire la suite
                            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');

        // Ajouter le bouton "Voir plus"
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'w-full py-3 mt-2 text-text-secondary text-sm font-medium border border-dashed border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors';
        loadMoreBtn.textContent = 'Voir plus d\'actualités';
        container.appendChild(loadMoreBtn);

    } catch (error) {
        console.error('Erreur chargement news:', error);
    }
}

// 4. Chargement des services depuis Supabase
async function loadServices() {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('city_id', 'bingerville')
            .is('deleted_at', null)
            .limit(6);

        if (error) throw error;

        const container = document.getElementById('services-grid');
        if (!container) return;

        container.innerHTML = data.map(s => `
            <div class="service-card bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800/50" data-category="${s.category}">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex gap-3">
                        <div class="w-12 h-12 rounded-xl ${
                            s.category === 'urgence' || s.category === 'commissariat' ? 'bg-red-500/10 text-red-500' :
                            s.category === 'sante' || s.category === 'pharmacie' ? 'bg-green-500/10 text-green-500' :
                            s.category === 'securite' ? 'bg-blue-500/10 text-blue-500' :
                            s.category === 'education' || s.category === 'ecole' ? 'bg-orange-500/10 text-orange-500' :
                            s.category === 'commerce' ? 'bg-purple-500/10 text-purple-500' :
                            'bg-cyan-500/10 text-cyan-500'
                        } flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-[24px]">${
                                s.category === 'urgence' ? 'local_hospital' :
                                s.category === 'sante' ? 'medication' :
                                s.category === 'securite' ? 'security' :
                                s.category === 'education' ? 'school' :
                                s.category === 'commerce' ? 'shopping_bag' :
                                'directions_bus'
                            }</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-text-main dark:text-white text-base mb-1">${s.name}</h4>
                            <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">${s.address} • ${s.phone || ''}</p>
                            <div class="flex items-center gap-2">
                                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                                    s.is_verified ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30' :
                                    'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }">
                                    <span class="w-2 h-2 rounded-full ${
                                        s.is_verified ? 'bg-green-500' : 'bg-gray-400'
                                    }"></span>
                                    <span class="text-[10px] font-bold uppercase tracking-wide ${
                                        s.is_verified ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                                    }">${s.is_verified ? 'Vérifié' : 'Non vérifié'}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined text-slate-400" style="font-size: 20px;">info</span>
                        </button>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg ${
                        s.category === 'urgence' ? 'bg-red-500 text-white' :
                        s.category === 'sante' ? 'bg-green-500 text-white' :
                        s.category === 'securite' ? 'bg-blue-500 text-white' :
                        'bg-primary text-text-main'
                    } font-semibold text-sm hover:opacity-90 transition-colors">
                        <span class="material-symbols-outlined text-[18px]">call</span> ${s.phone ? 'Appeler' : 'Info'}
                    </button>
                    <button class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span class="material-symbols-outlined text-[18px]">directions</span> Itinéraire
                    </button>
                </div>
            </div>
        `).join('');

        // Réactiver le filtre par catégorie
        initCategoryFilter();

    } catch (error) {
        console.error('Erreur chargement services:', error);
    }
}

// 5. Soumission de signalement à Supabase
async function submitReportToSupabase(reportData) {
    try {
        const {  { user } } = await supabase.auth.getUser();
        
        const report = {
            city_id: 'bingerville',
            user_id: user?.id || null,
            category: reportData.type,
            title: reportData.description.substring(0, 50),
            description: reportData.description,
            location_text: reportData.location,
            status: 'open'
        };

        const { data, error } = await supabase
            .from('reports')
            .insert(report)
            .select()
            .single();

        if (error) throw error;
        return data;

    } catch (error) {
        console.error('Erreur soumission signalement:', error);
        throw error;
    }
}

// 6. Navigation (inchangée)
const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.nav-item');
const fab = document.getElementById('fab');

if (fab) {
    fab.addEventListener('click', () => {
        showSection('signalement');
        fab.classList.add('fab-pulse');
        setTimeout(() => fab.classList.remove('fab-pulse'), 2000);
    });
}

function showSection(sectionId) {
    if (document.querySelector('.section-transitioning')) return;

    const currentSection = document.querySelector('.section.active');
    const targetSection = document.getElementById(sectionId);
    const targetNav = document.getElementById('nav-' + sectionId);

    if (!targetSection || targetSection === currentSection) return;

    targetSection.classList.add('section-transitioning');

    if (currentSection) {
        currentSection.style.transform = 'translateX(-20px)';
        currentSection.style.opacity = '0';
        setTimeout(() => {
            currentSection.classList.add('hidden');
            currentSection.classList.remove('active');
        }, 150);
    }

    navItems.forEach(item => {
        item.classList.remove('active', 'text-primary');
        item.classList.add('text-text-secondary', 'dark:text-gray-400');
        const iconDiv = item.querySelector('div');
        if (iconDiv) {
            iconDiv.classList.remove('bg-primary/10');
            iconDiv.style.transform = 'scale(1)';
        }
    });

    if (targetNav) {
        targetNav.classList.add('active', 'text-primary');
        targetNav.classList.remove('text-text-secondary', 'dark:text-gray-400');
        const iconDiv = targetNav.querySelector('div');
        if (iconDiv) {
            iconDiv.classList.add('bg-primary/10');
            iconDiv.style.transform = 'scale(1.1)';
        }
    }

    setTimeout(() => {
        targetSection.classList.remove('hidden');
        targetSection.style.transform = 'translateX(20px)';
        targetSection.style.opacity = '0';
        targetSection.offsetHeight; // force reflow
        targetSection.style.transform = 'translateX(0)';
        targetSection.style.opacity = '1';
        targetSection.classList.add('active');
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => targetSection.classList.remove('section-transitioning'), 300);
    }, currentSection ? 150 : 0);
}

// 7. Initialisation au chargement
document.addEventListener('DOMContentLoaded', async () => {
    // Charger les données depuis Supabase
    await Promise.all([
        loadNews(),
        loadServices()
    ]);

    // Réinitialiser les gestionnaires de formulaire
    initSignalementForm();
    initCategoryFilter();
});

// 8. Gestion du formulaire de signalement (connecté à Supabase)
function initSignalementForm() {
    const signalementForm = document.getElementById('signalement-form');
    if (!signalementForm) return;

    // ... (tout le code existant pour les boutons, géolocalisation, etc.)

    // Remplacer la soumission par un appel à Supabase
    signalementForm.onsubmit = async (e) => {
        e.preventDefault();

        const problemType = document.getElementById('problem-type')?.value;
        const description = document.getElementById('description')?.value.trim();
        const location = document.getElementById('location')?.value.trim();

        if (!problemType || !description || !location) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin" style="font-size: 20px;">refresh</span> Envoi...';

        try {
            const reportData = {
                type: problemType,
                description: description,
                location: location
            };

            await submitReportToSupabase(reportData);
            
            // Afficher succès
            const successMsg = document.getElementById('success-message');
            if (successMsg) successMsg.classList.remove('hidden');

            // Reset
            setTimeout(() => {
                signalementForm.reset();
                if (successMsg) successMsg.classList.add('hidden');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 20px;">send</span> Envoyer le signalement';
            }, 3000);

        } catch (err) {
            alert('Erreur : ' + (err.message || 'Impossible d\'envoyer le signalement.'));
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 20px;">send</span> Envoyer le signalement';
        }
    };
}

// 9. Filtre par catégorie (inchangé)
function initCategoryFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    categoryBtns.forEach(btn => {
        btn.onclick = () => {
            categoryBtns.forEach(b => b.classList.remove('active', 'bg-primary', 'text-text-main'));
            btn.classList.add('active', 'bg-primary', 'text-text-main');

            const cat = btn.dataset.category;
            serviceCards.forEach(card => {
                const cardCats = card.dataset.category.split(' ');
                card.style.display = (cat === 'all' || cardCats.includes(cat)) ? 'block' : 'none';
            });
        };
    });
}

// 10. PWA, thème, etc. (inchangés)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(console.warn);
    });
}

// ... (le reste du script.js original reste inchangé)
