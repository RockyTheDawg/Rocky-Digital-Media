window.rockyFurtrackMedia = [
  { id: "2211229", thumbnail: "https://orca2.furtrack.com/thumb/2211229.jpg" },
  { id: "2211228", thumbnail: "https://orca2.furtrack.com/thumb/2211228.jpg" },
  { id: "2211227", thumbnail: "https://orca2.furtrack.com/thumb/2211227.jpg" },
  { id: "2211226", thumbnail: "https://orca2.furtrack.com/thumb/2211226.jpg" },
  { id: "2211225", thumbnail: "https://orca2.furtrack.com/thumb/2211225.jpg" },
  { id: "2211224", thumbnail: "https://orca2.furtrack.com/thumb/2211224.jpg" },
  { id: "2211223", thumbnail: "https://orca2.furtrack.com/thumb/2211223.jpg" },
  { id: "2211222", thumbnail: "https://orca2.furtrack.com/thumb/2211222.jpg" },
  { id: "2117432", thumbnail: "https://orca2.furtrack.com/thumb/2117432.jpg" },
  { id: "2116197", thumbnail: "https://orca2.furtrack.com/thumb/2116197.jpg" },
  { id: "2116196", thumbnail: "https://orca2.furtrack.com/thumb/2116196.jpg" },
  { id: "2116195", thumbnail: "https://orca2.furtrack.com/thumb/2116195.jpg" },
  { id: "2116194", thumbnail: "https://orca2.furtrack.com/thumb/2116194.jpg" },
  { id: "2116193", thumbnail: "https://orca2.furtrack.com/thumb/2116193.jpg" },
  { id: "2116192", thumbnail: "https://orca2.furtrack.com/thumb/2116192.jpg" },
  { id: "2116191", thumbnail: "https://orca2.furtrack.com/thumb/2116191.jpg" },
  { id: "2116190", thumbnail: "https://orca2.furtrack.com/thumb/2116190.jpg" },
  { id: "1745535", thumbnail: "https://orca2.furtrack.com/thumb/1745535.jpg" },
  { id: "1745534", thumbnail: "https://orca2.furtrack.com/thumb/1745534.jpg" },
  { id: "1745533", thumbnail: "https://orca2.furtrack.com/thumb/1745533.jpg" },
  { id: "1745532", thumbnail: "https://orca2.furtrack.com/thumb/1745532.jpg" }
];

document.addEventListener("DOMContentLoaded", () => {
  const galleryDisclaimer = document.querySelector(".gallery-disclaimer");
  if (galleryDisclaimer && !document.querySelector(".gallery-device-note")) {
    const deviceNote = document.createElement("p");
    deviceNote.className = "gallery-disclaimer gallery-device-note";
    deviceNote.textContent = "Please note: Some photos may be taken using the fursuiter’s device, while others may be taken using the photographer’s device.";
    galleryDisclaimer.insertAdjacentElement("afterend", deviceNote);
  }

  const contactNameInput = document.querySelector('#contact-form input[name="name"]');
  const contactNameLabel = contactNameInput?.closest("label")?.querySelector("span");
  if (contactNameLabel) contactNameLabel.textContent = "Name or fursona name";
  if (contactNameInput) contactNameInput.placeholder = "Your name or fursona name";
});
