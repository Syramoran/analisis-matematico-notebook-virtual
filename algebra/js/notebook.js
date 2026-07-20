/* ============================================================
   notebook.js — cromo compartido de la libreta de Álgebra
   (índice, progreso, animaciones, navegación entre módulos)
   ============================================================ */
(function(){
  "use strict";

  const MODULES = [
    { id:1, file:'modulo-1.html', title:'Determinantes', short:'2×2, 3×3 (cofactores y Sarrus), menores, matrices triangulares y área generada', color:'orange' },
    { id:2, file:'modulo-2.html', title:'Propiedades de los determinantes y Regla de Cramer', short:'det(AB), transpuesta, propiedades de filas/columnas, invertibilidad y Cramer', color:'green' },
    { id:3, file:'modulo-3.html', title:'Vectores en el plano', short:'Magnitud, dirección, suma, producto por escalar, versor y vectores fundamentales i, j', color:'blue' },
    { id:4, file:'modulo-4.html', title:'Producto escalar, ángulo, paralelismo y proyección', short:'u·v, ángulo entre vectores, condiciones de paralelismo/ortogonalidad y proyección', color:'orange' },
    { id:5, file:'modulo-5.html', title:'Vectores en el espacio (R³)', short:'Terna (x;y;z), distancia, cosenos directores, base i,j,k y todas las operaciones en 3D', color:'green' },
    { id:6, file:'modulo-6.html', title:'Producto cruz, área, volumen y coplanaridad', short:'u×v, regla de la mano derecha, área del paralelogramo, triple producto escalar y volumen', color:'blue' },
    { id:7, file:'modulo-7.html', title:'Ecuaciones de la recta en el plano', short:'Vectorial, cartesiana, simétrica, general, segmentaria y explícita', color:'yellow' },
    { id:8, file:'modulo-8.html', title:'Posiciones relativas, ángulo y distancia entre rectas', short:'Paralelas, perpendiculares, coincidentes, intersección, ángulo y distancia punto-recta', color:'pink' },
  ];
  window.NB_MODULES = MODULES;

  function getProgress(){
    try{ return JSON.parse(localStorage.getItem('nb_algebra_progress')||'{}'); }catch(e){ return {}; }
  }
  function setModuleComplete(id, score, total){
    const p = getProgress();
    p[id] = { done:true, score:score, total:total, date:Date.now() };
    localStorage.setItem('nb_algebra_progress', JSON.stringify(p));
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
    html += `<span class="eyebrow">✎ Cuaderno de Álgebra</span>`;
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
    html += `<p class="index-note">Cuaderno digital de Álgebra y Geometría Analítica — se va completando a medida que aparecen nuevos temas. Basado en las guías de cátedra (Clases 14 y 15: Rectas en el plano) y en Kozak, Pastorelli y Vardanega (2007). <i>Nociones de Geometría Analítica y Álgebra Lineal.</i></p>`;
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
      } else if(next && next.locked){
        nextEl.classList.add('disabled');
        nextEl.innerHTML=`<span class="dir">próximamente →</span><span class="ttl">${next.title}</span>`;
      } else {
        nextEl.classList.add('disabled');
        nextEl.innerHTML=`<span class="dir">✎ por ahora, esto es todo</span><span class="ttl">Más módulos en camino</span>`;
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
