const $ = (selector) => document.querySelector(selector);

const funhouse = $(".funhouse");
const dogPopout = $("#dogPopout");
const moodCard = $("#moodCard");
const treatBag = $("#treatBag");
const foodGround = $("#foodGround");
const noseButton = $("#noseButton");
const backgroundNoseButton = $("#backgroundNoseButton");
const secretPaw = $("#secretPaw");
const autographPencil = $("#autographPencil");
const autographLayer = $("#autographLayer");
const debtCard = $("#debtCard");
const hotdogRain = $("#hotdogRain");
const title = $("h1");
const originalTitleText = title ? title.textContent : "Rocky-Snack-Shack-of-Chaos";
const videoModal = $("#videoModal");
const videoClose = $("#videoClose");
const rickrollFrame = $("#rickrollFrame");
const creditsButton = $("#creditsButton");
const creditsModal = $("#creditsModal");
const creditsClose = $("#creditsClose");
const commandsButton = $("#commandsButton");
const commandsModal = $("#commandsModal");
const commandsClose = $("#commandsClose");
const commandForm = $("#commandForm");
const commandInput = $("#commandInput");
const welcomeModal = $("#welcomeModal");
const letsGoButton = $("#letsGoButton");
const termsModal = $("#termsModal");
const termsAccept = $("#termsAccept");
const amazonPackage = $("#amazonPackage");
const tacoRecipeButton = $("#tacoRecipeButton");
const fortuneCookie = $("#fortuneCookie");
const riverBadge = $("#riverBadge");
const riverCameo = $("#riverCameo");
const pawTrail = $("#pawTrail");
const barkModal = $("#barkModal");
const barkClose = $("#barkClose");
const courtModal = $("#courtModal");
const courtClose = $("#courtClose");
const receipt = $("#receipt");
const receiptLines = $("#receiptLines");

const foods = [
  { icon: "🍔", name: "burger" },
  { icon: "🍟", name: "fries" },
  { icon: "🥤", name: "soda" },
  { icon: "🥓", name: "bacon" },
  { icon: "🥐", name: "croissant" },
  { icon: "🥞", name: "pancakes" },
  { icon: "🥯", name: "bagel" },
  { icon: "🍕", name: "pizza" },
  { icon: "🍗", name: "drumstick" },
  { icon: "🧀", name: "cheese" },
  { icon: "🍞", name: "toast" },
  { icon: "🍊", name: "orange", forbidden: true }
];

const tacoRecipes = [
  "https://www.allrecipes.com/recipe/257865/easy-beef-street-tacos/",
  "https://www.allrecipes.com/recipe/245744/mexican-street-tacos/",
  "https://www.loveandlemons.com/tacos/",
  "https://www.delish.com/cooking/recipe-ideas/a19636089/baja-fish-tacos-recipe/",
  "https://www.foodnetwork.com/recipes/food-network-kitchen/chicken-tacos-recipe-2108574",
  "https://www.simplyrecipes.com/recipes/fish_tacos/",
  "https://www.gimmesomeoven.com/carnitas-recipe/",
  "https://cookieandkate.com/roasted-cauliflower-and-lentil-tacos/"
];

const fortunes = [
  "If lost, follow the paw prints.",
  "A snack hidden is a snack temporarily misplaced.",
  "The treat bag knows what you did.",
  "Boop gently. The snack court is watching.",
  "Today is a good day to feed Rocky twice."
];

const foodCounts = {};
const comboFed = new Set();
let totalFeeds = 0;
let boops = 0;
let toastTimer = 0;
let debtTimer = 0;
let brainTimer = 0;
let videoCooldown = false;
let riverCooldown = false;
let riverDirectionRight = true;
let codeBuffer = "";
let courtShown = false;
let isNapping = false;

function on(element, event, handler) {
  if (element) element.addEventListener(event, handler);
}

function showModal(modal) {
  if (!modal) return;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function hideModal(modal) {
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

function setMood(message, duration = 2600) {
  if (!moodCard) return;
  moodCard.textContent = message;
  moodCard.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => moodCard.classList.remove("show"), duration);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function renderFoods() {
  if (!foodGround) return;
  const required = ["burger", "fries", "soda"].map((name) => foods.find((food) => food.name === name));
  const extras = shuffle(foods.filter((food) => !["burger", "fries", "soda"].includes(food.name))).slice(0, 3);
  const selected = shuffle([...required, ...extras]);
  foodGround.innerHTML = "";

  selected.forEach((food) => {
    const button = document.createElement("button");
    button.className = "food-item";
    button.type = "button";
    button.dataset.food = food.name;
    button.dataset.icon = food.icon;
    button.dataset.forbidden = String(Boolean(food.forbidden));
    button.setAttribute("aria-label", `Toss ${food.name} to Rocky`);
    button.innerHTML = `<span class="food-icon">${food.icon}</span><span class="food-name">${food.name}</span>`;
    on(button, "click", () => tossFood(button));
    foodGround.append(button);
  });
}

function tossFood(button) {
  if (!button || isNapping) return;
  const food = button.dataset.food;
  foodCounts[food] = (foodCounts[food] || 0) + 1;
  totalFeeds += 1;
  comboFed.add(food);

  button.classList.add("tossing");
  dogPopout?.classList.add("eating");
  setTimeout(() => {
    button.remove();
    dogPopout?.classList.remove("eating");
  }, 780);

  if (button.dataset.forbidden === "true") {
    dogPopout?.classList.add("confused");
    setMood("ugh healthy food detected! bleh", 3600);
    setTimeout(() => dogPopout?.classList.remove("confused"), 2400);
  } else {
    setMood(randomMood(food));
  }

  if (comboFed.has("burger") && comboFed.has("fries") && comboFed.has("soda")) {
    comboFed.clear();
    setMood("maximum snack crime.", 4200);
  }

  if (totalFeeds % 4 === 0) showSnackDebt();
  if (totalFeeds >= 7) showReceipt();
  if (totalFeeds >= 10 && !courtShown) openCourt();
  if (totalFeeds > 0 && totalFeeds % 9 === 0) triggerNap();

  if (foodGround && foodGround.children.length < 2) {
    setTimeout(renderFoods, 650);
  }
}

function randomMood(food) {
  const moods = {
    soda: "Rocky mood: chaotic",
    burger: "Rocky mood: loyal",
    fries: "Rocky mood: unstoppable",
    bacon: "Rocky mood: bacon certified",
    pizza: "Rocky mood: suspiciously Italian"
  };
  return moods[food] || shuffle([
    "Rocky mood: hungry",
    "Rocky mood: snack detected",
    "Rocky mood: tail activated",
    "Rocky mood: plotting dessert"
  ])[0];
}

function showSnackDebt() {
  if (!debtCard) return;
  clearTimeout(debtTimer);
  debtCard.classList.add("show");
  debtTimer = setTimeout(() => debtCard.classList.remove("show"), 3400);
}

function showReceipt() {
  if (!receipt || !receiptLines) return;
  receiptLines.innerHTML = "";
  Object.entries(foodCounts).forEach(([food, count]) => {
    const line = document.createElement("span");
    line.textContent = `${food} x${count}`;
    receiptLines.append(line);
  });
  receipt.classList.add("show");
  setTimeout(() => receipt.classList.remove("show"), 5600);
}

function flipRocky() {
  if (!dogPopout) return;
  dogPopout.classList.remove("flipping");
  void dogPopout.offsetWidth;
  dogPopout.classList.add("flipping");
  setTimeout(() => dogPopout.classList.remove("flipping"), 900);
}

function boopRocky() {
  boops += 1;
  setMood(getBoopMessage(), boops >= 25 ? 4200 : 3000);
}

function getBoopMessage() {
  if (boops >= 200) return `Boops: ${boops}. Rocky has contacted snack legal.`;
  if (boops >= 150) return `Boops: ${boops}. The nose is now a historical landmark.`;
  if (boops >= 125) return `Boops: ${boops}. Boop economy in shambles.`;
  if (boops >= 100) return `Boops: ${boops}. Boop license revoked.`;
  if (boops >= 75) return `Boops: ${boops}. Rocky is filing a formal snack complaint.`;
  if (boops >= 50) return `Boops: ${boops}. The nose has entered witness protection.`;
  if (boops >= 25) return `Boops: ${boops}. You have unlocked suspicious boop behavior.`;
  if (boops >= 10) return `Boops: ${boops}. okay that's a little too much.`;
  return `Boops: ${boops}`;
}

function triggerZoomies() {
  funhouse?.classList.add("zoomies");
  dogPopout?.classList.add("zooming");
  makePawTrail();
  setMood("ZOOMIES ACTIVATED.");
  setTimeout(() => {
    funhouse?.classList.remove("zoomies");
    dogPopout?.classList.remove("zooming");
  }, 2600);
}

function makePawTrail() {
  if (!pawTrail) return;
  pawTrail.innerHTML = "";
  for (let i = 0; i < 18; i += 1) {
    const paw = document.createElement("span");
    paw.className = "trail-paw";
    paw.textContent = "🐾";
    paw.style.left = `${Math.random() * 92}%`;
    paw.style.top = `${Math.random() * 88}%`;
    paw.style.animationDelay = `${Math.random() * 1.1}s`;
    pawTrail.append(paw);
  }
  setTimeout(() => (pawTrail.innerHTML = ""), 5200);
}

function stampRockyAutograph() {
  if (!autographLayer) return;
  const paw = document.createElement("span");
  paw.className = "signature-paw";
  paw.textContent = "🐾 Rocky";
  paw.style.left = `${18 + Math.random() * 58}%`;
  paw.style.top = `${18 + Math.random() * 58}%`;
  autographLayer.append(paw);
  setMood("Rocky signed the screen.");
  setTimeout(() => paw.remove(), 6200);
}

function openTreatVideo() {
  if (videoCooldown) {
    setMood("Treat bag cooldown. Try again in a second.");
    return;
  }
  videoCooldown = true;
  if (rickrollFrame) {
    rickrollFrame.src = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1";
  }
  showModal(videoModal);
  setTimeout(() => {
    videoCooldown = false;
  }, 5000);
}

function closeTreatVideo() {
  if (rickrollFrame) rickrollFrame.src = "";
  hideModal(videoModal);
}

function openCredits() {
  showModal(creditsModal);
}

function closeCredits() {
  hideModal(creditsModal);
}

function openCommands() {
  showModal(commandsModal);
  setTimeout(() => commandInput?.focus(), 60);
}

function closeCommands() {
  hideModal(commandsModal);
}

function openBarkTranslator() {
  showModal(barkModal);
}

function closeBarkTranslator() {
  hideModal(barkModal);
}

function openCourt() {
  courtShown = true;
  showModal(courtModal);
}

function closeCourt() {
  hideModal(courtModal);
}

function closeWelcome() {
  hideModal(welcomeModal);
  showModal(termsModal);
}

function closeTerms() {
  hideModal(termsModal);
}

function openAmazonPackage() {
  const country = (navigator.language || "en-US").split("-")[1]?.toLowerCase() || "us";
  const domains = {
    us: "amazon.com",
    ca: "amazon.ca",
    mx: "amazon.com.mx",
    gb: "amazon.co.uk",
    uk: "amazon.co.uk",
    au: "amazon.com.au",
    de: "amazon.de",
    fr: "amazon.fr",
    jp: "amazon.co.jp"
  };
  const domain = domains[country] || "amazon.com";
  window.open(`https://www.${domain}/s?k=dog+treats`, "_blank", "noreferrer");
}

function openRandomTacoRecipe() {
  const recipe = tacoRecipes[Math.floor(Math.random() * tacoRecipes.length)];
  setMood("Taco wisdom selected. Opening recipe...");
  window.open(recipe, "_blank", "noreferrer");
}

function openFortune() {
  setMood(`Rocky fortune: ${fortunes[Math.floor(Math.random() * fortunes.length)]}`, 10000);
}

function triggerAwoo() {
  title?.classList.add("awoo");
  setMood("Awoooooo.");
  setTimeout(() => title?.classList.remove("awoo"), 2600);
}

function triggerHotdogz() {
  if (!hotdogRain) return;
  hotdogRain.innerHTML = "";
  for (let i = 0; i < 28; i += 1) {
    const dog = document.createElement("span");
    dog.className = "falling-hotdog";
    dog.textContent = "🌭";
    dog.style.left = `${Math.random() * 100}%`;
    dog.style.top = `${-20 - Math.random() * 55}px`;
    dog.style.animationDelay = `${Math.random() * 1.5}s`;
    hotdogRain.append(dog);
  }
  setMood("HOTDOGZ MODE.");
  setTimeout(() => (hotdogRain.innerHTML = ""), 4300);
}

function triggerRiverCameo() {
  if (!riverCameo || riverCooldown) return;
  riverCooldown = true;
  riverBadge?.classList.add("show");
  setMood("Secret River credit found.");
  riverCameo.classList.remove("run-right", "run-left");
  void riverCameo.offsetWidth;
  riverCameo.classList.add(riverDirectionRight ? "run-right" : "run-left");
  riverDirectionRight = !riverDirectionRight;
  makeConfetti();
  setTimeout(() => riverBadge?.classList.remove("show"), 6000);
  setTimeout(() => {
    riverCameo.classList.remove("run-right", "run-left");
  }, 5200);
  setTimeout(() => {
    riverCooldown = false;
  }, 10000);
}

function makeConfetti() {
  if (!hotdogRain) return;
  for (let i = 0; i < 24; i += 1) {
    const piece = document.createElement("span");
    piece.className = "falling-hotdog";
    piece.textContent = ["✨", "🎉", "⭐", "🦴"][Math.floor(Math.random() * 4)];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${-20 - Math.random() * 80}px`;
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    hotdogRain.append(piece);
  }
  setTimeout(() => (hotdogRain.innerHTML = ""), 4200);
}

function triggerSquirrel() {
  dogPopout?.classList.add("squirrel-mode");
  setMood("SQUIRREL.");
  document.querySelectorAll(".icon-button, .food-item").forEach((button) => {
    button.style.transform = `translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) rotate(${Math.random() * 28 - 14}deg)`;
  });
  setTimeout(() => {
    dogPopout?.classList.remove("squirrel-mode");
    document.querySelectorAll(".icon-button, .food-item").forEach((button) => {
      button.style.transform = "";
    });
  }, 2500);
}

function triggerBrainMode() {
  clearTimeout(brainTimer);
  if (!title) return;
  title.textContent = "ONLY SNACKS.";
  title.classList.add("awoo");
  setMood("No Thoughts Mode: only snacks.");
  brainTimer = setTimeout(() => {
    title.textContent = originalTitleText;
    title.classList.remove("awoo");
  }, 4200);
}

function triggerNap() {
  isNapping = true;
  dogPopout?.classList.add("napping");
  setMood("Rocky is processing snacks...");
  setTimeout(() => {
    isNapping = false;
    dogPopout?.classList.remove("napping");
    setMood("Rocky woke up and immediately remembered snacks.");
  }, 5000);
}

function runTypedCommand(command, showUnknown = true) {
  const normalized = command.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes("awoo")) return triggerAwoo(), true;
  if (normalized.includes("hotdogz")) return triggerHotdogz(), true;
  if (normalized.includes("river")) return triggerRiverCameo(), true;
  if (normalized.includes("bark")) return openBarkTranslator(), true;
  if (normalized.includes("squirrel")) return triggerSquirrel(), true;
  if (normalized.includes("brain")) return triggerBrainMode(), true;
  if (showUnknown) setMood("Unknown command. Try AWOO, RIVER, BARK, HOTDOGZ, SQUIRREL, or BRAIN.", 4200);
  return false;
}

on(dogPopout, "click", (event) => {
  if (event.target === noseButton) return;
  flipRocky();
});

on(noseButton, "click", (event) => {
  event.stopPropagation();
  boopRocky();
});

on(backgroundNoseButton, "click", boopRocky);
on(secretPaw, "click", triggerZoomies);
on(autographPencil, "click", stampRockyAutograph);
on(treatBag, "click", openTreatVideo);
on(videoClose, "click", closeTreatVideo);
on(videoModal, "click", (event) => {
  if (event.target === videoModal) closeTreatVideo();
});
on(creditsButton, "click", openCredits);
on(creditsClose, "click", closeCredits);
on(creditsModal, "click", (event) => {
  if (event.target === creditsModal) closeCredits();
});
on(commandsButton, "click", openCommands);
on(commandsClose, "click", closeCommands);
on(commandsModal, "click", (event) => {
  if (event.target === commandsModal) closeCommands();
});
on(commandForm, "submit", (event) => {
  event.preventDefault();
  if (runTypedCommand(commandInput?.value || "")) {
    if (commandInput) commandInput.value = "";
    closeCommands();
  }
});
on(letsGoButton, "click", closeWelcome);
on(termsAccept, "click", closeTerms);
on(amazonPackage, "click", openAmazonPackage);
on(tacoRecipeButton, "click", openRandomTacoRecipe);
on(fortuneCookie, "click", openFortune);
on(barkClose, "click", closeBarkTranslator);
on(barkModal, "click", (event) => {
  if (event.target === barkModal) closeBarkTranslator();
});
on(courtClose, "click", closeCourt);
on(courtModal, "click", (event) => {
  if (event.target === courtModal) closeCourt();
});

window.addEventListener("keydown", (event) => {
  if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
  if (event.key.length !== 1) return;
  codeBuffer = `${codeBuffer}${event.key.toLowerCase()}`.slice(-20);
  runTypedCommand(codeBuffer, false) && (codeBuffer = "");
});

renderFoods();
