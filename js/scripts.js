/* =========================================================
   ANDREFUOCO — site scripts (vanilla JS, no dependencies)
   ========================================================= */
(() => {
  "use strict";

  /* ===================== ARTWORK (configurazione) =====================
     Qui decidi cosa appare nelle sezioni "Cover Art" e "Collage".

     - Per NASCONDERE una copertina: metti `visible: false` (e viceversa).
     - Per cambiare la didascalia: modifica `title`.
     - Per cambiare l'ordine: riordina le righe.
     - Nuova uscita? Aggiungi una riga con il percorso del file.
     - Nuovo collage? Aggiungi una voce a COLLAGES: le tavole vengono
       lette in ordine di nome (1.web.jpg, 2.web.jpg, 3.web.jpg). */
  const COVER_ART = [
    {
      label: "ANDREFUOCO",
      note: "",
      accent: true,
      items: [
        { title: "Marziani Siamo Noi", file: "assets/img/coverart/ANDREFUOCO/i marziani siamo noi 2.5(1).web.jpg", visible: true },
        { title: "Plancton (feat. Oratio)", file: "assets/img/coverart/ANDREFUOCO/plancton.web.jpg", visible: true },
      ],
    },
    {
      label: "Elettrogruppogeno",
      note: "La prima band di ANDREFUOCO",
      accent: false,
      items: [
        { title: "Buco Nero Supermassivo", file: "assets/img/coverart/Elettrogruppogeno/buconerosupermassivo_1400x1400.png", visible: true },
        { title: "Tutti Rockstar", file: "assets/img/coverart/Elettrogruppogeno/Tutti Rockstar_1400x1400.png", visible: true },
        { title: "Genetica", file: "assets/img/coverart/Elettrogruppogeno/Genetica_1400x1400.png", visible: true },
        { title: "Metacanzone", file: "assets/img/coverart/Elettrogruppogeno/metacanzone1400x1400.png", visible: true },
        { title: "Masciugo Allumido", file: "assets/img/coverart/Elettrogruppogeno/masciugo allumido_1400x1400.png", visible: false },
        { title: "Instadiva", file: "assets/img/coverart/Elettrogruppogeno/instadiva1400x1400.png", visible: true },
        { title: "La Mia Ragazza è Una Nerd", file: "assets/img/coverart/Elettrogruppogeno/Cover-LOGO-1400x1400.png", visible: true },
        { title: "Mekkaniko", file: "assets/img/coverart/Elettrogruppogeno/COVER_MEKKANIKO_1400x1400.png", visible: false },
        { title: "Sudococa", file: "assets/img/coverart/Elettrogruppogeno/sudococaCompressed_1400x1400.png", visible: false },
        { title: "Sudococa (Prophectical Remix)", file: "assets/img/coverart/Elettrogruppogeno/Sudococa Remix 1400x1400.png", visible: false },
      ],
    },
  ];

  const COLLAGES = [
    { release: "Marziani Siamo Noi", dir: "assets/img/collage/MARZIANI", panels: 3 },
    { release: "Plancton", dir: "assets/img/collage/PLANCTON", panels: 3 },
  ];

  /* ===================== ARTWORK (rendering) ===================== */
  function artTile(file, title, group) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "photo photo--art";
    btn.dataset.lbGroup = group;

    const img = document.createElement("img");
    img.src = file;
    img.alt = title;
    img.loading = "lazy";

    btn.appendChild(img);
    return btn;
  }

  function artGroup(label, note, accent) {
    const wrap = document.createElement("div");
    wrap.className = "art-group" + (accent ? " art-group--accent" : "");

    const head = document.createElement("div");
    head.className = "art-group__head";

    const h3 = document.createElement("h3");
    h3.className = "art-group__label";
    h3.textContent = label;
    head.appendChild(h3);

    if (note) {
      const p = document.createElement("p");
      p.className = "art-group__note";
      p.textContent = note;
      head.appendChild(p);
    }

    wrap.appendChild(head);
    return wrap;
  }

  function initCoverArt() {
    const mount = document.getElementById("coverartGroups");
    if (!mount) return;

    COVER_ART.forEach((project, idx) => {
      const items = project.items.filter((i) => i.visible !== false);
      if (!items.length) return;

      const group = artGroup(project.label, project.note, project.accent);
      const grid = document.createElement("div");
      grid.className = "photo-grid photo-grid--covers";
      items.forEach((item) => grid.appendChild(artTile(item.file, item.title, `covers-${idx}`)));
      group.appendChild(grid);
      mount.appendChild(group);
    });
  }

  function initCollages() {
    const mount = document.getElementById("collageGroups");
    if (!mount) return;

    COLLAGES.forEach((collage, idx) => {
      const group = artGroup(collage.release, null, true);
      const grid = document.createElement("div");
      grid.className = "collage-grid";
      for (let n = 1; n <= collage.panels; n++) {
        grid.appendChild(
          artTile(`${collage.dir}/${n}.web.jpg`, `${collage.release} — tavola ${n}`, `collage-${idx}`)
        );
      }
      group.appendChild(grid);
      mount.appendChild(group);
    });
  }

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

  /* ===================== LIGHTBOX =====================
     Qualsiasi bottone con data-lb-group apre il visualizzatore;
     frecce e tastiera navigano solo dentro il gruppo cliccato
     (foto, copertine di un progetto, tavole di un collage). */
  function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;

    const lightboxImg = document.getElementById("lightboxImg");
    const caption = document.getElementById("lightboxCaption");
    const closeBtn = lightbox.querySelector(".lightbox__close");
    const nextBtn = lightbox.querySelector(".lightbox__next");
    const prevBtn = lightbox.querySelector(".lightbox__prev");
    let group = [];
    let current = 0;
    let lastFocused = null;

    const render = () => {
      const img = group[current];
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "";
      if (caption) {
        const counter = group.length > 1 ? ` · ${current + 1} / ${group.length}` : "";
        caption.textContent = (img.alt || "") + counter;
      }
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
      current = (current + dir + group.length) % group.length;
      render();
    };

    /* Delegato: funziona anche per le tile generate da JS */
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-lb-group]");
      if (!trigger) return;
      const name = trigger.dataset.lbGroup;
      const triggers = [...document.querySelectorAll(`[data-lb-group="${CSS.escape(name)}"]`)];
      group = triggers.map((t) => t.querySelector("img")).filter(Boolean);
      open(Math.max(0, triggers.indexOf(trigger)));
    });

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
    initCoverArt();
    initCollages();
    initFooterYear();
    initLightbox();
  });
})();
