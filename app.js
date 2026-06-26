const tabLinks = document.querySelectorAll("[data-tab-link]");
const panels = document.querySelectorAll("[data-tab-panel]");
const bookingForm = document.querySelector("#booking-form");
const handlerForm = document.querySelector("#handler-form");
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
      ${firstLine} I'll be in contact within 24-48 hours with more information based on your preferred contact method.
      <br><br>
      If you have any questions, feel free to email me at
      <a href="mailto:officialrockymedia@gmail.com"><em>officialrockymedia@gmail.com</em></a>.
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
  await submitForm(bookingForm, "Thank you for booking with Rocky's Media!");
});

handlerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitForm(
    handlerForm,
    "Thank you for submitting a handler request with Rocky's Media!"
  );
});
