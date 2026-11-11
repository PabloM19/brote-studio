/* Guided project draft. The editor receives the choices only after confirmation. */
window.createBroteSetup = function (api) {
  'use strict';

  const key = 'brote-studio-setup-v1';
  const root = document.querySelector('#setup');
  const app = document.querySelector('#app');
  const dialog = document.querySelector('#setup-site');
  const esc = api.escape;
  const steps = ['Bienvenida', 'Tu centro', 'Productos', 'Servicios', 'Páginas', 'Colores', 'Menú', 'Portada', 'Tarjetas', 'Secciones y pie', 'Resumen'];
  const fields = {
    brand: ['Nombre del centro', 'Ej. Vivero La Umbría', 60],
    tagline: ['Frase de marca', 'Ej. Plantas para vivir mejor', 120],
    location: ['Municipio', 'Ej. Santa Eulària', 80],
    address: ['Dirección', 'Calle y número', 150],
    phone: ['Teléfono', '', 40, 'tel'],
    email: ['Correo', '', 100, 'email'],
    hours: ['Horario', 'Ej. Lunes a sábado, 9:00–18:00', 160],
    title: ['Titular de la portada', 'Se propone un título con el nombre de tu centro', 180],
    description: ['Introducción de la portada', 'Se propone un texto con tus productos o servicios', 600]
  };
  const colors = { primary: 'Principal', accent: 'Acento', background: 'Fondo', text: 'Texto' };
  const groups = [
    ['Inicio', page => page.id === 'inicio'],
    ['Plantas', page => page.group === 'Plantas'],
    ['Productos', page => page.group === 'Productos'],
    ['Servicios', page => page.group === 'Servicios'],
    ['Otras páginas', page => !['Plantas','Productos','Servicios'].includes(page.group) && page.id !== 'inicio']
  ];
  const extras = { info:'Presentación del centro', gallery:'Galería de fotos', blog:'Últimos artículos', faq:'Preguntas frecuentes', cta:'Invitación final' };
  const goalLabels = { products:'Explorar productos', services:'Descubrir servicios', contact:'Contactar' };
  const families = ['navbar','hero','cards','footer','forms','buttons'];
  const illustrated = {interior:'interior.jpg',exterior:'exterior.jpg',cactus:'cactus.jpg',paisajismo:'landscape.jpg'};
  const catalogPage = p => ['Plantas','Productos'].includes(p.group);
  const servicePage = p => p.group === 'Servicios';
  const otherPage = p => !catalogPage(p) && !servicePage(p);
  const home = 'inicio';
  const lastStep = steps.length - 1;
  let draft, step, pages, existing, returnFocus, observer, expanded, query, previewPage, previewTimer;
  let fromSummary = false;

  function readDraft() {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  }
  function saveDraft() {
    try { localStorage.setItem(key, JSON.stringify({ version:2, step, draft, fromSummary })); } catch {}
  }
  function clearDraft() {
    try { localStorage.removeItem(key); } catch {}
  }

  function open({ resume = false, hasProject = false } = {}) {
    const base = api.current();
    const saved = resume ? readDraft() : null;
    const previous = saved?.draft;
    pages = api.pages();
    existing = hasProject;
    returnFocus = document.activeElement;
    // Older drafts keep their choices and start at the first new question.
    step = Number.isInteger(saved?.step) ? Math.max(0, Math.min(saved.version === 2 ? lastStep : 2, saved.step)) : 0;
    fromSummary = saved?.version === 2 && saved.fromSummary === true && step !== lastStep;
    expanded = false;
    query = '';
    const initialPages = Array.isArray(previous?.pages) ? previous.pages : existing ? base.pages : [home,'nosotros','contacto'];
    const homePage = base.pageContent[home];
    const initialValue = key => {
      if (key === 'title') return existing ? homePage.title : '';
      if (key === 'description') return existing ? homePage.description : '';
      return existing ? base.settings[key] || '' : '';
    };
    draft = {
      ...Object.fromEntries(Object.entries(fields).map(([key, spec]) =>
        [key, typeof previous?.[key] === 'string' ? previous[key].slice(0, spec[2]) : initialValue(key)])),
      pages: [home, ...initialPages.filter((id, index) => id !== home && initialPages.indexOf(id) === index && pages.some(p => p.id === id))],
      ...Object.fromEntries(families.map(family => [family,
        Number.isInteger(previous?.[family]) && api.variants[family].variants[previous[family]] !== undefined
          ? previous[family] : base.components[family]])),
      colors: Object.fromEntries(Object.keys(colors).map(key =>
        [key, /^#[\da-f]{6}$/i.test(previous?.colors?.[key]) ? previous.colors[key] : base.settings[key]])),
      palette: Number.isInteger(previous?.palette) && api.palettes[previous.palette] ? previous.palette : null,
      groupMenu: previous?.groupMenu ?? (base.settings.homeGoal ? base.settings.groupMenu : true),
      goal: Object.hasOwn(goalLabels, previous?.goal) ? previous.goal : base.settings.homeGoal || 'products',
      featured: typeof previous?.featured === 'string' ? previous.featured : base.settings.focusProduct || '',
      extras: Object.keys(extras).filter(key => Array.isArray(previous?.extras) ? previous.extras.includes(key)
        : existing ? homePage.sections.some(section => section.type === key && !section.hidden) : ['info','cta'].includes(key))
    };
    app.hidden = true;
    root.hidden = false;
    document.body.classList.add('setup-active');
    show();
  }

  function close(apply) {
    observer?.disconnect();
    clearTimeout(previewTimer);
    api.done(apply ? draft : null);
    clearDraft();
    root.hidden = true;
    root.replaceChildren();
    document.body.classList.remove('setup-active');
    app.hidden = false;
    const focus = !apply && returnFocus?.isConnected && returnFocus !== document.body
      ? returnFocus : document.querySelector('#editor-workspace');
    focus?.focus({ preventScroll: true });
  }

  function selected(filter) {
    return draft.pages.map(id => pages.find(page => page.id === id)).filter(page => page && filter(page));
  }

  function heading(title, copy) {
    return `<h1 id="setup-title" tabindex="-1">${title}</h1><p class="setup-lead">${copy}</p>`;
  }
  function input(key) {
    const [label, placeholder, limit, type = 'text'] = fields[key];
    return `<label>${label}${key === 'description'
      ? `<textarea rows="3" name="${key}" maxlength="${limit}" placeholder="${placeholder}">${esc(draft[key])}</textarea>`
      : `<input id="setup-${key}" type="${type}" name="${key}" maxlength="${limit}" placeholder="${placeholder}" value="${esc(draft[key])}">`}</label>`;
  }
  function optionPage(page, visual = false) {
    const photo = visual && illustrated[page.id];
    return `<label class="setup-page${visual ? ' setup-product' : ''}">
      <input type="checkbox" data-setup-page="${esc(page.id)}" ${draft.pages.includes(page.id) ? 'checked' : ''} ${page.id === home ? 'disabled' : ''}>
      ${visual ? `<span class="setup-product-art" aria-hidden="true">${photo ? `<img src="${esc(api.image(photo))}" alt="">` : api.icon(servicePage(page) ? 'spark' : page.group === 'Productos' ? 'tag' : 'leaf',20)}</span>` : ''}
      <span><strong>${esc(page.name)}</strong><small>${page.id === home ? 'Página principal · incluida' : esc(page.description)}</small></span>
    </label>`;
  }
  function otherPages() {
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const term = normalize(query.trim());
    const result = pages.filter(page => otherPage(page) && (term
      ? normalize(`${page.name} ${page.group}`).includes(term)
      : expanded || draft.pages.includes(page.id) || ['nosotros','contacto','blog','proyectos','talleres'].includes(page.id)));
    return result.map(page => optionPage(page)).join('') || '<p>No hay páginas con ese nombre.</p>';
  }
  function featuredProduct() {
    const products = selected(catalogPage);
    if (!products.length) return '';
    return `<label class="setup-inline-field">¿Cuál quieres destacar primero?
      <select name="featured">
        <option value="">La primera que marque</option>
        ${products.map(page => `<option value="${esc(page.id)}" ${draft.featured === page.id ? 'selected' : ''}>${esc(page.name)}</option>`).join('')}
      </select></label>`;
  }
  function structure() {
    if (!draft.groupMenu) {
      return `<ul class="setup-sitemap-flat">${selected(() => true).map(page => `<li>${esc(page.name)}</li>`).join('')}</ul>`;
    }
    return `<div class="setup-sitemap">${groups.map(([label, filter], index) => {
      const items = selected(filter);
      if (!items.length) return '';
      if (index === 0) return '<span class="setup-map-home">Inicio</span>';
      return `<details ${index <= 3 ? 'open' : ''}><summary>${label} <small>${items.length}</small></summary>
        <ul>${items.map(page => `<li>${esc(page.name)}</li>`).join('')}</ul></details>`;
    }).join('')}</div>`;
  }
  function choices(family, title, visual = true) {
    const { variants, hints } = api.variants[family];
    return `<fieldset class="${visual ? 'setup-options' : 'setup-compact-options'}" aria-label="${title}">
      ${variants.map((name, index) => `<label class="setup-option">
        <input type="radio" name="${family}" value="${index}" ${draft[family] === index ? 'checked' : ''}>
        <span class="setup-option-copy"><strong>${name}</strong><small>${hints[index]}</small></span>
        ${visual ? `<span class="setup-sample setup-sample-${family}" data-index="${index}" data-family="${family}" aria-hidden="true"><iframe tabindex="-1" title="Muestra de ${name}" sandbox></iframe></span>` : ''}
      </label>`).join('')}
    </fieldset>`;
  }
  function paletteChoices() {
    return `<fieldset class="setup-palettes" aria-label="Paletas de color">
      ${api.palettes.map((palette, index) => `<label class="setup-palette">
        <input type="radio" name="palette" value="${index}" ${palette.colors.every((color, i) => color === Object.values(draft.colors)[i]) ? 'checked' : ''}>
        <strong>${palette.name}</strong>
        <span>${palette.colors.map(color => `<i style="background:${color}"></i>`).join('')}</span>
      </label>`).join('')}
    </fieldset>`;
  }
  function colorPreview() {
    const {primary, accent, background, text} = draft.colors;
    return `<div class="setup-color-preview" style="--sample-primary:${primary};--sample-accent:${accent};--sample-bg:${background};--sample-text:${text};--sample-on-primary:${api.onColor(primary)}">
      <small>Así se verá tu paleta</small><strong>${esc(draft.brand.trim() || api.current().settings.brand)}</strong>
      <p>Una web para tu centro de jardinería.</p><span>Ver catálogo ${api.icon('arrow',15)}</span>
    </div>`;
  }
  function review() {
    const products = selected(catalogPage), services = selected(servicePage);
    const title = esc(draft.brand.trim() || api.current().settings.brand);
    return `${heading(`${title}, tu web toma forma.`, 'Revisa las páginas y abre la vista completa para probar el menú. Tus decisiones se aplicarán cuando entres al personalizador.')}
      <div class="setup-review">
        <dl>
          <div><dt>Datos del centro</dt><dd>${esc(draft.location || 'Municipio sin indicar')}${draft.hours ? ` · ${esc(draft.hours)}` : ''}</dd><button class="quiet-link" data-setup="edit" data-step="1">Editar datos del centro</button></div>
          <div><dt>Páginas creadas al aplicar</dt><dd>${draft.pages.length} páginas · ${products.length} categorías de producto · ${services.length} servicios</dd>
          <div class="setup-review-actions"><button class="quiet-link" data-setup="edit" data-step="2">Editar productos</button><button class="quiet-link" data-setup="edit" data-step="3">Editar servicios</button><button class="quiet-link" data-setup="edit" data-step="4">Editar páginas</button></div></div>
          ${[['Colores','',5],['Navegación','navbar',6],['Portada','hero',7],['Tarjetas','cards',8],['Pie de página','footer',9]].map(([name, family, target]) => `<div><dt>${name}</dt><dd>${family ? api.variants[family].variants[draft[family]] : Object.values(draft.colors).map(color => `<i class="setup-swatch" style="background:${color}" title="${color}"></i>`).join('')}</dd><button class="quiet-link" data-setup="edit" data-step="${target}">Editar ${name.toLowerCase()}</button></div>`).join('')}
        </dl>
        <div>
          <div class="setup-sample setup-final-preview"><iframe tabindex="-1" title="Vista previa de tu portada" sandbox></iframe></div>
          <button class="ui-btn setup-full-preview" data-setup="preview">${api.icon('eye',17)} Ver la web completa</button>
          <div class="setup-map-preview">${structure()}</div>
        </div>
      </div>`;
  }
  function screen() {
    switch (step) {
      case 0: return `<section class="setup-intro"><div class="setup-intro-copy">
        <h1 id="setup-title" tabindex="-1">Bienvenido a<br>Brote Studio<span>.</span></h1>
        <p class="setup-lead">Cuéntanos qué vendes, qué servicios ofreces y cómo te gustaría que se viera tu web. Con tus respuestas prepararemos las páginas, el menú y el diseño.</p>
        <button class="ui-btn primary setup-primary" data-setup="next">Empezar ${api.icon('arrow',18)}</button>
        </div><figure class="setup-photo"><img src="${esc(api.image('hero.jpg'))}" alt="Invernadero luminoso lleno de plantas"></figure></section>`;
      case 1: return `${heading('¿Cómo es tu centro?', 'Añade el nombre y los datos que quieras mostrar en la web.')}
        <div class="setup-fields setup-field-grid">${['brand','tagline','location','address','phone','email','hours'].map(input).join('')}</div>`;
      case 2: return `${heading('¿Qué productos vendes más?', 'Marca las categorías que quieras mostrar. Cada una tendrá una página enlazada desde el menú.')}
        <div class="setup-pages">${pages.filter(catalogPage).map(page => optionPage(page, true)).join('')}</div>
        <div data-setup-featured>${featuredProduct()}</div>`;
      case 3: return `${heading('¿Qué servicios ofreces?', 'Marca los que quieres anunciar. Prepararemos una página para cada uno y los destacaremos en Inicio.')}
        <div class="setup-pages">${pages.filter(servicePage).map(page => optionPage(page, true)).join('')}</div>`;
      case 4: return `${heading('¿Qué más quieres contar?', 'Añade las páginas que falten. Las categorías y servicios que ya marcaste aparecen en la estructura.')}
        <div class="setup-structure"><div>
          <label class="setup-search">${api.icon('search',17)}<input type="search" placeholder="Buscar páginas adicionales" aria-label="Buscar páginas adicionales" value="${esc(query)}"></label>
          <div class="setup-pages" data-setup-other>${otherPages()}</div>
          <button class="quiet-link setup-more" data-setup="more" aria-expanded="${expanded}">${expanded ? 'Ver las recomendadas' : 'Ver todas las adicionales'}</button>
          </div><aside class="setup-map-preview"><h2>Estructura propuesta</h2>
          <label class="setup-switch"><input type="checkbox" name="groupMenu" ${draft.groupMenu ? 'checked' : ''}> Agrupar plantas, productos y servicios en submenús</label>
          <div data-setup-map>${structure()}</div></aside></div>`;
      case 5: return `${heading('¿Qué colores van contigo?', 'Elige una paleta o ajusta cada color. La vista cambia al momento.')}
        <div class="setup-color-layout"><div>${paletteChoices()}
          <div class="setup-custom-colors">${Object.entries(colors).map(([key,label]) => `<label>${label}<input type="color" data-setup-color="${key}" value="${draft.colors[key]}"></label>`).join('')}</div>
        </div><div data-setup-color-preview>${colorPreview()}</div></div>`;
      case 6: return `${heading('¿Cómo quieres el menú?', 'Compara las cabeceras con tu marca y las páginas que elegiste.')}
        ${choices('navbar','Diseños del menú')}`;
      case 7: return `${heading('¿Qué quieres mostrar al entrar?', 'Elige la composición de la portada y la acción principal. Puedes escribir tus textos o usar la propuesta.')}
        <div class="setup-fields setup-hero-fields">${input('title')}${input('description')}
          <label>Botón principal<select name="goal">${Object.entries(goalLabels).map(([key,label]) => `<option value="${key}" ${draft.goal === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
        </div>${choices('hero','Diseños de portada')}`;
      case 8: return `${heading('¿Cómo mostramos tus productos?', selected(catalogPage).length ? 'Elige el formato de las tarjetas con las categorías que has marcado.' : 'Compara formatos con tarjetas de ejemplo. Puedes añadir un catálogo más adelante.')}
        ${choices('cards','Diseños de tarjeta')}
        <details class="setup-extra-options"><summary>Estilo de los botones</summary>${choices('buttons','Estilo de los botones',false)}</details>`;
      case 9: return `${heading('¿Qué ponemos en Inicio y al pie?', 'Elige las secciones adicionales y cómo quieres cerrar cada página.')}
        <div class="setup-extras">${Object.entries(extras).map(([key,label]) => `<label class="setup-switch"><input type="checkbox" data-setup-extra="${key}" ${draft.extras.includes(key) ? 'checked' : ''}> ${label}</label>`).join('')}</div>
        ${choices('footer','Diseños del pie de página')}
        ${draft.pages.includes('contacto') ? `<details class="setup-extra-options"><summary>Diseño del formulario de contacto</summary>${choices('forms','Diseños del formulario',false)}</details>` : ''}`;
      default: return review();
    }
  }

  function pageCount() {
    root.querySelector('.setup-count')?.replaceChildren(`${draft.pages.length} ${draft.pages.length === 1 ? 'página elegida' : 'páginas elegidas'}`);
  }
  function show() {
    observer?.disconnect();
    clearTimeout(previewTimer);
    saveDraft();
    root.innerHTML = `<header class="setup-header">
      <div class="app-brand"><span class="brand-mark">${api.icon('sprout',25)}</span><span class="brand-word">brote<span>STUDIO</span></span></div>
      <div class="setup-progress" role="progressbar" aria-label="Progreso de la configuración" aria-valuemin="1" aria-valuemax="${steps.length}" aria-valuenow="${step + 1}" aria-valuetext="${steps[step]}, paso ${step + 1} de ${steps.length}">
        <span>${steps[step]} <small>${step + 1} de ${steps.length}</small></span>
        <div aria-hidden="true">${steps.map((_, i) => `<i class="${i <= step ? 'is-current' : ''}"></i>`).join('')}</div>
      </div>
      ${existing ? '<button class="quiet-link setup-exit" data-setup="cancel">Volver al editor</button>' : ''}
    </header>
    <main class="setup-content" aria-labelledby="setup-title">${step === 0 ? screen() : `<section class="setup-standard">${screen()}</section>`}</main>
    ${step > 0 ? `<footer class="setup-footer">
      <button class="ui-btn" data-setup="back">Atrás</button>
      <span class="setup-count" aria-live="polite"></span>
      <button class="ui-btn primary setup-primary" data-setup="${step === lastStep ? 'apply' : 'next'}">${step === lastStep ? 'Ver el personalizador completo' : fromSummary ? 'Volver al resumen' : 'Continuar'} ${api.icon('arrow',16)}</button>
    </footer>` : ''}`;
    if ([2,3,4].includes(step)) pageCount();
    root.querySelector('#setup-title').focus({ preventScroll:true });
    mountPreviews();
  }

  function mountPreviews() {
    const boxes = root.querySelectorAll('.setup-sample');
    if (!boxes.length) return;
    observer = new ResizeObserver(entries => {
      for (const {target, contentRect} of entries) {
        const frame = target.querySelector('iframe');
        frame.style.transform = `scale(${contentRect.width / Number(frame.dataset.width)})`;
      }
    });
    for (const box of boxes) {
      const frame = box.querySelector('iframe');
      const family = box.dataset.family;
      const width = family === 'cards' ? 1000 : 1150;
      frame.dataset.width = width;
      frame.style.width = `${width}px`;
      observer.observe(box);
    }
    refreshPreviews();
  }
  function refreshPreviews() {
    for (const box of root.querySelectorAll('.setup-sample')) {
      box.querySelector('iframe').srcdoc = api.preview(draft, {family:box.dataset.family,index:Number(box.dataset.index)});
    }
  }

  function openSite() {
    previewPage = home;
    dialog.innerHTML = `<div class="preview-modal-bar"><strong id="setup-site-title">Vista previa de tu web</strong>
      <select aria-label="Página de la vista previa" id="setup-site-page">${selected(() => true).map(page => `<option value="${esc(page.id)}">${esc(page.name)}</option>`).join('')}</select>
      <form method="dialog"><button class="ui-btn">${api.icon('close',16)} Volver al resumen</button></form></div>
      <iframe title="Web completa" id="setup-site-frame" sandbox="allow-scripts"></iframe>`;
    loadPage(previewPage);
    dialog.showModal();
  }
  function loadPage(id) {
    if (!draft.pages.includes(id)) return;
    previewPage = id;
    dialog.querySelector('select').value = previewPage;
    dialog.querySelector('iframe').srcdoc = api.preview(draft, {page:previewPage,interactive:true});
  }
  dialog.addEventListener('change', event => { if (event.target.matches('select')) loadPage(event.target.value); });
  dialog.addEventListener('close', () => {
    dialog.replaceChildren();
    root.querySelector('[data-setup=preview]')?.focus();
  });
  window.addEventListener('message', event => {
    if (!dialog.open || event.source !== dialog.querySelector('iframe')?.contentWindow) return;
    if (event.data?.source === 'brote-preview' && event.data.type === 'navigate') loadPage(event.data.page);
  });

  root.addEventListener('click', event => {
    const control = event.target.closest('[data-setup]');
    if (!control) return;
    switch (control.dataset.setup) {
      case 'next':
        step = fromSummary ? lastStep : step + 1;
        fromSummary = false;
        show();
        break;
      case 'back':
        step = fromSummary ? lastStep : step - 1;
        fromSummary = false;
        show();
        break;
      case 'edit': step = Number(control.dataset.step); fromSummary = true; show(); break;
      case 'apply': close(true); break;
      case 'cancel': close(false); break;
      case 'preview': openSite(); break;
      case 'more':
        expanded = !expanded;
        control.setAttribute('aria-expanded', String(expanded));
        control.textContent = expanded ? 'Ver las recomendadas' : 'Ver todas las adicionales';
        root.querySelector('[data-setup-other]').innerHTML = otherPages();
        break;
    }
  });
  root.addEventListener('input', ({target}) => {
    if (target.type === 'search') {
      query = target.value;
      root.querySelector('[data-setup-other]').innerHTML = otherPages();
    } else if (Object.hasOwn(fields, target.name)) {
      draft[target.name] = target.value;
      if (step === 7) {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(refreshPreviews,220);
      }
      saveDraft();
    } else if (target.dataset.setupColor) {
      draft.colors[target.dataset.setupColor] = target.value;
      draft.palette = null;
      root.querySelectorAll('[name=palette]').forEach(option => { option.checked = false; });
      root.querySelector('[data-setup-color-preview]').innerHTML = colorPreview();
      saveDraft();
    }
  });
  root.addEventListener('change', ({target}) => {
    const { name, value, checked, dataset } = target;
    if (dataset.setupPage) {
      const id = dataset.setupPage;
      draft.pages = checked ? [...new Set([...draft.pages, id])] : draft.pages.filter(page => page !== id);
      if (!draft.pages.includes(draft.featured)) draft.featured = '';
      const featured = root.querySelector('[data-setup-featured]');
      if (featured) featured.innerHTML = featuredProduct();
      pageCount();
    } else if (dataset.setupExtra) {
      const id = dataset.setupExtra;
      draft.extras = checked ? [...new Set([...draft.extras,id])] : draft.extras.filter(item => item !== id);
    } else if (name === 'groupMenu') {
      draft.groupMenu = checked;
    } else if (name === 'palette') {
      draft.palette = Number(value);
      Object.keys(colors).forEach((key, i) => { draft.colors[key] = api.palettes[draft.palette].colors[i]; });
      root.querySelectorAll('[data-setup-color]').forEach(input => { input.value = draft.colors[input.dataset.setupColor]; });
      root.querySelector('[data-setup-color-preview]').innerHTML = colorPreview();
    } else if (families.includes(name)) {
      draft[name] = Number(value);
    } else if (['featured','goal'].includes(name)) {
      draft[name] = value;
      if (name === 'goal') refreshPreviews();
    } else if (['title','description'].includes(name)) {
      refreshPreviews();
    }
    const map = root.querySelector('[data-setup-map]');
    if (map) map.innerHTML = structure();
    saveDraft();
  });

  return { open, hasDraft: () => Boolean(readDraft()) };
};
