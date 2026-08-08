const tabLinks = [...document.querySelectorAll("[data-tab-link]")];
const tabJumps = [...document.querySelectorAll("[data-tab-jump]")];
const panels = [...document.querySelectorAll("[data-tab-panel]")];
const creditsTrigger = document.querySelector("#credits-trigger");
const creditsPanel = document.querySelector("#credits-panel");
const creditsClose = document.querySelector("#credits-close");

function activateTab(name, updateHash = true) {
  const validName = panels.some((panel) => panel.dataset.tabPanel === name) ? name : "home";

  panels.forEach((panel) => {
    const active = panel.dataset.tabPanel === validName;
    panel.classList.toggle("active", active);
    panel.setAttribute("aria-hidden", String(!active));
  });

  tabLinks.forEach((link) => {
    const active = link.dataset.tabLink === validName;
    link.classList.toggle("active", active);
    link.setAttribute("aria-current", active ? "page" : "false");
  });

  if (updateHash && location.hash.slice(1) !== validName) {
    history.replaceState(null, "", `#${validName}`);
  }
}

[...tabLinks, ...tabJumps].forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = link.dataset.tabLink || link.dataset.tabJump;
    if (!target) return;
    event.preventDefault();
    activateTab(target);
  });
});

window.addEventListener("hashchange", () => activateTab(location.hash.slice(1), false));
activateTab(location.hash.slice(1) || "home", false);

const galleryItems = [
  {
    src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=84",
    alt: "Crowd gathered beneath warm string lights",
    caption: "Convention nights"
  },
  {
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=84",
    alt: "Friends sharing a candid moment outdoors",
    caption: "Friends in frame"
  },
  {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=84",
    alt: "Traveler looking across a mountain landscape",
    caption: "The long way home"
  },
  {
    src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=84",
    alt: "Still lake and cabin surrounded by mountains",
    caption: "Quiet places"
  },
  {
    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=84",
    alt: "City skyline at dusk",
    caption: "Between destinations"
  },
  {
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=84",
    alt: "Open road running through a desert landscape",
    caption: "Road stories"
  }
];

const galleryGrid = document.querySelector("#gallery-grid");
const galleryModal = document.querySelector("#gallery-modal");
const galleryImage = document.querySelector("#gallery-image");
const galleryCaption = document.querySelector("#gallery-caption");
const galleryClose = document.querySelector("#gallery-close");
const galleryNext = document.querySelector("#gallery-next");
const galleryPrev = document.querySelector("#gallery-prev");
let currentIndex = 0;
let lastGalleryTrigger = null;

galleryItems.forEach((item, index) => {
  const button = document.createElement("button");
  button.className = "gallery-card";
  button.type = "button";
  button.innerHTML = `<img src="${item.src}" alt="${item.alt}" loading="lazy"><span>${item.caption}</span>`;
  button.addEventListener("click", () => openGallery(index, button));
  galleryGrid?.appendChild(button);
});

function updateGallery() {
  const item = galleryItems[currentIndex];
  if (!item || !galleryImage || !galleryCaption) return;
  galleryImage.src = item.src;
  galleryImage.alt = item.alt;
  galleryCaption.textContent = item.caption;
}

function openGallery(index, trigger) {
  if (!galleryModal) return;
  currentIndex = index;
  lastGalleryTrigger = trigger;
  updateGallery();
  galleryModal.classList.add("open");
  galleryModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  galleryClose?.focus();
}

function closeGallery() {
  if (!galleryModal) return;
  galleryModal.classList.remove("open");
  galleryModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lastGalleryTrigger?.focus();
}

function showGallery(delta) {
  currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
  updateGallery();
}

galleryClose?.addEventListener("click", closeGallery);
galleryPrev?.addEventListener("click", () => showGallery(-1));
galleryNext?.addEventListener("click", () => showGallery(1));
galleryModal?.addEventListener("click", (event) => {
  if (event.target === galleryModal) closeGallery();
});

window.addEventListener("keydown", (event) => {
  if (!galleryModal?.classList.contains("open")) return;
  if (event.key === "ArrowRight") showGallery(1);
  if (event.key === "ArrowLeft") showGallery(-1);
  if (event.key === "Escape") closeGallery();
});

creditsTrigger?.addEventListener("click", () => {
  const isOpen = creditsPanel?.classList.toggle("open") ?? false;
  creditsTrigger.setAttribute("aria-label", isOpen ? "Close website credits" : "Open website credits");
});

creditsClose?.addEventListener("click", () => {
  creditsPanel?.classList.remove("open");
  creditsTrigger?.setAttribute("aria-label", "Open website credits");
});

document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (!copyButton) return;

  const label = copyButton.querySelector("strong");
  const originalText = label?.textContent;

  try {
    await navigator.clipboard.writeText(copyButton.dataset.copy);
    if (label) label.textContent = "Copied!";
    window.setTimeout(() => {
      if (label) label.textContent = originalText;
    }, 1400);
  } catch {
    window.prompt("Copy this Discord username:", copyButton.dataset.copy);
  }
});
