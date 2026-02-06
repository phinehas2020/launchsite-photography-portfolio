import "./style.css";

// ----------------------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------------------

document.documentElement.classList.add("js");

// Respect reduced motion per skill guidelines
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const elements = {
  header: document.querySelector("[data-header]"),
  nav: document.querySelector("[data-nav]"),
  menuToggle: document.querySelector("[data-menu-toggle]"),
  navLinks: [...document.querySelectorAll("[data-nav-link]")],
  sections: [...document.querySelectorAll("main section[id]")],
  yearLabel: document.querySelector("[data-year]"),
  scrollBar: document.querySelector("[data-scroll-progress]"),
  revealNodes: [...document.querySelectorAll(".reveal")],
};

if (elements.yearLabel) {
  elements.yearLabel.textContent = new Date().getFullYear().toString();
}

// ----------------------------------------------------------------
// REVEAL ANIMATIONS (IntersectionObserver)
// ----------------------------------------------------------------

const initRevealObserver = () => {
  if (prefersReducedMotion) return;

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.1,
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        // Once revealed, no need to observe anymore
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.revealNodes.forEach((node) => revealObserver.observe(node));
};

initRevealObserver();

// ----------------------------------------------------------------
// NAVIGATION & MENU
// ----------------------------------------------------------------

const toggleMenu = (forceState) => {
  const isCurrentlyOpen = elements.menuToggle?.getAttribute("aria-expanded") === "true";
  const newState = typeof forceState === "boolean" ? forceState : !isCurrentlyOpen;

  if (elements.menuToggle) {
    elements.menuToggle.setAttribute("aria-expanded", newState.toString());
  }

  if (elements.nav) {
    elements.nav.dataset.open = newState.toString();
  }
};

elements.menuToggle?.addEventListener("click", () => toggleMenu());

// Close menu on link click
elements.navLinks.forEach((link) => {
  link.addEventListener("click", () => toggleMenu(false));
});

// Scroll margin and active state
const initNavigationObserver = () => {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          elements.navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("is-current", isActive);
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: "-20% 0px -40% 0px" }
  );

  elements.sections.forEach((section) => navObserver.observe(section));
};

initNavigationObserver();

// ----------------------------------------------------------------
// SCROLL PERFORMANCE
// ----------------------------------------------------------------

let lastScrollY = window.scrollY;
let isScrolling = false;

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollRatio = maxScroll > 0 ? Math.min(currentScrollY / maxScroll, 1) : 0;

  // Scroll Progress Bar
  if (elements.scrollBar) {
    elements.scrollBar.style.transform = `scaleX(${scrollRatio})`;
  }

  // Header Behavior
  if (elements.header) {
    // Add solid background after scrolling a bit
    elements.header.classList.toggle("is-solid", currentScrollY > 20);

    // Hide/Show header on scroll direction (Desktop only)
    if (window.innerWidth >= 960) {
      const isHeaderOpen = elements.menuToggle?.getAttribute("aria-expanded") === "true";
      if (!isHeaderOpen && currentScrollY > 400) {
        if (currentScrollY > lastScrollY) {
          elements.header.classList.add("is-hidden");
        } else {
          elements.header.classList.remove("is-hidden");
        }
      } else {
        elements.header.classList.remove("is-hidden");
      }
    }
  }

  lastScrollY = currentScrollY;
  isScrolling = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!isScrolling) {
      window.requestAnimationFrame(handleScroll);
      isScrolling = true;
    }
  },
  { passive: true }
);

// Initial state
handleScroll();
