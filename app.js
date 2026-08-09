const tabLinks = [...document.querySelectorAll("[data-tab-link]")];
const panels = [...document.querySelectorAll("[data-tab-panel]")];
const bookingForm = document.querySelector("#booking-form");
const conventionSelect = document.querySelector("#convention-select");
const bookingOutput = document.querySelector("#booking-output");
const bookingSubmit = document.querySelector("#booking-submit");
const contactForm = document.querySelector("#contact-form");
const contactOutput = document.querySelector("#contact-output");
const contactSubmit = document.querySelector("#contact-submit");
const contactMethod = document.querySelector("#contact-method");
const contactDetailField = document.querySelector("#contact-detail-field");
const contactDetailLabel = document.querySelector("#contact-detail-label");
const contactDetail = document.querySelector("#contact-detail");
const creditsTrigger = document.querySelector("#credits-trigger");
const creditsPanel = document.querySelector("#credits-panel");
const creditsClose = document.querySelector("#credits-close");
const furtrackGrid = document.querySelector("#furtrack-grid");
const galleryLightbox = document.querySelector("#gallery-lightbox");
const galleryLightboxImage = document.querySelector("#gallery-lightbox-image");
const galleryLightboxCounter = document.querySelector("#gallery-lightbox-counter");
const galleryLightboxClose = document.querySelector("#gallery-lightbox-close");
const galleryLightboxPrevious = document.querySelector("#gallery-lightbox-previous");
const galleryLightboxNext = document.querySelector("#gallery-lightbox-next");
const aboutPanel = document.querySelector("#about");
const aboutRevealItems = aboutPanel
  ? [...aboutPanel.querySelectorAll(".about-intro > *, .about-card > *, .about-closing > *")]
  : [];
const faqQuestions = [...document.querySelectorAll(".faq-question")];
let aboutRevealObserver;
let activeGalleryIndex = 0;
let lastGalleryTrigger = null;

aboutRevealItems.forEach((item, index) => {
  item.classList.add("about-reveal");
  item.style.setProperty("--reveal-order", String(index % 3));
});

function resetSubmittedForm(tabName) {
  if (tabName === "booking" && bookingForm?.dataset.submitted === "true") {
    bookingForm.reset();
    delete bookingForm.dataset.submitted;
    updateContactDetailField();
    if (bookingOutput) bookingOutput.innerHTML = "";
    bookingOutput?.classList.remove("error");
    bookingSubmit?.removeAttribute("disabled");
    if (bookingSubmit) bookingSubmit.textContent = "Send booking request";
  }

  if (tabName === "contact" && contactForm?.dataset.submitted === "true") {
    contactForm.reset();
    delete contactForm.dataset.submitted;
    if (contactOutput) contactOutput.innerHTML = "";
    contactOutput?.classList.remove("error");
    contactSubmit?.removeAttribute("disabled");
    if (contactSubmit) contactSubmit.textContent = "Send message";
  }
}

function activateTab(name, updateHash = true) {
  const validName = panels.some((panel) => panel.dataset.tabPanel === name) ? name : "home";
  const previousName = panels.find((panel) => panel.classList.contains("active"))?.dataset.tabPanel;

  if (previousName && previousName !== validName) {
    resetSubmittedForm(previousName);
  }

  if (validName !== "gallery") closeGalleryLightbox(false);

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

  if (validName === "about") {
    requestAnimationFrame(restartAboutReveal);
  }
}

function initializeAboutReveal() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!aboutPanel || reducedMotion || !("IntersectionObserver" in window)) {
    aboutRevealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  aboutRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      aboutRevealObserver.unobserve(entry.target);
    });
  }, {
    root: aboutPanel,
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.12
  });
}

function restartAboutReveal() {
  if (!aboutRevealObserver) return;

  if (aboutPanel) aboutPanel.scrollTop = 0;

  aboutRevealItems.forEach((item) => {
    item.classList.remove("is-visible");
    aboutRevealObserver.unobserve(item);
    aboutRevealObserver.observe(item);
  });
}

initializeAboutReveal();

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

  const availableConventions = window.rockyConventions.filter(isConventionAvailable);
  const availableYears = [...new Set(availableConventions.map((convention) => convention.year))]
    .sort((left, right) => left - right);

  availableYears.forEach((year) => {
    const group = document.createElement("optgroup");
    group.label = String(year);

    availableConventions
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

function isConventionAvailable(convention) {
  if (convention.status === "canceled" || convention.status === "cancelled") return false;

  const endDate = parseConventionEndDate(convention.dates);
  return endDate ? endDate >= new Date() : true;
}

function parseConventionEndDate(dateRange) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const year = Number(dateRange.match(/,\s*(\d{4})$/)?.[1]);
  const months = dateRange.match(new RegExp(monthNames.join("|"), "g"));
  const dateWithoutYear = dateRange.replace(/,\s*\d{4}$/, "");
  const days = [...dateWithoutYear.matchAll(/\d+/g)].map((match) => Number(match[0]));
  const monthIndex = monthNames.indexOf(months?.at(-1));
  const finalDay = days.at(-1);

  if (!year || monthIndex < 0 || !finalDay) return null;
  return new Date(year, monthIndex, finalDay, 23, 59, 59, 999);
}

const contactFieldOptions = {
  email: {
    label: "Fill in the blank with your email address",
    name: "email",
    type: "email",
    autocomplete: "email",
    placeholder: "you@example.com"
  },
  telegram: {
    label: "Telegram username",
    name: "telegramUsername",
    type: "text",
    autocomplete: "off",
    placeholder: "@username"
  },
  discord: {
    label: "Discord username",
    name: "discordUsername",
    type: "text",
    autocomplete: "off",
    placeholder: "username"
  }
};

function updateContactDetailField() {
  if (!contactDetailField || !contactDetailLabel || !contactDetail) return;

  const option = contactFieldOptions[contactMethod?.value];
  contactDetail.value = "";
  contactDetailField.hidden = !option;
  contactDetail.disabled = !option;
  contactDetail.required = Boolean(option);

  if (!option) return;

  contactDetailLabel.textContent = option.label;
  contactDetail.name = option.name;
  contactDetail.type = option.type;
  contactDetail.autocomplete = option.autocomplete;
  contactDetail.placeholder = option.placeholder;
}

contactMethod?.addEventListener("change", updateContactDetailField);
updateContactDetailField();

bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const originalButtonText = bookingSubmit?.textContent;
  bookingSubmit?.setAttribute("disabled", "");
  if (bookingSubmit) bookingSubmit.textContent = "Sending…";
  bookingOutput?.classList.remove("error");
  delete bookingForm.dataset.submitted;

  try {
    const response = await fetch(bookingForm.action, {
      method: "POST",
      body: new FormData(bookingForm),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) throw new Error("Formspree did not accept the request.");

    bookingForm.dataset.submitted = "true";
    bookingOutput.innerHTML = `
      <strong>Booking request sent!</strong>
      <span>Thanks! Rocky Digital Media will contact you using your selected method.</span>
    `;
  } catch {
    bookingOutput?.classList.add("error");
    bookingOutput.innerHTML = `
      <strong>Request not sent</strong>
      <span>Please check your connection and try again.</span>
    `;
  } finally {
    if (bookingForm.dataset.submitted === "true") {
      bookingSubmit?.setAttribute("disabled", "");
      if (bookingSubmit) bookingSubmit.textContent = "Submitted";
    } else {
      bookingSubmit?.removeAttribute("disabled");
      if (bookingSubmit) bookingSubmit.textContent = originalButtonText || "Send booking request";
    }
  }
});

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  const originalButtonText = contactSubmit?.textContent;
  contactSubmit?.setAttribute("disabled", "");
  if (contactSubmit) contactSubmit.textContent = "Sending…";
  contactOutput?.classList.remove("error");
  delete contactForm.dataset.submitted;

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) throw new Error("Formspree did not accept the message.");

    contactForm.dataset.submitted = "true";
    contactOutput.innerHTML = `
      <strong>Message sent!</strong>
      <span>Thanks for reaching out. Rocky Digital Media will reply to the email address you provided.</span>
    `;
  } catch {
    contactOutput?.classList.add("error");
    contactOutput.innerHTML = `
      <strong>Message not sent</strong>
      <span>Please check your connection and try again.</span>
    `;
  } finally {
    if (contactForm.dataset.submitted === "true") {
      contactSubmit?.setAttribute("disabled", "");
      if (contactSubmit) contactSubmit.textContent = "Submitted";
    } else {
      contactSubmit?.removeAttribute("disabled");
      if (contactSubmit) contactSubmit.textContent = originalButtonText || "Send message";
    }
  }
});

function buildFurtrackGallery() {
  if (!furtrackGrid || !Array.isArray(window.rockyFurtrackMedia)) return;

  window.rockyFurtrackMedia.forEach((media, index) => {
    const card = document.createElement("figure");
    card.className = "furtrack-card";

    const openButton = document.createElement("button");
    openButton.className = "furtrack-open";
    openButton.type = "button";
    openButton.setAttribute("aria-label", `Expand gallery photograph ${index + 1}`);

    const photo = document.createElement("img");
    photo.src = media.thumbnail;
    photo.alt = `Gallery photograph ${index + 1}`;
    photo.loading = "lazy";
    photo.decoding = "async";
    photo.draggable = false;

    const watermark = document.createElement("span");
    watermark.className = "furtrack-watermark";
    watermark.textContent = "© Rocky Digital Media";
    watermark.setAttribute("aria-hidden", "true");

    photo.addEventListener("error", () => {
      card.classList.add("load-error");
      photo.alt = `Gallery photograph ${index + 1} is temporarily unavailable`;
    });

    openButton.addEventListener("click", () => openGalleryLightbox(index, openButton));

    openButton.append(photo, watermark);
    card.appendChild(openButton);
    furtrackGrid.appendChild(card);
  });
}

function updateGalleryLightbox(index) {
  const mediaItems = window.rockyFurtrackMedia || [];
  if (!galleryLightboxImage || !galleryLightboxCounter || mediaItems.length === 0) return;

  activeGalleryIndex = (index + mediaItems.length) % mediaItems.length;
  const media = mediaItems[activeGalleryIndex];
  galleryLightboxImage.src = media.full || media.thumbnail;
  galleryLightboxImage.alt = `Expanded gallery photograph ${activeGalleryIndex + 1}`;
  galleryLightboxCounter.textContent = `${activeGalleryIndex + 1} of ${mediaItems.length}`;
}

function openGalleryLightbox(index, trigger) {
  if (!galleryLightbox) return;

  lastGalleryTrigger = trigger;
  updateGalleryLightbox(index);
  galleryLightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  galleryLightboxClose?.focus();
}

function closeGalleryLightbox(returnFocus = true) {
  if (!galleryLightbox || galleryLightbox.hidden) return;

  galleryLightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  if (galleryLightboxImage) galleryLightboxImage.src = "";
  if (returnFocus) lastGalleryTrigger?.focus();
  lastGalleryTrigger = null;
}

function moveGalleryLightbox(direction) {
  updateGalleryLightbox(activeGalleryIndex + direction);
}

buildConventionOptions();
buildFurtrackGallery();

galleryLightboxClose?.addEventListener("click", () => closeGalleryLightbox());
galleryLightboxPrevious?.addEventListener("click", () => moveGalleryLightbox(-1));
galleryLightboxNext?.addEventListener("click", () => moveGalleryLightbox(1));
galleryLightbox?.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) closeGalleryLightbox();
});

furtrackGrid?.addEventListener("contextmenu", (event) => event.preventDefault());
galleryLightboxImage?.addEventListener("contextmenu", (event) => event.preventDefault());

document.addEventListener("keydown", (event) => {
  if (!galleryLightbox || galleryLightbox.hidden) return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveGalleryLightbox(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    moveGalleryLightbox(1);
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeGalleryLightbox();
  }
});

faqQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const shouldOpen = question.getAttribute("aria-expanded") !== "true";

    faqQuestions.forEach((otherQuestion) => {
      const answerId = otherQuestion.getAttribute("aria-controls");
      const answer = answerId ? document.getElementById(answerId) : null;
      otherQuestion.setAttribute("aria-expanded", "false");
      if (answer) answer.hidden = true;
    });

    if (!shouldOpen) return;

    const answerId = question.getAttribute("aria-controls");
    const answer = answerId ? document.getElementById(answerId) : null;
    question.setAttribute("aria-expanded", "true");
    if (answer) answer.hidden = false;
  });
});

creditsTrigger?.addEventListener("click", () => {
  const isOpen = creditsPanel?.classList.toggle("open") ?? false;
  creditsTrigger.setAttribute("aria-label", isOpen ? "Close website credits" : "Open website credits");
});

creditsClose?.addEventListener("click", () => {
  creditsPanel?.classList.remove("open");
  creditsTrigger?.setAttribute("aria-label", "Open website credits");
});
