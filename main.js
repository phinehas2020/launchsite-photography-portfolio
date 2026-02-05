import "./style.css";
import Lenis from "lenis";

document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const yearSlot = document.querySelector("[data-year]");
const progress = document.querySelector("[data-scroll-progress]");
const revealNodes = document.querySelectorAll(".reveal");
const parallaxNodes = document.querySelectorAll("[data-parallax-speed]");

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

const sections = [...document.querySelectorAll("main section[id]")];

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
      threshold: 0.4,
      rootMargin: "-20% 0px -35% 0px"
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

const activateReveals = () => {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
};

if (reducedMotion) {
  activateReveals();
} else {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      activateReveals();
    });
  });
}

if (!reducedMotion) {
  const lenis = new Lenis({
    smoothWheel: true,
    smoothTouch: false,
    lerp: 0.1
  });

  let previousScroll = 0;

  lenis.on("scroll", ({ scroll, limit }) => {
    const max = limit || document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(scroll / max, 1) : 0;

    if (progress) {
      progress.style.width = `${ratio * 100}%`;
    }

    if (header) {
      header.classList.toggle("is-solid", scroll > 16);
      const scrollingDown = scroll > previousScroll;
      const isDesktop = window.innerWidth > 960;

      if (isDesktop && scroll > 220 && scrollingDown) {
        header.classList.add("is-hidden");
      } else {
        header.classList.remove("is-hidden");
      }
    }

    parallaxNodes.forEach((node) => {
      const speed = Number(node.dataset.parallaxSpeed || 0);
      node.style.transform = `translate3d(0, ${scroll * speed}px, 0)`;
    });

    previousScroll = scroll;
  });

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };

  requestAnimationFrame(raf);
} else {
  const onNativeScroll = () => {
    const scroll = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(scroll / max, 1) : 0;
    if (progress) {
      progress.style.width = `${ratio * 100}%`;
    }

    if (header) {
      header.classList.toggle("is-solid", scroll > 16);
      header.classList.remove("is-hidden");
    }
  };

  window.addEventListener("scroll", onNativeScroll, { passive: true });
  onNativeScroll();
}
