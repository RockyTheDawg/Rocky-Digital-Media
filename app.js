const tabLinks = [...document.querySelectorAll("[data-tab-link]")];
const panels = [...document.querySelectorAll("[data-tab-panel]")];
const bookingForm = document.querySelector("#booking-form");
const conventionSelect = document.querySelector("#convention-select");
const conventionDetails = document.querySelector("#convention-details");
const bookingOutput = document.querySelector("#booking-output");
const creditsTrigger = document.querySelector("#credits-trigger");
const creditsPanel = document.querySelector("#credits-panel");
const creditsClose = document.querySelector("#credits-close");
const furtrackGrid = document.querySelector("#furtrack-grid");

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

tabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    activateTab(link.dataset.tabLink);
  });
});

window.addEventListener("hashchange", () => activateTab(location.hash.slice(1), false));
activateTab(location.hash.slice(1) || "home", false);

function buildConventionOptions() {
  if (!conventionSelect || !Array.isArray(window.rockyConventions)) return;

  [2026, 2027].forEach((year) => {
    const group = document.createElement("optgroup");
    group.label = String(year);

    window.rockyConventions
      .filter((convention) => convention.year === year)
      .forEach((convention) => {
        const option = document.createElement("option");
        option.value = convention.name;
        option.textContent = convention.short;
        option.dataset.index = String(window.rockyConventions.indexOf(convention));
        group.appendChild(option);
      });

    conventionSelect.appendChild(group);
  });
}

function getSelectedConvention() {
  const option = conventionSelect?.selectedOptions[0];
  if (!option?.dataset.index) return null;
  return window.rockyConventions[Number(option.dataset.index)];
}

conventionSelect?.addEventListener("change", () => {
  const convention = getSelectedConvention();
  if (!convention || !conventionDetails) return;

  conventionDetails.innerHTML = `
    <strong>${convention.name}</strong>
    <span>${convention.dates}</span>
    <span>${convention.location}</span>
    <a href="${convention.url}" target="_blank" rel="noreferrer">View listing</a>
  `;
});

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const data = new FormData(bookingForm);
  const convention = getSelectedConvention();

  bookingOutput.innerHTML = `
    <strong>Booking draft ready</strong>
    <span>First name: ${escapeHtml(data.get("firstName"))}</span>
    <span>Fursona: ${escapeHtml(data.get("fursonaName"))}</span>
    <span>Species: ${escapeHtml(data.get("species"))}</span>
    <span>Convention: ${escapeHtml(convention?.name || "")}</span>
  `;
});

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

function buildFurtrackGallery() {
  if (!furtrackGrid || !Array.isArray(window.rockyFurtrackMedia)) return;

  window.rockyFurtrackMedia.forEach((media, index) => {
    const card = document.createElement("figure");
    card.className = "furtrack-card";

    const photo = document.createElement("img");
    photo.src = media.thumbnail;
    photo.alt = `Fursuit photograph by RockyTheDog, image ${index + 1}`;
    photo.loading = "lazy";
    photo.decoding = "async";

    card.appendChild(photo);
    furtrackGrid.appendChild(card);
  });
}

buildConventionOptions();
buildFurtrackGallery();

creditsTrigger?.addEventListener("click", () => {
  const isOpen = creditsPanel?.classList.toggle("open") ?? false;
  creditsTrigger.setAttribute("aria-label", isOpen ? "Close website credits" : "Open website credits");
});

creditsClose?.addEventListener("click", () => {
  creditsPanel?.classList.remove("open");
  creditsTrigger?.setAttribute("aria-label", "Open website credits");
});
