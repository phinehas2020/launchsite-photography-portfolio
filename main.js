import "./style.css";

document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const sections = [...document.querySelectorAll("main section[id]")];
const yearSlot = document.querySelector("[data-year]");
const progress = document.querySelector("[data-scroll-progress]");
const revealNodes = [...document.querySelectorAll(".reveal")];

if (yearSlot) {
  yearSlot.textContent = String(new Date().getFullYear());
}

const setMobileMenuState = (open) => {
  if (!menuToggle || !nav) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", String(open));
  nav.dataset.open = String(open);

  const headerCta = document.querySelector(".header-cta");
  if (headerCta) {
    headerCta.dataset.open = String(open);
  }
};

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMobileMenuState(!isOpen);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setMobileMenuState(false);
  });
});

const setActiveNavLink = (currentId) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentId}`;
    link.classList.toggle("is-current", isActive);
  });
};

if (sections.length > 0 && "IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNavLink(entry.target.id);
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: "-20% 0px -40% 0px"
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

if (reducedMotion) {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
} else {
  revealNodes.forEach((node, index) => {
    const delay = Math.min(index * 24, 120);
    window.setTimeout(() => {
      node.classList.add("is-visible");
    }, delay);
  });
}

let previousScroll = 0;
let ticking = false;

const updateScrollState = () => {
  const scroll = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? Math.min(scroll / maxScroll, 1) : 0;

  if (progress) {
    progress.style.width = `${ratio * 100}%`;
  }

  if (header) {
    header.classList.toggle("is-solid", scroll > 12);

    const scrollingDown = scroll > previousScroll;
    const isDesktop = window.innerWidth > 960;
    const menuOpen = menuToggle?.getAttribute("aria-expanded") === "true";

    if (isDesktop && !menuOpen && scroll > 220 && scrollingDown) {
      header.classList.add("is-hidden");
    } else {
      header.classList.remove("is-hidden");
    }
  }

  previousScroll = scroll;
  ticking = false;
};

const onScroll = () => {
  if (ticking) {
    return;
  }

  ticking = true;
  requestAnimationFrame(updateScrollState);
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });
updateScrollState();
