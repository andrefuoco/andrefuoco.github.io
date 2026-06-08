/* =========================================================
   ANDREFUOCO — site scripts (vanilla JS, no dependencies)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  /* --- Mobile menu toggle --- */
  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Apri il menu");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
  });

  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* --- Navbar background on scroll --- */
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --- Active link highlighting --- */
  const sections = [...document.querySelectorAll("main section[id]")];
  const linkFor = (id) => navLinks.querySelector(`a[href="#${id}"]`);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkFor(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.querySelectorAll("a").forEach((a) => a.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* --- Footer year --- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* --- Lightbox gallery --- */
  const photos = [...document.querySelectorAll(".photo")];
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = lightbox.querySelector(".lightbox__close");
  const nextBtn = lightbox.querySelector(".lightbox__next");
  const prevBtn = lightbox.querySelector(".lightbox__prev");
  const sources = photos.map((p) => p.querySelector("img"));
  let current = 0;
  let lastFocused = null;

  const render = () => {
    const img = sources[current];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
  };

  const open = (index) => {
    current = index;
    render();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lastFocused = document.activeElement;
    closeBtn.focus();
  };

  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  const move = (dir) => {
    current = (current + dir + sources.length) % sources.length;
    render();
  };

  photos.forEach((photo, i) => photo.addEventListener("click", () => open(i)));
  closeBtn.addEventListener("click", close);
  nextBtn.addEventListener("click", () => move(1));
  prevBtn.addEventListener("click", () => move(-1));

  // Click on the dark backdrop (not the image/buttons) closes
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") move(1);
    else if (e.key === "ArrowLeft") move(-1);
  });
});
