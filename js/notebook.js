/* ============================================================
   notebook.js — cromo compartido de la libreta
   (índice, progreso, animaciones, navegación entre módulos)
   ============================================================ */
(function(){
  "use strict";

  const MODULES = [
    { id:1, file:'modulo-1.html', title:'El problema de la tangente',              short:'Motivación e idea intuitiva', color:'yellow' },
    { id:2, file:'modulo-2.html', title:'Definición informal de límite',           short:'¿Qué significa que L sea el límite?', color:'pink' },
    { id:3, file:'modulo-3.html', title:'Límites laterales',                        short:'Acercarse por izquierda y por derecha', color:'green' },
    { id:4, file:'modulo-4.html', title:'Límites infinitos y asíntotas verticales', short:'Cuando f(x) crece o decrece sin cota', color:'blue' },
    { id:5, file:'modulo-5.html', title:'Definición formal (ε – δ)',               short:'La precisión detrás de la idea intuitiva', color:'orange' },
    { id:6, file:'modulo-6.html', title:'Límites al infinito y técnicas de cálculo',short:'Asíntotas horizontales, leyes y formas indeterminadas', color:'yellow' },
    { id:7, file:null,           title:'Continuidad',                              short:'Próximo capítulo del cuaderno', locked:true, color:'pink' },
  ];
  window.NB_MODULES = MODULES;

  function getProgress(){
    try{ return JSON.parse(localStorage.getItem('nb_progress')||'{}'); }catch(e){ return {}; }
  }
  function setModuleComplete(id, score, total){
    const p = getProgress();
    p[id] = { done:true, score:score, total:total, date:Date.now() };
    localStorage.setItem('nb_progress', JSON.stringify(p));
  }
  window.NB = window.NB || {};
  window.NB.setModuleComplete = setModuleComplete;
  window.NB.getProgress = getProgress;

  function buildDrawer(){
    const drawer = document.getElementById('index-drawer');
    if(!drawer) return;
    const progress = getProgress();
    const current = parseInt(document.body.getAttribute('data-module')||'0',10);

    let html = `<button class="close-drawer" aria-label="Cerrar índice">✕</button>`;
    html += `<span class="eyebrow">✎ Cuaderno · Unidad 2</span>`;
    html += `<h2>Índice</h2>`;
    html += `<p style="font-family:var(--font-note);font-size:.88rem;color:#6b6252;margin-top:-6px;">Tocá cualquier página para ir directo ahí.</p>`;
    html += `<ul class="index-list">`;
    html += `<li><a href="index.html" class="${current===0?'active':''}"><span class="num">🏠</span> Portada</a></li>`;
    MODULES.forEach(m=>{
      const done = progress[m.id] && progress[m.id].done;
      if(m.locked){
        html += `<li><a class="locked" tabindex="-1"><span class="num">${m.id}</span> ${m.title} <span style="margin-left:auto;font-size:.85rem;">🔒</span></a></li>`;
      } else {
        html += `<li><a href="${m.file}" class="${current===m.id?'active':''}">
          <span class="num">${m.id}</span> ${m.title}
          ${done?'<span class="check">✔</span>':''}
        </a></li>`;
      }
    });
    html += `</ul>`;
    html += `<p class="index-note">Cuaderno digital de Análisis Matemático I — Unidad Temática N.º 2: Límite de funciones reales. Basado en Stewart, J. (2012). <i>Cálculo. Trascendentes tempranas.</i> Cap. 2, y en las guías de cátedra.</p>`;
    drawer.innerHTML = html;

    drawer.querySelector('.close-drawer').addEventListener('click', closeDrawer);
  }

  function openDrawer(){
    document.getElementById('index-drawer').classList.add('open');
    document.getElementById('drawer-overlay').classList.add('open');
    document.body.style.overflow='hidden';
  }
  function closeDrawer(){
    document.getElementById('index-drawer').classList.remove('open');
    document.getElementById('drawer-overlay').classList.remove('open');
    document.body.style.overflow='';
  }

  function buildProgressStrip(){
    const el = document.querySelector('.progress-strip');
    if(!el) return;
    const current = parseInt(document.body.getAttribute('data-module')||'0',10);
    el.innerHTML='';
    MODULES.filter(m=>!m.locked).forEach(m=>{
      const s = document.createElement('span');
      if(m.id < current) s.classList.add('on');
      if(m.id === current) s.classList.add('current');
      el.appendChild(s);
    });
  }

  function buildPageNav(){
    const current = parseInt(document.body.getAttribute('data-module')||'0',10);
    const prevEl = document.querySelector('.page-nav .prev');
    const nextEl = document.querySelector('.page-nav .next');
    if(!prevEl && !nextEl) return;
    const list = MODULES;
    const idx = list.findIndex(m=>m.id===current);
    const prev = idx>0 ? list[idx-1] : null;
    const next = (idx>=0 && idx<list.length-1) ? list[idx+1] : null;

    if(prevEl){
      if(current===1){
        prevEl.href='index.html';
        prevEl.innerHTML=`<span class="dir">← volver</span><span class="ttl">Portada / Índice</span>`;
      } else if(prev){
        prevEl.href=prev.file;
        prevEl.innerHTML=`<span class="dir">← página anterior</span><span class="ttl">${prev.id}. ${prev.title}</span>`;
      }
    }
    if(nextEl){
      if(next && !next.locked){
        nextEl.href=next.file;
        nextEl.innerHTML=`<span class="dir">página siguiente →</span><span class="ttl">${next.id}. ${next.title}</span>`;
      } else {
        nextEl.classList.add('disabled');
        nextEl.innerHTML=`<span class="dir">próximamente →</span><span class="ttl">Continuidad</span>`;
      }
    }
  }

  function initReveal(){
    const els = document.querySelectorAll('.underline-draw, .reveal');
    if(!('IntersectionObserver' in window)){
      els.forEach(e=>e.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){ en.target.classList.add('in-view'); io.unobserve(en.target); }
      });
    },{ threshold:.4 });
    els.forEach(e=>io.observe(e));
  }

  document.addEventListener('DOMContentLoaded', function(){
    buildDrawer();
    buildProgressStrip();
    buildPageNav();
    initReveal();

    const tab = document.getElementById('index-tab');
    if(tab) tab.addEventListener('click', openDrawer);
    const overlay = document.getElementById('drawer-overlay');
    if(overlay) overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeDrawer(); });
  });
})();
