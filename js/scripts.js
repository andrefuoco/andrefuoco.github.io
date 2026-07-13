/* =========================================================
   ANDREFUOCO — site scripts (vanilla JS, no dependencies)
   ========================================================= */
(() => {
  "use strict";

  /* ===================== NAV ===================== */
  function initNav() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    if (!nav || !toggle || !navLinks) return;

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

    /* Navbar background on scroll */
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* Active link highlighting */
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
  }

  /* ===================== SPOTIFY RELEASES =====================
     data/releases.json is refreshed automatically by the scheduled
     GitHub Action (.github/workflows/update-releases.yml).
     If it can't be loaded, the static artist embed in the HTML
     remains as fallback — always up to date, courtesy of Spotify. */
  const RELEASE_TYPE_LABELS = {
    album: "Album",
    single: "Singolo",
    compilation: "Raccolta",
  };

  function releaseCard(release) {
    const card = document.createElement("a");
    card.className = "release";
    card.href = release.url;
    card.target = "_blank";
    card.rel = "noopener";

    const cover = document.createElement("img");
    cover.className = "release__cover";
    cover.src = release.image || "assets/img/logo.png";
    cover.alt = `Copertina — ${release.name}`;
    cover.loading = "lazy";

    const meta = document.createElement("span");
    meta.className = "release__meta";

    const name = document.createElement("span");
    name.className = "release__name";
    name.textContent = release.name;

    const info = document.createElement("span");
    info.className = "release__info";
    const type = RELEASE_TYPE_LABELS[release.type] || release.type;
    const year = (release.releaseDate || "").slice(0, 4);
    info.textContent = year ? `${type} · ${year}` : type;

    meta.append(name, info);
    card.append(cover, meta);
    return card;
  }

  async function initReleases() {
    const grid = document.getElementById("releaseGrid");
    const embed = document.getElementById("latestEmbed");
    const label = document.getElementById("latestLabel");
    if (!grid || !embed) return;

    let data;
    try {
      const res = await fetch("data/releases.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch {
      return; // keep the artist embed fallback
    }

    const releases = Array.isArray(data.releases) ? data.releases : [];
    if (!releases.length) return;

    /* Newest release becomes the main player */
    const latest = releases[0];
    if (latest.embedUrl) {
      embed.src = `${latest.embedUrl}?utm_source=generator`;
      embed.title = `Spotify — ${latest.name}`;
      if (label) {
        label.textContent = `Ultima uscita — ${latest.name}`;
        label.hidden = false;
      }
    }

    /* Full discography grid */
    releases.forEach((release) => grid.appendChild(releaseCard(release)));
  }

  /* ===================== FOOTER YEAR ===================== */
  function initFooterYear() {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ===================== LIGHTBOX GALLERY ===================== */
  function initLightbox() {
    const photos = [...document.querySelectorAll(".photo")];
    const lightbox = document.getElementById("lightbox");
    if (!lightbox || !photos.length) return;

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
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initReleases();
    initFooterYear();
    initLightbox();
  });
})();
