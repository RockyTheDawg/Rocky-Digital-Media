const tabLinks = [...document.querySelectorAll("[data-tab-link]")];
const panels = [...document.querySelectorAll("[data-tab-panel]")];
const bookingForm = document.querySelector("#booking-form");
const conventionSelect = document.querySelector("#convention-select");
const bookingOutput = document.querySelector("#booking-output");
const bookingSubmit = document.querySelector("#booking-submit");
const contactMethod = document.querySelector("#contact-method");
const contactDetailField = document.querySelector("#contact-detail-field");
const contactDetailLabel = document.querySelector("#contact-detail-label");
const contactDetail = document.querySelector("#contact-detail");
const creditsTrigger = document.querySelector("#credits-trigger");
const creditsPanel = document.querySelector("#credits-panel");
const creditsClose = document.querySelector("#credits-close");
const furtrackGrid = document.querySelector("#furtrack-grid");
const aboutPanel = document.querySelector("#about");
const aboutRevealItems = [...document.querySelectorAll(".about-reveal")];
const faqQuestions = [...document.querySelectorAll(".faq-question")];
let aboutRevealObserver;

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

  try {
    const response = await fetch("https://formspree.io/f/xojoqobk", {
      method: "POST",
      body: new FormData(bookingForm),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) throw new Error("Formspree did not accept the request.");

    bookingOutput.innerHTML = `
      <strong>Booking request sent!</strong>
      <span>Thanks! Rocky Digital Media will contact you using your selected method.</span>
    `;
    bookingForm.reset();
    updateContactDetailField();
  } catch {
    bookingOutput?.classList.add("error");
    bookingOutput.innerHTML = `
      <strong>Request not sent</strong>
      <span>Please check your connection and try again.</span>
    `;
  } finally {
    bookingSubmit?.removeAttribute("disabled");
    if (bookingSubmit) bookingSubmit.textContent = originalButtonText || "Send booking request";
  }
});

function buildFurtrackGallery() {
  if (!furtrackGrid || !Array.isArray(window.rockyFurtrackMedia)) return;

  window.rockyFurtrackMedia.forEach((media, index) => {
    const card = document.createElement("figure");
    card.className = "furtrack-card";

    const photo = document.createElement("img");
    photo.src = media.thumbnail;
    photo.alt = `Gallery photograph ${index + 1}`;
    photo.loading = "lazy";
    photo.decoding = "async";

    card.appendChild(photo);
    furtrackGrid.appendChild(card);
  });
}

buildConventionOptions();
buildFurtrackGallery();

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
