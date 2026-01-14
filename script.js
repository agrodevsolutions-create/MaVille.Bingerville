// script.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = document.querySelector('meta[name="supabase-url"]').content;
const supabaseAnonKey = document.querySelector('meta[name="supabase-key"]').content;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.nav-item');
const darkToggle = document.getElementById('dark-toggle');

function showSection(sectionId) {
  sections.forEach(section => section.classList.toggle('hidden', section.id !== sectionId));
  navItems.forEach(item => {
    item.classList.toggle('text-primary', item.dataset.section === sectionId);
    item.classList.toggle('text-gray-400', item.dataset.section !== sectionId);
  });
}

darkToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

async function loadNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('city_id', 'bingerville')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .limit(5);
  
  if (error) return console.error('Erreur news:', error);
  
  const container = document.getElementById('news-container');
  container.innerHTML = data.map(item => `
    <article class="bg-card-dark rounded-xl p-4">
      <span class="inline-block px-2 py-1 bg-primary text-white text-xs font-bold rounded mb-2">${item.category}</span>
      <h3 class="font-bold">${item.title}</h3>
      <p class="text-sm text-gray-300 mt-1">${item.content.substring(0, 100)}...</p>
    </article>
  `).join('');
}

async function loadServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('city_id', 'bingerville')
    .is('deleted_at', null)
    .limit(6);
  
  if (error) return console.error('Erreur services:', error);
  
  const container = document.getElementById('services-container');
  container.innerHTML = data.map(s => `
    <div class="bg-card-dark rounded-xl p-4">
      <h3 class="font-bold">${s.name}</h3>
      <p class="text-sm text-gray-400">${s.category} • ${s.address}</p>
    </div>
  `).join('');
}

document.getElementById('signalement-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const desc = document.getElementById('report-desc').value;
  const location = document.getElementById('report-location').value;
  
  try {
    const {  { user } } = await supabase.auth.getUser();
    await supabase.from('reports').insert({
      city_id: 'bingerville',
      user_id: user?.id || null,
      category: 'autre',
      title: desc.substring(0, 50),
      description: desc,
      location_text: location
    });
    alert('✅ Signalement envoyé !');
    e.target.reset();
  } catch (err) {
    alert('❌ Erreur : ' + err.message);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.remove('dark');
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(item.dataset.section);
    });
  });

  loadNews();
  loadServices();
});
