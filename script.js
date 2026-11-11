/* Brote Studio — responsive garden-centre preview renderer. No dependencies. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const clamp = (value, low, high, fallback) => Number.isFinite(Number(value)) ? Math.min(high, Math.max(low, Number(value))) : fallback;
  const color = (value, fallback) => /^#[0-9a-f]{6}$/i.test(String(value)) ? value : fallback;
  const iconPaths = {
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    leaf: '<path d="M20 3C8 2 2 8 5 15s15 7 15-12Z"/><path d="M4 21 16 9"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    phone: '<path d="M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pot: '<path d="M6 12h12l-2 9H8Z"/><path d="M12 12V4M12 8C6 9 4 6 4 3c5 0 8 2 8 5Zm0-2c4 0 6-2 6-5-4 0-6 2-6 5Z"/>',
    truck: '<path d="M2 4h12v13H2ZM14 9h4l4 5v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    sprout: '<path d="M12 22V11M12 15C5 16 2 11 2 6c7 0 10 3 10 9Zm0-4C12 4 16 2 22 2c0 6-4 10-10 9Z"/>',
    shield: '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/>',
    star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
    edit: '<path d="m15 4 5 5M4 20l4-1L21 6a2.8 2.8 0 0 0-4-4L4 15Z"/>',
    camera: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/>',
    chat: '<path d="M21 11a9 9 0 0 1-13 8l-6 2 2-6A9 9 0 1 1 21 11Z"/><path d="M8 10h8M8 14h5"/>',
    bag: '<path d="M4 7h16l-1 14H5ZM8 7V5a4 4 0 0 1 8 0v2"/>'
  };
  const icon = (name, extra = '') => `<svg class="s-icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.leaf}</svg>`;
  const defaults = {
    brand:'Jardín de Abril', tagline:'Un poco de verde, una vida más bonita.', location:'Valencia', email:'hola@jardindeabril.es', phone:'+34 960 123 456', address:'Camino del Jardín, 12 · Valencia',
    primary:'#234638', accent:'#dbe9ba', background:'#fbfaf7', text:'#24372e', headingFont:'serif', bodyFont:'sans', radius:14, spacing:68, maxWidth:1200, fontSize:16,
    shadow:'soft', buttonSize:'medium', cardRatio:'4/3', columns:3, logoMark:true, navSticky:true, topbar:false, animations:true
  };
  const basePages = [
    {id:'inicio',name:'Inicio'}, {id:'nosotros',name:'Nosotros'}, {id:'interior',name:'Plantas de interior'},
    {id:'exterior',name:'Plantas de exterior'}, {id:'cactus',name:'Cactus y suculentas'}, {id:'paisajismo',name:'Paisajismo'}, {id:'contacto',name:'Contacto'}
  ];
  const photos = {
    hero:'assets/hero.jpg', interior:'assets/interior.jpg', exterior:'assets/exterior.jpg', cactus:'assets/cactus.jpg', landscape:'assets/landscape.jpg', gardener:'assets/gardener.jpg'
  };
  function context(state = {}, pages = []) {
    const settings = {...defaults,...state.settings};
    const catalog = pages.length ? pages : basePages;
    const selected = (state.pages || catalog.map(page => page.id)).map(id => catalog.find(page => page.id === id)).filter(Boolean);
    const active = state.activePage || selected[0]?.id || 'inicio';
    return {
      state, settings, catalog, selected, active,
      page:state.pageContent?.[active] || {},
      meta:catalog.find(page => page.id === active) || selected[0] || basePages[0],
      components:state.components || {}, footer:{social:true,contact:true,hours:true,legal:true,quality:false,newsletter:false,...state.footer}
    };
  }
  const variant = (ctx, type, max) => Math.round(clamp(ctx.components[type], 0, max, 0));
  const heading = (title, text = '', eyebrow = '', cls = '') => `<div class="s-section-head ${cls}">${eyebrow ? `<span class="s-eyebrow">${esc(eyebrow)}</span>` : ''}<h2>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}</div>`;
  const img = (src, alt, extra = '', eager = false) => `<img src="${esc(src)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" ${extra}>`;
  function getRoute(ctx, candidates) {
    const needles = (Array.isArray(candidates) ? candidates : [candidates]).filter(Boolean);
    return ctx.selected.find(page => needles.some(needle => page.id === needle)) || ctx.selected.find(page => needles.some(needle => `${page.id} ${page.name}`.toLowerCase().includes(String(needle).toLowerCase()))) || null;
  }
  function routeAttributes(ctx, candidates, fallback = 'Esta página aún no forma parte de la estructura. Puedes añadirla desde Páginas.') {
    const page = getRoute(ctx, candidates);
    return page ? `data-page="${esc(page.id)}"` : `data-demo="${esc(fallback)}"`;
  }
  function button(ctx, text, candidates = ['contacto','contact'], secondary = false, extra = '') {
    return `<button type="button" class="s-btn s-btn-v${variant(ctx,'buttons',4)}${secondary ? ' s-btn-secondary' : ''}" ${routeAttributes(ctx,candidates)} ${extra}><span>${esc(text)}</span>${icon('arrow')}</button>`;
  }
  const demoButton = (text, message, cls = '') => `<button type="button" class="${cls}" data-demo="${esc(message)}">${esc(text)}</button>`;
  function brand(ctx, className = '') {
    return `<button class="s-brand ${className}" type="button" ${routeAttributes(ctx,['inicio','home'])} aria-label="${esc(ctx.settings.brand)} — Inicio">${ctx.settings.logoMark ? `<span class="s-brand-mark">${icon('sprout')}</span>` : ''}<span>${esc(ctx.settings.brand)}</span></button>`;
  }
  function pageLink(ctx, page, className = '', arrow = false) {
    return `<button type="button"${className ? ` class="${className}${page.id === ctx.active ? ' is-current' : ''}"` : ''} data-page="${esc(page.id)}"${page.id === ctx.active ? ' aria-current="page"' : ''}>${esc(page.name)}${arrow ? icon('arrow') : ''}</button>`;
  }
  function submenu(ctx, label, pages) {
    return `<details class="s-nav-more s-nav-group${pages.some(p => p.id === ctx.active) ? ' is-current' : ''}">
      <summary>${esc(label)} ${icon('down')}</summary>
      <div>${pages.map(page => pageLink(ctx,page)).join('')}</div></details>`;
  }
  function groupedLinks(ctx, max, mobile = false) {
    const output = [];
    const home = ctx.selected.find(page => page.id === 'inicio');
    if (home) output.push(pageLink(ctx, home, 's-nav-link'));
    const groups = ['Plantas','Productos','Servicios'];
    for (const group of groups) {
      const members = ctx.selected.filter(page => page.group === group);
      if (members.length) output.push(submenu(ctx, group, members));
    }
    const extra = ctx.selected.filter(page => page.id !== 'inicio' && !groups.includes(page.group) && (mobile || page.id !== 'contacto'));
    if (mobile) return [...output, ...extra.map(page => pageLink(ctx,page,'s-nav-link'))];
    const capacity = Math.max(0, max - output.length);
    if (extra.length <= capacity) return [...output, ...extra.map(page => pageLink(ctx,page,'s-nav-link'))];
    const direct = Math.max(0, capacity - 1);
    return [...output, ...extra.slice(0,direct).map(page => pageLink(ctx,page,'s-nav-link')), submenu(ctx,'Más',extra.slice(direct))];
  }
  function navLinks(ctx, max = 4) {
    if (ctx.settings.groupMenu) return groupedLinks(ctx,max).join('');
    let pages = ctx.selected.filter(page => !/contact/i.test(`${page.id} ${page.name}`));
    if (!pages.length) pages = ctx.selected;
    const label = name => {const short=name.replace(/^Plantas de /,'').replace(/^Plantas /,'');return short.charAt(0).toUpperCase()+short.slice(1);};
    return pages.slice(0,max).map(page => `<button type="button" class="s-nav-link${page.id === ctx.active ? ' is-current' : ''}" data-page="${esc(page.id)}"${page.id === ctx.active ? ' aria-current="page"' : ''}>${esc(label(page.name))}</button>`).join('') + (pages.length > max ? `<details class="s-nav-more"><summary>Más ${icon('down')}</summary><div>${pages.slice(max).map(page=>`<button type="button" data-page="${esc(page.id)}">${esc(page.name)}</button>`).join('')}</div></details>` : '');
  }
  function navbar(ctx) {
    const v = variant(ctx,'navbar',3);
    const guided = Boolean(ctx.settings.homeGoal);
    const utility = ctx.settings.topbar || v === 2 ? `<div class="s-utility"><span>${icon('leaf')} ${guided ? esc(ctx.settings.tagline || ctx.settings.brand) : 'Cultivamos contigo, desde 1998'}</span><span>${guided ? esc([ctx.settings.location,ctx.settings.hours].filter(Boolean).join(' · ')) : `${esc(ctx.settings.location)} <span class="s-utility-dot">·</span> L–S 9:00–20:00`}</span></div>` : '';
    const menu = `<button class="s-mobile-toggle" type="button" data-menu-toggle aria-label="Abrir menú" aria-expanded="false" aria-controls="s-mobile-menu">${icon('menu')}</button>`;
    const contact = !guided || ctx.selected.some(page => page.id === 'contacto') ? button(ctx,'Visítanos',['contacto','contact']) : '';
    let inner;
    if (v === 1 && ctx.settings.groupMenu) {
      const links = groupedLinks(ctx,5);
      inner = `<div class="s-nav-container"><nav class="s-nav-side" aria-label="Navegación izquierda">${links.slice(0,2).join('')}</nav>${brand(ctx)}<nav class="s-nav-side s-nav-right" aria-label="Navegación derecha">${links.slice(2).join('')}</nav>${menu}</div>`;
    } else if (v === 1) {
      const links = ctx.selected.filter(page => !/contact/i.test(`${page.id} ${page.name}`)).slice(0,4);
      const link = page => {const text=page.name.replace(/^Plantas de /,'');return `<button type="button" class="s-nav-link${page.id === ctx.active ? ' is-current' : ''}" data-page="${esc(page.id)}">${esc(text.charAt(0).toUpperCase()+text.slice(1))}</button>`;};
      const overflow = ctx.selected.filter(page=>!links.includes(page));
      const more = overflow.length ? `<details class="s-nav-more"><summary>Más ${icon('down')}</summary><div>${overflow.map(page=>`<button type="button" data-page="${esc(page.id)}">${esc(page.name)}</button>`).join('')}</div></details>` : '';
      inner = `<div class="s-nav-container"><nav class="s-nav-side" aria-label="Navegación izquierda">${links.slice(0,2).map(link).join('')}</nav>${brand(ctx)}<nav class="s-nav-side s-nav-right" aria-label="Navegación derecha">${links.slice(2).map(link).join('')}${more}</nav>${menu}</div>`;
    } else if (v === 2) {
      inner = `<div class="s-nav-container">${brand(ctx)}${!guided || ctx.settings.phone ? `<div class="s-nav-help">${icon('phone')}<span>Nos encantará ayudarte<strong>${esc(ctx.settings.phone)}</strong></span></div>` : ''}${contact}${menu}</div><nav class="s-nav-second" aria-label="Navegación principal">${navLinks(ctx,6)}${guided ? '' : demoButton('Consejos para tus plantas','Cada planta tiene su ritmo. Encuentra guías y consejos en la página de blog.','s-nav-link s-nav-guide')}</nav>`;
    } else {
      inner = `<div class="s-nav-container">${brand(ctx)}<nav class="s-desktop-links" aria-label="Navegación principal">${navLinks(ctx,4)}</nav>${contact}${menu}</div>`;
    }
    const mobile = `<nav class="s-mobile-menu" id="s-mobile-menu" aria-label="Navegación móvil">${ctx.settings.groupMenu ? groupedLinks(ctx,0,true).join('') : ctx.selected.map(page => pageLink(ctx,page,'',true)).join('')}</nav>`;
    return `<header class="s-nav s-nav-v${v}${ctx.settings.navSticky ? ' s-nav-sticky' : ''}">${utility}${inner}${mobile}</header>`;
  }
  function heroPhoto(ctx) {
    const id = `${ctx.active} ${ctx.meta.name}`.toLowerCase();
    if (/cact|suculent/.test(id)) return photos.cactus;
    if (/interior/.test(id)) return photos.interior;
    if (/exterior|flor|temporada|arom/.test(id)) return photos.exterior;
    if (/paisaj|obra|proyect|manten|alquiler|evento/.test(id)) return photos.landscape;
    if (/nosotr|equipo|contact|about/.test(id)) return photos.gardener;
    return photos.hero;
  }
  const productPage = page => ['Plantas','Productos'].includes(page.group);
  function featuredProducts(ctx) {
    const items = ctx.selected.filter(productPage);
    const lead = items.find(page => page.id === ctx.settings.focusProduct);
    return lead ? [lead, ...items.filter(page => page !== lead)] : items;
  }
  function homeAction(ctx) {
    const choices = {
      products: ['Explora el catálogo', featuredProducts(ctx)[0]?.id],
      services: ['Descubre nuestros servicios', ctx.selected.find(page => page.group === 'Servicios')?.id],
      contact: ['Contacta con nosotros', ctx.selected.find(page => page.id === 'contacto')?.id]
    };
    return [choices[ctx.settings.homeGoal], choices.products, choices.services, choices.contact].find(choice => choice?.[1]);
  }
  function hero(ctx, block = {}) {
    const v = variant(ctx,'hero',3);
    const isHome = /^(inicio|home)$/.test(ctx.active);
    const title = block.title || ctx.page.title || (isHome ? 'Tu vida, un poco más verde.' : ctx.meta.name);
    const text = block.text || ctx.page.description || (isHome ? 'Plantas que te hacen bien. Jardines que cuentan tu historia. Encuentra tu próximo rincón favorito con nosotros.' : 'Te acompañamos para dar vida a tus espacios, con plantas de calidad y el consejo de quienes las cuidan cada día.');
    const eyebrow = isHome ? `TU CENTRO DE JARDINERÍA${ctx.settings.location ? ` EN ${ctx.settings.location.toUpperCase()}` : ''}` : `${ctx.settings.brand} · ${ctx.meta.name}`;
    const primary = homeAction(ctx);
    const secondary = ctx.selected.find(page => page.id === 'nosotros' && page.id !== primary?.[1]);
    const guidedHome = isHome && ctx.settings.homeGoal;
    const actions = guidedHome ? `<div class="s-hero-actions">${primary ? button(ctx,primary[0],[primary[1]]) : ''}${secondary ? button(ctx,'Conócenos',[secondary.id],true) : ''}</div>` : `<div class="s-hero-actions">${button(ctx,isHome ? 'Encuentra tu planta' : 'Hablemos de tu proyecto',isHome ? ['interior','plantas','exterior'] : ['contacto','contact'])}${button(ctx,isHome ? 'Conócenos' : 'Ven a visitarnos',isHome ? ['nosotros','about'] : ['contacto','contact'],true)}</div>`;
    const copy = `<div class="s-hero-copy"><span class="s-eyebrow"><i class="s-dot"></i>${esc(eyebrow)}</span><h1>${esc(title)}</h1><p>${esc(text)}</p>${actions}<div class="s-hero-proof"><span class="s-small-sprout">${icon('sprout')}</span><span>Crecer es mejor<br><strong>cuando lo hacemos juntos.</strong></span></div></div>`;
    const image = `<div class="s-hero-image">${img(heroPhoto(ctx),isHome ? 'Luz natural entre plantas de un centro de jardinería' : ctx.meta.name,'',true)}<div class="s-photo-note">${icon('leaf')}<span>Un espacio para<br><strong>echar raíces.</strong></span><span class="s-note-spark">✳</span></div><span class="s-image-caption">NATURALEZA, SIN PRISA.</span></div>`;
    if (v === 1) return `<section class="s-hero s-hero-v1">${img(heroPhoto(ctx),'Un jardín lleno de vida','class="s-hero-background"',true)}<div class="s-hero-shade"></div><div class="s-container">${copy}</div><span class="s-hero-bottom">${icon('sun')} Todo empieza con una planta.</span></section>`;
    if (v === 2) return `<section class="s-hero s-hero-v2 s-container">${copy}<div class="s-hero-panorama">${img(heroPhoto(ctx),'Nuestro espacio de plantas y jardines','',true)}<span class="s-panorama-label">${icon('pin')}${esc(ctx.settings.location)} · Ven, pasea, encuentra</span></div></section>`;
    if (v === 3) return `<section class="s-hero s-hero-v3 s-container">${copy}<div class="s-hero-collage"><div class="s-collage-main">${img(heroPhoto(ctx),'Un rincón verde que inspira','',true)}</div><div class="s-collage-small">${img(photos.cactus,'Detalle de una planta suculenta')}</div><span class="s-collage-stamp">let it<br><em>grow.</em>${icon('sprout')}</span></div></section>`;
    return `<section class="s-hero s-hero-v0 s-container">${copy}${image}</section>`;
  }
  const categories = [
    {title:'Plantas de interior',text:'Un soplo de naturaleza, dentro de casa.',image:photos.interior,alt:'Hojas verdes de una planta de interior',badge:'Tu rincón verde',route:['interior'],price:'18,90 €'},
    {title:'Plantas de exterior',text:'Más color para tu jardín y tu terraza.',image:photos.exterior,alt:'Flores y plantas para jardines de exterior',badge:'A pleno sol',route:['exterior'],price:'12,50 €'},
    {title:'Cactus y suculentas',text:'Pequeños, resistentes y con carácter.',image:photos.cactus,alt:'Cactus y plantas suculentas',badge:'Fáciles de cuidar',route:['cactus','suculentas'],price:'7,90 €'},
    {title:'Jardines con alma',text:'Espacios pensados para disfrutarlos.',image:photos.landscape,alt:'Un jardín mediterráneo cuidado',badge:'Hecho para ti',route:['paisajismo','proyectos'],price:'A medida'}
  ];
  function categoryItem(page, ctx) {
    const photo = {interior:photos.interior, exterior:photos.exterior, cactus:photos.cactus, suculentas:photos.cactus,
      arboles:photos.landscape, arbustos:photos.landscape, aromaticas:photos.exterior, temporada:photos.exterior, macetas:photos.interior};
    return {
      title: page.name, text: page.description, image: photo[page.id] || photos.hero,
      alt: '', badge: page.group, route: [page.id === ctx.active ? 'contacto' : page.id], tag: page.group
    };
  }
  function catalogItems(ctx) {
    if (ctx.settings.homeGoal) {
      const products = featuredProducts(ctx);
      if (productPage(ctx.meta)) {
        return [ctx.meta,...products.filter(page => page.id !== ctx.active)].map(page => categoryItem(page,ctx));
      }
      if (products.length) return products.map(page => categoryItem(page,ctx));
    }
    const id = `${ctx.active} ${ctx.meta.name}`.toLowerCase();
    if (/interior/.test(id)) return [
      {...categories[0],title:'Monstera deliciosa',text:'Hojas únicas. Una compañera con personalidad.',badge:'Luz indirecta',price:'24,90 €'},
      {...categories[0],title:'Pothos golden',text:'Fácil de cuidar, imposible no quererla.',badge:'Muy resistente',price:'12,90 €'},
      {...categories[0],title:'Ficus elastica',text:'Un verde intenso para tu rincón favorito.',badge:'La favorita',price:'29,90 €'},
      {...categories[0],title:'Calathea orbifolia',text:'La naturaleza también sabe dibujar.',badge:'Pet friendly',price:'19,90 €'}
    ];
    if (/cact|suculent/.test(id)) return [
      {...categories[2],title:'Echeveria',text:'Una pequeña roseta de color y textura.',badge:'Poco riego',price:'5,90 €'},
      {...categories[2],title:'Cactus columna',text:'Arquitectura natural, en pequeño formato.',badge:'Mucho sol',price:'15,90 €'},
      {...categories[2],title:'Aloe vera',text:'Tan útil como bonita.',badge:'Mediterránea',price:'8,90 €'},
      {...categories[2],title:'Haworthia',text:'La planta pequeña que cabe en cualquier sitio.',badge:'Fácil',price:'6,90 €'}
    ];
    if (/exterior|flor|temporada|arom/.test(id)) return [
      {...categories[1],title:'Lavanda',text:'El aroma del Mediterráneo, en tu jardín.',badge:'Polinizadores',price:'6,90 €'},
      {...categories[1],title:'Margarita',text:'Un toque de alegría todos los días.',badge:'De temporada',price:'4,90 €'},
      {...categories[1],title:'Romero',text:'Verde, aromático y lleno de posibilidades.',badge:'Mucho sol',price:'5,50 €'},
      {...categories[1],title:'Buganvilla',text:'Color que trepa por tus paredes.',badge:'Exterior',price:'18,90 €'}
    ];
    return categories;
  }
  function card(ctx, item, index = 0) {
    const v = [0,2,1,3,5,6,4][variant(ctx,'cards',6)];
    const route = routeAttributes(ctx,item.route);
    const picture = img(item.image,item.alt);
    const detail = `<span class="s-card-kicker">${esc(item.badge)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p>`;
    if (v === 1) return `<article class="s-card s-card-v1"><button class="s-card-link" type="button" ${route}>${picture}<span class="s-card-shade"></span><span class="s-card-overlay"><span class="s-card-kicker">${esc(item.badge)}</span><strong>${esc(item.title)}</strong><span>${esc(item.text)}</span></span><span class="s-card-arrow">${icon('arrow')}</span></button></article>`;
    if (v === 2) return `<article class="s-card s-card-v2"><button class="s-card-link" type="button" ${route}><span class="s-card-image">${picture}</span><span class="s-card-body"><span class="s-card-kicker">${esc(item.badge)}</span><strong>${esc(item.title)}</strong><span class="s-card-summary">${esc(item.text)}</span><span class="s-text-link">Descubrir ${icon('arrow')}</span></span></button></article>`;
    if (v === 3) return `<article class="s-card s-card-v3"><button class="s-card-link" type="button" ${route}><span class="s-card-image">${picture}<span class="s-card-badge">${icon('leaf')}${esc(item.badge)}</span></span><span class="s-card-body"><strong>${esc(item.title)}</strong><span class="s-card-summary">${esc(item.text)}</span><span class="s-card-round">${icon('arrow')}</span></span></button></article>`;
    if (v === 4) return `<article class="s-card s-card-v4"><div class="s-card-image">${picture}<span class="s-card-badge">NUESTRA SELECCIÓN</span><button type="button" class="s-card-favorite" data-favorite aria-label="Guardar ${esc(item.title)}" aria-pressed="false">${icon('heart')}</button></div><div class="s-card-body"><span class="s-card-kicker">${esc(item.badge)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p><div class="s-product-bottom"><strong>Tu próximo favorito.</strong><button type="button" class="s-add-button" ${route} aria-label="Ver ${esc(item.title)}">${icon('arrow')}</button></div></div></article>`;
    if (v === 5) return `<article class="s-card s-card-v5"><button type="button" class="s-card-link" ${route}><span class="s-editorial-card-head"><span>0${index+1}</span><strong>${esc(item.title)}</strong>${icon('arrow')}</span><span class="s-card-image">${picture}</span><span class="s-editorial-card-foot">${esc(item.text)}</span></button></article>`;
    if (v === 6 && ctx.settings.homeGoal) return `<article class="s-card s-card-v6"><button type="button" class="s-card-link" ${route}><span class="s-service-symbol">${icon('sprout')}</span><span class="s-card-body"><strong>${esc(item.title)}</strong><span class="s-card-summary">${esc(item.text)}</span></span>${icon('arrow')}</button></article>`;
    if (v === 6) { const services=[['sprout','Diseño de jardines','Tu espacio, pensado para ti.','paisajismo'],['sun','Cuidado todo el año','Cada estación, en las mejores manos.','mantenimiento'],['leaf','Alquiler de plantas','Eventos que dejan huella.','alquiler'],['chat','Asesoramiento','Un consejo para cada nueva idea.','asesoramiento']];const service=services[index%services.length];return `<article class="s-card s-card-v6"><button type="button" class="s-card-link" ${routeAttributes(ctx,[service[3],'contacto'])}><span class="s-service-symbol">${icon(service[0])}</span><span class="s-card-body"><span class="s-card-kicker">CRECEMOS CONTIGO</span><strong>${esc(service[1])}</strong><span class="s-card-summary">${esc(service[2])}</span></span><span class="s-text-link">Cuéntanos tu idea ${icon('arrow')}</span></button></article>`; }
    return `<article class="s-card s-card-v0"><button class="s-card-link" type="button" ${route}><span class="s-card-image">${picture}</span><span class="s-card-body"><span class="s-card-kicker">${esc(item.badge)}</span><strong>${esc(item.title)}</strong><span class="s-card-summary">${esc(item.text)}</span><span class="s-card-arrow">${icon('arrow')}</span></span></button></article>`;
  }
  const carouselControls = () => `<div class="s-carousel-controls"><button type="button" data-carousel-step="-1" aria-label="Ver anteriores">${icon('arrow','s-flip')}</button><button type="button" data-carousel-step="1" aria-label="Ver siguientes">${icon('arrow')}</button></div>`;
  function catalog(ctx, block = {}) {
    const v = variant(ctx,'catalog',3);
    const items = catalogItems(ctx);
    const guided = Boolean(ctx.settings.homeGoal);
    const title = block.title || (guided ? (productPage(ctx.meta) ? 'Explora nuestra selección' : 'Qué encontrarás en el centro') : /^(inicio|home)$/.test(ctx.active) ? 'Encuentra tu verde.' : 'Tus próximas favoritas.');
    const text = block.text || (guided ? '' : 'Para cada espacio, para cada persona, hay una planta.');
    if (v === 1 || v === 2) {
      const products=ctx.settings.homeGoal ? items : [{...categories[0],title:'Monstera deliciosa',tag:'interior'},{...categories[1],title:'Lavanda mediterránea',tag:'exterior'},{...categories[2],title:'Echeveria',tag:'cactus'},{...categories[0],title:'Pothos golden',tag:'interior'},{...categories[1],title:'Flores de temporada',tag:'exterior'},{...categories[2],title:'Cactus columna',tag:'cactus'}];
      const groups = ctx.settings.homeGoal ? [...new Set(products.map(item => item.tag).filter(Boolean))].map(tag => [tag,tag]) : [['interior','Interior'],['exterior','Exterior'],['cactus','Cactus y suculentas']];
      const filters=[['all','Todas'],...groups].map(([id,label])=>`<button type="button" data-catalog-filter="${esc(id)}" class="${id === 'all' ? 'is-active' : ''}" aria-pressed="${id === 'all'}">${esc(label)}<span>${id === 'all' ? products.length : products.filter(p=>p.tag===id).length}</span></button>`).join('');
      const grid=`<div class="s-filter-results"><span class="s-filter-count" role="status">${products.length} plantas para descubrir</span><div class="s-filter-grid">${products.map((item,index)=>`<div class="s-catalog-item" data-catalog-tag="${esc(item.tag)}" data-catalog-name="${esc(item.title.toLowerCase())}">${card(ctx,item,index)}</div>`).join('')}</div><p class="s-filter-empty" hidden>No hemos encontrado plantas con esos filtros. Prueba otra categoría.</p></div>`;
      return `<section class="s-section s-container s-catalog s-catalog-filtered s-catalog-filtered-v${v}" data-filter-catalog>${heading(title,text,'TU PRÓXIMA PLANTA')}<div class="s-filter-layout"><div class="s-catalog-filter-controls">${v === 1 ? `<label class="s-catalog-search"><span>Busca tu planta</span><input type="search" data-catalog-search placeholder="Nombre de la planta…" aria-label="Buscar plantas"></label><span class="s-filter-label">ELIGE UN AMBIENTE</span>` : ''}<div class="s-catalog-filters" role="group" aria-label="Filtrar plantas por categoría">${filters}</div></div>${grid}</div></section>`;
    }
    if (v === 3) return `<section class="s-section s-container s-catalog s-catalog-v2"><div class="s-catalog-intro">${heading(title,text,'UN MUNDO VERDE')}${button(ctx,'Explorar productos',[featuredProducts(ctx)[0]?.id || 'interior','exterior'],true)}<span class="s-large-sprout">${icon('sprout')}</span></div><div class="s-cards-grid">${items.map((item,index) => card(ctx,item,index)).join('')}</div></section>`;
    return `<section class="s-section s-container s-catalog s-catalog-v0"><div class="s-section-top">${heading(title,text,'UN POCO DE NATURALEZA')}${button(ctx,'Explora la colección',[featuredProducts(ctx)[0]?.id || 'interior','exterior'],true)}</div><div class="s-cards-grid">${(ctx.settings.homeGoal ? items : items.slice(0,clamp(ctx.settings.columns,2,4,3))).map((item,index) => card(ctx,item,index)).join('')}</div></section>`;
  }
  function cards(ctx, block = {}) {
    return `<section class="s-section s-container">${heading(block.title || 'Pequeñas cosas que hacen bien.',block.text || 'Una colección de naturaleza para encontrar tu favorita.','NUESTRA SELECCIÓN')}<div class="s-cards-grid">${catalogItems(ctx).slice(0,3).map((item,index) => card(ctx,item,index)).join('')}</div></section>`;
  }
  function buttons(ctx, block = {}) {
    return `<section class="s-section s-container s-buttons-section">${heading(block.title || 'Tu próximo rincón verde empieza aquí.',block.text || 'Te ayudamos a encontrar lo que necesitas.','DA EL SIGUIENTE PASO')}<div class="s-button-showcase">${button(ctx,'Descubre nuestras plantas',['interior','exterior'])}${button(ctx,'Ven a visitarnos',['contacto','contact'],true)}<button class="s-btn s-btn-v${variant(ctx,'buttons',4)}" type="button" data-demo="Tu selección está guardada en esta vista de ejemplo.">${icon('heart')}<span>Mis favoritas</span></button></div></section>`;
  }
  function info(ctx, block = {}) {
    const v = variant(ctx,'info',3);
    const title = block.title || 'Nos gusta la tierra. Y quienes la cuidan.';
    const text = block.text || (ctx.settings.homeGoal ? `Conoce ${ctx.settings.brand} y descubre cómo podemos ayudarte con tu jardín.` : 'Somos un equipo de personas que cree que la naturaleza hace la vida más bonita. Llevamos más de 25 años compartiendo plantas, consejos y ganas de crear.');
    const guided = Boolean(ctx.settings.homeGoal);
    const aboutRoute = ctx.active === 'nosotros' ? ['contacto'] : ['nosotros','contacto'];
    const copy = `<div class="s-info-copy">${heading(title,text,'RAÍCES LOCALES, PASIÓN NATURAL')}<p>Te escuchamos, te aconsejamos y te acompañamos. Desde la primera maceta hasta el jardín que siempre has imaginado.</p>${button(ctx, ctx.active === 'nosotros' ? 'Contacta con nosotros' : 'Conoce nuestra historia', aboutRoute,true)}</div>`;
    const photo = `<div class="s-info-image">${img(photos.gardener,'El cuidado cercano de nuestras plantas')}<span class="s-info-note">Hecho con calma.<br><em>Cuidado con cariño.</em></span></div>`;
    if (v === 2) return `<section class="s-section s-container s-info s-info-v2"><div class="s-info-statement"><span class="s-eyebrow">NUESTRA FORMA DE SER</span><h2>${esc(title)}</h2>${guided ? '' : `<span class="s-info-year">Est. 1998 ${icon('sprout')}</span>`}</div><div class="s-info-editorial"><p>${esc(text)}</p><p>Seleccionamos cada planta con criterio y te ayudamos a cuidarla. Porque un jardín no termina cuando lo plantas: ahí es donde empieza.</p><div class="s-info-values"><span>${icon('check')} Consejo de verdad</span><span>${icon('check')} Calidad en cada hoja</span><span>${icon('check')} Pasión compartida</span></div>${button(ctx,'Acércate a conocernos',['nosotros','contacto'],true)}</div></section>`;
    if (v === 3) return `<section class="s-section s-container s-info s-info-v3">${heading(title,text,'ASÍ CRECEMOS CONTIGO')}<div class="s-info-bento-grid"><div class="s-bento-photo">${img(photos.gardener,'El cuidado que nos une a la naturaleza')}<span>Hecho con las manos.<br><em>Cuidado con el corazón.</em></span></div><article class="s-bento-wide"><span class="s-eyebrow">${guided ? 'NUESTRO CENTRO' : 'DESDE 1998'}</span><h3>Lo que nos mueve<br>siempre está vivo.</h3><p>${guided ? esc(text) : 'Más de 25 años compartiendo plantas, ideas y buenos consejos.'}</p></article><article>${icon('chat')}<h3>Te escuchamos.</h3><p>Cada espacio empieza con tu historia.</p></article><article>${icon('sprout')}<h3>Lo cuidamos.</h3><p>Contigo, en cada nueva estación.</p></article></div></section>`;
    return `<section class="s-section s-container s-info s-info-v${v}">${v === 1 ? copy+photo : photo+copy}</section>`;
  }
  function serviceOptions(ctx) {
    if (!ctx.settings.homeGoal) return '';
    return ctx.selected.filter(page => page.group === 'Servicios').map(page => `<option>${esc(page.name)}</option>`).join('') + '<option>Otra consulta</option>';
  }
  function fields(ctx, compact = false) {
    return `<div class="s-form-fields"><label>Tu nombre<input name="nombre" autocomplete="name" placeholder="¿Cómo te llamas?" required maxlength="100"></label><label>Correo electrónico<input type="email" name="email" autocomplete="email" placeholder="hola@ejemplo.com" required maxlength="180"></label>${compact ? '' : `<label class="s-field-full">¿En qué podemos ayudarte?<select name="interes">${serviceOptions(ctx) || '<option>Quiero información sobre plantas</option><option>Estoy pensando en un proyecto de paisajismo</option><option>Me interesa el alquiler de plantas</option><option>Quiero visitar el centro</option><option>Otra consulta</option>'}</select></label>`}<label class="s-field-full">${compact ? '¿Qué tienes en mente?' : 'Cuéntanos un poco más'}<textarea name="mensaje" rows="${compact ? 2 : 3}" placeholder="Un jardín, una terraza, una duda con tu planta…" required maxlength="3000"></textarea></label></div><label class="s-form-consent"><input type="checkbox" required> <span>He leído y acepto la política de privacidad.</span></label><button type="submit" class="s-btn s-btn-v${variant(ctx,'buttons',4)}"><span>Enviar consulta</span>${icon('arrow')}</button><p class="s-form-status" role="status" hidden></p><small class="s-form-demo-note">Formulario de muestra · no se enviarán datos</small>`;
  }
  function contactDetails(ctx) {
    const entries = [['pin','Ven a vernos',ctx.settings.address],['phone','Hablamos cuando quieras',ctx.settings.phone],['mail','También por correo',ctx.settings.email]];
    if (ctx.settings.homeGoal && ctx.settings.hours) entries.push(['clock','Horario',ctx.settings.hours]);
    return `<div class="s-contact-details">${entries.filter(entry => entry[2]).map(([symbol,label,value]) => `<div>${icon(symbol)}<span><strong>${label}</strong>${esc(value)}</span></div>`).join('')}</div>`;
  }
  function forms(ctx, block = {}) {
    const v = variant(ctx,'forms',3);
    const title = block.title || 'Lo bonito empieza con una conversación.';
    const text = block.text || 'Cuéntanos qué tienes en mente. Nos encantará ayudarte a darle vida.';
    if (v === 1) return `<section class="s-section s-container s-contact s-form-two-columns">${heading(title,text,'HABLEMOS')}<form class="s-contact-form" data-demo-form>${fields(ctx)}</form></section>`;
    if (v === 2) return `<section class="s-section s-container s-contact s-form-v1"><div class="s-contact-intro">${heading(title,text,'ESTAMOS CERCA')}${contactDetails(ctx)}<span class="s-contact-decoration">${icon('sprout')}</span></div><form class="s-contact-form" data-demo-form>${fields(ctx)}</form></section>`;
    if (v === 3) return `<section class="s-section s-container s-contact s-form-stepped">${heading(title,text,'TU IDEA, PASO A PASO')}<form class="s-contact-form" data-demo-form data-stepped><ol class="s-form-progress"><li class="is-current" aria-current="step"><span>1</span>Nos conocemos</li><li><span>2</span>Tu proyecto</li></ol><fieldset data-form-step="1"><legend>Empezamos por ti.</legend><p>Solo necesitamos saber cómo dirigirnos a ti.</p><div class="s-form-fields"><label>Tu nombre<input name="nombre" autocomplete="name" placeholder="¿Cómo te llamas?" required maxlength="100"></label><label>Correo electrónico<input name="email" type="email" autocomplete="email" placeholder="hola@ejemplo.com" required maxlength="180"></label></div><button type="button" class="s-btn s-btn-v${variant(ctx,'buttons',4)}" data-step-next><span>Continuar</span>${icon('arrow')}</button></fieldset><fieldset data-form-step="2" hidden disabled><legend>Ahora, cuéntanos tu idea.</legend><p>Lo que imaginas nos ayuda a preparar el siguiente paso.</p><div class="s-form-fields"><label class="s-field-full">Me interesa<select name="servicio">${serviceOptions(ctx) || '<option>Paisajismo y diseño</option><option>Alquiler de plantas</option><option>Mantenimiento</option><option>Asesoramiento sobre plantas</option>'}</select></label><label class="s-field-full">¿Qué tienes en mente?<textarea name="mensaje" placeholder="Una terraza, un jardín, un evento…" rows="3" required maxlength="3000"></textarea></label></div><label class="s-form-consent"><input type="checkbox" required><span>He leído y acepto la política de privacidad.</span></label><div class="s-step-actions"><button type="button" class="s-step-back" data-step-back>${icon('arrow','s-flip')}Volver</button><button type="submit" class="s-btn s-btn-v${variant(ctx,'buttons',4)}"><span>Enviar mi idea</span>${icon('arrow')}</button></div></fieldset><p class="s-form-status" role="status" hidden></p><small class="s-form-demo-note">Formulario de muestra · no se enviarán datos</small></form></section>`;
    return `<section class="s-section s-container s-contact s-form-v0">${heading(title,text,'NOS ENCANTARÁ LEERTE')}<form class="s-contact-form" data-demo-form>${fields(ctx)}</form></section>`;
  }
  function gallery(ctx, block = {}) {
    const v = variant(ctx,'gallery',2);
    const entries = [[photos.landscape,'Un jardín para disfrutar despacio'],[photos.interior,'Verde que entra en casa'],[photos.exterior,'Color en cada estación'],[photos.hero,'Nuestro pequeño universo verde'],[photos.cactus,'Belleza en los detalles']];
    return `<section class="s-section s-container s-gallery s-gallery-v${v}" ${v === 2 ? 'data-carousel' : ''}><div class="s-section-top">${heading(block.title || 'Espacios que invitan a quedarse.',block.text || 'Un poco de inspiración para imaginar lo que puede crecer en tu casa.','NATURALEZA EN BUENA COMPAÑÍA')}${v === 2 ? carouselControls() : ''}</div><div class="${v === 2 ? 's-carousel-track' : 's-gallery-grid'}">${entries.slice(0,v === 0 ? 3 : 5).map(([src,caption],i)=>`<figure>${img(src,caption)}<figcaption><span>0${i+1}</span>${esc(caption)}</figcaption></figure>`).join('')}</div></section>`;
  }
  const reviews = [
    {quote:'Entré a por una planta y salí con ganas de llenar la casa de verde. El trato, de diez.',name:'Clara M.',where:'Una casa un poco más verde',initial:'C'},
    {quote:'Escucharon lo que queríamos y transformaron nuestra terraza en nuestro sitio favorito.',name:'Miguel y Laura',where:'Un proyecto que sigue creciendo',initial:'M'},
    {quote:'Siempre vuelvo. Saben muchísimo y te lo explican con una paciencia que se agradece.',name:'Ana R.',where:'Plant lover desde hace años',initial:'A'}
  ];
  const stars = () => `<span class="s-stars" aria-label="5 de 5 estrellas">${Array.from({length:5},()=>icon('star')).join('')}</span>`;
  const reviewCard = review => `<article class="s-review">${stars()}<blockquote>“${esc(review.quote)}”</blockquote><div class="s-review-person"><span class="s-avatar">${review.initial}</span><span><strong>${esc(review.name)}</strong><small>${esc(review.where)}</small></span></div></article>`;
  function testimonials(ctx, block = {}) {
    const v = variant(ctx,'testimonials',2);
    if (v === 1) return `<section class="s-section s-testimonials s-testimonials-v1"><div class="s-container"><span class="s-eyebrow">LO QUE CRECE ENTRE NOSOTROS</span><span class="s-quote-mark">“</span><blockquote>${esc(block.text || reviews[0].quote)}</blockquote><div class="s-review-person"><span class="s-avatar">C</span><span><strong>Clara M.</strong><small>Una casa un poco más verde</small></span>${stars()}</div></div></section>`;
    if (v === 2) return `<section class="s-section s-container s-testimonials s-testimonials-ratings">${heading(block.title || 'Lo que mejor habla de nosotros.',block.text || 'El cariño de quienes vuelven, una y otra vez.','VALORACIONES')}<div class="s-ratings-layout"><div class="s-ratings-summary"><strong>4,9<span>/ 5</span></strong>${stars()}<span>Gracias por crecer<br>con nosotros.</span><small>Valoración de ejemplo</small></div><div class="s-ratings-list">${reviews.slice(0,2).map(reviewCard).join('')}</div></div></section>`;
    return `<section class="s-section s-container s-testimonials s-testimonials-v${v}" ${v === 2 ? 'data-carousel' : ''}><div class="s-section-top">${heading(block.title || 'Aquí también crece la confianza.',block.text || 'Historias de quienes ya comparten nuestra pasión.','VOCES DE NUESTRO JARDÍN')}${v === 2 ? carouselControls() : ''}</div><div class="${v === 2 ? 's-carousel-track' : 's-review-grid'}">${reviews.map(reviewCard).join('')}</div></section>`;
  }
  const questions = [
    ['¿Me ayudáis a elegir la planta adecuada?','Claro. Cuéntanos cuánta luz tienes, cómo es tu espacio y cuánto tiempo puedes dedicarle. Te aconsejamos para que encuentres una planta que encaje contigo.'],
    ['¿Hacéis entregas a domicilio?','Podemos organizar la entrega de tus plantas y materiales. Escríbenos con tu dirección para confirmar la zona, la disponibilidad y las condiciones.'],
    ['¿Puedo visitar el centro sin cita?','Sí, ven a pasear y descubrir nuestras plantas en horario de apertura. Para consultas de paisajismo, recomendamos concertar una visita para dedicarte el tiempo que merece tu proyecto.'],
    ['¿También me ayudáis después de la compra?','Por supuesto. Si tu planta no está como esperabas, cuéntanos cómo la cuidas o trae una foto. Nos gusta que lo que llevas a casa siga creciendo bien.']
  ];
  function faq(ctx, block = {}) {
    const v = variant(ctx,'faq',2);
    return `<section class="s-section s-container s-faq s-faq-v${v}" ${v === 2 ? 'data-faq-categories' : ''}>${heading(block.title || 'Por si te lo estás preguntando.',block.text || 'Y si tu duda no está aquí, estaremos encantados de escucharte.','DUDAS QUE BROTAN')}${v === 2 ? `<div class="s-faq-tabs" role="group" aria-label="Categorías de preguntas"><button type="button" data-faq-filter="all" aria-pressed="true" class="is-active">Todas</button><button type="button" data-faq-filter="plantas" aria-pressed="false">Plantas y cuidados</button><button type="button" data-faq-filter="visita" aria-pressed="false">Visitas y entregas</button></div>` : ''}<div class="s-faq-list">${questions.map(([q,a],i)=>`<details data-faq-group="${i === 0 || i === 3 ? 'plantas' : 'visita'}" ${i === 0 ? 'open' : ''}><summary>${esc(q)}${icon('plus')}</summary><div>${esc(a)}</div></details>`).join('')}</div></section>`;
  }
  function cta(ctx, block = {}) {
    const v = [0,2,1,3][variant(ctx,'cta',3)];
    const title = block.title || 'Hagamos que algo bonito crezca.';
    const text = block.text || 'Pásate por nuestro centro. Ven con una idea, una duda o simplemente con ganas de verde.';
    const copy = `<div class="s-cta-copy"><span class="s-eyebrow">TU PRÓXIMO RINCÓN FAVORITO</span><h2>${esc(title)}</h2><p>${esc(text)}</p>${button(ctx,'Ven a conocernos',['contacto','contact'])}</div>`;
    if (v === 1) return `<section class="s-section s-container"><div class="s-cta s-cta-v1">${copy}<div class="s-cta-image">${img(photos.landscape,'Un jardín acogedor para compartir')}</div></div></section>`;
    if (v === 2) return `<section class="s-section s-container"><div class="s-cta s-cta-v2">${icon('sprout')}<div><h2>${esc(title)}</h2><p>${esc(text)}</p></div>${button(ctx,'Hablemos',['contacto','contact'])}</div></section>`;
    if (v === 3) return `<section class="s-section s-container"><div class="s-cta s-cta-v3">${img(photos.hero,'Naturaleza en nuestro centro de jardinería','class="s-cta-background"')}<div class="s-cta-shade"></div>${copy}</div></section>`;
    return `<section class="s-section s-container"><div class="s-cta s-cta-v0"><span class="s-cta-drawing">${icon('sprout')}</span>${copy}<span class="s-cta-drawing s-cta-drawing-right">${icon('leaf')}</span></div></section>`;
  }
  function newsletterForm(ctx, label = 'Tu correo electrónico') {
    return `<form class="s-newsletter-form" data-demo-form data-newsletter><label><span class="s-sr-only">${esc(label)}</span><input type="email" name="email" autocomplete="email" placeholder="${esc(label)}" aria-label="${esc(label)}" required></label><button type="submit" class="s-btn s-btn-v${variant(ctx,'buttons',4)}"><span>Me apunto</span>${icon('arrow')}</button><label class="s-newsletter-consent"><input type="checkbox" required> Acepto la política de privacidad.</label><p class="s-form-status" role="status" hidden></p><small class="s-form-demo-note">Suscripción de muestra · no se enviarán datos</small></form>`;
  }
  function newsletter(ctx, block = {}) {
    const v = [1,0,2][variant(ctx,'newsletter',2)];
    const title = block.title || 'Un poquito de verde en tu bandeja.';
    const text = block.text || 'Consejos de temporada, ideas y novedades. Solo cosas que merecen crecer.';
    if (v === 2) return `<section class="s-section s-container"><div class="s-newsletter s-newsletter-v2"><div class="s-newsletter-image">${img(photos.interior,'Hojas verdes para inspirarte')}</div><div>${heading(title,text,'CARTA VERDE')}${newsletterForm(ctx)}</div></div></section>`;
    return `<section class="s-section s-container"><div class="s-newsletter s-newsletter-v${v}"><div>${v === 0 ? icon('mail','s-newsletter-icon') : ''}${heading(title,text,'MANTENEMOS EL CONTACTO')}</div>${newsletterForm(ctx)}</div></section>`;
  }
  function stats(ctx, block = {}) {
    const v = variant(ctx,'stats',2);
    const facts = [['25+','años compartiendo verde'],['1.200','variedades para descubrir'],['100%','pasión por lo que hacemos']];
    if (v === 2) return `<section class="s-section s-container s-stats s-stats-v2"><div><span class="s-eyebrow">RAÍCES QUE SIGUEN CRECIENDO</span><span class="s-stats-featured">25<span>años</span></span><h2>${esc(block.title || 'La misma ilusión que el primer día.')}</h2><p>${esc(block.text || 'Y muchas ganas de seguir creciendo contigo.')}</p></div><div class="s-stats-image">${img(photos.gardener,'Años de experiencia cuidando plantas')}<span>${icon('sprout')}Desde 1998</span></div></section>`;
    return `<section class="s-section s-container s-stats s-stats-v${v}">${block.title ? heading(block.title,block.text || '') : ''}<div class="s-stats-grid">${facts.map(([n,label])=>`<div><strong>${n}</strong><span>${label}</span></div>`).join('')}</div></section>`;
  }
  const people = [{name:'Ana',role:'Plantas y buenos consejos',initial:'A',icon:'leaf'},{name:'Marcos',role:'Jardines que cuentan historias',initial:'M',icon:'sun'},{name:'Lucía',role:'Detalles que lo cambian todo',initial:'L',icon:'sprout'}];
  function team(ctx, block = {}) {
    const v = [0,2,1][variant(ctx,'team',2)];
    const title = block.title || 'Personas con las manos en la tierra.';
    const text = block.text || 'Detrás de cada planta bien cuidada, hay alguien que disfruta haciéndolo.';
    const members = people.map((p,i)=>`<article class="s-team-person"><div class="s-team-avatar s-team-avatar-${i}">${icon(p.icon)}<span>${p.initial}</span></div><div><h3>${p.name}</h3><p>${p.role}</p></div></article>`).join('');
    if (v === 1) return `<section class="s-section s-container s-team s-team-v1"><div class="s-team-photo">${img(photos.gardener,'La dedicación de nuestro equipo')}</div><div>${heading(title,text,'EL EQUIPO')}<div class="s-team-grid">${members}</div></div></section>`;
    return `<section class="s-section s-container s-team s-team-v${v}">${heading(title,text,'EL EQUIPO')}<div class="s-team-grid">${members}</div></section>`;
  }
  const posts = [
    {title:'Tu primera planta de interior: por dónde empezar',tag:'EN CASA',date:'12 ABR',image:photos.interior,desc:'Tres claves sencillas para elegir bien: luz, espacio y ganas de cuidar.'},
    {title:'Un jardín mediterráneo que pide poco y da mucho',tag:'EN EL JARDÍN',date:'08 ABR',image:photos.landscape,desc:'Texturas, aromas y especies que se sienten en casa bajo nuestro sol.'},
    {title:'Pequeños cuidados para una primavera muy verde',tag:'DE TEMPORADA',date:'02 ABR',image:photos.exterior,desc:'Es el momento de observar, abonar y dejar que tu jardín despierte.'}
  ];
  function blog(ctx, block = {}) {
    const v = variant(ctx,'blog',2);
    const entry = (post,i) => `<article class="s-blog-card"><button type="button" data-article="${i}">${img(post.image,post.title)}<span class="s-blog-meta">${post.tag}<span>${post.date}</span></span><h3>${post.title}</h3><p>${post.desc}</p><span class="s-text-link">Seguir leyendo ${icon('arrow')}</span></button></article>`;
    return `<section class="s-section s-container s-blog s-blog-v${v}">${heading(block.title || 'Ideas que dan vida.',block.text || 'Aprende, prueba, equivócate un poquito y sigue cultivando.','EL CUADERNO VERDE')}<div class="s-blog-grid">${posts.map(entry).join('')}</div></section>`;
  }
  function pricing(ctx, block = {}) {
    const v = variant(ctx,'pricing',2);
    const plans = [
      {name:'Una primera idea',label:'Asesoramiento',text:'Empezamos escuchándote para orientar tu proyecto.',items:['Visita al centro','Selección de especies','Consejos de cuidado']},
      {name:'Tu espacio, a medida',label:'Diseño de jardín',text:'Damos forma a ese jardín que ya tienes en la cabeza.',items:['Estudio del espacio','Propuesta de diseño','Selección y plantación']},
      {name:'Que siga creciendo',label:'Mantenimiento',text:'Cuidamos cada estación para que tú lo disfrutes.',items:['Plan de cuidados','Poda y abonado','Seguimiento periódico']}
    ];
    if (v === 1) return `<section class="s-section s-container s-pricing s-pricing-v1">${heading(block.title || 'El cuidado que tu espacio necesita.',block.text || 'Distintas formas de acompañarte, con la misma dedicación.','NUESTROS SERVICIOS')}<div class="s-service-table">${plans.map(plan=>`<div><span>${esc(plan.label)}</span><h3>${esc(plan.name)}</h3><p>${esc(plan.text)}</p>${button(ctx,'Consultar',['contacto','contact'],true)}</div>`).join('')}</div></section>`;
    if (v === 2) return `<section class="s-section s-container s-pricing s-pricing-v2"><div>${heading(block.title || 'Cada jardín es un mundo.',block.text || 'Por eso escuchamos, visitamos y diseñamos una propuesta para ti.','UN PRESUPUESTO A TU MEDIDA')}<div class="s-price-checks">${['Sin compromiso','Ajustado a tu espacio','Con asesoramiento personal'].map(t=>`<span>${icon('check')}${t}</span>`).join('')}</div></div><div class="s-quote-card">${icon('sprout')}<h3>Cuéntanos tu idea.</h3><p>Nosotros ponemos la experiencia y las ganas.</p>${button(ctx,'Pide tu propuesta',['contacto','contact'])}</div></section>`;
    return `<section class="s-section s-container s-pricing s-pricing-v0">${heading(block.title || 'Te acompañamos de principio a jardín.',block.text || 'Elige cómo quieres empezar. El presupuesto lo hacemos contigo.','SERVICIOS QUE CRECEN CONTIGO')}<div class="s-price-grid">${plans.map((plan,i)=>`<article class="${i === 1 ? 'is-featured' : ''}">${i === 1 ? '<span class="s-price-badge">PENSADO PARA TI</span>' : ''}<span class="s-eyebrow">${plan.label}</span><h3>${plan.name}</h3><p>${plan.text}</p><strong class="s-price-label">A medida</strong><ul>${plan.items.map(item=>`<li>${icon('check')}${item}</li>`).join('')}</ul>${button(ctx,'Hablemos',['contacto','contact'],i !== 1)}</article>`).join('')}</div></section>`;
  }
  function features(ctx, block = {}) {
    const v = variant(ctx,'features',2);
    const chosen = ctx.settings.homeGoal && ctx.selected.filter(page => page.group === 'Servicios');
    if (chosen?.length) {
      return `<section class="s-section s-container s-features s-features-v${v}">${heading(block.title || 'Nuestros servicios',block.text || '')}
        <div class="s-features-grid">${chosen.map((page,index) => `<article><span class="s-feature-icon">${v === 1 ? `<span class="s-feature-number">${index + 1}</span>` : icon('sprout')}</span><div><h3>${esc(page.name)}</h3><p>${esc(page.description)}</p>${button(ctx,'Ver servicio',[page.id],true)}</div></article>`).join('')}</div></section>`;
    }
    const items = [['sprout','Plantas bien cuidadas','Elegidas una a una, para que crezcan contigo.'],['chat','Consejos de verdad','Personas que saben y disfrutan compartiéndolo.'],['sun','Cerca de ti','Un lugar al que venir, volver y sentirte a gusto.']];
    return `<section class="s-section s-container s-features s-features-v${v}">${block.title ? heading(block.title,block.text || '') : ''}<div class="s-features-grid">${items.map(([i,t,d],index)=>`<article><span class="s-feature-icon">${v === 1 ? `<span class="s-feature-number">0${index+1}</span>` : icon(i)}</span><div><h3>${t}</h3><p>${d}</p></div></article>`).join('')}</div></section>`;
  }
  function breadcrumbs(ctx) {
    const v = variant(ctx,'breadcrumbs',2);
    return `<nav class="s-breadcrumbs s-breadcrumbs-v${v} s-container" aria-label="Ruta de navegación"><button type="button" ${routeAttributes(ctx,['inicio','home'])}>${v === 2 ? icon('arrow','s-flip') : icon('sprout')}<span>${v === 2 ? 'Volver al inicio' : 'Inicio'}</span></button>${v === 2 ? `<strong>${esc(ctx.meta.name)}</strong>` : `${icon('chevron')}<span aria-current="page">${esc(ctx.meta.name)}</span>`}</nav>`;
  }
  function notice(ctx, block = {}) {
    const v = variant(ctx,'notice',2);
    const text = block.text || 'La mejor estación es la que llenas de plantas. Descubre las novedades del vivero.';
    return `<div class="s-notice-wrap s-container"><aside class="s-notice s-notice-v${v}">${v === 2 ? img(photos.exterior,'Novedades de temporada') : icon(v === 1 ? 'sun' : 'leaf')}<div>${v === 2 ? `<strong>${esc(block.title || 'Han llegado cosas bonitas.')}</strong>` : ''}<span>${esc(text)}</span></div><button type="button" class="s-notice-link" ${routeAttributes(ctx,['exterior','ofertas','interior'])}>Descubrir ${icon('arrow')}</button>${v === 1 ? `<button type="button" class="s-notice-close" data-notice-close aria-label="Cerrar aviso">${icon('close')}</button>` : ''}</aside></div>`;
  }
  function footer(ctx) {
    const v = variant(ctx,'footer',3);
    const opts = ctx.footer;
    const socials = opts.social ? `<div class="s-socials"><button type="button" aria-label="Instagram" data-demo="Aquí irá el perfil de Instagram de ${esc(ctx.settings.brand)}.">${icon('camera')}</button><button type="button" aria-label="Facebook" data-demo="Aquí irá la página de Facebook de ${esc(ctx.settings.brand)}."><span aria-hidden="true">f</span></button><button type="button" aria-label="WhatsApp" data-demo="Aquí irá el chat de WhatsApp de ${esc(ctx.settings.brand)}.">${icon('chat')}</button></div>` : '';
    const linkColumn = `<div class="s-footer-column"><h3>Explora</h3>${ctx.selected.slice(0,6).map(page=>`<button type="button" data-page="${esc(page.id)}">${esc(page.name)}</button>`).join('')}</div>`;
    const details = [ctx.settings.address,ctx.settings.phone,ctx.settings.email].filter(Boolean);
    const contact = opts.contact && details.length ? `<div class="s-footer-column"><h3>Nos encontrarás aquí</h3>${details.map(value => `<p>${esc(value)}</p>`).join('')}</div>` : '';
    const hours = ctx.settings.homeGoal
      ? (opts.hours && ctx.settings.hours ? `<div class="s-footer-column"><h3>Horario</h3><p>${esc(ctx.settings.hours)}</p></div>` : '')
      : opts.hours ? `<div class="s-footer-column"><h3>Ven sin prisa</h3><p>Lunes a sábado<br><strong>9:00–20:00</strong></p><p>Domingos<br><strong>10:00–14:00</strong></p></div>` : '';
    const legalLink=(title,id,message)=>`<button type="button" ${routeAttributes(ctx,[id],message)}>${title}</button>`;
    const legal = `<div class="s-footer-bottom"><span>© ${new Date().getFullYear()} ${esc(ctx.settings.brand)}. Cultivamos contigo.</span><div>${opts.legal ? `${legalLink('Aviso legal','legal','Este espacio mostrará el aviso legal del centro.')}${legalLink('Privacidad','privacidad','Este espacio mostrará la política de privacidad del centro.')}${legalLink('Cookies','cookies','En la web final podrás gestionar tus preferencias de cookies desde aquí.')}` : ''}${opts.quality ? legalLink('Política de calidad','calidad','Este enlace permitirá consultar la política de calidad del centro.') : ''}</div></div>`;
    const logoBlock = `<div class="s-footer-brand">${brand(ctx)}<p>${esc(ctx.settings.tagline)}</p>${socials}</div>`;
    const news = opts.newsletter ? `<div class="s-footer-newsletter"><span class="s-eyebrow">QUE SIGA CRECIENDO</span><h3>Verde en tu bandeja.</h3><p>Ideas y cuidados, de vez en cuando.</p>${newsletterForm(ctx)}</div>` : '';
    if (v === 1) return `<footer class="s-footer s-footer-v1"><div class="s-container">${logoBlock}<nav class="s-footer-centered-links" aria-label="Enlaces del pie">${ctx.selected.map(page=>`<button type="button" data-page="${esc(page.id)}">${esc(page.name)}</button>`).join('')}</nav><div class="s-footer-details">${contact}${hours}</div>${news}${legal}</div></footer>`;
    if (v === 2) return `<footer class="s-footer s-footer-v2"><div class="s-container"><div class="s-footer-top">${news || `<div class="s-footer-community"><span class="s-eyebrow">NUESTRA COMUNIDAD</span><h3>Compartimos<br>raíces.</h3><p>${esc(ctx.settings.tagline)}</p>${socials}</div>`}<div class="s-footer-links">${linkColumn}${contact}${hours}</div></div><div class="s-footer-wordmark">${brand(ctx)}${news ? socials : ''}</div>${legal}</div></footer>`;
    if (v === 3) return `<footer class="s-footer s-footer-v3"><div class="s-container"><div class="s-footer-big"><h2>Nos vemos<br><em>entre plantas.</em></h2>${button(ctx,'Ven a visitarnos',['contacto','contact'])}</div><div class="s-footer-top">${logoBlock}${linkColumn}${contact}${hours}</div>${news}${legal}</div></footer>`;
    return `<footer class="s-footer s-footer-v0"><div class="s-container"><div class="s-footer-top">${logoBlock}${linkColumn}${contact}${hours}</div>${news}${legal}</div></footer>`;
  }
  const renderers = {navbar,hero,cards,buttons,forms,info,catalog,gallery,testimonials,faq,cta,footer,newsletter,stats,team,blog,pricing,features,breadcrumbs,notice};
  function theme(ctx) {
    const s = ctx.settings;
    const primary = color(s.primary,defaults.primary);
    const rgb = primary.slice(1).match(/.{2}/g).map(hex=>parseInt(hex,16));
    const luminance = rgb.map(channel=>{const n=channel/255; return n <= 0.04045 ? n/12.92 : ((n+0.055)/1.055)**2.4;}).reduce((sum,n,index)=>sum+n*[0.2126,0.7152,0.0722][index],0);
    const headingFonts = {serif:'"DM Serif Display", Georgia, serif',sans:'"DM Sans", Arial, sans-serif',modern:'Georgia, serif',humanist:'Palatino, "Palatino Linotype", serif'};
    const bodyFonts = {sans:'"DM Sans", Arial, sans-serif',humanist:'"Trebuchet MS", Arial, sans-serif',mono:'"Courier New", monospace',serif:'Georgia, serif'};
    const ratio = ['4/3','1/1','3/4'].includes(s.cardRatio) ? s.cardRatio : '4/3';
    return [
      `--s-primary:${primary}`,`--s-accent:${color(s.accent,defaults.accent)}`,`--s-bg:${color(s.background,defaults.background)}`,`--s-text:${color(s.text,defaults.text)}`,
      `--s-on-primary:${luminance > .36 ? '#17271d' : '#ffffff'}`,`--s-radius:${clamp(s.radius,0,40,14)}px`,`--s-space:${clamp(s.spacing,24,140,68)}px`,
      `--s-max:${clamp(s.maxWidth,700,1600,1200)}px`,`--s-font-size:${clamp(s.fontSize,12,22,16)}px`,`--s-columns:${Math.round(clamp(s.columns,2,4,3))}`,
      `--s-heading-font:${headingFonts[s.headingFont] || headingFonts.serif}`,`--s-body-font:${bodyFonts[s.bodyFont] || bodyFonts.sans}`,`--s-card-ratio:${ratio}`,
      `--s-button-pad:${s.buttonSize === 'small' ? '10px 17px' : s.buttonSize === 'large' ? '17px 26px' : '13px 21px'}`,
      `--s-shadow:${s.shadow === 'none' ? 'none' : s.shadow === 'lifted' ? '0 12px 28px rgb(29 53 40 / .14)' : '0 4px 16px rgb(29 53 40 / .05)'}`
    ].join(';');
  }
  function editable(content, type, id, clean) {
    const label = ({hero:'portada', navbar:'menú', footer:'pie de página'})[type] || 'sección';
    const insert = ['navbar','footer'].includes(type) ? '' : `<button type="button" class="s-insert-section" data-insert-after="${esc(id)}" aria-label="Añadir una sección después de esta">${icon('plus')}</button>`;
    return `<div class="s-editable" data-section-type="${esc(type)}" data-section-id="${esc(id)}">${content}${clean ? '' : `<button type="button" class="s-edit-section" data-edit-section="${esc(id)}" data-edit-type="${esc(type)}">${icon('edit')}<span>Editar ${label}</span></button>${insert}`}</div>`;
  }
  function render(state, pages, opts = {}) {
    const ctx = context(state,pages);
    const sections = ctx.page.sections || ['hero','features','catalog','info','testimonials','cta'].map((type,index)=>({id:`${ctx.active}-${type}-${index}`,type,hidden:false}));
    const contents = sections.filter(section=>!section.hidden && !['navbar','footer'].includes(section.type)).map((section,index)=>{
      const renderer = renderers[section.type];
      return renderer ? editable(renderer(ctx,section),section.type,section.id || `${section.type}-${index}`,opts.clean) : '';
    }).join('');
    return `<div class="site-root${opts.clean ? ' s-clean' : ''}${ctx.settings.animations ? '' : ' s-no-motion'}" style="${esc(theme(ctx))}"><a class="s-skip-link" href="#site-main">Saltar al contenido</a>${editable(navbar(ctx),'navbar','global-navbar',opts.clean)}<main id="site-main">${contents}</main>${editable(footer(ctx),'footer','global-footer',opts.clean)}${feedback()}</div>`;
  }
  function feedback(){return `<div class="s-demo-toast" role="status" aria-live="polite" hidden></div><dialog class="s-article-dialog"><button type="button" class="s-dialog-close" data-close-article aria-label="Cerrar artículo">${icon('close')}</button><div class="s-article-content"></div></dialog>`;}
  function sample(type, selectedVariant, state, pages) {
    const ctx = context(state,pages);
    ctx.components = {...ctx.components,[type]:selectedVariant};
    const renderer = renderers[type] || hero;
    const navContext=type === 'navbar' ? `<div class="s-nav-sample-context"><div><span>UN ESPACIO PARA TU NATURALEZA</span><h2>Tu vida,<br>un poco más verde.</h2><i></i><i></i><b></b></div>${img(photos.hero,'Un centro de jardinería lleno de vida')}</div>` : '';
    return `<div class="site-root site-sample s-sample-${esc(type)} s-clean" style="${esc(theme(ctx))}">${renderer(ctx,{})}${navContext}${feedback()}</div>`;
  }
  const runtime = String.raw`
    (() => {
      const root = document.querySelector('.site-root');
      if (!root) return;
      let toastTimer;
      const send = (type, payload = {}) => parent.postMessage({source:'brote-preview',type,...payload}, '*');
      const toast = message => {
        const el = root.querySelector('.s-demo-toast');
        if (!el) return;
        el.textContent = message; el.hidden = false;
        clearTimeout(toastTimer); toastTimer = setTimeout(() => {el.hidden = true;},5000);
      };
      const filterCatalog = section => {
        const selected=section.querySelector('[data-catalog-filter].is-active')?.dataset.catalogFilter || 'all';
        const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
        const search=normalize(section.querySelector('[data-catalog-search]')?.value);
        let count=0;
        section.querySelectorAll('[data-catalog-tag]').forEach(item=>{const visible=(selected==='all'||item.dataset.catalogTag===selected)&&normalize(item.dataset.catalogName).includes(search);item.hidden=!visible;if(visible)count++;});
        const label=section.querySelector('.s-filter-count');if(label)label.textContent=count+' planta'+(count===1?'':'s')+' para descubrir';
        const empty=section.querySelector('.s-filter-empty');if(empty)empty.hidden=count>0;
      };
      const setFormStep = (form, step) => {
        const first=form.querySelector('[data-form-step="1"]'),second=form.querySelector('[data-form-step="2"]');
        if(step===2){for(const control of first.querySelectorAll('input,select,textarea')){if(!control.reportValidity())return false;}}
        first.hidden=step!==1;first.disabled=step!==1;second.hidden=step!==2;second.disabled=step!==2;
        form.querySelectorAll('.s-form-progress li').forEach((item,index)=>{item.classList.toggle('is-current',index+1===step);if(index+1===step)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
        const active=step===1?first:second;active.querySelector('input,select,textarea')?.focus({preventScroll:true});return true;
      };
      root.addEventListener('click', event => {
        const edit = event.target.closest('[data-edit-section]');
        if (edit) {event.preventDefault();send('edit',{sectionId:edit.dataset.editSection,sectionType:edit.dataset.editType});return;}
        const insert = event.target.closest('[data-insert-after]');
        if (insert) {event.preventDefault();send('insert',{after:insert.dataset.insertAfter});return;}
        const toggle = event.target.closest('[data-menu-toggle]');
        if (toggle) {const nav=toggle.closest('.s-nav');const open=nav.classList.toggle('is-menu-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');return;}
        const filter=event.target.closest('[data-catalog-filter]');
        if(filter){const section=filter.closest('[data-filter-catalog]');section.querySelectorAll('[data-catalog-filter]').forEach(button=>{button.classList.toggle('is-active',button===filter);button.setAttribute('aria-pressed',String(button===filter));});filterCatalog(section);return;}
        const faqFilter=event.target.closest('[data-faq-filter]');
        if(faqFilter){const section=faqFilter.closest('[data-faq-categories]');section.querySelectorAll('[data-faq-filter]').forEach(button=>{button.classList.toggle('is-active',button===faqFilter);button.setAttribute('aria-pressed',String(button===faqFilter));});const group=faqFilter.dataset.faqFilter;section.querySelectorAll('[data-faq-group]').forEach(item=>item.hidden=group!=='all'&&item.dataset.faqGroup!==group);return;}
        const next=event.target.closest('[data-step-next]');
        if(next){setFormStep(next.closest('form'),2);return;}
        const back=event.target.closest('[data-step-back]');
        if(back){setFormStep(back.closest('form'),1);return;}
        const navigate = event.target.closest('[data-page]');
        if (navigate) {event.preventDefault();send('navigate',{page:navigate.dataset.page});return;}
        const demo = event.target.closest('[data-demo]');
        if (demo) {event.preventDefault();toast(demo.dataset.demo);return;}
        const carousel = event.target.closest('[data-carousel-step]');
        if (carousel) {const track=carousel.closest('[data-carousel]').querySelector('.s-carousel-track');if(track)track.scrollBy({left:Number(carousel.dataset.carouselStep)*track.clientWidth*.8,behavior:'smooth'});return;}
        const favorite = event.target.closest('[data-favorite]');
        if (favorite) {const active=favorite.getAttribute('aria-pressed')!=='true';favorite.setAttribute('aria-pressed',String(active));toast(active?'Guardada entre tus favoritas en esta vista.':'Planta eliminada de tus favoritas.');return;}
        const close = event.target.closest('[data-notice-close]');
        if (close) {close.closest('.s-notice-wrap').remove();return;}
        const article = event.target.closest('[data-article]');
        if (article) {
          const titles=['Tu primera planta de interior: por dónde empezar','Un jardín mediterráneo que pide poco y da mucho','Pequeños cuidados para una primavera muy verde'];
          const texts=[
            '<p>Antes de elegir una planta, observa la luz de tu casa. Una ventana luminosa sin sol directo ofrece muchas posibilidades; un rincón oscuro necesita especies adaptadas y unas expectativas realistas.</p><h3>Empieza por una compañera fácil</h3><p>Un pothos o una sansevieria son buenas opciones para aprender a observar. Toca el sustrato antes de regar y comprueba que la maceta puede drenar.</p><h3>Dale tiempo</h3><p>Tras un cambio de espacio, las plantas necesitan adaptarse. Evita moverlas continuamente y ve ajustando sus cuidados poco a poco.</p>',
            '<p>Un jardín que se adapta a su entorno se disfruta más. La lavanda, el romero y las especies de clima mediterráneo aportan textura, aroma y vida sin pedir cuidados constantes.</p><h3>Piensa en la luz y en el suelo</h3><p>Agrupa las plantas según sus necesidades de agua, deja espacio para que crezcan y prepara un suelo con buen drenaje.</p><h3>Diseña para vivirlo</h3><p>Una pequeña zona de sombra, un camino cómodo y algún asiento convierten el jardín en un lugar al que apetece salir.</p>',
            '<p>La primavera invita a observar cómo despiertan tus plantas. Revisa hojas, tallos y sustrato antes de cambiar tu rutina.</p><h3>Riega mirando la tierra</h3><p>Las necesidades cambian con la temperatura y la luz. Comprueba la humedad del sustrato y evita los encharcamientos.</p><h3>Un poco de alimento</h3><p>Durante el crecimiento activo, sigue las indicaciones del abono adecuado para cada especie. Más cantidad no significa mejores resultados.</p>'
          ];
          const index=Math.min(2,Math.max(0,Number(article.dataset.article)||0));
          const dialog=root.querySelector('.s-article-dialog');
          if(dialog){dialog.querySelector('.s-article-content').innerHTML='<span class="s-eyebrow">EL CUADERNO VERDE · ARTÍCULO DE MUESTRA</span><h2>'+titles[index]+'</h2>'+texts[index];dialog.showModal();}return;
        }
        const closeArticle=event.target.closest('[data-close-article]');
        if(closeArticle) closeArticle.closest('dialog').close();
      });
      root.addEventListener('input',event=>{if(event.target.matches('[data-catalog-search]'))filterCatalog(event.target.closest('[data-filter-catalog]'));});
      root.addEventListener('submit',event=>{
        const form=event.target.closest('[data-demo-form]');if(!form)return;
        event.preventDefault();
        if(form.hasAttribute('data-stepped')&&!form.querySelector('[data-form-step="1"]').disabled){setFormStep(form,2);return;}
        if(!form.reportValidity())return;
        const status=form.querySelector('.s-form-status');
        if(status){status.textContent=form.hasAttribute('data-newsletter')?'¡Listo! Así se confirmaría tu suscripción. Esta demo no envía ni guarda tu correo.':'¡Gracias! Así se confirmaría tu consulta. Esta demo no envía ni guarda tus datos.';status.hidden=false;}
      });
      document.addEventListener('keydown',event=>{
        if(event.key==='Escape')root.querySelectorAll('.is-menu-open').forEach(nav=>{nav.classList.remove('is-menu-open');const button=nav.querySelector('[data-menu-toggle]');if(button){button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Abrir menú');}});
      });
      window.addEventListener('message',event=>{
        const message=event.data;if(event.source!==parent || !message || message.source!=='brote-studio')return;
        if(message.type==='focus'){
          const nodes=Array.from(root.querySelectorAll('[data-section-id]'));
          const target=nodes.find(node=>message.sectionId?node.dataset.sectionId===message.sectionId:node.dataset.sectionType===message.sectionType);
          if(target){target.scrollIntoView({behavior:'smooth',block:'start'});target.classList.add('s-section-highlight');setTimeout(()=>target.classList.remove('s-section-highlight'),1600);}
        }
        if(message.type==='set-scroll'){
          const top=Number(message.top)||0;
          document.fonts.ready.then(()=>requestAnimationFrame(()=>window.scrollTo({top,behavior:'instant'})));
        }
        if(message.type==='get-scroll')send('scroll',{top:window.scrollY});
      });
      let scrollTick=false;
      window.addEventListener('scroll',()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(()=>{send('scroll',{top:window.scrollY});scrollTick=false;});}},{passive:true});
      send('ready',{height:document.documentElement.scrollHeight});
    })();
  `;
  window.BroteSite = {render,sample,runtime};
})();


(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = v => JSON.parse(JSON.stringify(v));
  const slug = v => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pagina';
  const uid = () => `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const ICONS = {
    sprout: '<path d="M12 21V11M12 16C5 17 2 12 3 6c6-1 11 3 9 10ZM12 12C11 5 16 2 22 3c0 6-4 10-10 9Z"/>',
    pages: '<rect x="7" y="3" width="13" height="16" rx="2"/><path d="M4 7v13a2 2 0 0 0 2 2h10M10 7h7M10 11h7M10 15h4"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M10 9v12"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-3.7 1.5 1.5 0 0 1 1-2.8h2a4 4 0 0 0 4-4c0-4.3-4-7.5-9-7.5Z"/><path d="M7.5 9h.01M11 6.5h.01M16 8h.01M6.5 14h.01" stroke-width="3"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>', down: '<path d="m6 9 6 6 6-6"/>', up: '<path d="m6 15 6-6 6 6"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>', check: '<path d="m5 12 4 4L19 6"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>', search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    desktop: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    tablet: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/>',
    mobile: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    hidden: '<path d="m3 3 18 18M10.6 5.1 12 5c6 0 10 7 10 7a18 18 0 0 1-3 3.6M6.3 6.3A23 23 0 0 0 2 12s4 7 10 7a12 12 0 0 0 5.7-1.7"/>',
    undo: '<path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 6 6v3"/>', redo: '<path d="m15 5 5 5-5 5m5-5H10a6 6 0 0 0-6 6v3"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>', upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9a2.8 2.8 0 1 1 4.2 2.5c-1.5.6-1.5 1.5-1.5 2.5M12 17h.01"/>',
    nav: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M5 7.5h3M12 7.5h2M17 7.5h2"/>',
    hero: '<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M13 3v18M5 8h5M5 12h4M5 16h3m6 1 4-6 5 6"/>',
    cards: '<rect x="3" y="5" width="8" height="14" rx="2"/><rect x="14" y="5" width="7" height="14" rx="2"/><path d="M3 12h8m3 0h7"/>',
    button: '<rect x="2" y="6" width="20" height="12" rx="5"/><path d="M6 12h7m2-2 2 2-2 2"/>',
    form: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 7h10M7 11h10M7 16h4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
    text: '<path d="M4 5h16M4 10h16M4 15h10M4 20h8"/>',
    quote: '<path d="M10 6H4v7h6V6ZM20 6h-6v7h6V6ZM10 13c0 4-2 6-6 6m16-6c0 4-2 6-6 6"/>',
    cta: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 10h6M6 14h4m6-5 3 3-3 3"/>',
    footer: '<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 14h20M6 17h2M11 17h2M16 17h2"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 6 10 7L22 6"/>',
    chart: '<path d="M4 20h17M7 16v-5M12 16V4m5 12V8"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m3 10v-3a6 6 0 0 0-3-5"/>',
    tag: '<path d="M20 13 12 21 3 12V3h9l8 8a1.5 1.5 0 0 1 0 2Z"/><circle cx="7.5" cy="7.5" r="1"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    sliders: '<path d="M4 6h4m6 0h6M4 12h10m6 0h0M4 18h0m6 0h10"/><circle cx="11" cy="6" r="3"/><circle cx="17" cy="12" r="3"/><circle cx="7" cy="18" r="3"/>',
    type: '<path d="M4 4h16M12 4v17M8 21h8M4 8V4m16 4v4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
    code: '<path d="m7 6-5 6 5 6m10-12 5 6-5 6M14 3l-4 18"/>',
    spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
    edit: '<path d="m15 4 5 5M4 20l4-1L21 6a2.8 2.8 0 0 0-4-4L4 15Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    history: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6M12 7v6l3 2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    leaf: '<path d="M20 3C7 2 2 8 5 15s16 8 15-12ZM4 21 16 9"/>',
  };
  const icon = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.layout}</svg>`;
  const iconBtn = (action, symbol, label, extra = '') => `<button class="icon-btn" data-action="${action}" title="${esc(label)}" aria-label="${esc(label)}" ${extra}>${icon(symbol)}</button>`;
  const PAGE_GROUPS = ['Todas', 'Esenciales', 'Plantas', 'Productos', 'Servicios', 'Inspiración', 'Legales'];
  const PAGES = [
    ['inicio', 'Inicio', 'Esenciales', 'La primera impresión de tu centro.'],
    ['nosotros', 'Nosotros', 'Esenciales', 'Vuestra historia, equipo y filosofía.'],
    ['contacto', 'Contacto', 'Esenciales', 'Formulario, ubicación y horarios.'],
    ['instalaciones', 'El centro', 'Esenciales', 'Un paseo por vuestras instalaciones.'],
    ['interior', 'Plantas de interior', 'Plantas', 'Un hogar con más vida.'],
    ['exterior', 'Plantas de exterior', 'Plantas', 'Verde para balcones y jardines.'],
    ['cactus', 'Cactus', 'Plantas', 'Carácter, formas y pocos cuidados.'],
    ['suculentas', 'Suculentas', 'Plantas', 'Pequeñas plantas, grandes posibilidades.'],
    ['trepadoras', 'Trepadoras', 'Plantas', 'Vida que crece en vertical.'],
    ['arboles', 'Árboles y frutales', 'Plantas', 'Raíces para los próximos años.'],
    ['arbustos', 'Arbustos', 'Plantas', 'Estructura y color durante todo el año.'],
    ['aromaticas', 'Aromáticas', 'Plantas', 'Aromas del jardín a la cocina.'],
    ['huerto', 'Huerto', 'Plantas', 'El placer de cultivar lo tuyo.'],
    ['temporada', 'Plantas de temporada', 'Plantas', 'Cada estación tiene su color.'],
    ['macetas', 'Macetas y jardineras', 'Productos', 'El hogar de cada planta.'],
    ['sustratos', 'Sustratos y abonos', 'Productos', 'Todo empieza en una buena tierra.'],
    ['riego', 'Riego', 'Productos', 'Cada gota cuenta.'],
    ['herramientas', 'Herramientas', 'Productos', 'Tus mejores compañeras de jardín.'],
    ['paisajismo', 'Paisajismo', 'Servicios', 'Diseñamos tu rincón de naturaleza.'],
    ['obra', 'Construcción de jardines', 'Servicios', 'Del primer boceto a la última planta.'],
    ['mantenimiento', 'Mantenimiento', 'Servicios', 'Jardines cuidados, todo el año.'],
    ['poda', 'Poda', 'Servicios', 'La experiencia que tus árboles necesitan.'],
    ['alquiler', 'Alquiler de plantas', 'Servicios', 'Eventos con raíces y personalidad.'],
    ['asesoramiento', 'Asesoramiento', 'Servicios', 'Un consejo para cada pregunta.'],
    ['reparto', 'Reparto a domicilio', 'Servicios', 'Llevamos la naturaleza hasta tu puerta.'],
    ['proyectos', 'Nuestros proyectos', 'Inspiración', 'Jardines que ya están creciendo.'],
    ['blog', 'Blog y consejos', 'Inspiración', 'Ideas para una vida más verde.'],
    ['talleres', 'Talleres y eventos', 'Inspiración', 'Aprendemos con las manos en la tierra.'],
    ['faq', 'Preguntas frecuentes', 'Inspiración', 'Respuestas que ayudan a crecer.'],
    ['promociones', 'Promociones', 'Inspiración', 'Oportunidades de temporada.'],
    ['equipo', 'Nuestro equipo', 'Esenciales', 'Las personas detrás de cada consejo.'],
    ['legal', 'Aviso legal', 'Legales', 'Información del titular del sitio.'],
    ['privacidad', 'Privacidad', 'Legales', 'Ejemplo de página de privacidad.'],
    ['cookies', 'Cookies', 'Legales', 'Ejemplo de política de cookies.'],
    ['calidad', 'Política de calidad', 'Legales', 'Vuestro compromiso con la calidad.'],
  ].map(([id, name, group, description]) => ({ id, name, group, description }));
  const CATEGORIES = [
    { id: 'navbar', name: 'Navegación', icon: 'nav', group: 'Estructura', desc: 'La bienvenida empieza por un buen menú.', variants: ['Esencial', 'Logo centrado', 'Doble barra', 'Flotante'], hints: ['Logo, enlaces y una acción clara.', 'La marca en el centro, enlaces a ambos lados.', 'Contacto arriba y navegación debajo.', 'Una cápsula ligera sobre el contenido.'] },
    { id: 'hero', name: 'Portadas', icon: 'hero', group: 'Estructura', desc: 'Una primera impresión con personalidad.', variants: ['Editorial', 'Inmersiva', 'En el centro', 'Collage'], hints: ['Texto e imagen en equilibrio.', 'Una gran fotografía lo cuenta todo.', 'Titular centrado y una imagen panorámica.', 'Composición asimétrica con varias imágenes.'] },
    { id: 'footer', name: 'Pie de página', icon: 'footer', group: 'Estructura', desc: 'Todo lo importante, también al final.', variants: ['Completo', 'Compacto', 'Comunidad', 'Visítanos'], hints: ['La información organizada en columnas.', 'Una despedida sencilla y horizontal.', 'La suscripción como protagonista.', 'Dirección, contacto y horarios a mano.'] },
    { id: 'cards', name: 'Tarjetas', icon: 'cards', group: 'Elementos', desc: 'Siete formas de mostrar lo que te hace especial.', variants: ['Botánica', 'Horizontal', 'Sobre la imagen', 'Con detalles', 'Esencial', 'De servicio', 'Destacada'], hints: ['Fotografía, título y una invitación.', 'Imagen al lado, información compacta.', 'Texto integrado sobre la fotografía.', 'Etiquetas y cuidados de cada planta.', 'Solo lo que importa.', 'Un icono, un servicio, una solución.', 'Más espacio para un gran protagonista.'] },
    { id: 'buttons', name: 'Botones', icon: 'button', group: 'Elementos', desc: 'Pequeños detalles que invitan a hacer clic.', variants: ['Sólido', 'Contorno', 'Texto y flecha', 'Con icono', 'Acción dividida'], hints: ['Contraste y claridad.', 'Un trazo ligero.', 'Discreto y editorial.', 'Una pista visual antes del texto.', 'Texto y acción en dos piezas.'] },
    { id: 'forms', name: 'Formularios', icon: 'form', group: 'Elementos', desc: 'Conversaciones que empiezan sin esfuerzo.', variants: ['Sencillo', 'Dos columnas', 'Con información', 'Por pasos'], hints: ['Campos en una sola columna.', 'Mejor uso del espacio disponible.', 'Contacto y formulario, juntos.', 'Una solicitud guiada en dos pasos.'] },
    { id: 'breadcrumbs', name: 'Migas de pan', icon: 'chevron', group: 'Elementos', desc: 'Para saber siempre dónde estás.', variants: ['Discretas', 'En cápsula', 'Con contexto'] },
    { id: 'notice', name: 'Avisos', icon: 'bell', group: 'Elementos', desc: 'Novedades que merecen un poco de atención.', variants: ['Franja', 'Mensaje', 'Tarjeta'] },
    { id: 'info', name: 'Contenido', icon: 'text', group: 'Secciones', desc: 'Dale espacio a tu historia y tus servicios.', variants: ['Imagen y texto', 'Alternado', 'Editorial', 'Bento'] },
    { id: 'catalog', name: 'Catálogo', icon: 'grid', group: 'Secciones', desc: 'Una colección que apetece descubrir.', variants: ['Cuadrícula', 'Con filtros', 'Por categorías', 'Selección editorial'] },
    { id: 'features', name: 'Servicios', icon: 'spark', group: 'Secciones', desc: 'Cuenta cómo puedes ayudar.', variants: ['Iconos', 'Numerados', 'Destacado'] },
    { id: 'gallery', name: 'Galerías', icon: 'image', group: 'Secciones', desc: 'Deja que tus plantas y proyectos hablen.', variants: ['Cuadrícula', 'Mosaico', 'Carrusel'] },
    { id: 'cta', name: 'Llamadas a la acción', icon: 'cta', group: 'Secciones', desc: 'El siguiente paso, en el momento adecuado.', variants: ['Centrada', 'En una línea', 'Con imagen', 'Inmersiva'] },
    { id: 'testimonials', name: 'Testimonios', icon: 'quote', group: 'Secciones', desc: 'Las palabras de quienes ya os conocen.', variants: ['Tarjetas', 'Gran cita', 'Valoraciones'] },
    { id: 'faq', name: 'Preguntas frecuentes', icon: 'help', group: 'Secciones', desc: 'Resuelve las dudas antes de la visita.', variants: ['Acordeón', 'Dos columnas', 'Con categorías'] },
    { id: 'stats', name: 'Cifras', icon: 'chart', group: 'Secciones', desc: 'Vuestra trayectoria, de un vistazo.', variants: ['En una línea', 'En tarjetas', 'Protagonista'] },
    { id: 'team', name: 'Equipo', icon: 'users', group: 'Secciones', desc: 'Pon cara a quienes cuidan cada detalle.', variants: ['Cuadrícula', 'Horizontal', 'Destacado'] },
    { id: 'blog', name: 'Artículos', icon: 'pages', group: 'Secciones', desc: 'Ideas y consejos que dan ganas de leer.', variants: ['Tarjetas', 'Portada editorial', 'Listado'] },
    { id: 'newsletter', name: 'Newsletter', icon: 'mail', group: 'Secciones', desc: 'Haz crecer vuestra comunidad.', variants: ['En línea', 'Panel centrado', 'Con imagen'] },
    { id: 'pricing', name: 'Planes de servicio', icon: 'tag', group: 'Secciones', desc: 'Compara opciones de manera sencilla.', variants: ['Tres planes', 'Comparativa', 'Destacado'] },
  ];
  const TOTAL_VARIANTS = CATEGORIES.reduce((n, c) => n + c.variants.length, 0);
  const SECTION_TYPES = CATEGORIES.filter(c => !['navbar', 'footer', 'cards', 'buttons'].includes(c.id));
  const PRESETS = [
    { name: 'Jardín mediterráneo', caption: 'Sereno · natural · cercano', colors: ['#244638', '#dce8c3', '#fbfaf6', '#26382d'], headingFont: 'serif', radius: 14 },
    { name: 'Terracota', caption: 'Cálido · artesanal · orgánico', colors: ['#914d36', '#eed4bb', '#fbf4ec', '#483a31'], headingFont: 'serif', radius: 4 },
    { name: 'Flor de lavanda', caption: 'Suave · luminoso · delicado', colors: ['#665375', '#e3dbef', '#fcfaff', '#3d3547'], headingFont: 'modern', radius: 20 },
    { name: 'Bosque moderno', caption: 'Fresco · directo · actual', colors: ['#1b4f44', '#c5ed8c', '#f4f7f3', '#203b33'], headingFont: 'sans', radius: 24 },
    { name: 'Arena y olivo', caption: 'Pausado · elegante · esencial', colors: ['#635f3e', '#e8dfb8', '#f9f6ed', '#383b2f'], headingFont: 'humanist', radius: 0 },
    { name: 'Azul botánico', caption: 'Limpio · editorial · luminoso', colors: ['#284d6b', '#cde5e8', '#f7fafb', '#283d4c'], headingFont: 'sans', radius: 8 },
  ];
  const DEFAULT_SETTINGS = { groupMenu:false, focusProduct:'', homeGoal:'', hours:'', brand: 'Jardín de Abril', tagline: 'La vida, un poco más verde.', location: 'Valencia', email: 'hola@jardindeabril.es', phone: '+34 960 123 456', address: 'Camino del Jardín, 12 · Valencia', primary: '#244638', accent: '#dce8c3', background: '#fbfaf6', text: '#26382d', headingFont: 'serif', bodyFont: 'sans', radius: 14, spacing: 68, maxWidth: 1200, fontSize: 16, headingWeight: 0, bodyWeight: 0, shadow: 'soft', buttonSize: 'medium', cardRatio: '4/3', columns: 3, logoMark: true, navSticky: true, topbar: false, animations: true };
  const defaultContent = p => {
    let types = ['hero', 'catalog', 'info', 'faq', 'cta'];
    if (p.id === 'inicio') types = ['hero', 'features', 'catalog', 'info', 'testimonials', 'cta'];
    else if (p.id === 'contacto') types = ['hero', 'forms', 'faq'];
    else if (p.id === 'nosotros' || p.id === 'instalaciones') types = ['hero', 'info', 'stats', 'gallery', 'team', 'cta'];
    else if (p.group === 'Servicios') types = ['hero', 'info', 'features', 'gallery', 'testimonials', 'forms', 'cta'];
    else if (p.id === 'blog' || p.id === 'talleres') types = ['hero', 'blog', 'newsletter'];
    else if (p.id === 'proyectos') types = ['hero', 'gallery', 'testimonials', 'cta'];
    else if (p.id === 'faq') types = ['hero', 'faq', 'forms'];
    else if (p.id === 'equipo') types = ['hero', 'team', 'info', 'cta'];
    else if (p.group === 'Legales') types = ['hero', 'info'];
    return { title: p.id === 'inicio' ? 'Hay un lugar para tu naturaleza.' : p.name, description: p.id === 'inicio' ? 'Plantas, ideas y personas que te ayudan a llenar de vida cada rincón. Bienvenido a tu próximo lugar favorito.' : p.description, sections: types.map(type => ({ id: uid(), type, hidden: false })) };
  };
  const makeDefault = () => ({ version: 1, generated: false, pages: ['inicio', 'nosotros', 'contacto', 'interior', 'exterior', 'paisajismo', 'alquiler', 'blog'], activePage: 'inicio', customPages: [], settings: clone(DEFAULT_SETTINGS), components: Object.fromEntries(CATEGORIES.map(c => [c.id, 0])), footer: { social: true, contact: true, hours: true, legal: true, quality: false, newsletter: false }, pageContent: Object.fromEntries(PAGES.map(p => [p.id, defaultContent(p)])) });
  const STORAGE_KEY = 'brote-studio-project-v1';
  let storageAvailable = true;
  function validate(raw) {
    if (!raw || typeof raw !== 'object' || raw.version !== 1 || !Array.isArray(raw.pages) || !raw.settings || typeof raw.settings !== 'object') throw Error('Este archivo no es una configuración de Brote Studio v1.');
    const clean = makeDefault();
    clean.customPages = Array.isArray(raw.customPages) ? raw.customPages.slice(0, 30).filter(p => p && typeof p.id === 'string' && /^[a-z0-9-]{1,80}$/.test(p.id) && !PAGES.some(x => x.id === p.id)).map(p => ({ id: p.id, name: String(p.name || 'Página').slice(0, 80), group: 'Personalizadas', description: String(p.description || '').slice(0, 250) })).filter((p, i, a) => a.findIndex(x => x.id === p.id) === i) : [];
    const knownPages = [...PAGES, ...clean.customPages];
    clean.pages = [...new Set(['inicio', ...raw.pages.filter(id => knownPages.some(p => p.id === id))])];
    clean.activePage = clean.pages.includes(raw.activePage) ? raw.activePage : 'inicio';
    clean.generated = !!raw.generated;
    for (const k of ['brand', 'tagline', 'location', 'email', 'phone', 'address', 'hours']) if (typeof raw.settings[k] === 'string') clean.settings[k] = raw.settings[k].slice(0, k === 'brand' ? 60 : 250);
    for (const k of ['primary', 'accent', 'background', 'text']) if (/^#[0-9a-f]{6}$/i.test(raw.settings[k])) clean.settings[k] = raw.settings[k];
    for (const [key, weights] of [['headingWeight', [0,400,500,600,700,800]], ['bodyWeight', [0,400,500,600]]]) {
      if (weights.includes(raw.settings[key])) clean.settings[key] = raw.settings[key];
    }
    const enums = { headingFont: ['serif', 'sans', 'modern', 'humanist'], bodyFont: ['sans', 'humanist', 'mono', 'serif'], shadow: ['none', 'soft', 'lifted'], buttonSize: ['small', 'medium', 'large'], cardRatio: ['4/3', '1/1', '3/4'] };
    for (const [key, allowed] of Object.entries(enums)) if (allowed.includes(raw.settings[key])) clean.settings[key] = raw.settings[key];
    for (const [k, min, max] of [['radius', 0, 32], ['spacing', 32, 120], ['maxWidth', 960, 1440], ['fontSize', 14, 20], ['columns', 2, 4]]) if (Number.isFinite(Number(raw.settings[k]))) clean.settings[k] = Math.min(max, Math.max(min, Number(raw.settings[k])));
    for (const k of ['logoMark', 'navSticky', 'topbar', 'animations', 'groupMenu']) if (typeof raw.settings[k] === 'boolean') clean.settings[k] = raw.settings[k];
    if (['products','services','contact'].includes(raw.settings.homeGoal)) clean.settings.homeGoal = raw.settings.homeGoal;
    if (knownPages.some(page => page.id === raw.settings.focusProduct && ['Plantas','Productos'].includes(page.group))) clean.settings.focusProduct = raw.settings.focusProduct;
    for (const k of Object.keys(clean.footer)) if (typeof raw.footer?.[k] === 'boolean') clean.footer[k] = raw.footer[k];
    for (const c of CATEGORIES) if (Number.isInteger(raw.components?.[c.id]) && raw.components[c.id] >= 0 && raw.components[c.id] < c.variants.length) clean.components[c.id] = raw.components[c.id];
    for (const p of knownPages) {
      const pc = raw.pageContent?.[p.id];
      if (!pc || typeof pc !== 'object') { clean.pageContent[p.id] = defaultContent(p); continue; }
      clean.pageContent[p.id] = { title: String(pc.title ?? p.name).slice(0, 180), description: String(pc.description ?? p.description).slice(0, 600), sections: Array.isArray(pc.sections) ? pc.sections.slice(0, 30).filter(s => s && SECTION_TYPES.some(t => t.id === s.type)).map(s => ({ id: uid(), type: s.type, hidden: !!s.hidden, ...(typeof s.title === 'string' ? { title: s.title.slice(0, 180) } : {}), ...(typeof s.text === 'string' ? { text: s.text.slice(0, 1000) } : {}) })) : defaultContent(p).sections };
    }
    return clean;
  }
  let state = makeDefault();
  let hasProject = false;
  let editorStarted = false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      state = validate(JSON.parse(stored));
      hasProject = true;
    }
  } catch { storageAvailable = false; }
  const ui = { stage: 'preview', category: 'navbar', pageGroup: 'Todas', pageSearch: '', componentSearch: '', device: window.innerWidth <= 700 ? 'mobile' : 'desktop', sampleDevice: 'desktop', canvasMode: 'page', actualSize: false, selectedSection: null, panelBack: null, insertAfter: null };
  const undoStack = [], redoStack = [];
  let editBefore = null, previewTimer, saveTimer, toastTimer, resizeObserver, lastFocusType = null;
  const catalog = () => [...PAGES, ...state.customPages];
  const currentPage = () => catalog().find(p => p.id === state.activePage) || PAGES[0];
  const currentContent = () => state.pageContent[state.activePage];
  const guide = window.createBroteGuide({
    icon, toast,
    snapshot: () => ({ ui: clone(ui), panelScroll: $('.panel-body')?.scrollTop || 0, disclosures: $$('[data-disclosure][open]').map(el => el.dataset.disclosure) }),
    restore: saved => {
      Object.assign(ui, saved.ui);
      render();
      $$('[data-disclosure]').forEach(el => { el.open = saved.disclosures.includes(el.dataset.disclosure); });
      if ($('.panel-body')) $('.panel-body').scrollTop = saved.panelScroll;
    },
    navigate: guideNavigation,
    openTask(id) {
      if (id === 'export') { $('.export-btn').click(); return; }
      const destinations = {
        pages: {stage:'pages'},
        design: {stage:'design', category:'hero'},
        identity: {stage:'brand'},
        content: {stage:'section'},
        mobile: {stage:'preview', device:'mobile'}
      };
      if (!destinations[id]) return;
      guideNavigation(destinations[id]);
      if (id === 'mobile') {
        guide.complete('mobile');
        $('[data-action="device"][data-value="mobile"]').focus();
      } else $('#inspector').focus();
    },
    openSetup: () => setup.open({ hasProject: true }),
    choosePages: () => showPanel('pages')
  });
  const setup = window.createBroteSetup({
    icon,
    escape: esc,
    image: name => window.broteOffline?.assets[name] || `assets/${name}`,
    palettes: PRESETS,
    onColor: primary => luminance(primary) > .36 ? '#17271d' : '#ffffff',
    pages: catalog,
    current: () => state,
    variants: Object.fromEntries(CATEGORIES.map(family => [family.id,family])),
    preview(draft, {family, index, page = 'inicio', interactive = false} = {}) {
      const next = { ...applySetupChoices(draft), activePage: page };
      const markup = family
        ? window.BroteSite.sample(family, index, next, catalog())
        : window.BroteSite.render(next, catalog(), { clean: true });
      const cardCSS = '.site-sample .s-section{padding-block:16px}.site-sample .s-section-head{display:none}';
      const footerCSS = '.site-sample .s-footer{margin-top:0}';
      const extraCSS = family === 'cards' ? cardCSS : family === 'footer' ? footerCSS : '';
      return documentHTML(markup, { sample: !interactive, clean: true, extraCSS, settings: next.settings });
    },
    done(draft) {
      if (!draft && editorStarted) return;
      if (draft) {
        if (editorStarted) { finishEdit(); remember(); }
        state = applySetupChoices(draft);
        hasProject = true;
        Object.assign(ui, {stage:'preview', canvasMode:'page', selectedSection:null, panelBack:null});
        state.activePage = 'inicio';
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; }
        catch { storageAvailable = false; }
        guide.credit(['pages','design','identity']);
      }
      editorStarted = true;
      render();
    }
  });
  function applySetupChoices(draft) {
    const pages = draft.pages.map(id => catalog().find(page => page.id === id)).filter(Boolean);
    const products = pages.filter(page => ['Plantas','Productos'].includes(page.group));
    const services = pages.filter(page => page.group === 'Servicios');
    const featured = products.find(page => page.id === draft.featured) || products[0];
    const chosenPalette = PRESETS[draft.palette];
    const fresh = !hasProject && !editorStarted;
    const brand = draft.brand.trim() || (fresh ? 'Mi centro de jardinería' : state.settings.brand);
    const profile = Object.fromEntries(['tagline','location','address','phone','email','hours'].map(key => [key,draft[key].trim()]));
    const settings = {
      ...state.settings, ...profile, ...draft.colors, brand, groupMenu:draft.groupMenu,
      homeGoal:draft.goal, focusProduct:featured?.id || '',
      ...(chosenPalette ? { headingFont:chosenPalette.headingFont, radius:chosenPalette.radius } : {})
    };
    const components = { ...state.components };
    for (const key of ['navbar','hero','cards','footer','forms','buttons']) components[key] = draft[key];
    const newSection = type => ({ id:uid(), type, hidden:false });
    const pageContent = { ...state.pageContent };
    const home = pageContent.inicio;
    const managed = new Map([
      ['catalog',Boolean(products.length)], ['features',Boolean(services.length)],
      ...['info','gallery','blog','faq','cta'].map(type => [type,draft.extras.includes(type)])
    ]);
    let sections = fresh ? [newSection('hero')] : home.sections;
    // Reuse sections and preserve edited content and order for an existing project.
    sections = sections.map(section => {
      if (!managed.has(section.type)) return section;
      const visible = managed.get(section.type);
      managed.delete(section.type);
      return { ...section, hidden:!visible };
    });
    sections = [...sections,...[...managed].filter(([,visible]) => visible).map(([type]) => newSection(type))];
    const featuredFirst = featured ? [featured, ...products.filter(page => page !== featured)] : products;
    const listed = (draft.goal === 'services' && services.length ? services : products.length ? featuredFirst : services)
      .slice(0,3).map(page => page.name.toLocaleLowerCase('es'));
    const offer = new Intl.ListFormat('es', {type:'conjunction'}).format(listed);
    const intro = offer ? `En ${brand} ${draft.goal === 'services' || !products.length ? 'ofrecemos' : 'encontrarás'} ${offer}.` : `Conoce ${brand} y descubre cómo podemos ayudarte con tu jardín.`;
    pageContent.inicio = { ...home, title:draft.title.trim() || brand,
      description:draft.description.trim() || profile.tagline || intro, sections };
    for (const page of pages) {
      if (page.id === 'inicio' || (!fresh && state.pages.includes(page.id))) continue;
      const baseline = defaultContent(page);
      const content = pageContent[page.id] || baseline;
      const sectionData = sections => sections.map(({type, hidden, title, text}) => ({type,hidden,title,text}));
      const edited = content.title !== baseline.title || content.description !== baseline.description
        || JSON.stringify(sectionData(content.sections)) !== JSON.stringify(sectionData(baseline.sections));
      if (!fresh && edited) continue;
      const isProduct = products.includes(page);
      const isService = services.includes(page);
      if (!isProduct && !isService && page.id !== 'contacto') continue;
      // Fresh category pages use the actual selected offering rather than example stock or reviews.
      const types = isProduct ? ['hero','catalog','cta'] : isService ? ['hero','info','cta'] : ['hero','forms'];
      const blocks = types.map(type => type === 'info'
        ? { ...newSection(type), title:page.name, text:page.description } : newSection(type));
      pageContent[page.id] = { ...content, title:page.name, description:page.description, sections:blocks };
    }
    const footer = fresh ? { ...state.footer, social:false, legal:pages.some(page => page.group === 'Legales') }
      : state.footer;
    return {
      ...state, generated:true, pages:draft.pages, activePage:draft.pages.includes(state.activePage) ? state.activePage : 'inicio',
      settings, components, pageContent, footer
    };
  }
  function guideNavigation(step) {
    const cover = firstCover();
    const stage = step.stage === 'section' && !cover ? 'order' : step.stage;
    showPanel(stage, {
      category:step.category || 'navbar', device:step.device || ui.device,
      selectedSection: stage === 'section' ? cover.id : null
    });
    syncPreviewControls();
  }
  function remember() { undoStack.push(JSON.stringify(state)); if (undoStack.length > 50) undoStack.shift(); redoStack.length = 0; }
  const viewKey = () => `${ui.stage}:${ui.stage === 'design' ? ui.category : ui.selectedSection || ''}:${state.activePage}`;
  function change(fn, refresh = 'all') {
    finishEdit(); remember();
    const beforeKey = viewKey(), panelScroll = $('.panel-body')?.scrollTop || 0;
    const focused = document.activeElement;
    const focusInfo = focused?.dataset?.pageToggle ? { page: focused.dataset.pageToggle } : focused?.dataset?.action ? { action: focused.dataset.action, value: focused.dataset.value, family: focused.dataset.family } : null;
    fn(); persist(); refresh === 'all' ? render() : refresh === 'panel' ? (renderPanel(), renderPreview()) : renderPreview();
    if (beforeKey === viewKey()) {
      if ($('.panel-body')) $('.panel-body').scrollTop = panelScroll;
      const target = focusInfo?.page ? $(`[data-page-toggle="${focusInfo.page}"]`) : focusInfo?.action ? $$('[data-action]').find(e => e.dataset.action === focusInfo.action && e.dataset.value === focusInfo.value && e.dataset.family === focusInfo.family) : null;
      target?.focus({ preventScroll: true });
    }
    updateHistory();
  }
  function persist() {
    const el = $('#save-status'); if (el) el.innerHTML = `${icon('check', 13)} Guardando…`;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; } catch { storageAvailable = false; } updateSave(); }, 350);
  }
  function updateSave() { const e = $('#save-status'); if (e) e.innerHTML = `${icon(storageAvailable ? 'check' : 'bell', 13)} ${storageAvailable ? 'Guardado en este navegador' : 'Usa Exportar para guardar'}`; }
  function startEdit() { if (!editBefore) editBefore = JSON.stringify(state); }
  function finishEdit() { if (editBefore && editBefore !== JSON.stringify(state)) { undoStack.push(editBefore); if (undoStack.length > 50) undoStack.shift(); redoStack.length = 0; } editBefore = null; updateHistory(); }
  function updateHistory() { const a = $('[data-action="undo"]'), b = $('[data-action="redo"]'); if (a) a.disabled = !undoStack.length; if (b) b.disabled = !redoStack.length; }
  function toast(message) { const e = $('#toast'); e.innerHTML = `${icon('check', 17)}<span>${esc(message)}</span>`; e.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => e.classList.remove('show'), 3300); }
  function pageOptions() { return catalog().filter(p => state.pages.includes(p.id)).map(p => `<option value="${p.id}" ${p.id === state.activePage ? 'selected' : ''}>${esc(p.name)}</option>`).join(''); }

  function render() {
    if (!$('#editor-workspace')) $('#app').innerHTML = `
      <header class="app-header editor-header">
        <a class="app-brand" href="#" data-action="home" aria-label="Brote Studio, volver a la vista previa"><span class="brand-mark">${icon('sprout', 25)}</span><span class="brand-word">brote<span>STUDIO</span></span></a>
        <span class="header-divider"></span>
        <div class="project-name"><span id="header-project">${esc(state.settings.brand)}</span></div>
        <nav class="header-actions" aria-label="Editor del sitio">
          <button class="ui-btn editor-nav" data-action="stage" data-value="pages" aria-controls="inspector">${icon('pages', 16)}<span>Páginas</span></button>
          <button class="ui-btn editor-nav" data-action="stage" data-value="brand" aria-controls="inspector">${icon('palette', 16)}<span>Estilo de la web</span></button>
          <button class="ui-btn primary preview-button" data-action="preview">${icon('eye', 17)}<span>Ver sitio</span></button>
          <details class="editor-more"><summary aria-label="Más opciones">Más ${icon('down', 13)}</summary><div class="editor-menu">
            <button class="ui-btn" data-action="undo">${icon('undo', 16)} Deshacer</button>
            <button class="ui-btn" data-action="redo">${icon('redo', 16)} Rehacer</button>
            <button class="ui-btn guide-btn" data-action="help">${icon('help', 16)} Primeros pasos</button>
            <button class="ui-btn" data-action="setup">${icon('spark', 16)} Abrir configuración inicial</button>
            <button class="ui-btn export-btn" data-action="export">${icon('download', 16)} Exportar e importar</button>
          </div></details>
        </nav>
      </header>
      <main class="app-workspace editor-workspace" id="editor-workspace" tabindex="-1">
        <section class="canvas-area" aria-label="Vista previa interactiva">
          <div class="canvas-tools"><div class="canvas-page"><label class="page-picker">${icon('pages', 16)}<select id="preview-page" aria-label="Página de la vista previa">${pageOptions()}</select>${icon('down', 13)}</label><button class="ui-btn canvas-edit" data-action="edit-cover">${icon('edit', 15)} Editar portada</button></div>
            <div class="canvas-tool-right"><div class="device-picker" role="group" aria-label="Dispositivo de la vista previa">${[['desktop', 'desktop', 'Escritorio'], ['tablet', 'tablet', 'Tableta'], ['mobile', 'mobile', 'Móvil']].map(([id, sym, label]) => `<button data-action="device" data-value="${id}" class="${ui.device === id ? 'active' : ''}" title="${label}" aria-label="${label}" aria-pressed="${ui.device === id}">${icon(sym, 17)}</button>`).join('')}</div><button class="icon-btn canvas-size" data-action="actual-size" id="canvas-scale" type="button" aria-label="Tamaño real de la vista previa" aria-pressed="${ui.actualSize}">100%</button></div>
          </div>
          <div class="canvas-stage" id="canvas-stage"><div class="browser-frame" id="browser-frame"><div class="browser-chrome"><div class="window-dots" aria-hidden="true"><i></i><i></i><i></i></div><div class="browser-address">${icon('lock', 10)}<span id="browser-address"></span></div></div><div class="frame-viewport" id="frame-viewport"><iframe id="site-frame" title="Vista previa de tu centro de jardinería" sandbox="allow-scripts allow-same-origin allow-forms" referrerpolicy="no-referrer"></iframe></div></div></div>
          <div class="canvas-bottom"><span id="save-status" role="status"></span><div class="canvas-actions"><button class="ui-btn" data-action="composition">${icon('layers', 15)} Ordenar secciones</button><button class="ui-btn" data-action="add-section">${icon('plus', 16)} Añadir sección</button></div></div>
        </section>
        <aside class="inspector" id="inspector" tabindex="-1" aria-labelledby="panel-title" hidden><div id="inspector-content"></div></aside>
      </main>`;
    if (ui.pageGroup === 'Personalizadas' && !state.customPages.length) ui.pageGroup = 'Todas';
    if (ui.stage === 'section' && !currentContent().sections.some(s => s.id === ui.selectedSection)) {
      Object.assign(ui, { stage:'order', selectedSection:null, panelBack:null });
    }
    syncPreviewControls();
    renderPanel(); renderPreview(); updateSave(); updateHistory(); guide.refresh();
    if (!resizeObserver) {
      resizeObserver = new ResizeObserver(fitPreview);
      resizeObserver.observe($('#canvas-stage'));
    }
  }
  function syncPreviewControls() {
    const pageSelect = $('#preview-page');
    const options = pageOptions();
    if (pageSelect.dataset.options !== options) {
      pageSelect.innerHTML = options;
      pageSelect.dataset.options = options;
    }
    pageSelect.value = state.activePage;
    $('#header-project').textContent = state.settings.brand;
    $$('.device-picker button').forEach(button => {
      const active = button.dataset.value === ui.device;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    fitPreview();
  }

  const disclosure = (id, label, content) => `<details class="editor-disclosure" data-disclosure="${id}"><summary>${label}${icon('down', 14)}</summary><div class="disclosure-body">${content}</div></details>`;
  const pageScope = () => `<span class="editor-scope">${icon('pages', 13)} Solo esta página · ${esc(currentPage().name)}</span>`;
  const siteScope = () => `<span class="editor-scope">${icon('globe', 13)} Todas las páginas</span>`;
  const family = type => CATEGORIES.find(c => c.id === type);
  const sectionName = type => ({hero:'Portada',navbar:'Menú de navegación',gallery:'Galería',forms:'Formulario',cta:'Llamada a la acción'})[type] || family(type).name;
  const firstCover = () => currentContent().sections.find(s => s.type === 'hero' && !s.hidden);
  let panelKey = '';

  function renderPanel() {
    const key = viewKey();
    const open = panelKey === key ? $$('[data-disclosure][open]').map(el => el.dataset.disclosure) : [];
    panelKey = key;
    const inspector = $('#inspector');
    inspector.hidden = ui.stage === 'preview';
    $('.editor-workspace').classList.toggle('has-inspector', !inspector.hidden);
    $$('.editor-nav').forEach(button => button.setAttribute('aria-expanded', String(button.dataset.value === ui.stage)));
    $('[data-action="edit-cover"]').hidden = !firstCover() || ui.canvasMode === 'component';
    if (inspector.hidden) {
      $('#inspector-content').replaceChildren();
      return;
    }

    const section = currentContent().sections.find(s => s.id === ui.selectedSection);
    const panels = {
      pages: ['Páginas', siteScope, renderPages],
      brand: ['Estilo de la web', siteScope, renderIdentity],
      order: ['Ordenar secciones', pageScope, renderComposition],
      add: ['Añadir sección', pageScope, renderSectionPicker],
      design: [sectionName(ui.category), siteScope, renderComponents],
      section: [section ? sectionName(section.type) : 'Secciones', pageScope, section ? () => renderSectionEditor(section) : renderComposition]
    };
    const [title, scope, body] = panels[ui.stage];
    const back = ui.panelBack ? `<button class="quiet-link panel-back" data-action="panel-back">${icon('chevron', 13)} Volver a ${ui.panelBack.stage === 'brand' ? 'Estilo de la web' : 'Ordenar secciones'}</button>` : '';
    $('#inspector-content').innerHTML = `<div class="editor-panel-heading">${back}<div><h2 id="panel-title">${title}</h2>${iconBtn('close-panel', 'close', 'Cerrar panel')}</div>${scope()}</div><div class="panel-body">${body()}</div>`;
    $$('[data-disclosure]').forEach(el => { el.open = open.includes(el.dataset.disclosure); });
    hydrateSamples();
  }

  function showPanel(stage, options = {}) {
    finishEdit();
    const wasSample = ui.canvasMode === 'component';
    Object.assign(ui, { stage, selectedSection:null, panelBack:null, insertAfter:null, canvasMode:'page', ...options });
    renderPanel();
    if (wasSample || ui.canvasMode === 'component') renderPreview();
    if (stage !== 'preview') $('#inspector').focus({preventScroll:true});
    requestAnimationFrame(fitPreview);
  }

  function renderPages() {
    const all = catalog();
    const selected = all.filter(p => state.pages.includes(p.id));
    const groups = [...new Set(selected.map(p => p.group))];
    return `<div class="editor-page-list">${groups.map(group => `<h3>${esc(group)}</h3>${selected.filter(p => p.group === group).map(p => `<button class="editor-row" data-action="choose-page" data-value="${p.id}" ${p.id === state.activePage ? 'aria-current="page"' : ''}>${icon('pages', 16)}<strong>${esc(p.name)}</strong>${icon(p.id === state.activePage ? 'check' : 'chevron', 14)}</button>`).join('')}`).join('')}</div>
      ${disclosure('more-pages', 'Añadir o quitar páginas', `<label class="search-field">${icon('search', 16)}<input id="page-search" value="${esc(ui.pageSearch)}" placeholder="Buscar una página" aria-label="Buscar una página"></label><label class="field-label"><span>Categoría</span><select id="page-group">${[...PAGE_GROUPS, ...(state.customPages.length ? ['Personalizadas'] : [])].map(group => `<option ${group === ui.pageGroup ? 'selected' : ''}>${group}</option>`).join('')}</select></label><div class="selection-summary"><button data-action="select-group">Seleccionar todas las de esta lista</button></div><div class="page-list">${pageChoices()}</div>`)}
      <button class="dashed-btn" data-action="add-page">${icon('plus', 16)} Crear página personalizada</button>
      ${state.generated ? '' : '<button class="ui-btn primary full-width" data-action="generate">Crear páginas</button>'}`;
  }
  function filteredPages() {
    const search = ui.pageSearch.trim().toLocaleLowerCase('es');
    return catalog().filter(p => (ui.pageGroup === 'Todas' || p.group === ui.pageGroup) && (p.name + ' ' + p.description).toLocaleLowerCase('es').includes(search));
  }
  function pageChoices() {
    return filteredPages().map(p => `<label class="page-option ${state.pages.includes(p.id) ? 'selected' : ''}"><input type="checkbox" data-page-toggle="${p.id}" ${state.pages.includes(p.id) ? 'checked' : ''} ${p.id === 'inicio' ? 'disabled' : ''}><span class="custom-check">${icon('check', 12)}</span><span class="page-option-text"><strong>${esc(p.name)}</strong><span>${esc(p.description)}</span></span>${p.id === 'inicio' ? icon('lock', 13) : ''}</label>`).join('') || '<p class="editor-note">No se han encontrado páginas.</p>';
  }
  const toggle = (label, key, checked, group = 'settings', caption = '') => `<label class="setting-toggle"><span><strong>${label}</strong>${caption ? `<small>${caption}</small>` : ''}</span><input type="checkbox" data-toggle="${key}" data-group="${group}" ${checked ? 'checked' : ''}><span class="switch"></span></label>`;
  const selectField = (label, key, options, value) => `<label class="field-label"><span>${label}</span><select data-setting="${key}">${options.map(([id, text]) => `<option value="${id}" ${String(value) === String(id) ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`;
  function footerControls() { return `<div class="setting-group"><div class="setting-group-title">QUÉ QUIERES INCLUIR</div>${[['contact', 'Datos de contacto'], ['hours', 'Horario de apertura'], ['social', 'Redes sociales'], ['legal', 'Enlaces legales'], ['quality', 'Política de calidad'], ['newsletter', 'Suscripción a novedades']].map(([key, name]) => toggle(name, key, state.footer[key], 'footer')).join('')}</div>`; }
  function componentSettings(type) {
    if (type === 'navbar') return `<div class="setting-group">${toggle('Agrupar por plantas, productos y servicios', 'groupMenu', state.settings.groupMenu)}${toggle('Menú fijo al hacer scroll', 'navSticky', state.settings.navSticky)}${toggle('Barra informativa superior', 'topbar', state.settings.topbar)}</div>`;
    if (type === 'footer') return footerControls();
    if (type === 'cards') return `<div class="setting-group">${selectField('Proporción de las imágenes', 'cardRatio', [['4/3', 'Horizontal · 4:3'], ['1/1', 'Cuadrada · 1:1'], ['3/4', 'Vertical · 3:4']], state.settings.cardRatio)}${selectField('Columnas en escritorio', 'columns', [[2, '2 columnas'], [3, '3 columnas'], [4, '4 columnas']], state.settings.columns)}</div>`;
    if (type === 'buttons') return `<div class="setting-group">${selectField('Tamaño del botón', 'buttonSize', [['small', 'Compacto'], ['medium', 'Equilibrado'], ['large', 'Generoso']], state.settings.buttonSize)}</div>`;
    if (type === 'catalog') return `<div class="setting-group">${selectField('Columnas en escritorio', 'columns', [[2, '2 columnas'], [3, '3 columnas'], [4, '4 columnas']], state.settings.columns)}</div>`;
    return '';
  }
  function componentVisible(type) {
    const visible = currentContent().sections.filter(s => !s.hidden).map(s => s.type);
    if (type === 'cards') return visible.includes('catalog');
    if (['navbar', 'footer', 'buttons'].includes(type)) return true;
    return visible.includes(type);
  }
  function variants(c) {
    return `<div class="variant-toolbar"><span>Vista del ejemplo</span><div class="mini-device-picker">${[['desktop','Escritorio'],['mobile','Móvil']].map(([device,label]) => `<button data-action="sample-device" data-value="${device}" class="${ui.sampleDevice === device ? 'active' : ''}" aria-pressed="${ui.sampleDevice === device}" aria-label="Ejemplos en ${label.toLowerCase()}">${icon(device, 14)}</button>`).join('')}</div></div>
      <div class="variant-list">${c.variants.map((name, i) => `<button class="variant-card ${state.components[c.id] === i ? 'selected' : ''}" data-action="variant" data-family="${c.id}" data-value="${i}" aria-pressed="${state.components[c.id] === i}"><div class="variant-thumbnail ${ui.sampleDevice === 'mobile' ? 'mobile-sample' : ''}" data-sample="${c.id}" data-index="${i}"><iframe tabindex="-1" aria-hidden="true" title="Ejemplo ${esc(name)}" sandbox="allow-same-origin"></iframe><span class="variant-check">${icon('check', 12)}</span></div><div class="variant-caption"><div><strong>${name}</strong>${c.hints?.[i] ? `<span>${c.hints[i]}</span>` : ''}</div></div></button>`).join('')}</div>`;
  }
  function globalDesign(type, label = 'Cambiar diseño') {
    return disclosure(`design-${type}`, label, `<p class="editor-note">Este diseño se aplica en todas las páginas que usan este componente.</p>${variants(family(type))}`);
  }
  function renderComponents() {
    const c = family(ui.category);
    const settings = componentSettings(c.id);
    const canAdd = !componentVisible(c.id) && SECTION_TYPES.includes(c);
    return `${settings}${variants(c)}${canAdd ? `<button class="dashed-btn" data-action="insert-section" data-value="${c.id}">${icon('plus', 16)} Añadir a ${esc(currentPage().name)}</button>` : ''}
      <button class="ui-btn full-width" data-action="canvas-mode">${ui.canvasMode === 'component' ? 'Volver a ver la página' : 'Ver solo este componente'}</button>`;
  }
  function pageText() {
    return `<label class="field-label"><span>Título</span><textarea rows="2" maxlength="180" data-content="title">${esc(currentContent().title)}</textarea></label><label class="field-label"><span>Descripción</span><textarea rows="4" maxlength="600" data-content="description">${esc(currentContent().description)}</textarea></label>`;
  }
  function sectionText(section) {
    const usesPage = section.id === currentContent().sections.find(s => s.type === 'hero')?.id;
    const title = usesPage && !section.title ? 'data-content="title"' : `data-section-field="title" data-section-id="${section.id}"`;
    const description = usesPage && !section.text ? 'data-content="description"' : `data-section-field="text" data-section-id="${section.id}"`;
    return `<label class="field-label"><span>Título</span><textarea rows="2" maxlength="180" ${title} placeholder="Título del ejemplo">${esc(section.title || (usesPage ? currentContent().title : ''))}</textarea></label><label class="field-label"><span>${section.type === 'hero' ? 'Descripción' : 'Texto'}</span><textarea rows="4" maxlength="${description.includes('data-content') ? 600 : 1000}" ${description} placeholder="Texto del ejemplo">${esc(section.text || (usesPage ? currentContent().description : ''))}</textarea></label>`;
  }
  function renderSectionEditor(s) {
    const isCover = s.type === 'hero';
    const settings = componentSettings(s.type);
    const goals = [['','Del ejemplo'],['products','Ver productos'],['services','Ver servicios'],['contact','Contactar']];
    const coverButton = isCover ? disclosure('cover-button', 'Botón principal', `
      ${state.activePage === 'inicio' ? selectField('Acción de la portada de Inicio', 'homeGoal', goals, state.settings.homeGoal) : ''}
      <p class="editor-note">El estilo y el tamaño de los botones se aplican en toda la web.</p>${componentSettings('buttons')}${variants(family('buttons'))}`) : '';
    return `${s.hidden ? '<p class="editor-note">Esta sección está oculta.</p>' : ''}${sectionText(s)}
      ${coverButton}${globalDesign(s.type)}
      ${s.type === 'catalog' ? globalDesign('cards', 'Diseño de las tarjetas') : ''}
      ${settings ? disclosure('section-settings', 'Ajustes de diseño', siteScope() + settings) : ''}
      ${disclosure('section-options', 'Opciones de sección', `<div class="editor-section-options">
        <button class="ui-btn" data-action="toggle-section" data-value="${s.id}">${icon(s.hidden ? 'eye' : 'hidden', 15)} ${s.hidden ? 'Mostrar' : 'Ocultar'} sección</button>
        <button class="ui-btn" data-action="duplicate-section" data-value="${s.id}">${icon('copy', 15)} Duplicar sección</button>
        <button class="ui-btn danger-text" data-action="remove-section" data-value="${s.id}">${icon('trash', 15)} Eliminar sección</button>
      </div>`)}`;
  }
  function renderComposition() {
    const sections = currentContent().sections;
    return `<div class="section-list">${sections.map((s, i) => `<div class="section-item ${s.hidden ? 'is-hidden' : ''}"><div class="section-row"><span class="section-symbol">${icon(family(s.type).icon, 17)}</span><button class="section-name" data-action="edit-section" data-value="${s.id}"><strong>${esc(s.title || sectionName(s.type))}</strong><span>${s.hidden ? 'Oculta' : family(s.type).variants[state.components[s.type]]}</span></button><div class="section-actions">${iconBtn('move-section-up', 'up', 'Subir sección', `data-value="${s.id}" ${i === 0 ? 'disabled' : ''}`)}${iconBtn('move-section-down', 'down', 'Bajar sección', `data-value="${s.id}" ${i === sections.length - 1 ? 'disabled' : ''}`)}${iconBtn('toggle-section', s.hidden ? 'hidden' : 'eye', s.hidden ? 'Mostrar sección' : 'Ocultar sección', `data-value="${s.id}"`)}</div></div></div>`).join('') || '<p class="editor-note">Esta página todavía no tiene secciones.</p>'}</div>
      <button class="dashed-btn" data-action="add-section">${icon('plus', 16)} Añadir sección</button>
      ${disclosure('page-content', 'Título y descripción de la página', pageText())}`;
  }
  function renderSectionPicker() {
    const { group, id } = currentPage();
    const suggested = id === 'contacto' ? ['forms','faq','info','cta']
      : group === 'Servicios' ? ['features','gallery','testimonials','forms']
      : ['Plantas','Productos'].includes(group) ? ['catalog','info','faq','cta']
      : ['catalog','features','gallery','info'];
    const existing = currentContent().sections.filter(s => !s.hidden).map(s => s.type);
    const recommended = [...new Set([...suggested, 'faq', 'forms', 'cta', 'testimonials', ...SECTION_TYPES.map(c => c.id)])]
      .sort((a,b) => Number(existing.includes(a)) - Number(existing.includes(b))).slice(0,4);
    const row = type => `<button class="editor-row" data-action="insert-section" data-value="${type}">${icon(family(type).icon, 17)}<span><strong>${sectionName(type)}</strong><small>${family(type).desc}</small></span>${icon('plus', 15)}</button>`;
    const after = currentContent().sections.find(s => s.id === ui.insertAfter);
    return `<p class="editor-note">${after ? `Se insertará después de ${esc(sectionName(after.type).toLowerCase())}.` : 'Se añadirá al final de la página.'}</p><h3 class="editor-group-title">Sugerencias para ${esc(currentPage().name)}</h3><div class="editor-library">${recommended.map(row).join('')}</div>
      ${disclosure('all-sections', 'Ver todas las secciones', `<div class="editor-library">${SECTION_TYPES.map(c => row(c.id)).join('')}</div>`)}`;
  }
  const rangeField = (label, key, min, max, step, unit) => `<label class="range-field"><span>${label}<output id="out-${key}">${state.settings[key]}${unit}</output></span><input type="range" data-setting="${key}" data-unit="${unit}" min="${min}" max="${max}" step="${step}" value="${state.settings[key]}"><small><span>${min}${unit}</span><span>${max}${unit}</span></small></label>`;
  function weightField(label, key, weights) {
    const value = state.settings[key];
    const options = [0, ...weights].map(weight => `<button type="button" class="ui-btn" data-action="type-weight" data-value="${key}:${weight}" aria-pressed="${value === weight}">${weight || 'Original'}</button>`).join('');
    return `<div class="type-weights" role="group" aria-label="${label}"><strong>${label}</strong><div>${options}</div></div>`;
  }
  function identityContent(mode) {
    let content = '';
    if (mode === 'presets') content = `<div class="preset-list">${PRESETS.map((p, i) => `<button class="preset-card ${state.settings.primary === p.colors[0] ? 'active' : ''}" data-action="preset" data-value="${i}"><div class="preset-art" style="background:${p.colors[2]};color:${p.colors[0]}"><span class="preset-a" style="font-family:${p.headingFont === 'sans' ? 'DM Sans,sans-serif' : 'DM Serif Display,Georgia,serif'}">Aa<span>.</span></span><div class="preset-swatches">${p.colors.map(color => `<i style="background:${color}"></i>`).join('')}</div>${state.settings.primary === p.colors[0] ? `<span class="preset-check">${icon('check', 13)}</span>` : ''}</div><div class="preset-caption"><strong>${p.name}</strong><span>${p.caption}</span></div></button>`).join('')}</div><div class="small-tip">${icon('spark', 17)}El estilo cambia colores, fuente de títulos y radios. Tus páginas y composiciones se conservan.</div>`;
    if (mode === 'brand') content = `<div class="setting-group"><div class="brand-preview"><span>${icon('sprout', 38)}</span><strong>${esc(state.settings.brand)}</strong><small>${esc(state.settings.tagline)}</small></div>${[['brand', 'Nombre del centro', 60], ['tagline', 'Una frase que os defina', 250], ['location', 'Ciudad', 80], ['email', 'Correo electrónico', 150], ['phone', 'Teléfono', 40], ['address', 'Dirección', 250], ['hours', 'Horario', 160]].map(([k, label, max]) => `<label class="field-label"><span>${label}</span><input data-setting="${k}" value="${esc(state.settings[k])}" maxlength="${max}"></label>`).join('')}${toggle('Símbolo botánico junto al nombre', 'logoMark', state.settings.logoMark)}</div>`;
    if (mode === 'colors') content = `<div class="setting-group">${[['primary', 'Principal', 'Acciones, cabeceras y acentos.'], ['accent', 'Secundario', 'Detalles y superficies suaves.'], ['background', 'Fondo', 'El lienzo de tu sitio.'], ['text', 'Texto', 'Para leer con comodidad.']].map(([k, label, desc]) => `<div class="color-setting"><div><strong>${label}</strong><small>${desc}</small></div><label class="color-input" style="--swatch:${state.settings[k]}"><input type="color" data-setting="${k}" value="${state.settings[k]}" aria-label="Color ${label}"><span></span></label><input class="hex-input" data-color-text="${k}" value="${state.settings[k].toUpperCase()}" maxlength="7" aria-label="Código hexadecimal ${label}"></div>`).join('')}</div><div class="color-specimen" style="background:${state.settings.background};color:${state.settings.text}"><span class="specimen-pill" style="background:${state.settings.accent};color:${state.settings.primary}">TU PALETA EN ACCIÓN</span><h3>Un poco más<br>de naturaleza.</h3><p>Cuatro colores. Infinitas posibilidades.</p><button type="button" style="background:${state.settings.primary};color:${readableOn(state.settings.primary)}" data-action="sample-toast">Descubrir ${icon('arrow', 15)}</button></div><div id="contrast-note">${contrastMarkup()}</div>`;
    if (mode === 'type') content = `<div class="setting-group">${selectField('Fuente para los títulos', 'headingFont', [['serif', 'DM Serif Display · Botánica'], ['sans', 'DM Sans · Moderna'], ['modern', 'Georgia · Editorial'], ['humanist', 'Palatino · Artesanal']], state.settings.headingFont)}<div class="type-specimen" style="font-family:${({ serif: 'DM Serif Display,Georgia,serif', sans: 'DM Sans,sans-serif', modern: 'Georgia,serif', humanist: 'Palatino,serif' })[state.settings.headingFont]}"><span>Aa Bb Cc</span><strong style="${state.settings.headingWeight ? `font-weight:${state.settings.headingWeight}` : ''}">Deja que<br>la vida crezca.</strong><small style="${state.settings.bodyWeight ? `font-weight:${state.settings.bodyWeight}` : ''}">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz · 0123456789</small></div>${selectField('Fuente para los textos', 'bodyFont', [['sans', 'DM Sans · Clara y cercana'], ['humanist', 'Trebuchet MS · Humanista'], ['mono', 'Monospace · Técnica'], ['serif', 'Georgia · Clásica']], state.settings.bodyFont)}${rangeField('Tamaño del texto base', 'fontSize', 14, 20, 1, ' px')}
      ${weightField('Peso de los títulos', 'headingWeight', [400,500,600,700,800])}
      ${weightField('Peso de los párrafos', 'bodyWeight', [400,500,600])}</div><div class="small-tip">${icon('type', 17)}Las fuentes principales van incluidas en el proyecto: no necesitan servicios externos.</div>`;
    if (mode === 'layout') content = `<div class="setting-group">${rangeField('Redondeado de las esquinas', 'radius', 0, 32, 1, ' px')}<div class="radius-demo" style="--demo-radius:${state.settings.radius}px"><div></div><div></div><button type="button" data-action="sample-toast">Botón</button></div>${rangeField('Espacio entre secciones', 'spacing', 32, 120, 4, ' px')}${rangeField('Ancho máximo del contenido', 'maxWidth', 960, 1440, 40, ' px')}${selectField('Sombras de las tarjetas', 'shadow', [['none', 'Sin sombra'], ['soft', 'Sutil'], ['lifted', 'Con profundidad']], state.settings.shadow)}${selectField('Columnas del catálogo', 'columns', [[2, '2 columnas'], [3, '3 columnas'], [4, '4 columnas']], state.settings.columns)}${toggle('Transiciones suaves', 'animations', state.settings.animations)}</div><div class="small-tip">${icon('mobile', 17)}La cuadrícula se adapta automáticamente a móvil. Estos ajustes definen la composición en escritorio.</div>`;
    if (mode === 'footer') content = footerControls();
    return content;
  }
  function renderIdentity() {
    const library = `<label class="search-field">${icon('search', 16)}<input id="component-search" value="${esc(ui.componentSearch)}" placeholder="Buscar entre ${TOTAL_VARIANTS} diseños" aria-label="Buscar componente"></label><div id="editor-family-list">${familyChoices()}</div>`;
    return `<h3 class="editor-group-title">Paletas de partida</h3>${identityContent('presets')}
      ${disclosure('colors', 'Colores personalizados', identityContent('colors'))}
      ${disclosure('brand', 'Datos de tu centro', identityContent('brand'))}
      ${disclosure('advanced', 'Ajustes avanzados', [
        disclosure('type', 'Tipografía', identityContent('type')),
        disclosure('layout', 'Formas y espacios', identityContent('layout')),
        disclosure('footer', 'Contenido del pie de página', identityContent('footer')),
        disclosure('library', 'Biblioteca de componentes', library)
      ].join(''))}`;
  }
  function familyChoices() {
    const search = ui.componentSearch.trim().toLocaleLowerCase('es');
    const matching = CATEGORIES.filter(c => c.name.toLocaleLowerCase('es').includes(search));
    return ['Estructura','Elementos','Secciones'].map(group => {
      const rows = matching.filter(c => c.group === group);
      if (!rows.length) return '';
      return `<h3 class="editor-group-title">${group}</h3>${rows.map(c => `<button class="editor-row" data-action="category" data-value="${c.id}">${icon(c.icon, 16)}<strong>${c.name}</strong>${icon('chevron', 14)}</button>`).join('')}`;
    }).join('') || '<p class="editor-note">No se han encontrado componentes.</p>';
  }
  function luminance(hex) { const c = hex.slice(1).match(/../g).map(x => parseInt(x, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return c[0] * .2126 + c[1] * .7152 + c[2] * .0722; }
  function readableOn(hex) { return luminance(hex) > .42 ? '#172c22' : '#ffffff'; }
  function refreshBrandSpecimens() {
    const specimen = $('.color-specimen');
    if (specimen) {
      specimen.style.background = state.settings.background; specimen.style.color = state.settings.text;
      const pill = $('.specimen-pill', specimen); pill.style.background = state.settings.accent; pill.style.color = state.settings.primary;
      const button = $('button', specimen); button.style.background = state.settings.primary; button.style.color = readableOn(state.settings.primary);
    }
    if ($('.brand-preview')) { $('.brand-preview strong').textContent = state.settings.brand; $('.brand-preview small').textContent = state.settings.tagline; }
  }
  function contrastMarkup() { const a = luminance(state.settings.text), b = luminance(state.settings.background), ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05); return `<div class="contrast-note ${ratio < 4.5 ? 'low' : ''}">${icon(ratio < 4.5 ? 'bell' : 'check', 16)}<span>Contraste texto / fondo: <strong>${ratio.toFixed(1)}:1</strong><small>${ratio < 4.5 ? 'Prueba un texto más oscuro o un fondo más claro.' : 'Buena legibilidad para texto normal.'}</small></span></div>`; }

  const cssUrl = new URL('styles.css', document.baseURI).href;
  const assetBase = new URL('.', document.baseURI).href;
  function previewTypeCSS(settings) {
    const {headingWeight, bodyWeight} = settings;
    return [
      headingWeight ? `.site-root :is(h1,h2,h3,h4){font-weight:${headingWeight}!important}` : '',
      bodyWeight ? `.site-root :is(p,.s-card-summary,.s-editorial-card-foot){font-weight:${bodyWeight}!important}` : ''
    ].join('');
  }
  function documentHTML(body, { sample = false, clean = false, scrollTo = null, extraCSS = '', settings = state.settings } = {}) {
    const focus = typeof scrollTo === 'string' ? { type: scrollTo } : scrollTo;
    const scrollScript = focus ? `;setTimeout(()=>{const target=${JSON.stringify(focus).replace(/</g, '\\u003c')};const el=Array.from(document.querySelectorAll('[data-section-id]')).find(n=>target.id?n.dataset.sectionId===target.id:n.dataset.sectionType===target.type);if(el)el.scrollIntoView({block:'start',behavior:'instant'})},100);` : '';
    const offline = window.broteOffline;
    if (offline) body = body.replace(/src="assets\/([^"]+)"/g, (match, name) => offline.assets[name] ? `src="${offline.assets[name]}"` : match);
    const styles = offline ? `<style>${offline.previewCSS}</style>` : `<link rel="stylesheet" href="${esc(cssUrl)}">`;
    const guidedCSS = offline ? `<style>${offline.guidedCSS}</style>` : `<link rel="stylesheet" href="${esc(new URL('site-guided.css',assetBase).href)}">`;
    const typeCSS = previewTypeCSS(settings) + extraCSS;
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${esc(assetBase)}">${styles}${guidedCSS}${typeCSS ? `<style>${typeCSS}</style>` : ''}</head><body class="preview-body ${sample ? 'sample-body' : ''} ${clean ? 'clean-preview' : ''}">${body}${sample ? '' : `<script>${window.BroteSite.runtime}${scrollScript}<\/script>`}</body></html>`;
  }
  function renderPreview(focusType = null) {
    clearTimeout(previewTimer);
    if (!window.BroteSite) return;
    const frame = $('#site-frame'); if (!frame) return;
    const section = focusType || lastFocusType;
    const isSample = ui.canvasMode === 'component' && ui.stage === 'design';
    const frameKey = isSample ? `sample:${ui.category}` : state.activePage;
    let previousScroll = 0;
    if (frame.dataset.view === frameKey) {
      previousScroll = Number(frame.dataset.scroll) || 0;
      try { previousScroll = frame.contentWindow.scrollY; } catch {}
    }
    frame.dataset.view = frameKey;
    frame.dataset.scroll = previousScroll;
    const body = isSample ? window.BroteSite.sample(ui.category, state.components[ui.category], state, catalog()) : window.BroteSite.render(state, catalog(), { clean: false });
    frame.onload = () => {
      if (!section && !isSample) {
        frame.contentWindow.postMessage({source:'brote-studio', type:'set-scroll', top:previousScroll}, '*');
      }
    };
    frame.srcdoc = documentHTML(body, { scrollTo: !isSample && section ? section : null, sample:isSample });
    const addr = $('#browser-address'); if (addr) addr.textContent = isSample ? `Componente / ${CATEGORIES.find(c => c.id === ui.category)?.name}` : `${slug(state.settings.brand)}.demo/${state.activePage === 'inicio' ? '' : currentPage().id}`;
    fitPreview();
    lastFocusType = null;
  }
  function schedulePreview() { clearTimeout(previewTimer); previewTimer = setTimeout(() => renderPreview(), 160); }
  function fitPreview() {
    const stage = $('#canvas-stage'), box = $('#browser-frame'), viewport = $('#frame-viewport'), frame = $('#site-frame'); if (!stage || !frame) return;
    const width = ui.device === 'mobile' ? 390 : ui.device === 'tablet' ? 768 : 1200;
    const availW = Math.max(240, stage.clientWidth - (window.innerWidth <= 700 ? 16 : 40));
    const availH = Math.max(130, stage.clientHeight - 10);
    const borderWidth = ui.device === 'mobile' ? 10 : 2;
    const scale = ui.actualSize ? 1 : Math.min(1, (availW - borderWidth) / width);
    stage.classList.toggle('actual-size', ui.actualSize);
    box.style.width = `${width * scale + borderWidth}px`; box.className = `browser-frame ${ui.device}`;
    viewport.style.height = `${availH - 34}px`;
    frame.style.width = `${width}px`; frame.style.height = `${(availH - 34) / scale}px`; frame.style.transform = ui.actualSize ? 'none' : `scale(${scale})`;
    const sizeButton = $('#canvas-scale');
    sizeButton.textContent = `${Math.round(scale * 100)}%`;
    sizeButton.title = ui.actualSize ? 'Ajustar al lienzo' : 'Ver a tamaño real';
    sizeButton.setAttribute('aria-pressed', String(ui.actualSize));
    $$('[data-sample]').filter(el => el.clientWidth).forEach(el => { const f = $('iframe', el); const sw = ui.sampleDevice === 'mobile' ? 390 : 780; const factor = ui.sampleDevice === 'mobile' ? .47 : el.clientWidth / sw; f.style.width = `${sw}px`; f.style.transform = `scale(${factor})`; f.style.height = `${el.clientHeight / factor}px`; });
  }
  function hydrateSamples(refresh = false) {
    if (!window.BroteSite) return;
    $$('[data-sample]').filter(el => el.clientWidth).forEach(el => { const type = el.dataset.sample, v = Number(el.dataset.index); const f = $('iframe', el); if (!refresh && f.hasAttribute('srcdoc')) return; f.srcdoc = documentHTML(window.BroteSite.sample(type, v, state, catalog()), { sample: true, clean: true }); });
    requestAnimationFrame(fitPreview);
  }
  function openSection(id, back = null, scroll = false) {
    const section = currentContent().sections.find(s => s.id === id);
    if (!section) return;
    showPanel('section', {selectedSection:id, panelBack:back});
    if (scroll && !section.hidden) {
      $('#site-frame').contentWindow.postMessage({source:'brote-studio', type:'focus', sectionId:id}, '*');
    }
  }
  function openComponent(type, back = null) {
    showPanel('design', {category:type, panelBack:back, canvasMode:componentVisible(type) ? 'page' : 'component'});
  }
  function selectPage(id) {
    if (!state.pages.includes(id) || id === state.activePage) return;
    finishEdit();
    state.activePage = id;
    Object.assign(ui, { canvasMode:'page', selectedSection:null, insertAfter:null, panelBack:null });
    if (!['pages','brand','order'].includes(ui.stage)) ui.stage = 'preview';
    persist();
    render();
  }
  function showModal(title, body, className = '') {
    const d = $('#modal'); d.className = `app-modal ${className}`; d.innerHTML = `<div class="modal-heading"><div><span class="eyebrow">BROTE STUDIO</span><h2 id="modal-title">${title}</h2></div>${iconBtn('close-modal', 'close', 'Cerrar ventana')}</div><div class="modal-body">${body}</div>`; if (!d.open) d.showModal();
  }
  function openPreview() {
    finishEdit(); const d = $('#site-modal'); d.innerHTML = `<div class="preview-modal-bar"><div class="preview-modal-brand">${icon('sprout', 21)}<strong>${esc(state.settings.brand)}</strong><span>Vista previa</span></div><select id="fullscreen-page" aria-label="Página de la vista previa ampliada">${pageOptions()}</select><button class="ui-btn" data-action="close-preview">${icon('close', 16)}Volver al estudio</button></div><iframe id="fullscreen-frame" title="Vista ampliada del sitio" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>`; $('#fullscreen-frame').srcdoc = documentHTML(window.BroteSite.render(state, catalog(), { clean: true }), { clean: true }); d.showModal();
  }
  function downloadJSON() { finishEdit(); const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `brote-${slug(state.settings.brand)}.json`; a.click(); guide.complete('export'); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('Configuración exportada. Puedes importarla en cualquier navegador.'); }
  document.addEventListener('click', event => {
    const b = event.target.closest('[data-action]');
    const more = $('.editor-more');
    if (more && (b || !more.contains(event.target))) more.open = false;
    if (!b) return;
    event.preventDefault(); const action = b.dataset.action, value = b.dataset.value;
    const beforeSections = ['move-section-up','move-section-down','toggle-section','remove-section','duplicate-section','insert-section'].includes(action)
      ? JSON.stringify(currentContent().sections) : null;
    if (action === 'stage') {
      if (ui.stage === value) showPanel('preview');
      else showPanel(value);
    }
    else if (action === 'home' || action === 'close-panel') {
      const currentStage = ui.stage;
      showPanel('preview');
      ($(`.editor-nav[data-value="${currentStage}"]`) || $('[data-action="edit-cover"]:not([hidden])') || $('#preview-page')).focus();
    }
    else if (action === 'panel-back') {
      const back = ui.panelBack;
      showPanel(back.stage);
      $$('[data-disclosure]').forEach(el => { el.open = back.disclosures?.includes(el.dataset.disclosure) || false; });
      $('.panel-body').scrollTop = back.scroll;
    }
    else if (action === 'choose-page') {
      selectPage(value);
      $(`[data-action="choose-page"][data-value="${value}"]`)?.focus();
    }
    else if (action === 'select-group') change(() => {
      filteredPages().forEach(p => { if (!state.pages.includes(p.id)) state.pages.push(p.id); });
    });
    else if (action === 'generate') {
      change(() => { state.generated = true; ui.stage = 'preview'; ui.canvasMode = 'page'; });
      guide.complete('pages');
      toast(`${state.pages.length} páginas listas para editar.`);
    }
    else if (action === 'category') openComponent(value, {
      stage:'brand', scroll:$('.panel-body').scrollTop, disclosures:$$('[data-disclosure][open]').map(el => el.dataset.disclosure)
    });
    else if (action === 'variant') {
      const c = family(b.dataset.family);
      change(() => { state.components[c.id] = Number(value); }, 'panel');
      guide.complete('design');
      toast(`${c.variants[Number(value)]} aplicado a todo el sitio.`);
    }
    else if (action === 'device') { if (value === 'mobile') guide.complete('mobile'); ui.device = value; syncPreviewControls(); }
    else if (action === 'actual-size') { ui.actualSize = !ui.actualSize; fitPreview(); }
    else if (action === 'type-weight') {
      const [key, weight] = value.split(':');
      change(() => { state.settings[key] = Number(weight); }, 'panel');
      guide.complete('identity');
    }
    else if (action === 'sample-device') {
      const panelScroll = $('.panel-body').scrollTop;
      const toolbarIndex = $$('.variant-toolbar').indexOf(b.closest('.variant-toolbar'));
      ui.sampleDevice = value;
      renderPanel();
      $('.panel-body').scrollTop = panelScroll;
      $$('.variant-toolbar')[toolbarIndex]?.querySelector(`[data-value="${value}"]`)?.focus({preventScroll:true});
    }
    else if (action === 'canvas-mode') { ui.canvasMode = ui.canvasMode === 'page' ? 'component' : 'page'; renderPanel(); renderPreview(); }
    else if (action === 'composition') showPanel('order');
    else if (action === 'edit-cover') openSection(firstCover()?.id, null, true);
    else if (action === 'edit-section') openSection(value, {stage:'order', scroll:$('.panel-body').scrollTop}, true);
    else if (action === 'move-section-up' || action === 'move-section-down') change(() => { const sections = currentContent().sections; const i = sections.findIndex(s => s.id === value), j = i + (action === 'move-section-up' ? -1 : 1); if (i >= 0 && j >= 0 && j < sections.length) [sections[i], sections[j]] = [sections[j], sections[i]]; }, 'panel');
    else if (action === 'toggle-section') change(() => { const s = currentContent().sections.find(s => s.id === value); if (s) s.hidden = !s.hidden; }, 'panel');
    else if (action === 'remove-section') { change(() => { currentContent().sections = currentContent().sections.filter(s => s.id !== value); ui.stage = 'order'; ui.panelBack = null; ui.selectedSection = null; }, 'panel'); toast('Sección eliminada. Puedes deshacer este cambio.'); }
    else if (action === 'duplicate-section') change(() => { const a = currentContent().sections, i = a.findIndex(s => s.id === value); if (i >= 0 && a.length < 30) a.splice(i + 1, 0, { ...a[i], id: uid() }); }, 'panel');
    else if (action === 'add-section') showPanel('add', {
      panelBack:b.closest('#inspector') ? {stage:'order', scroll:$('.panel-body').scrollTop} : null
    });
    else if (action === 'insert-section') {
      const sections = currentContent().sections;
      if (sections.length >= 30) return toast('Esta página ya tiene 30 secciones.');
      change(() => {
        const section = {id:uid(), type:value, hidden:false};
        const after = sections.findIndex(s => s.id === ui.insertAfter);
        sections.splice(after < 0 ? sections.length : after + 1, 0, section);
        Object.assign(ui, {stage:'section', selectedSection:section.id, insertAfter:null, canvasMode:'page'});
        lastFocusType = {id:section.id};
      }, 'panel');
      $('#inspector').focus({preventScroll:true});
      toast('Sección añadida.');
    }
    else if (action === 'preset') { const p = PRESETS[Number(value)]; change(() => { ['primary', 'accent', 'background', 'text'].forEach((k, i) => state.settings[k] = p.colors[i]); state.settings.headingFont = p.headingFont; state.settings.radius = p.radius; }); guide.complete('identity'); toast(`Estilo ${p.name} aplicado.`); }
    else if (action === 'add-page') showModal('¿Qué más quieres contar?', `<form id="new-page-form"><p class="modal-lead">La nueva página empezará con una portada, contenido, catálogo y una llamada a la acción.</p><label class="field-label"><span>Nombre de la página</span><input name="pageName" placeholder="Por ejemplo, Orquídeas" maxlength="60" required autofocus></label><label class="field-label"><span>Una breve descripción</span><textarea name="pageDescription" rows="3" placeholder="Qué encontrará aquí quien os visite" maxlength="250"></textarea></label><button class="ui-btn primary full-width" type="submit">Crear página ${icon('plus', 16)}</button></form>`);
    else if (action === 'undo' || action === 'redo') { finishEdit(); const from = action === 'undo' ? undoStack : redoStack, to = action === 'undo' ? redoStack : undoStack; if (!from.length) return; to.push(JSON.stringify(state)); state = JSON.parse(from.pop()); persist(); render(); toast(action === 'undo' ? 'Cambio deshecho.' : 'Cambio rehecho.'); }
    else if (action === 'help') guide.open();
    else if (action === 'setup') setup.open({hasProject:true});
    else if (action === 'preview') openPreview();
    else if (action === 'close-preview') $('#site-modal').close();
    else if (action === 'close-modal') $('#modal').close();
    else if (action === 'export') showModal('Llévate tu proyecto.', `<p class="modal-lead">Guarda tu propuesta para presentarla, recuperarla o seguir construyendo.</p><div class="export-options"><button data-action="download-json"><span class="export-icon">${icon('download', 24)}</span><span><strong>Exportar configuración</strong><small>Páginas, diseños, textos e identidad en un archivo JSON.</small></span>${icon('arrow', 18)}</button><button data-action="import-json"><span class="export-icon">${icon('upload', 24)}</span><span><strong>Importar configuración</strong><small>Continúa una propuesta guardada en otro navegador.</small></span>${icon('arrow', 18)}</button><button data-action="download-code"><span class="export-icon">${icon('code', 24)}</span><span><strong>Descargar el proyecto</strong><small>HTML, CSS, JavaScript, imágenes y fuentes. Sin instalación.</small></span>${icon('arrow', 18)}</button></div><div class="modal-note">${icon('sprout', 22)}<p><strong>El siguiente paso: WordPress.</strong><br>Este prototipo permite validar la experiencia. Todavía no genera bloques de Gutenberg o Spectra ni publica en tu WordPress.</p></div><button class="reset-link" data-action="reset-confirm">Restablecer el proyecto de ejemplo</button>`);
    else if (action === 'download-json') downloadJSON();
    else if (action === 'import-json') $('#import-file').click();
    else if (action === 'download-code') { if (location.protocol === 'file:') return toast('Ya tienes el proyecto descargado: index.html, styles.css, script.js y assets.'); const a = document.createElement('a'); a.href = 'brote-studio.zip'; a.download = 'brote-studio.zip'; a.click(); toast('Descargando el proyecto completo.'); }
    else if (action === 'reset-confirm') showModal('Volver a la semilla.', `<p class="modal-lead">Se recuperará el proyecto Jardín de Abril con sus ajustes iniciales. Puedes exportar tu propuesta antes de continuar.</p><div class="modal-button-row"><button class="ui-btn" data-action="download-json">Exportar primero</button><button class="ui-btn primary" data-action="reset">Restablecer ejemplo</button></div>`);
    else if (action === 'reset') { change(() => { state = makeDefault(); ui.stage = 'pages'; ui.pageGroup = 'Todas'; ui.pageSearch = ''; ui.canvasMode = 'page'; }); $('#modal').close(); toast('El proyecto de ejemplo está listo. Puedes deshacer este cambio.'); }
    else if (action === 'sample-toast') toast('Este es un ejemplo de tu estilo. Los cambios se ven en la vista previa.');
    if (beforeSections !== null && beforeSections !== JSON.stringify(currentContent().sections)) guide.complete('content');
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'new-page-form') return; event.preventDefault();
    const f = new FormData(event.target), name = String(f.get('pageName') || '').trim(), description = String(f.get('pageDescription') || '').trim(); if (!name) return;
    if (state.customPages.length >= 30) return toast('Puedes crear hasta 30 páginas personalizadas.');
    let id = slug(name), n = 2; while (catalog().some(p => p.id === id)) id = `${slug(name)}-${n++}`;
    change(() => { const p = { id, name, description: description || `Descubre ${name.toLowerCase()} en nuestro centro.`, group: 'Personalizadas' }; state.customPages.push(p); state.pages.push(id); state.pageContent[id] = defaultContent(p); ui.pageGroup = 'Personalizadas'; ui.pageSearch = ''; }); $('#modal').close(); toast(`La página ${name} ya forma parte de tu web.`);
  });
  document.addEventListener('input', event => {
    const el = event.target;
    if (el.id === 'page-search') { ui.pageSearch = el.value; $('.page-list').innerHTML = pageChoices(); return; }
    if (el.id === 'component-search') { ui.componentSearch = el.value; $('#editor-family-list').innerHTML = familyChoices(); return; }
    if (el.matches('[data-setting]') && el.tagName !== 'SELECT' && el.type !== 'checkbox') {
      startEdit(); const key = el.dataset.setting; if (String(state.settings[key]) !== el.value) guide.complete('identity'); state.settings[key] = el.type === 'range' ? Number(el.value) : el.value;
      if (el.type === 'range') { const out = $(`#out-${key}`); if (out) out.textContent = `${el.value}${el.dataset.unit}`; }
      if (el.type === 'color') { el.closest('.color-input').style.setProperty('--swatch', el.value); $(`[data-color-text="${key}"]`).value = el.value.toUpperCase(); const note = $('#contrast-note'); if (note) note.innerHTML = contrastMarkup(); }
      if (key === 'radius') $('.radius-demo')?.style.setProperty('--demo-radius', `${el.value}px`);
      if (key === 'brand') $('#header-project').textContent = el.value;
      refreshBrandSpecimens(); persist(); schedulePreview();
    }
    if (el.matches('[data-color-text]') && /^#[0-9a-f]{6}$/i.test(el.value)) { startEdit(); if (state.settings[el.dataset.colorText] !== el.value) guide.complete('identity'); state.settings[el.dataset.colorText] = el.value; const picker = $(`[data-setting="${el.dataset.colorText}"]`); picker.value = el.value; picker.closest('.color-input').style.setProperty('--swatch', el.value); const note = $('#contrast-note'); if (note) note.innerHTML = contrastMarkup(); refreshBrandSpecimens(); persist(); schedulePreview(); }
    if (el.matches('[data-content]')) { startEdit(); if (currentContent()[el.dataset.content] !== el.value) guide.complete('content'); currentContent()[el.dataset.content] = el.value; persist(); schedulePreview(); }
    if (el.matches('[data-section-field]')) { const s = currentContent().sections.find(x => x.id === el.dataset.sectionId); if (s) { startEdit(); if ((s[el.dataset.sectionField] || '') !== el.value) guide.complete('content'); s[el.dataset.sectionField] = el.value; persist(); schedulePreview(); } }
  });
  document.addEventListener('focusout', e => { if (e.target.matches('[data-setting],[data-color-text],[data-content],[data-section-field]')) finishEdit(); });
  document.addEventListener('change', async event => {
    const el = event.target;
    if (el.matches('[data-page-toggle]')) change(() => { const id = el.dataset.pageToggle; if (id === 'inicio') return; if (el.checked && !state.pages.includes(id)) state.pages.push(id); else state.pages = state.pages.filter(p => p !== id); if (!state.pages.includes(state.activePage)) state.activePage = 'inicio'; });
    else if (el.id === 'page-group') { ui.pageGroup = el.value; $('.page-list').innerHTML = pageChoices(); }
    else if (el.id === 'preview-page') selectPage(el.value);
    else if (el.id === 'fullscreen-page') { selectPage(el.value); $('#fullscreen-frame').srcdoc = documentHTML(window.BroteSite.render(state, catalog(), {clean:true}), {clean:true}); }
    else if (el.matches('[data-toggle]')) { guide.complete('identity'); change(() => { state[el.dataset.group || 'settings'][el.dataset.toggle] = el.checked; }, 'preview'); }
    else if (el.matches('select[data-setting]')) { guide.complete('identity'); change(() => { state.settings[el.dataset.setting] = el.dataset.setting === 'columns' ? Number(el.value) : el.value; }, 'panel'); }
    else if (el.matches('[data-setting],[data-color-text]')) { finishEdit(); if (el.type === 'color' || el.dataset.colorText) { hydrateSamples(true); } }
    else if (el.id === 'import-file') {
      const f = el.files[0]; if (!f) return; if (f.size > 2 * 1024 * 1024) { toast('El archivo es demasiado grande. El límite es 2 MB.'); el.value = ''; return; }
      try { const next = validate(JSON.parse(await f.text())); change(() => { state = next; Object.assign(ui, {stage:'preview', canvasMode:'page', selectedSection:null, panelBack:null}); }); $('#modal').close(); toast('Proyecto importado. Puedes deshacer para recuperar el anterior.'); } catch (error) { toast(error instanceof SyntaxError ? 'El archivo no contiene un JSON válido.' : error.message); } finally { el.value = ''; }
    }
  });
  window.addEventListener('message', event => {
    const frame = $('#site-frame'), full = $('#fullscreen-frame');
    if (![frame?.contentWindow, full?.contentWindow].includes(event.source) || event.data?.source !== 'brote-preview') return;
    const data = event.data;
    if (data.type === 'navigate' && state.pages.includes(data.page)) {
      if (event.source === full?.contentWindow) { selectPage(data.page); $('#fullscreen-page').value = data.page; full.srcdoc = documentHTML(window.BroteSite.render(state, catalog(), {clean:true}), {clean:true}); }
      else selectPage(data.page);
    }
    if (event.source !== frame?.contentWindow) return;
    if (data.type === 'scroll' && Number.isFinite(data.top)) frame.dataset.scroll = Math.max(0, data.top);
    if (data.type === 'edit') {
      if (['navbar','footer'].includes(data.sectionType)) openComponent(data.sectionType);
      else openSection(data.sectionId);
    } else if (data.type === 'insert' && currentContent().sections.some(s => s.id === data.after)) {
      showPanel('add', {insertAfter:data.after});
    }
  });
  document.addEventListener('toggle', event => {
    if (event.target.matches('[data-disclosure][open]')) hydrateSamples();
  }, true);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.querySelector('dialog[open]') && $('#setup').hidden) {
      const more = $('.editor-more');
      if (more?.open) { more.open = false; more.querySelector('summary').focus(); }
      else $('[data-action="close-panel"]')?.click();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.target.matches('input,textarea,[contenteditable]')) { e.preventDefault(); $(`[data-action="${e.shiftKey ? 'redo' : 'undo'}"]`)?.click(); }
  });
  window.addEventListener('beforeunload', () => { if (!editorStarted) return; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} });
  $('#modal').addEventListener('click', e => { if (e.target === $('#modal')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
  guide.init();
  const url = new URL(location.href);
  const forceSetup = url.searchParams.get('bienvenida') === '1';
  if (forceSetup) {
    url.searchParams.delete('bienvenida');
    try { history.replaceState(null, '', url); } catch {}
  }
  if (forceSetup || !hasProject || setup.hasDraft()) {
    setup.open({ resume: true, hasProject });
  } else {
    editorStarted = true;
    render();
  }
})();
