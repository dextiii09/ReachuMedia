/* Small, dependency-free motion layer. Content stays readable without animation. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReduced = () => preference.matches;
  document.documentElement.dataset.motion = isReduced() ? 'off' : 'on';
  const easing = 'cubic-bezier(.22, 1, .36, 1)';
  const running = new Set();
  const dialogStates = new WeakMap();
  let seen = new WeakSet();
  const observed = new Set();
  let observer;

  function animate(element, frames, options = {}) {
    if (isReduced() || typeof element?.animate !== 'function') return null;
    const animation = element.animate(frames, { duration: 600, easing, ...options });
    running.add(animation);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
    return animation;
  }

  function settleWithin(element) {
    for (const animation of running) {
      const target = animation.effect?.target;
      if (target === element || element.contains(target)) animation.cancel();
    }
  }

  function reveal(element, delay = 0, distance = 18) {
    if (seen.has(element)) return;
    seen.add(element);
    observed.delete(element);
    observer?.unobserve(element);
    if (element.contains(document.activeElement)) return;
    const transform = getComputedStyle(element).transform;
    const resting = transform === 'none' ? '' : transform;
    animate(element, [
      { opacity: 0, transform: `translate3d(0, ${distance}px, 0) ${resting}` },
      { opacity: 1, transform: `translate3d(0, 0, 0) ${resting}` },
    ], { delay, duration: 680, fill: 'backwards' });
  }

  function refresh(element) {
    if (!element) return;
    settleWithin(element);
    animate(element, [{ opacity: .5, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 340 });
  }

  function releaseDialog(dialog) {
    dialog.classList.remove('is-opening', 'is-closing');
    if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('has-modal');
  }

  function openDialog(dialog) {
    const previous = dialogStates.get(dialog);
    if (previous?.timer) clearTimeout(previous.timer);
    previous?.animation?.cancel();
    const state = { closing: false, animation: null, timer: null };
    dialogStates.set(dialog, state);
    dialog.classList.remove('is-closing');
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('has-modal');
    if (isReduced()) return;
    dialog.classList.add('is-opening');
    state.animation = animate(dialog, [
      { opacity: 0, transform: 'translateY(18px) scale(.985)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ], { duration: 320 });
    state.animation?.finished.then(() => {
      if (dialogStates.get(dialog) === state) dialog.classList.remove('is-opening');
    }, () => {});
  }

  function closeDialog(dialog) {
    if (!dialog.open) return;
    const previous = dialogStates.get(dialog);
    if (previous?.closing) return;
    previous?.animation?.cancel();
    if (isReduced() || typeof dialog.animate !== 'function') {
      dialog.close();
      releaseDialog(dialog);
      return;
    }
    const state = { closing: true, animation: null, timer: null };
    dialogStates.set(dialog, state);
    dialog.classList.remove('is-opening');
    dialog.classList.add('is-closing');
    const finish = () => {
      if (dialogStates.get(dialog) !== state) return;
      clearTimeout(state.timer);
      dialogStates.delete(dialog);
      state.animation?.cancel();
      dialog.close();
      releaseDialog(dialog);
    };
    state.animation = animate(dialog, [
      { opacity: 1, transform: 'translateY(0) scale(1)' },
      { opacity: 0, transform: 'translateY(10px) scale(.99)' },
    ], { duration: 170, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' });
    state.animation?.finished.then(finish, finish);
    state.timer = setTimeout(finish, 260);
  }

  window.reachUpMotion = { openDialog, closeDialog, refresh };
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
    dialog.addEventListener('close', () => {
      if (dialog.open) return; // An earlier close event may arrive after a rapid reopen.
      const state = dialogStates.get(dialog);
      if (state?.timer) clearTimeout(state.timer);
      state?.animation?.cancel();
      dialogStates.delete(dialog);
      releaseDialog(dialog);
    });
  });

  const hero = document.querySelector('.hero-copy');
  function animateIntro() {
    if (isReduced()) return;
    const elements = [...(hero?.children || [])];
    elements.push(...document.querySelectorAll('.art-caption, .creator-main, .creator-secondary, .fit-badge, .art-stamp, .art-footnote'));
    elements.forEach((element, index) => {
      settleWithin(element);
      seen.delete(element);
      reveal(element, Math.min(index * 65, 390), 22);
    });
  }
  function startReveals() {
    observer?.disconnect();
    observed.clear();
    seen = new WeakSet();
    if (isReduced()) return;
    animateIntro();
    const intro = document.querySelector('.page-intro');
    if (intro) [...intro.children].forEach((element, index) => reveal(element, index * 60, 16));
    if (!('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll('.team-card, .testimonial-card, .section-heading, .process-step, .project-card, .comparison-copy, .comparison-lab, .service-row, .concept-card, .about-preview-inner, .cta-inner, .principle-grid > article, .service-detail, .faq-list > details, .about-image, .about-story-copy, .case-title-row, .case-cover, .case-overview > *, .case-details > article, .content-links > a, .reel-card, .related-work, .contact-layout > aside, #campaign-form, .prose > h2, .prose > p');
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target;
        const siblings = [...element.parentElement.children];
        const delay = element.matches('.process-step, .project-card, .service-row, .concept-card, .principle-grid > article, .case-details > article, .content-links > a, .reel-card') ? (siblings.indexOf(element) % 4) * 60 : 0;
        reveal(element, delay);
      }
    }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });
    targets.forEach(element => { observed.add(element); observer.observe(element); });
  }

  document.addEventListener('focusin', event => {
    for (const element of observed) {
      if (!element.contains(event.target)) continue;
      seen.add(element);
      observer?.unobserve(element);
      observed.delete(element);
    }
    for (const animation of running) {
      const element = animation.effect?.target;
      if (!element?.closest('dialog') && element?.contains(event.target)) animation.cancel();
    }
  });
  function settleHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    settleWithin(target);
    seen.add(target);
    observer?.unobserve(target);
    for (const element of observed) {
      if (!target.contains(element) && !element.contains(target)) continue;
      seen.add(element);
      observer?.unobserve(element);
      observed.delete(element);
    }
  }
  window.addEventListener('hashchange', settleHash);
  if (location.hash) settleHash();
  document.querySelectorAll('.faq-list details').forEach(details => {
    details.addEventListener('toggle', () => { if (details.open) refresh(details.querySelector('p')); });
  });
  function stopMotion() {
    observer?.disconnect();
    observed.clear();
    for (const animation of running) animation.cancel();
    document.querySelectorAll('dialog[open]').forEach(dialog => {
      if (dialogStates.get(dialog)?.closing) { dialog.close(); releaseDialog(dialog); }
      else dialog.classList.remove('is-opening', 'is-closing');
    });
  }

  // Move collage layers without replacing their original tilted transforms.
  const art = document.querySelector('.hero-art');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let artVisible = !('IntersectionObserver' in window);
  let artFrame = 0;
  let artX = 0, artY = 0, targetX = 0, targetY = 0;
  function resetArtPointer() {
    cancelAnimationFrame(artFrame);
    artFrame = 0;
    artX = artY = targetX = targetY = 0;
    art?.style.removeProperty('--art-pointer-x');
    art?.style.removeProperty('--art-pointer-y');
  }
  function syncArtMotion() {
    if (!art) return;
    const active = artVisible && !document.hidden && !isReduced();
    art.classList.toggle('art-motion-active', active);
    if (!active || !finePointer.matches) resetArtPointer();
  }
  function moveArtPointer() {
    if (!art || isReduced() || !artVisible || document.hidden) { resetArtPointer(); return; }
    artX += (targetX - artX) * .1;
    artY += (targetY - artY) * .1;
    art.style.setProperty('--art-pointer-x', `${artX.toFixed(2)}px`);
    art.style.setProperty('--art-pointer-y', `${artY.toFixed(2)}px`);
    if (Math.abs(targetX - artX) + Math.abs(targetY - artY) > .05) artFrame = requestAnimationFrame(moveArtPointer);
    else artFrame = 0;
  }
  if (art) {
    if ('IntersectionObserver' in window) {
      const artObserver = new IntersectionObserver(entries => {
        artVisible = entries[0].isIntersecting;
        syncArtMotion();
      }, { threshold: .05 });
      artObserver.observe(art);
    }
    art.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || !finePointer.matches || isReduced() || !artVisible) return;
      const bounds = art.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)) * 7;
      targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1)) * 7;
      if (!artFrame) artFrame = requestAnimationFrame(moveArtPointer);
    }, { passive: true });
    art.addEventListener('pointerleave', () => {
      targetX = targetY = 0;
      if (!artFrame && !isReduced()) artFrame = requestAnimationFrame(moveArtPointer);
    });
    document.addEventListener('visibilitychange', syncArtMotion);
    finePointer.addEventListener('change', syncArtMotion);
  }

  const header = document.querySelector('.site-header');
  function updatePreference() {
    const reduced = isReduced();
    document.documentElement.dataset.motion = reduced ? 'off' : 'on';
    if (reduced) stopMotion();
    else { startReveals(); if (location.hash) settleHash(); }
    syncArtMotion();
  }
  preference.addEventListener('change', updatePreference);
  updatePreference();
  if (location.hash) settleHash();
  const progress = document.createElement('span');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  header.append(progress);
  let scheduled = false;
  function updateScroll() {
    const maximum = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maximum > 0 ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    scheduled = false;
  }
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
})();
