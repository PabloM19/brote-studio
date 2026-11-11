/* Brote Studio · additive onboarding; never writes to the project configuration. */
window.createBroteGuide = function (api) {
  'use strict';
  const key = 'brote-studio-guide-v1';
  const milestones = [
    ['pages','Confirma tus páginas','Elige tu estructura y pulsa Crear páginas.'],
    ['design','Elige una composición','Aplica un diseño de la biblioteca.'],
    ['identity','Hazla tuya','Cambia un estilo o un ajuste de identidad.'],
    ['content','Cuenta tu historia','Edita un texto desde Esta página.'],
    ['mobile','Revisa el móvil','Abre el dispositivo Móvil de la vista previa.'],
    ['export','Guarda una copia','Exporta la configuración de tu proyecto.']
  ];
  let progress = { intro: 'new', step: 0, done: [] };
  let storageAvailable = true;
  let dialog, savedUI, returnFocus, tourIndex = -1, resizeFrame;
  const $ = s => document.querySelector(s);
  const steps = [
    { stage:'pages', target:'.page-option', title:'Empieza por lo que quieres contar.', text:'Busca entre las 35 páginas, explora las categorías o añade una propia. Inicio es esencial; el resto lo eliges tú.' },
    { stage:'design', target:'.variant-card', title:'El diseño se elige viéndolo.', text:'Explora 73 composiciones en 20 familias. Cada miniatura muestra el componente real; el diseño elegido se aplica a toda tu web.' },
    { stage:'brand', target:'.preset-card', title:'Dale tu identidad.', text:'Empieza con una paleta o ajusta tu marca, los colores, las fuentes, los espacios y el pie. Tus páginas se conservan.' },
    { stage:'design', category:'composition', target:'[data-content=title]', title:'Cada página tiene su historia.', text:'Edita títulos y descripciones, añade secciones, cambia su orden o escóndelas. Estos contenidos pertenecen solo a la página elegida.' },
    { stage:'design', pane:'preview', target:'.page-picker', title:'Muévete por tu web.', text:'Este selector cambia la página de la vista previa. También puedes navegar con los enlaces del propio sitio.' },
    { stage:'design', pane:'preview', device:'mobile', target:'.canvas-tools', title:'Mira cómo crece en cada pantalla.', text:'Alterna entre escritorio, tableta y móvil. La vista previa tiene un tamaño independiente del editor para comprobar el diseño real.' },
    { stage:'design', target:'.export-btn', title:'Tu trabajo, a salvo.', text:'Los cambios se guardan en este navegador. Exporta el JSON para conservar una copia o importarlo en otro equipo. Ver sitio abre la vista ampliada.' }
  ];
  const taskLabels = ['Elegir páginas', 'Explorar componentes', 'Personalizar identidad', 'Editar esta página', 'Ver en móvil', 'Abrir exportación'];
  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (!saved || !Array.isArray(saved.done)) return;
      progress.intro = ['new','paused','completed','skipped'].includes(saved.intro)
        ? saved.intro : saved.seen ? 'skipped' : 'new';
      progress.step = Number.isInteger(saved.step) ? Math.max(0, Math.min(steps.length - 1, saved.step)) : 0;
      progress.done = milestones.map(([id]) => id).filter(id => saved.done.includes(id));
    } catch { storageAvailable = false; }
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(progress)); storageAvailable = true; }
    catch { storageAvailable = false; }
    refresh();
  }
  function refresh() {
    document.querySelectorAll('[data-guide-count]').forEach(el => { el.textContent = `${progress.done.length}/6`; });
    const sidebar = $('[data-guide-sidebar]');
    if (!sidebar) return;
    const next = milestones.find(([id]) => !progress.done.includes(id));
    sidebar.querySelector('small').textContent = next ? next[1] : 'Propuesta preparada';
    sidebar.querySelector('i').style.width = `${progress.done.length / milestones.length * 100}%`;
  }
  function frame(content, cls = '') {
    dialog.className = `brote-guide ${cls}`;
    dialog.innerHTML = content;
    if (!dialog.open) dialog.showModal();
  }
  function close() { if (tourIndex >= 0) restore(); dialog.close(); (returnFocus?.isConnected ? returnFocus : $('.guide-btn'))?.focus({preventScroll:true}); }
  function heading(title, kicker='BROTE STUDIO') { return `<div class="guide-heading"><div><span class="eyebrow">${kicker}</span><h2 id="guide-title">${title}</h2></div><button class="icon-btn" data-guide="close" aria-label="Cerrar guía">${api.icon('close')}</button></div>`; }
  function open() {
    if (!dialog.open) returnFocus = document.activeElement;
    const status = {new:'Recorrido disponible', paused:`Pausado en el paso ${progress.step + 1} de ${steps.length}`, completed:'Recorrido completado', skipped:'Recorrido saltado'};
    const action = {new:'Empezar el recorrido', paused:'Retomar el recorrido', completed:'Repetir el recorrido', skipped:'Empezar el recorrido'};
    const next = milestones.find(([id]) => !progress.done.includes(id))?.[0];
    const tasks = milestones.map(([id,title,text],i) => {
      const done = progress.done.includes(id);
      return `<li class="${done ? 'is-done' : ''} ${next === id ? 'is-next' : ''}">
        <span aria-label="${done ? 'Completado' : 'Pendiente'}">${done ? api.icon('check',15) : String(i+1).padStart(2,'0')}</span>
        <div><strong>${title}</strong><p>${text}</p>
        <button class="quiet-link" data-guide="task" data-task="${id}">${taskLabels[i]} ${api.icon('arrow',13)}</button></div>
      </li>`;
    }).join('');
    frame(`${heading('Tu web, paso a paso.')}
      <p class="guide-lead">Seis hitos para preparar tu primera propuesta. Puedes seguirlos en el orden que prefieras.</p>
      <div class="guide-progress" role="progressbar" aria-label="Hitos de tu web" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${progress.done.length}"><span style="width:${progress.done.length/6*100}%"></span></div>
      <p class="guide-progress-label">${progress.done.length} de 6 hitos completados</p>
      <p class="guide-note">${status[progress.intro]}</p>
      <ol class="guide-checklist">${tasks}</ol>
      ${next ? '' : '<p class="guide-note">Tu primera propuesta está preparada.</p>'}
      <button class="ui-btn primary full-width" data-guide="tour">${action[progress.intro]} ${api.icon('arrow',16)}</button>
      ${progress.intro === 'paused' ? '<button class="guide-skip" data-guide="restart">Empezar el recorrido desde el principio</button>' : ''}
      <button class="guide-skip" data-guide="setup">Abrir configuración inicial</button>
      <details class="guide-demo"><summary>Opciones de demostración</summary><p>Reinicia el estado del tutorial y los hitos de esta guía.</p><button class="ui-btn" data-guide="reset">Reiniciar tutorial e hitos</button></details>
      <p class="guide-footnote">${storageAvailable ? 'Los hitos se guardan en este navegador.' : 'El navegador no permite guardar los hitos fuera de esta sesión.'}</p>`);
  }
  function restore() {
    tourIndex = -1;
    if (savedUI) api.restore(savedUI);
    savedUI = null;
  }
  function start(resume = true) {
    savedUI = api.snapshot();
    tourIndex = resume && progress.intro === 'paused' ? progress.step : 0;
    showStep();
  }
  function skip() {
    if (progress.intro !== 'completed') progress.intro = 'skipped';
    progress.step = 0;
    save();
    close();
    api.choosePages();
  }
  function showStep() {
    const step = steps[tourIndex];
    progress.intro = 'paused';
    progress.step = tourIndex;
    save();
    api.navigate(step);
    frame(`<div class="guide-spotlight" aria-hidden="true"></div><section class="guide-tour-card"><div class="guide-tour-top"><span class="eyebrow">RECORRIDO · ${tourIndex+1} / ${steps.length}</span><button class="icon-btn" data-guide="close" aria-label="Pausar el recorrido">${api.icon('close',17)}</button></div><h2 id="guide-title">${step.title}</h2><p>${step.text}</p><div class="guide-tour-dots" aria-hidden="true">${steps.map((_,i)=>`<i class="${i===tourIndex?'active':''}"></i>`).join('')}</div><div class="guide-tour-actions"><button class="quiet-link" data-guide="skip">Saltar tutorial</button><div><button class="ui-btn" data-guide="back" ${tourIndex===0?'disabled':''}>Atrás</button><button class="ui-btn primary" data-guide="next">${tourIndex===steps.length-1?'Terminar':'Siguiente'} ${api.icon('arrow',15)}</button></div></div></section>`, 'guide-tour');
    position(); requestAnimationFrame(position);
    dialog.querySelector('[data-guide="next"]').focus({preventScroll:true});
  }
  function position() {
    if (tourIndex < 0 || !dialog?.open) return;
    const target = $(steps[tourIndex].target); if(!target) return;
    const r = target.getBoundingClientRect(), gap = 9, w = innerWidth, h = innerHeight;
    const spot = dialog.querySelector('.guide-spotlight'), card = dialog.querySelector('.guide-tour-card');
    const left=Math.max(7,r.left-gap), top=Math.max(7,r.top-gap), right=Math.min(w-7,r.right+gap), bottom=Math.min(h-7,r.bottom+gap);
    Object.assign(spot.style,{left:`${left}px`,top:`${top}px`,width:`${Math.max(0,right-left)}px`,height:`${Math.max(0,bottom-top)}px`});
    const cw=card.offsetWidth, ch=card.offsetHeight, margin=16;
    let x, y;
    if(w-right >= cw+margin*2){x=right+margin;y=top;}
    else if(left >= cw+margin*2){x=left-cw-margin;y=top;}
    else {x=(w-cw)/2;y=bottom+margin; if(y+ch>h-margin) y=top-ch-margin; if(y<margin)y=h-ch-margin;}
    Object.assign(card.style,{left:`${Math.max(margin,Math.min(w-cw-margin,x))}px`,top:`${Math.max(margin,Math.min(h-ch-margin,y))}px`});
  }
  function finish() {
    progress.intro = 'completed';
    save();
    restore();
    frame(`${heading('Ya conoces el terreno.','AHORA, HAZLO TUYO')}<div class="guide-welcome-mark">${api.icon('sprout',42)}</div><p class="guide-lead">Ya puedes seguir ajustando tu web desde el personalizador.</p><p class="guide-note">Los hitos se completan al trabajar en el editor. El recorrido no cambia tu proyecto ni marca tareas por ti.</p><button class="ui-btn primary full-width" data-guide="close">Volver al personalizador ${api.icon('arrow',16)}</button><button class="guide-skip" data-guide="checklist">Ver mis hitos</button>`);
  }
  function complete(id) {
    if(tourIndex>=0 || progress.done.includes(id)) return;
    progress.done.push(id); save();
    const m=milestones.find(m=>m[0]===id); api.toast(`${m[1]} · ${progress.done.length} de 6 hitos`);
  }
  function init() {
    dialog=document.createElement('dialog'); dialog.id='brote-guide'; dialog.setAttribute('aria-labelledby','guide-title'); document.body.append(dialog);
    dialog.addEventListener('click', e=>{
      const button=e.target.closest('[data-guide]'); if(!button)return;
      const action=button.dataset.guide;
      if (action === 'close') {
        if (progress.intro === 'new') { progress.intro = 'skipped'; save(); }
        close();
      } else if (action === 'tour' || action === 'restart') start(action !== 'restart');
      else if (action === 'next') {
        if (tourIndex === steps.length - 1) finish();
        else { tourIndex++; showStep(); }
      } else if (action === 'back' && tourIndex > 0) {
        tourIndex--; showStep();
      } else if (action === 'skip') skip();
      else if (action === 'checklist') open();
      else if (action === 'setup') { close(); api.openSetup(); }
      else if (action === 'task') { close(); api.openTask(button.dataset.task); }
      else if (action === 'reset') { progress = {intro:'new', step:0, done:[]}; save(); open(); }
    });
    dialog.addEventListener('cancel', e => {
      e.preventDefault();
      dialog.querySelector('[data-guide="close"]')?.click();
    });
    dialog.addEventListener('keydown', e => {
      if (tourIndex < 0 || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      dialog.querySelector(`[data-guide="${e.key === 'ArrowLeft' ? 'back' : 'next'}"]`)?.click();
    });
    window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(position);});
    readProgress();
    refresh();
  }
  function credit(ids) {
    progress.done = [...new Set([...progress.done, ...ids])];
    save();
  }
  return {init,open,complete,refresh,credit};
};
