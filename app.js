const tabLinks = document.querySelectorAll("[data-tab-link]");
const panels = document.querySelectorAll("[data-tab-panel]");
const bookingForm = document.querySelector("#booking-form");
const handlerForm = document.querySelector("#handler-form");
const formOutput = document.querySelector("#form-output");
const lightbox = document.querySelector("#lightbox");
const lightboxMedia = lightbox?.querySelector(".lightbox-media");
const lightboxCaption = lightbox?.querySelector("p");
const lightboxClose = document.querySelector("#lightbox-close");
const creditsTrigger = document.querySelector("#credits-trigger");
const creditsPanel = document.querySelector("#credits-panel");
const creditsClose = document.querySelector("#credits-close");

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
    copyButton.innerHTML = `<span class="social-icon discord">✓</span> Copied`;
    setTimeout(() => {
      copyButton.innerHTML = oldText;
    }, 1400);
  } catch {
    alert(value);
  }
});
const originalBookingForm = bookingForm?.innerHTML;
const originalHandlerForm = handlerForm?.innerHTML;

function resetSubmittedForms() {
  if (bookingForm?.dataset.submitted === "true" && originalBookingForm) {
    bookingForm.innerHTML = originalBookingForm;
    bookingForm.dataset.submitted = "false";
  }

  if (handlerForm?.dataset.submitted === "true" && originalHandlerForm) {
    handlerForm.innerHTML = originalHandlerForm;
    handlerForm.dataset.submitted = "false";
  }
}

bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const data = new FormData(bookingForm);

  await fetch(bookingForm.action, {
    method: "POST",
    body: data,
    headers: { Accept: "application/json" },
  });
bookingForm.dataset.submitted = "true";
  
bookingForm.innerHTML = `
  <div class="form-output show">
    Thank you for booking with Rocky's Media! I'll be in contact within 24-48 hours with more information based on your preferred contact method.
    <br><br>
    If you have any questions, feel free to email me at
    <a href="mailto:officialrockymedia@gmail.com"><em>officialrockymedia@gmail.com</em></a>.
    <br><br>
  </div>
`;
});

document.querySelectorAll(".photo-tile").forEach((tile) => {
  tile.addEventListener("click", () => {
    const image = tile.querySelector("img");
    const svg = tile.querySelector("svg");

    lightboxMedia.innerHTML = "";

    if (image) {
      const enlargedImage = document.createElement("img");
      enlargedImage.src = image.src;
      enlargedImage.alt = image.alt;
      lightboxMedia.appendChild(enlargedImage);
    }

    if (svg) {
      lightboxMedia.appendChild(svg.cloneNode(true));
    }

    lightboxCaption.textContent = tile.dataset.gallery || "Photo preview";

    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    }
  });
});

lightboxClose?.addEventListener("click", () => lightbox.close());

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});

window.addEventListener("focus", resetSubmittedForms);
