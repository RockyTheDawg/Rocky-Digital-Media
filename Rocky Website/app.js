const tabLinks = document.querySelectorAll("[data-tab-link]");
const panels = document.querySelectorAll("[data-tab-panel]");
const pawTrigger = document.querySelector("#paw-trigger");
const pawPanel = document.querySelector("#paw-panel");
const pawClose = document.querySelector("#paw-close");
const bookingForm = document.querySelector("#booking-form");
const formOutput = document.querySelector("#form-output");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector("p");
const lightboxClose = document.querySelector("#lightbox-close");

function activateTab(name) {
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tabPanel === name);
  });

  document.querySelectorAll(".tab").forEach((link) => {
    link.classList.toggle("active", link.dataset.tabLink === name);
  });

  if (location.hash.slice(1) !== name) {
    history.replaceState(null, "", `#${name}`);
  }
}

tabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = link.dataset.tabLink;
    if (!target) return;
    event.preventDefault();
    activateTab(target);
  });
});

window.addEventListener("hashchange", () => {
  const target = location.hash.slice(1);
  const exists = [...panels].some((panel) => panel.dataset.tabPanel === target);
  activateTab(exists ? target : "home");
});

activateTab(location.hash.slice(1) || "home");

pawTrigger?.addEventListener("click", () => {
  const isOpen = pawPanel.classList.toggle("open");
  pawTrigger.setAttribute("aria-label", isOpen ? "Close info panel" : "Open info panel");
});

pawClose?.addEventListener("click", () => {
  pawPanel.classList.remove("open");
  pawTrigger.setAttribute("aria-label", "Open info panel");
});

document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (!copyButton) return;

  const value = copyButton.dataset.copy;
  try {
    await navigator.clipboard.writeText(value);
    copyButton.classList.add("copied");
    const original = copyButton.getAttribute("aria-label") || copyButton.textContent.trim();
    copyButton.setAttribute("aria-label", `Copied ${value}`);
    setTimeout(() => {
      copyButton.classList.remove("copied");
      copyButton.setAttribute("aria-label", original);
    }, 1400);
  } catch {
    alert(value);
  }
});

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const data = new FormData(bookingForm);
  const summary = [
    "Booking request ready:",
    `Name/handle: ${data.get("name")}`,
    `Contact: ${data.get("contact")}`,
    `Convention: ${data.get("convention")}`,
    `Date/time: ${data.get("date")} at ${data.get("time")}`,
    `Package: ${data.get("package")}`,
    `Details: ${data.get("details")}`,
  ].join("\n");

  formOutput.textContent = summary;
  formOutput.classList.add("show");
});

document.querySelectorAll(".photo-tile").forEach((tile) => {
  tile.addEventListener("click", () => {
    const image = tile.querySelector("img");
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = tile.dataset.gallery;

    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    }
  });
});

lightboxClose?.addEventListener("click", () => lightbox.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

if (window.lucide) {
  window.lucide.createIcons();
}
