/*!
* Start Bootstrap - Resume v7.0.6 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
// 

// --- Lightbox migliorata con frecce visibili ---
document.addEventListener("DOMContentLoaded", () => {
  const images = Array.from(document.querySelectorAll(".photo-grid img"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox .close");
  const nextBtn = document.querySelector(".lightbox .next");
  const prevBtn = document.querySelector(".lightbox .prev");
  let currentIndex = 0;

  // Apri lightbox al click su immagine
  images.forEach((img, index) => {
    img.addEventListener("click", () => {
      currentIndex = index;
      lightboxImg.src = img.src;
      lightbox.style.display = "flex";
      document.addEventListener("keydown", handleKeyPress);
    });
  });

  function closeLightbox() {
    lightbox.style.display = "none";
    document.removeEventListener("keydown", handleKeyPress);
  }

  function showSlide(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = images.length - 1;
    if (currentIndex >= images.length) currentIndex = 0;
    lightboxImg.src = images[currentIndex].src;
  }

  function handleKeyPress(e) {
    if (e.key === "ArrowLeft") showSlide(-1);
    if (e.key === "ArrowRight") showSlide(1);
    if (e.key === "Escape") closeLightbox();
  }

  // Aree cliccabili invisibili
  lightbox.addEventListener("click", (e) => {
    const clickX = e.clientX;
    const width = window.innerWidth;
    const clickY = e.clientY;

    const rightZone = width * 0.9;
    const leftZone = width * 0.1;

    if (clickX > width - 120 && clickY < 120) closeLightbox();
    else if (clickX < leftZone) showSlide(-1);
    else if (clickX > rightZone) showSlide(1); 
    else closeLightbox();
  });

  // Frecce visibili
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showSlide(1);
  });
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showSlide(-1);
  });

  // X per chiudere
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeLightbox();
  });
});
