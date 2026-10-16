document.documentElement.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
const mobileMenu = window.matchMedia('(max-width: 800px)');
function closeMenu() { nav.classList.remove('open'); nav.inert = mobileMenu.matches; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
menuButton.addEventListener('click', () => { const open = !nav.classList.contains('open'); nav.classList.toggle('open', open); nav.inert = !open && mobileMenu.matches; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
mobileMenu.addEventListener('change', closeMenu);
closeMenu();
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
const segments = { skincare: { a: 14, b: 78, target: 'skincare customers' }, fitness: { a: 22, b: 71, target: 'fitness customers' }, travel: { a: 18, b: 82, target: 'travel customers' } };
document.querySelectorAll('[data-segment]').forEach(button => button.addEventListener('click', () => {
  const data = segments[button.dataset.segment];
  document.querySelectorAll('[data-segment]').forEach(tab => { const selected = tab === button; tab.classList.toggle('active', selected); tab.setAttribute('aria-pressed', String(selected)); });
  document.querySelector('[data-fit-a]').textContent = `${data.a}%`;
  document.querySelector('[data-fit-b]').textContent = `${data.b}%`;
  document.querySelector('[data-bar-a]').style.width = `${data.a}%`;
  document.querySelector('[data-bar-b]').style.width = `${data.b}%`;
  document.querySelector('[data-note-a]').textContent = `A small overlap with your ${data.target}.`;
  document.querySelector('[data-note-b]').textContent = `A stronger overlap with your ${data.target}.`;
  window.reachUpMotion?.refresh(document.querySelector('.creator-comparison'));
}));
document.querySelectorAll('[data-work-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.workFilter;
  document.querySelectorAll('[data-work-filter]').forEach(tab => { const selected = tab === button; tab.classList.toggle('active', selected); tab.setAttribute('aria-pressed', String(selected)); });
  document.querySelectorAll('[data-work-section]').forEach(section => { const wasHidden = section.hidden; section.hidden = filter !== 'all' && section.dataset.workSection !== filter; if (wasHidden && !section.hidden) window.reachUpMotion?.refresh(section); });
}));
document.querySelectorAll('[data-load-reel]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', () => {
    const card = button.closest('.reel-card');
    const preview = card?.querySelector('.reel-preview');
    const feedback = card?.querySelector('.reel-feedback');
    if (!preview || preview.querySelector('iframe')) return;
    let url;
    try {
      url = new URL(button.dataset.reelUrl);
      if (url.protocol !== 'https:' || url.hostname !== 'www.instagram.com' || url.username || url.password || url.port || url.search || url.hash || !/^\/p\/[A-Za-z0-9_-]+\/embed\/$/.test(url.pathname)) throw new Error('Invalid Instagram preview');
    } catch { if (feedback) feedback.textContent = 'Please use View on Instagram to open this content.'; return; }
    const iframe = document.createElement('iframe');
    iframe.className = 'reel-frame';
    iframe.src = url.href;
    iframe.title = `${button.dataset.reelTitle} — Instagram preview`;
    iframe.loading = 'eager';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    iframe.setAttribute('allow', 'encrypted-media; fullscreen');
    iframe.addEventListener('error', () => { if (feedback) feedback.textContent = 'This preview couldn’t load. Use View on Instagram to open the content.'; });
    if (feedback) feedback.textContent = 'Instagram controls this preview. If it’s unavailable, use View on Instagram.';
    preview.replaceChildren(iframe);
    card.classList.add('is-loaded');
    iframe.focus({ preventScroll: true });
  });
});
const showDialog = dialog => window.reachUpMotion ? window.reachUpMotion.openDialog(dialog) : dialog.showModal();
const dismissDialog = dialog => window.reachUpMotion ? window.reachUpMotion.closeDialog(dialog) : dialog.close();
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dismissDialog(dialog));
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dismissDialog(dialog); } });
});
const conceptDialog = document.querySelector('#concept-dialog');
let conceptsPromise;
document.querySelectorAll('[data-concept]').forEach(button => button.addEventListener('click', async () => {
  const content = document.querySelector('#concept-content');
  content.replaceChildren();
  const loading = document.createElement('p'); loading.textContent = 'Loading creative concept…'; content.append(loading);
  showDialog(conceptDialog);
  try {
    conceptsPromise ||= fetch('assets/concepts.json').then(response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); }).catch(error => { conceptsPromise = null; throw error; });
    const concepts = await conceptsPromise;
    const concept = concepts.find(item => item.id === button.dataset.concept);
    const eyebrow = document.createElement('div'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'INDEPENDENT CAMPAIGN CONCEPT';
    const heading = document.createElement('h2'); heading.textContent = concept.title; heading.id = 'concept-title';
    conceptDialog.setAttribute('aria-labelledby', 'concept-title');
    const disclosure = document.createElement('p'); disclosure.className = 'concept-modal-disclosure'; disclosure.textContent = 'Self-initiated creative proposal. Not a commissioned or completed client campaign. No results are claimed. Images on concept cards are editorial stock.';
    const intro = document.createElement('p'); intro.className = 'concept-modal-description'; intro.textContent = concept.text;
    const body = document.createElement('div'); body.className = 'concept-modal-body';
    [['Audience', concept.audience], ['The strategy', concept.strategy], ['Creative direction', concept.creative], ['How we would learn', concept.measure]].forEach(([title, text]) => { const section = document.createElement('section'); const h = document.createElement('h3'); h.textContent = title; const p = document.createElement('p'); p.textContent = text; section.append(h, p); body.append(section); });
    const link = document.createElement('a'); link.href = 'contact.html'; link.className = 'button primary'; link.textContent = 'Explore an idea for your brand ↗';
    content.replaceChildren(eyebrow, heading, disclosure, intro, body, link);
  } catch { const error = document.createElement('p'); error.textContent = 'This concept could not be loaded. Please try again, or email letstalk@reachupmedia.in to discuss an idea.'; content.replaceChildren(error); }
}));
