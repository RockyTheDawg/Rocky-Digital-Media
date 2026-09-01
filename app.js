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
const tabs = document.querySelector(".tabs");
const galleryPanel = document.querySelector("#gallery");
const aboutPanel = document.querySelector("#about");
const policyPanel = document.querySelector("#policy");
const policyViewport = document.querySelector("#policy-viewport");
const policyDocument = document.querySelector("#policy-document");
const policyPageWraps = [...document.querySelectorAll(".policy-page-wrap")];
const policyPages = [...document.querySelectorAll(".policy-page")];
const policyZoomControls = document.querySelector("#policy-zoom-controls");
const policyZoomOut = document.querySelector("#policy-zoom-out");
const policyZoomIn = document.querySelector("#policy-zoom-in");
const policyZoomLevel = document.querySelector("#policy-zoom-level");
const faqQuestions = [...document.querySelectorAll(".faq-question")];
const autoHideNavPanels = [galleryPanel, aboutPanel, policyPanel].filter(Boolean);
let activeGalleryIndex = 0;
let lastGalleryTrigger = null;
let lastAutoHideScrollPosition = 0;
let autoHideScrollFrame = null;
let policyZoom = 1;
let policyResizeFrame = null;
let policyPinchStartDistance = 0;
let policyPinchStartZoom = 1;
let policyPinchAnchorX = null;
let policyPinchFrame = null;
let pendingPolicyPinchZoom = 1;

const policyZoomMinimum = 1;
const policyZoomMaximum = 2;
const policyZoomStep = 0.25;

const formConfirmations = {
  booking: {
    form: bookingForm,
    output: bookingOutput,
    submit: bookingSubmit,
    message: `
      <strong>Booking request sent!</strong>
      <span>Thanks! Rocky Digital Media will contact you using your selected method.</span>
    `
  },
  contact: {
    form: contactForm,
    output: contactOutput,
    submit: contactSubmit,
    message: `
      <strong>Message sent!</strong>
      <span>Thanks for reaching out. Rocky Digital Media will reply to the email address you provided.</span>
    `
  }
};

function showFormConfirmation(name) {
  const confirmation = formConfirmations[name];
  if (!confirmation?.form || !confirmation.output || !confirmation.submit) return;

  confirmation.form.reset();
  if (name === "booking") updateContactDetailField();
  confirmation.form.dataset.submitted = "true";
  confirmation.output.classList.remove("error");
  confirmation.output.innerHTML = confirmation.message;
  confirmation.submit.setAttribute("disabled", "");
  confirmation.submit.textContent = "Submitted";
}

function reloadWithFormConfirmation(name) {
  const url = new URL(window.location.href);
  url.searchParams.set("submitted", name);
  url.hash = name;
  window.location.replace(url.toString());
}

function restoreFormConfirmation() {
  const url = new URL(window.location.href);
  const name = url.searchParams.get("submitted");
  if (!formConfirmations[name]) return;

  url.searchParams.delete("submitted");
  url.hash = name;
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  activateTab(name, false);
  showFormConfirmation(name);
}

function getEmailValidationMessage(value) {
  const email = value.trim();
  if (email.toLowerCase() === "you@example.com") return "";

  const parts = email.split("@");
  if (parts.length !== 2) {
    return "Enter a valid email address. For testing, use only you@example.com.";
  }

  const [localPart, domain] = parts;
  const validLocalPart = /^(?!\.)(?!.*\.\.)[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+(?<!\.)$/i;
  const validDomain = /^(?=.{1,253}$)(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i;
  const reservedDomain = /(^|\.)(example\.(com|net|org)|invalid|localhost|test)$/i;

  if (
    email.length > 254 ||
    localPart.length > 64 ||
    !validLocalPart.test(localPart) ||
    !validDomain.test(domain) ||
    reservedDomain.test(domain)
  ) {
    return "Enter a valid email address. For testing, use only you@example.com.";
  }

  return "";
}

function validateEmailFields(form) {
  if (!form) return true;

  const emailFields = [...form.querySelectorAll('input[type="email"]:not(:disabled)')];
  emailFields.forEach((field) => field.setCustomValidity(getEmailValidationMessage(field.value)));
  return emailFields.every((field) => field.validity.valid);
}

[bookingForm, contactForm].forEach((form) => {
  form?.addEventListener("input", (event) => {
    if (event.target.matches('input[type="email"]')) event.target.setCustomValidity("");
  });
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

function getActiveAutoHidePanel() {
  return autoHideNavPanels.find((panel) => panel.classList.contains("active"));
}

function getAutoHideScrollPosition() {
  const activePanel = getActiveAutoHidePanel();
  return Math.max(window.scrollY, activePanel?.scrollTop || 0);
}

function showTabs() {
  tabs?.classList.remove("scroll-hidden");
}

function keepActiveTabVisible(link, behaviour = "auto") {
  if (!tabs || !link || tabs.scrollWidth <= tabs.clientWidth) return;

  const maximumScroll = Math.max(0, tabs.scrollWidth - tabs.clientWidth);
  const centredPosition = link.offsetLeft - ((tabs.clientWidth - link.offsetWidth) / 2);
  const targetPosition = Math.min(maximumScroll, Math.max(0, centredPosition));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  try {
    tabs.scrollTo({
      left: targetPosition,
      behavior: prefersReducedMotion ? "auto" : behaviour
    });
  } catch (error) {
    tabs.scrollLeft = targetPosition;
  }
}

function updateAutoHideTabsOnScroll() {
  autoHideScrollFrame = null;

  const activePanel = getActiveAutoHidePanel();
  if (!activePanel) {
    showTabs();
    return;
  }

  const currentPosition = getAutoHideScrollPosition();
  const scrollDifference = currentPosition - lastAutoHideScrollPosition;

  if (activePanel === policyPanel) {
    const policyTopAreaVisible = currentPosition <= 24 ||
      (policyZoomControls?.getBoundingClientRect().bottom || 0) > 0;

    if (policyTopAreaVisible) {
      showTabs();
    } else {
      tabs?.classList.add("scroll-hidden");
    }

    lastAutoHideScrollPosition = currentPosition;
    return;
  }

  if (currentPosition <= 24 || scrollDifference < -2) {
    showTabs();
  } else if (scrollDifference > 2) {
    tabs?.classList.add("scroll-hidden");
  }

  lastAutoHideScrollPosition = currentPosition;
}

function scheduleAutoHideTabsUpdate() {
  if (autoHideScrollFrame !== null) return;
  autoHideScrollFrame = requestAnimationFrame(updateAutoHideTabsOnScroll);
}

function updatePolicyZoom(anchorX = null) {
  policyResizeFrame = null;
  if (!policyViewport || !policyDocument || policyPages.length === 0) return;

  const viewportWidth = policyViewport.clientWidth;
  if (viewportWidth === 0) return;

  const firstPage = policyPages[0];
  const pageAspectRatio = firstPage.naturalWidth && firstPage.naturalHeight
    ? firstPage.naturalWidth / firstPage.naturalHeight
    : 17 / 22;
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const availableHeight = Math.max(window.innerHeight - (10 * rootFontSize), 240);
  const fittedWidth = Math.min(viewportWidth, availableHeight * pageAspectRatio);
  const zoom = policyZoom;
  const pageWidth = fittedWidth * zoom;
  const anchorPosition = Number.isFinite(anchorX)
    ? Math.min(viewportWidth, Math.max(0, anchorX))
    : viewportWidth / 2;
  const previousAnchor = policyViewport.scrollWidth > 0
    ? (policyViewport.scrollLeft + anchorPosition) / policyViewport.scrollWidth
    : 0.5;

  policyDocument.style.width = `${Math.max(viewportWidth, pageWidth)}px`;
  policyPageWraps.forEach((pageWrap) => {
    pageWrap.style.width = `${pageWidth}px`;
  });

  if (policyZoomLevel) policyZoomLevel.textContent = `${Math.round(zoom * 100)}%`;
  if (policyZoomOut) policyZoomOut.disabled = zoom <= policyZoomMinimum;
  if (policyZoomIn) policyZoomIn.disabled = zoom >= policyZoomMaximum;

  requestAnimationFrame(() => {
    policyViewport.scrollLeft = Math.max(
      0,
      (previousAnchor * policyViewport.scrollWidth) - anchorPosition
    );
  });
}

function schedulePolicyZoomUpdate() {
  if (policyResizeFrame !== null) return;
  policyResizeFrame = requestAnimationFrame(updatePolicyZoom);
}

function changePolicyZoom(direction, anchorX = null) {
  policyZoom = Math.min(
    policyZoomMaximum,
    Math.max(policyZoomMinimum, policyZoom + (direction * policyZoomStep))
  );
  updatePolicyZoom(anchorX);
}

function getPolicyTouchDistance(touches) {
  const horizontalDistance = touches[1].clientX - touches[0].clientX;
  const verticalDistance = touches[1].clientY - touches[0].clientY;
  return Math.hypot(horizontalDistance, verticalDistance);
}

function getPolicyTouchAnchor(touches) {
  if (!policyViewport) return null;
  const viewportBounds = policyViewport.getBoundingClientRect();
  return ((touches[0].clientX + touches[1].clientX) / 2) - viewportBounds.left;
}

function handlePolicyTouchStart(event) {
  if (event.touches.length !== 2) return;

  event.preventDefault();
  policyPinchStartDistance = getPolicyTouchDistance(event.touches);
  policyPinchStartZoom = policyZoom;
  pendingPolicyPinchZoom = policyZoom;
  policyPinchAnchorX = getPolicyTouchAnchor(event.touches);
}

function handlePolicyTouchMove(event) {
  if (event.touches.length !== 2 || policyPinchStartDistance <= 0) return;

  event.preventDefault();
  const distance = getPolicyTouchDistance(event.touches);
  const zoomRatio = distance / policyPinchStartDistance;
  const limitedZoom = Math.min(
    policyZoomMaximum,
    Math.max(policyZoomMinimum, policyPinchStartZoom * zoomRatio)
  );

  pendingPolicyPinchZoom = Math.round(limitedZoom * 20) / 20;
  policyPinchAnchorX = getPolicyTouchAnchor(event.touches);
  if (policyPinchFrame !== null) return;

  policyPinchFrame = requestAnimationFrame(() => {
    policyPinchFrame = null;
    if (Math.abs(policyZoom - pendingPolicyPinchZoom) < 0.01) return;
    policyZoom = pendingPolicyPinchZoom;
    updatePolicyZoom(policyPinchAnchorX);
  });
}

function handlePolicyTouchEnd(event) {
  if (event.touches.length >= 2 || policyPinchStartDistance <= 0) return;

  policyPinchStartDistance = 0;
  if (policyPinchFrame !== null) {
    cancelAnimationFrame(policyPinchFrame);
    policyPinchFrame = null;
    policyZoom = pendingPolicyPinchZoom;
  }
  policyZoom = Math.min(
    policyZoomMaximum,
    Math.max(policyZoomMinimum, Math.round(policyZoom / policyZoomStep) * policyZoomStep)
  );
  updatePolicyZoom(policyPinchAnchorX);
  policyPinchAnchorX = null;
}

function preventPolicyNativeGesture(event) {
  event.preventDefault();
}

function resetPolicyZoom() {
  if (policyPinchFrame !== null) {
    cancelAnimationFrame(policyPinchFrame);
    policyPinchFrame = null;
  }

  policyZoom = policyZoomMinimum;
  policyPinchStartDistance = 0;
  policyPinchStartZoom = policyZoomMinimum;
  pendingPolicyPinchZoom = policyZoomMinimum;
  policyPinchAnchorX = null;
  if (policyViewport) policyViewport.scrollLeft = 0;
  if (policyZoomLevel) policyZoomLevel.textContent = "100%";
  if (policyZoomOut) policyZoomOut.disabled = true;
  if (policyZoomIn) policyZoomIn.disabled = false;
}

function activateTab(name, updateHash = true) {
  const validName = panels.some((panel) => panel.dataset.tabPanel === name) ? name : "home";
  const previousName = panels.find((panel) => panel.classList.contains("active"))?.dataset.tabPanel;

  document.body.dataset.activeTab = validName;

  if (previousName && previousName !== validName) {
    resetSubmittedForm(previousName);
  }

  if (validName !== "gallery") closeGalleryLightbox(false);

  if (validName === "policy" && previousName !== "policy") {
    resetPolicyZoom();
  }

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

  const activeTabLink = tabLinks.find((link) => link.dataset.tabLink === validName);
  requestAnimationFrame(() => keepActiveTabVisible(activeTabLink, previousName === validName ? "auto" : "smooth"));

  if (updateHash && location.hash.slice(1) !== validName) {
    history.replaceState(null, "", `#${validName}`);
  }

  showTabs();
  lastAutoHideScrollPosition = ["gallery", "about", "policy"].includes(validName)
    ? getAutoHideScrollPosition()
    : 0;
  if (validName === "policy") {
    requestAnimationFrame(updatePolicyZoom);
    requestAnimationFrame(updateAutoHideTabsOnScroll);
  }
}

tabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    activateTab(link.dataset.tabLink);
  });
});

window.addEventListener("hashchange", () => activateTab(location.hash.slice(1), false));
window.addEventListener("scroll", scheduleAutoHideTabsUpdate, { passive: true });
window.addEventListener("resize", () => {
  schedulePolicyZoomUpdate();
  const activeTabLink = tabLinks.find((link) => link.classList.contains("active"));
  requestAnimationFrame(() => keepActiveTabVisible(activeTabLink));
}, { passive: true });
autoHideNavPanels.forEach((panel) => {
  panel.addEventListener("scroll", scheduleAutoHideTabsUpdate, { passive: true });
});
tabs?.addEventListener("focusin", showTabs);
policyZoomOut?.addEventListener("click", () => changePolicyZoom(-1));
policyZoomIn?.addEventListener("click", () => changePolicyZoom(1));
policyViewport?.addEventListener("touchstart", handlePolicyTouchStart, { passive: false });
policyViewport?.addEventListener("touchmove", handlePolicyTouchMove, { passive: false });
policyViewport?.addEventListener("touchend", handlePolicyTouchEnd, { passive: true });
policyViewport?.addEventListener("touchcancel", handlePolicyTouchEnd, { passive: true });
policyViewport?.addEventListener("gesturestart", preventPolicyNativeGesture, { passive: false });
policyViewport?.addEventListener("gesturechange", preventPolicyNativeGesture, { passive: false });
policyPages.forEach((page) => {
  if (!page.complete) page.addEventListener("load", schedulePolicyZoomUpdate, { once: true });
});
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
  const yearMatch = dateRange.match(/,\s*(\d{4})$/);
  const year = Number(yearMatch ? yearMatch[1] : 0);
  const months = dateRange.match(new RegExp(monthNames.join("|"), "g"));
  const dateWithoutYear = dateRange.replace(/,\s*\d{4}$/, "");
  const days = (dateWithoutYear.match(/\d+/g) || []).map((day) => Number(day));
  const finalMonth = months && months.length > 0 ? months[months.length - 1] : "";
  const monthIndex = monthNames.indexOf(finalMonth);
  const finalDay = days.length > 0 ? days[days.length - 1] : 0;

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
restoreFormConfirmation();

bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateEmailFields(bookingForm) || !bookingForm.checkValidity()) {
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
    reloadWithFormConfirmation("booking");
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
  if (!validateEmailFields(contactForm) || !contactForm.checkValidity()) {
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
    reloadWithFormConfirmation("contact");
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
