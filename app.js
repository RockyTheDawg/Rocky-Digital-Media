const tabLinks = document.querySelectorAll("[data-tab-link]");
const panels = document.querySelectorAll("[data-tab-panel]");
const bookingForm = document.querySelector("#booking-form");
const handlerForm = document.querySelector("#handler-form");
const creditsTrigger = document.querySelector("#credits-trigger");
const creditsPanel = document.querySelector("#credits-panel");
const creditsClose = document.querySelector("#credits-close");

// Gallery elements
const galleryGrid = document.querySelector('#gallery-grid');
const galleryModal = document.querySelector('#gallery-modal');
const galleryImage = document.querySelector('#gallery-image');
const galleryClose = document.querySelector('#gallery-close');
const galleryNext = document.querySelector('#gallery-next');
const galleryPrev = document.querySelector('#gallery-prev');
let galleryItems = [];
let currentIndex = -1;

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

    if (
      bookingForm?.dataset.submitted === "true" ||
      handlerForm?.dataset.submitted === "true"
    ) {
      window.location.href = `#${target}`;
      window.location.reload();
      return;
    }

    activateTab(target);
  });
});

window.addEventListener("hashchange", () => {
  const target = location.hash.slice(1);
  const exists = [...panels].some((panel) => panel.dataset.tabPanel === target);
  activateTab(exists ? target : "home");
});

activateTab(location.hash.slice(1) || "home");

// --- Gallery logic ---

async function loadGallery() {
  // Try to fetch a gallery.json at the site root (or fallback to examples)
  try {
    const res = await fetch('/gallery.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        galleryItems = data;
      }
    }
  } catch (e) {
    // ignore
  }

  if (!galleryItems || galleryItems.length === 0) {
    // fallback sample images
    galleryItems = [
      'https://via.placeholder.com/1200x800?text=Gallery+1',
      'https://via.placeholder.com/1200x800?text=Gallery+2',
      'https://via.placeholder.com/1200x800?text=Gallery+3'
    ];
  }

  renderGallery();
}

function renderGallery() {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = '';
  galleryItems.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Gallery image ${i + 1}`;
    img.tabIndex = 0;
    img.dataset.index = i;
    img.addEventListener('click', () => openGallery(i));
    img.addEventListener('keydown', (e) => { if (e.key === 'Enter') openGallery(i); });
    galleryGrid.appendChild(img);
  });
}

function openGallery(index) {
  if (!galleryModal || !galleryImage) return;
  currentIndex = index;
  galleryImage.src = galleryItems[index];
  galleryImage.alt = `Gallery image ${index + 1}`;
  galleryImage.classList.remove('zoomed');
  galleryModal.classList.add('open');
  galleryModal.setAttribute('aria-hidden', 'false');
}

function closeGallery() {
  if (!galleryModal) return;
  galleryModal.classList.remove('open');
  galleryModal.setAttribute('aria-hidden', 'true');
  galleryImage.src = '';
  currentIndex = -1;
}

function showNext(delta = 1) {
  if (galleryItems.length === 0) return;
  currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
  galleryImage.src = galleryItems[currentIndex];
  galleryImage.alt = `Gallery image ${currentIndex + 1}`;
  galleryImage.classList.remove('zoomed');
}

// events
galleryClose?.addEventListener('click', closeGallery);
galleryPrev?.addEventListener('click', () => showNext(-1));
galleryNext?.addEventListener('click', () => showNext(1));

galleryModal?.addEventListener('click', (e) => {
  // close if click outside the image
  if (e.target === galleryModal) closeGallery();
});

galleryImage?.addEventListener('click', () => {
  // toggle zoom
  galleryImage.classList.toggle('zoomed');
});

window.addEventListener('keydown', (e) => {
  if (!galleryModal.classList.contains('open')) return;
  if (e.key === 'ArrowRight') showNext(1);
  if (e.key === 'ArrowLeft') showNext(-1);
  if (e.key === 'Escape') closeGallery();
});

// load gallery on startup
loadGallery();

// --- end gallery logic ---


creditsTrigger?.addEventListener("click", () => {
  const isOpen = creditsPanel.classList.toggle("open");
  creditsTrigger.setAttribute(
    "aria-label",
    isOpen ? "Close website credits" : "Open website credits"
  );
});

creditsClose?.addEventListener("click", () => {
  creditsPanel.classList.remove("open");
  creditsTrigger.setAttribute("aria-label", "Open website credits");
});

document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (!copyButton) return;

  const value = copyButton.dataset.copy;

  try {
    await navigator.clipboard.writeText(value);
    const oldText = copyButton.innerHTML;
    copyButton.innerHTML = "Copied";
    setTimeout(() => {
      copyButton.innerHTML = oldText;
    }, 1400);
  } catch {
    alert(value);
  }
});

function showThanks(form, firstLine) {
  form.dataset.submitted = "true";
  form.innerHTML = `
    <div class="form-output show">
      ${firstLine} The M.E.G. team will review and follow up within 24-48 hours.
      <br><br>
      For questions or developer access, email us at
      <a href="mailto:contact@capnblox.dev"><em>contact@capnblox.dev</em></a>.
      <br><br>
    </div>
  `;
}

async function submitForm(form, firstLine) {
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);

  await fetch(form.action, {
    method: "POST",
    body: data,
    headers: { Accept: "application/json" },
  });

  showThanks(form, firstLine);
}

bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitForm(bookingForm, "Thanks — your submission to Cap'n Blox's team was received!");
});

handlerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitForm(handlerForm, "Thanks — your submission to Cap'n Blox's team was received!");
});
