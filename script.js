// Minimal site script for Cap'n Blox's Official Site
// Kept intentionally simple to preserve fast load and GitHub Pages compatibility.

document.addEventListener('DOMContentLoaded', () => {
  // Ensure the document title reflects the new site
  document.title = "Cap'n Blox's Official Site";

  // Small accessibility helper: focus the main heading when arriving via fragment
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target && typeof target.focus === 'function') target.focus();
  }

  const faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });
});
