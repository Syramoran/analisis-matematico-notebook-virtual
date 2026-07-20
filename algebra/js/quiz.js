/* ============================================================
   quiz.js — cuestionarios con feedback inmediato (fin de módulo)
   ============================================================ */
(function(){
  "use strict";

  function normalize(str){
    return String(str).trim().toLowerCase()
      .replace(/\s+/g,'')
      .replace(/infinito/g,'inf')
      .replace(/−/g,'-');
  }

  function buildQuestion(q, idx, total){
    const card = document.createElement('div');
    card.className='quiz-card';
    card.dataset.correct='false';
    card.innerHTML = `<div class="q-kicker">Pregunta ${idx+1} de ${total}</div>
      <p class="q-prompt">${q.prompt}</p>`;

    let body;
    if(q.type==='mcq' || q.type==='tf'){
      const options = q.type==='tf' ? ['Verdadero','Falso'] : q.options;
      body = document.createElement('div');
      body.className='q-options';
      options.forEach((opt,i)=>{
        const id = `q${idx}-opt${i}`;
        const label = document.createElement('label');
        label.className='q-option';
        label.setAttribute('for',id);
        label.innerHTML = `<input type="radio" name="q${idx}" id="${id}" value="${i}"> <span>${opt}</span>`;
        body.appendChild(label);
      });
    } else if(q.type==='fill'){
      body = document.createElement('div');
      body.className='q-fill';
      body.innerHTML = `<input type="text" placeholder="Escribí tu respuesta" aria-label="Respuesta">`;
    }
    card.appendChild(body);

    const actions = document.createElement('div');
    actions.className='quiz-actions';
    const checkBtn = document.createElement('button');
    checkBtn.type='button'; checkBtn.className='btn secondary';
    checkBtn.textContent='Comprobar ✔';
    actions.appendChild(checkBtn);
    card.appendChild(actions);

    const feedback = document.createElement('div');
    feedback.className='q-feedback';
    card.appendChild(feedback);

    function getSelection(){
      if(q.type==='fill'){
        const v = body.querySelector('input').value;
        return v;
      }
      const sel = body.querySelector('input:checked');
      return sel ? parseInt(sel.value,10) : null;
    }
    function isCorrect(sel){
      if(q.type==='mcq') return sel === q.correct;
      if(q.type==='tf') return (sel===0) === (q.correct===true);
      if(q.type==='fill'){
        const accepted = Array.isArray(q.accept) ? q.accept : [q.accept];
        return accepted.some(a => normalize(a)===normalize(sel));
      }
      return false;
    }

    checkBtn.addEventListener('click', ()=>{
      const sel = getSelection();
      if(sel===null || sel===''){
        feedback.className='q-feedback show bad';
        feedback.textContent='Elegí o escribí una respuesta antes de comprobar 🙂';
        return;
      }
      const ok = isCorrect(sel);
      // marcar opciones visualmente
      if(q.type!=='fill'){
        body.querySelectorAll('.q-option').forEach((lab,i)=>{
          lab.classList.remove('correct','incorrect');
          const input = lab.querySelector('input');
          input.disabled = true;
          if(q.type==='mcq' && i===q.correct) lab.classList.add('correct');
          if(q.type==='tf' && ((i===0)===(q.correct===true))) lab.classList.add('correct');
          if(input.checked && !ok) lab.classList.add('incorrect');
        });
      }
      feedback.className = 'q-feedback show ' + (ok?'ok':'bad');
      feedback.innerHTML = (ok? '✔ ¡Correcto! ' : '✘ No es así. ') + (q.explain||'');

      if(ok){
        card.dataset.correct='true';
        checkBtn.disabled=true;
        checkBtn.classList.add('correct');
        checkBtn.textContent='¡Correcto!';
      } else {
        checkBtn.textContent='Intentar de nuevo ↺';
        checkBtn.classList.add('wrong');
        setTimeout(()=>{ checkBtn.classList.remove('wrong'); },600);
        if(q.type!=='fill'){
          body.querySelectorAll('input').forEach(i=>i.disabled=false);
          body.querySelectorAll('.q-option').forEach(lab=>lab.classList.remove('incorrect'));
        }
      }
      card.dispatchEvent(new Event('nb-quiz-update'));
    });

    return card;
  }

  window.NBQuiz = function(containerId, config){
    const container = document.getElementById(containerId);
    if(!container) return;
    const total = config.questions.length;
    const cardsWrap = document.createElement('div');
    config.questions.forEach((q,i)=> cardsWrap.appendChild(buildQuestion(q,i,total)) );
    container.appendChild(cardsWrap);

    const progress = document.createElement('div');
    progress.className='quiz-progress';
    container.insertBefore(progress, cardsWrap);

    const finishWrap = document.createElement('div');
    finishWrap.style.textAlign='center';
    finishWrap.style.marginTop='10px';
    const finishBtn = document.createElement('button');
    finishBtn.className='btn'; finishBtn.type='button';
    finishBtn.textContent='Finalizar cuestionario 📘';
    finishWrap.appendChild(finishBtn);
    container.appendChild(finishWrap);

    const summary = document.createElement('div');
    summary.className='quiz-summary';
    container.appendChild(summary);

    function updateProgress(){
      const correct = cardsWrap.querySelectorAll('.quiz-card[data-correct="true"]').length;
      progress.textContent = `${correct} de ${total} respondidas correctamente`;
      return correct;
    }
    cardsWrap.addEventListener('nb-quiz-update', updateProgress);
    updateProgress();

    finishBtn.addEventListener('click', ()=>{
      const correct = updateProgress();
      const pct = Math.round(correct/total*100);
      const pass = correct/total >= (config.passScore||0.7);
      summary.classList.add('show');
      summary.innerHTML = `
        <div class="score">${correct}/${total}</div>
        <p>${pct}% de aciertos. ${
          pass ? '¡Muy bien! Dominás las ideas clave de este módulo.'
               : 'Todavía te conviene repasar algunos conceptos de este módulo antes de seguir.'
        }</p>
        <button class="btn secondary" type="button" id="retry-quiz-${containerId}">Reiniciar cuestionario ↺</button>
      `;
      summary.scrollIntoView({behavior:'smooth', block:'center'});
      if(pass && window.NB){
        window.NB.setModuleComplete(config.moduleId, correct, total);
        buildDrawerIfPresent();
      }
      document.getElementById('retry-quiz-'+containerId).addEventListener('click', ()=>{
        location.reload();
      });
    });

    function buildDrawerIfPresent(){
      // vuelve a pintar el índice para reflejar el check ✔ recién ganado
      const drawer = document.getElementById('index-drawer');
      if(drawer && drawer.innerHTML){
        const ev = new Event('DOMContentLoaded');
        // notebook.js ya corrió; simplemente re-invocamos su build si está expuesta
      }
    }
  };
})();
