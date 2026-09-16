// ---------- Cache des éléments DOM ----------
const htmlEl = document.documentElement;
const body = document.body;

const motionToggle = document.getElementById("motion-toggle");
const typewriterEl = document.getElementById("typewriter");
const revealEls = document.querySelectorAll(".reveal");
const skillsGrid = document.querySelector(".skills-grid");
const faqList = document.querySelector(".faq-list");
const feedbackForm = document.getElementById("feedback-form");
const contactForm = document.getElementById("contact-form");
const langSwitcher = document.querySelector(".lang-switcher");
const langToggle = document.getElementById("lang-toggle");
const langFlagEl = document.getElementById("lang-flag");
const langOptions = document.querySelectorAll(".lang-option");
const placeholderEls = document.querySelectorAll("[data-fr-placeholder]");
const scrollProgress = document.getElementById("scroll-progress");
const backToTop = document.getElementById("back-to-top");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
const themeToggle = document.getElementById("theme-toggle");

// ---------- Réduction des animations (bouton + préférence système) ----------
function applyMotionPref(reduced) {
  htmlEl.classList.toggle("reduce-motion", reduced);
  motionToggle.textContent = reduced ? "🚫" : "✨";
  motionToggle.setAttribute("aria-pressed", String(reduced));
}

function isMotionReduced() {
  return htmlEl.classList.contains("reduce-motion");
}

const savedMotion = localStorage.getItem("reduceMotion");
const systemPrefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
applyMotionPref(savedMotion !== null ? savedMotion === "true" : systemPrefersReducedMotion);

motionToggle.addEventListener("click", () => {
  applyMotionPref(!isMotionReduced());
  localStorage.setItem("reduceMotion", String(isMotionReduced()));
  resetTypewriter();
});

// ---------- Effet machine à écrire ----------
const rolesByLang = {
  fr: ["Développeur Python", "Créateur d'outils utiles", "Ouvert au freelance"],
  en: ["Python Developer", "Useful Tools Creator", "Open to freelance work"],
  de: ["Python-Entwickler", "Entwickler nützlicher Tools", "Offen für Freelance-Projekte"],
};

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  const roles = rolesByLang[body.getAttribute("data-lang")] || rolesByLang.fr;
  const currentRole = roles[roleIndex % roles.length];

  if (isMotionReduced()) {
    typewriterEl.textContent = currentRole;
    return;
  }

  if (!deleting) {
    charIndex++;
    typewriterEl.textContent = currentRole.slice(0, charIndex);
    if (charIndex === currentRole.length) {
      deleting = true;
      setTimeout(typeLoop, 4800);
      return;
    }
  } else {
    charIndex--;
    typewriterEl.textContent = currentRole.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(typeLoop, deleting ? 120 : 140);
}

function resetTypewriter() {
  roleIndex = 0;
  charIndex = 0;
  deleting = false;
  typewriterEl.textContent = "";
  typeLoop();
}

setTimeout(typeLoop, isMotionReduced() ? 0 : 1350);

// ---------- Apparition des sections au scroll ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => revealObserver.observe(el));

// ---------- Info-bulles des compétences (délégation d'événements) ----------
skillsGrid.addEventListener("click", (e) => {
  const badge = e.target.closest(".skill-badge");
  if (!badge) return;
  e.stopPropagation();
  const wasOpen = badge.classList.contains("open");
  skillsGrid.querySelectorAll(".skill-badge.open").forEach((b) => {
    b.classList.remove("open");
    b.setAttribute("aria-expanded", "false");
  });
  if (!wasOpen) {
    badge.classList.add("open");
    badge.setAttribute("aria-expanded", "true");
  }
});

// ---------- Accordéon FAQ (délégation d'événements) ----------
faqList.addEventListener("click", (e) => {
  const question = e.target.closest(".faq-question");
  if (!question) return;
  const item = question.closest(".faq-item");
  const wasOpen = item.classList.contains("open");
  faqList.querySelectorAll(".faq-item.open").forEach((i) => {
    i.classList.remove("open");
    i.querySelector(".faq-question").setAttribute("aria-expanded", "false");
  });
  if (!wasOpen) {
    item.classList.add("open");
    question.setAttribute("aria-expanded", "true");
  }
});

// ---------- Formulaires -> ouvrent l'email pré-rempli ----------
function openMailto(subject, name, message) {
  const mailSubject = encodeURIComponent(subject);
  const body = encodeURIComponent(`De la part de : ${name}\n\n${message}`);
  window.location.href = `mailto:santschiar@gmail.com?subject=${mailSubject}&body=${body}`;
}

if (feedbackForm) {
  feedbackForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("feedback-name").value.trim() || "Anonyme";
    const message = document.getElementById("feedback-message").value.trim();
    openMailto("Avis sur le portfolio", name, message);
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contact-name").value.trim();
    const subject = document.getElementById("contact-subject").value.trim() || "Contact depuis le portfolio";
    const message = document.getElementById("contact-message").value.trim();
    openMailto(subject, name, message);
  });
}

// ---------- Sélecteur de langue FR/EN/DE (menu avec drapeaux) ----------
const langFlags = { fr: "🇫🇷", en: "🇬🇧", de: "🇩🇪" };

function applyLanguage(lang, { restartTyping = true } = {}) {
  body.setAttribute("data-lang", lang);
  htmlEl.setAttribute("lang", lang);
  langFlagEl.textContent = langFlags[lang];
  placeholderEls.forEach((el) => {
    el.placeholder = el.dataset[lang + "Placeholder"] || el.dataset.frPlaceholder;
  });
  langOptions.forEach((opt) => opt.classList.toggle("active", opt.dataset.lang === lang));
  if (restartTyping) resetTypewriter();
}

const savedLang = ["fr", "en", "de"].includes(localStorage.getItem("lang")) ? localStorage.getItem("lang") : "fr";
applyLanguage(savedLang, { restartTyping: false });

langToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  langSwitcher.classList.toggle("open");
});

langOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    e.stopPropagation();
    const lang = option.dataset.lang;
    applyLanguage(lang);
    localStorage.setItem("lang", lang);
    langSwitcher.classList.remove("open");
  });
});

// ---------- Barre de progression de lecture + bouton retour en haut ----------
let scrollTicking = false;

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const docHeight = htmlEl.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = progress + "%";
  backToTop.classList.toggle("visible", scrollTop > 400);
  scrollTicking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateScrollUI);
  },
  { passive: true }
);
updateScrollUI();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ---------- Menu mobile (hamburger) ----------
navToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  navLinks.classList.toggle("open");
});

navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") navLinks.classList.remove("open");
});

// ---------- Thème clair/sombre ----------
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  body.setAttribute("data-theme", savedTheme);
  themeToggle.textContent = savedTheme === "light" ? "☀️" : "🌙";
}

themeToggle.addEventListener("click", () => {
  const next = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
  body.setAttribute("data-theme", next);
  themeToggle.textContent = next === "light" ? "☀️" : "🌙";
  localStorage.setItem("theme", next);
});

// ---------- Fermeture des menus au clic extérieur (un seul écouteur global) ----------
document.addEventListener("click", (e) => {
  skillsGrid.querySelectorAll(".skill-badge.open").forEach((b) => {
    b.classList.remove("open");
    b.setAttribute("aria-expanded", "false");
  });
  langSwitcher.classList.remove("open");
  if (navLinks.classList.contains("open") && !navLinks.contains(e.target) && e.target !== navToggle) {
    navLinks.classList.remove("open");
  }
});
