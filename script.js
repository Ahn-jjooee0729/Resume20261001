const panel = document.querySelector('.main-panel');
const sections = [...document.querySelectorAll('.placeholder-section')];
const links = [...document.querySelectorAll('.section-nav a')];

function setActiveSection(id) {
  links.forEach((link) => {
    const active = link.hash === `#${id}`;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveSection(visible.target.id);
  },
  { root: panel, threshold: [0.25, 0.5, 0.75] }
);

sections.forEach((section) => observer.observe(section));

links.forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.hash);
    if (!target || window.matchMedia('(max-width: 900px)').matches) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', link.hash);
  });
});

const desktopLayout = window.matchMedia('(min-width: 901px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollTimer;
let isSnapping = false;

function snapToSection() {
  if (!desktopLayout.matches || isSnapping) return;

  const scrollTop = panel.scrollTop;
  let currentIndex = 0;

  sections.forEach((section, index) => {
    if (section.offsetTop <= scrollTop + 1) currentIndex = index;
  });

  const currentSection = sections[currentIndex];
  const nextSection = sections[currentIndex + 1];
  const sectionEnd = nextSection ? nextSection.offsetTop : panel.scrollHeight;
  const sectionLength = Math.max(sectionEnd - currentSection.offsetTop, 1);
  const progress = (scrollTop - currentSection.offsetTop) / sectionLength;
  const targetSection = progress >= 1 / 2 && nextSection ? nextSection : currentSection;

  if (Math.abs(panel.scrollTop - targetSection.offsetTop) < 2) return;

  isSnapping = true;
  panel.scrollTo({
    top: targetSection.offsetTop,
    behavior: reducedMotion.matches ? 'auto' : 'smooth',
  });

  window.setTimeout(() => {
    isSnapping = false;
  }, reducedMotion.matches ? 0 : 700);
}

panel.addEventListener('scroll', () => {
  if (!desktopLayout.matches || isSnapping) return;
  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(snapToSection, 100);
}, { passive: true });

const projectOrbit = document.querySelector('.project-orbit');
const projectCards = [...document.querySelectorAll('.project-node')];
const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');

function setProjectDetail(card, expanded) {
  const overview = card.querySelector('.project-overview');
  const detail = card.querySelector('.project-detail');

  card.classList.toggle('is-expanded', expanded);
  card.setAttribute('aria-expanded', String(expanded));
  overview?.setAttribute('aria-hidden', String(expanded));
  detail?.setAttribute('aria-hidden', String(!expanded));
  projectOrbit?.classList.toggle(
    'has-active',
    projectCards.some((projectCard) => projectCard.classList.contains('is-expanded'))
  );
}

function closeOtherProjects(currentCard) {
  projectCards.forEach((card) => {
    if (card !== currentCard) setProjectDetail(card, false);
  });
}

projectCards.forEach((card) => {
  card.addEventListener('pointerenter', () => {
    if (!hoverPointer.matches) return;
    closeOtherProjects(card);
    setProjectDetail(card, true);
  });

  card.addEventListener('pointerleave', () => {
    if (!hoverPointer.matches || card.matches(':focus-visible')) return;
    setProjectDetail(card, false);
  });

  card.addEventListener('focus', () => {
    if (!card.matches(':focus-visible')) return;
    closeOtherProjects(card);
    setProjectDetail(card, true);
  });

  card.addEventListener('blur', () => setProjectDetail(card, false));

  card.addEventListener('click', () => {
    if (hoverPointer.matches) return;
    const willExpand = !card.classList.contains('is-expanded');
    closeOtherProjects(card);
    setProjectDetail(card, willExpand);
  });

  card.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setProjectDetail(card, false);
    card.blur();
  });
});

document.addEventListener('pointerdown', (event) => {
  if (hoverPointer.matches || event.target.closest('.project-node')) return;
  projectCards.forEach((card) => setProjectDetail(card, false));
});
