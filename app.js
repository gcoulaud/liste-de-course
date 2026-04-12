import { firebaseConfig } from "./firebase-config.js";

let addDoc;
let collection;
let deleteDoc;
let doc;
let getDocs;
let getFirestore;
let initializeApp;
let onSnapshot;
let orderBy;
let query;
let serverTimestamp;
let setDoc;
let updateDoc;
let writeBatch;

const LOCAL_STORAGE_KEY = "shopping_list_local_items_v1";
const CUSTOM_SUGGESTIONS_KEY = "shopping_list_custom_suggestions_v1";
const USER_PROFILE_KEY = "shopping_list_user_profile_v1";
const DEFAULT_USER = { id: "home", name: "Maison" };
const CATEGORY_ORDER = [
  "fruits_legumes",
  "frais",
  "viandes",
  "poissons",
  "epicerie",
  "boissons",
  "hygiene_maison",
  "alcool",
  "autres",
];

const CATEGORY_KEYWORDS = {
  fruits_legumes: [
    "tomate",
    "pomme",
    "banane",
    "carotte",
    "courgette",
    "concombre",
    "salade",
    "oignon",
    "poivron",
    "patate",
    "citron",
    "orange",
  ],
  frais: [
    "lait",
    "beurre",
    "oeuf",
    "oeufs",
    "fromage",
    "yaourt",
    "creme",
    "crème",
    "skyr",
    "mozzarella",
    "emmental",
    "camembert",
    "brie",
    "parmesan",
  ],
  viandes: [
    "viande",
    "boeuf",
    "bœuf",
    "poulet",
    "dinde",
    "porc",
    "steak",
    "jambon",
    "saucisse",
    "veau",
    "agneau",
    "lardon",
  ],
  poissons: [
    "poisson",
    "saumon",
    "thon",
    "cabillaud",
    "colin",
    "truite",
    "crevette",
    "crevettes",
    "moule",
    "moules",
    "sardine",
    "maquereau",
  ],
  epicerie: [
    "riz",
    "pate",
    "pâtes",
    "farine",
    "huile",
    "sucre",
    "sel",
    "sauce",
    "pain",
    "cafe",
    "café",
    "the",
    "thé",
    "chocolat",
  ],
  boissons: ["eau", "jus", "soda", "sirop"],
  hygiene_maison: [
    "shampoing",
    "dentifrice",
    "savon",
    "lessive",
    "liquide vaisselle",
    "papier toilette",
    "essuie",
    "sopalin",
  ],
  alcool: ["biere", "bière", "vin", "champagne", "whisky", "wisky", "vodka", "rhum"],
};
const SUGGESTIONS = [
  "Tomates",
  "Pommes",
  "Bananes",
  "Carottes",
  "Courgettes",
  "Concombres",
  "Lait",
  "Lait demi-écrémé",
  "Lait entier",
  "Beurre doux",
  "Beurre demi sel",
  "Crème fraîche",
  "Fromage blanc",
  "Skyr",
  "Mozzarella",
  "Emmental râpé",
  "Camembert",
  "Brie",
  "Parmesan",
  "Oeufs",
  "Yaourts",
  "Yaourt nature",
  "Yaourt grec",
  "Petit suisse",
  "Fromage",
  "Pain",
  "Pain de mie",
  "Pain complet",
  "Sucre morceaux",
  "Sucre poudre",
  "Sucre glace",
  "Riz",
  "Pâtes",
  "Farine",
  "Huile d'olive",
  "Huile de tournesol",
  "Végétaline",
  "Eau minérale",
  "Jus d'orange",
  "Bière",
  "Vin rouge",
  "Vin blanc",
  "Champagne",
  "Whisky",
  "Vodka",
  "Rhum",
  "Café",
  "Thé",
  "Shampoing",
  "Dentifrice",
  "Liquide vaisselle",
  "Papier toilette",
  "Sopalin",
  "Essuie tout",
];
let customSuggestions = loadCustomSuggestions();

const form = document.getElementById("add-item-form");
const input = document.getElementById("item-input");
const listElement = document.getElementById("shopping-list");
const clearBtn = document.getElementById("clear-done");
const refreshBtn = document.getElementById("refresh-btn");
const itemsLeftElement = document.getElementById("items-left");
const template = document.getElementById("item-template");
const autocompleteList = document.getElementById("autocomplete-list");
const statusElement = document.getElementById("sync-status");
const userNameInput = document.getElementById("user-name-input");
const saveUserBtn = document.getElementById("save-user-btn");
const beaufilsUserBtn = document.getElementById("beaufils-user-btn");
const qrShareBtn = document.getElementById("qr-share-btn");
const qrModal = document.getElementById("qr-modal");
const qrImage = document.getElementById("qr-image");
const qrCloseBtn = document.getElementById("qr-close-btn");

let activeSuggestionIndex = -1;
let items = [];
let unsubscribeItems = null;
let unsubscribeSuggestions = null;
let cloudSuggestions = [];
let currentUser = loadUserProfile();
let cloudUnavailable = false;

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let db = null;
if (userNameInput) {
  userNameInput.value = currentUser.name;
}

bootstrap();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    return;
  }

  await rememberSuggestion(text);

  if (db) {
    try {
      await addDoc(itemsCollection(), {
        text,
        category: detectCategory(text),
        purchased: false,
        createdAt: serverTimestamp(),
      });
    } catch {
      // Fallback local si Firestore échoue.
      items.unshift({
        id: crypto.randomUUID(),
        text,
        category: detectCategory(text),
        purchased: false,
      });
      persistLocalItems();
      render();
      statusElement.textContent = "Erreur cloud, sauvegarde locale";
    }
  } else {
    items.unshift({
      id: crypto.randomUUID(),
      text,
      category: detectCategory(text),
      purchased: false,
    });
    persistLocalItems();
    render();
  }

  input.value = "";
  hideAutocomplete();
  input.focus();
});

clearBtn.addEventListener("click", async () => {
  if (!db) {
    items = [];
    persistLocalItems();
    render();
    return;
  }

  const snapshot = await getDocs(itemsCollection());
  const batch = writeBatch(db);
  snapshot.forEach((itemDoc) => batch.delete(itemDoc.ref));
  try {
    await batch.commit();
  } catch {
    statusElement.textContent = "Suppression cloud impossible";
  }
});

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    window.location.reload();
  });
}

if (saveUserBtn && userNameInput) {
  saveUserBtn.addEventListener("click", () => switchUser(userNameInput.value));
}

if (beaufilsUserBtn && userNameInput) {
  beaufilsUserBtn.addEventListener("click", () => {
    switchUser("Beau-fils");
  });
}

input.addEventListener("input", () => {
  activeSuggestionIndex = -1;
  const queryText = input.value.trim().toLowerCase();

  if (!queryText) {
    hideAutocomplete();
    return;
  }

  const existingValues = new Set(items.map((item) => item.text.toLowerCase()));
  const allSuggestions = getAllSuggestions();
  const matches = allSuggestions.filter((suggestion) => {
    return suggestion.toLowerCase().includes(queryText) && !existingValues.has(suggestion.toLowerCase());
  }).slice(0, 6);

  renderAutocomplete(matches);
});

input.addEventListener("keydown", (event) => {
  const suggestionItems = autocompleteList.querySelectorAll(".autocomplete-item");
  if (autocompleteList.hidden || suggestionItems.length === 0) {
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestionItems.length;
    updateActiveSuggestion(suggestionItems);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    activeSuggestionIndex =
      activeSuggestionIndex <= 0 ? suggestionItems.length - 1 : activeSuggestionIndex - 1;
    updateActiveSuggestion(suggestionItems);
    return;
  }

  if (event.key === "Enter" && activeSuggestionIndex >= 0) {
    event.preventDefault();
    suggestionItems[activeSuggestionIndex].click();
  }
});

document.addEventListener("click", (event) => {
  const clickedInInput = event.target === input;
  const clickedAutocomplete = autocompleteList.contains(event.target);

  if (!clickedInInput && !clickedAutocomplete) {
    hideAutocomplete();
  }
});

if (qrShareBtn && qrModal && qrImage) {
  qrShareBtn.addEventListener("click", () => {
    qrModal.removeAttribute("hidden");
  });

  if (qrCloseBtn) {
    qrCloseBtn.addEventListener("click", () => {
      qrModal.setAttribute("hidden", "");
    });
  }

  qrModal.addEventListener("click", (event) => {
    if (event.target === qrModal) {
      qrModal.setAttribute("hidden", "");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      qrModal.setAttribute("hidden", "");
    }
  });
}

async function bootstrap() {
  if (isFirebaseConfigured) {
    const firebaseReady = await loadFirebaseModules();
    if (firebaseReady) {
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      setStatus();
      connectToSharedList();
      connectToSharedSuggestions();
      return;
    }
  }

  items = loadLocalItems();
  setStatus();
  render();
}

async function loadFirebaseModules() {
  try {
    const [appModule, firestoreModule] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
    ]);

    initializeApp = appModule.initializeApp;
    addDoc = firestoreModule.addDoc;
    collection = firestoreModule.collection;
    deleteDoc = firestoreModule.deleteDoc;
    doc = firestoreModule.doc;
    getDocs = firestoreModule.getDocs;
    getFirestore = firestoreModule.getFirestore;
    onSnapshot = firestoreModule.onSnapshot;
    orderBy = firestoreModule.orderBy;
    query = firestoreModule.query;
    serverTimestamp = firestoreModule.serverTimestamp;
    setDoc = firestoreModule.setDoc;
    updateDoc = firestoreModule.updateDoc;
    writeBatch = firestoreModule.writeBatch;
    cloudUnavailable = false;
    return true;
  } catch {
    cloudUnavailable = true;
    return false;
  }
}

function connectToSharedList() {
  if (unsubscribeItems) {
    unsubscribeItems();
    unsubscribeItems = null;
  }

  const itemsQuery = query(itemsCollection(), orderBy("createdAt", "desc"));
  unsubscribeItems = onSnapshot(
    itemsQuery,
    (snapshot) => {
      items = snapshot.docs.map((itemDoc) => ({
        id: itemDoc.id,
        ...itemDoc.data(),
      }));
      render();
      setStatus();
    },
    (error) => {
      const code = error?.code ? ` (${error.code})` : "";
      statusElement.textContent = `Cloud indisponible, reconnexion...${code}`;
      console.error("Firestore items sync error:", error);
    }
  );
}

function connectToSharedSuggestions() {
  if (unsubscribeSuggestions) {
    unsubscribeSuggestions();
    unsubscribeSuggestions = null;
  }

  unsubscribeSuggestions = onSnapshot(
    suggestionsCollection(),
    (snapshot) => {
      cloudSuggestions = snapshot.docs
        .map((suggestionDoc) => suggestionDoc.data()?.text)
        .filter((value) => typeof value === "string");
    },
    (error) => {
      const code = error?.code ? ` (${error.code})` : "";
      statusElement.textContent = `Sync suggestions indisponible, reconnexion...${code}`;
      console.error("Firestore suggestions sync error:", error);
    }
  );
}

function itemsCollection() {
  return collection(db, "users", currentUser.id, "items");
}

function suggestionsCollection() {
  return collection(db, "users", currentUser.id, "suggestions");
}

function itemDocRef(itemId) {
  return doc(db, "users", currentUser.id, "items", itemId);
}

function suggestionDocRef(suggestionId) {
  return doc(db, "users", currentUser.id, "suggestions", suggestionId);
}

function setStatus() {
  if (!isFirebaseConfigured) {
    statusElement.textContent = `Mode local - Utilisateur: ${currentUser.name}`;
    return;
  }

  if (cloudUnavailable || !db) {
    statusElement.textContent = `Mode local (cloud indisponible) - Utilisateur: ${currentUser.name}`;
    return;
  }

  statusElement.textContent = `Synchronisé en direct - Utilisateur: ${currentUser.name}`;
}

function switchUser(name) {
  const nextProfile = createUserProfile(name);
  const changed = nextProfile.id !== currentUser.id || nextProfile.name !== currentUser.name;
  currentUser = nextProfile;
  saveUserProfile(currentUser);
  if (userNameInput) {
    userNameInput.value = currentUser.name;
  }

  if (!changed) {
    setStatus();
    return;
  }

  hideAutocomplete();
  cloudSuggestions = [];

  if (db) {
    connectToSharedList();
    connectToSharedSuggestions();
  } else {
    items = loadLocalItems();
    render();
    setStatus();
  }
}

function render() {
  listElement.innerHTML = "";
  const sortedItems = [...items].sort(compareItemsByCategoryThenName);

  for (const item of sortedItems) {
    const node = template.content.firstElementChild.cloneNode(true);
    const iconBtn = node.querySelector(".shopping-item__icon-btn");
    const text = node.querySelector(".shopping-item__text");
    const categorySelect = node.querySelector(".shopping-item__category");
    const deleteBtn = node.querySelector(".delete-btn");

    text.textContent = item.text;
    node.classList.toggle("is-purchased", Boolean(item.purchased));
    categorySelect.value = item.category || detectCategory(item.text);

    categorySelect.addEventListener("change", async () => {
      const nextCategory = categorySelect.value;
      const previousCategory = item.category || detectCategory(item.text);

      if (db) {
        item.category = nextCategory;
        render();
        try {
          await updateDoc(itemDocRef(item.id), {
            category: nextCategory,
          });
        } catch {
          statusElement.textContent = "Catégorie cloud impossible";
          item.category = previousCategory;
          render();
        }
      } else {
        item.category = nextCategory;
        persistLocalItems();
        render();
      }
    });

    iconBtn.addEventListener("click", async () => {
      if (db) {
        try {
          await updateDoc(itemDocRef(item.id), {
            purchased: !item.purchased,
          });
        } catch {
          statusElement.textContent = "Mise à jour cloud impossible";
        }
      } else {
        item.purchased = !item.purchased;
        persistLocalItems();
        render();
      }
    });

    deleteBtn.addEventListener("click", async () => {
      if (db) {
        try {
          await deleteDoc(itemDocRef(item.id));
        } catch {
          statusElement.textContent = "Suppression cloud impossible";
        }
      } else {
        items = items.filter((i) => i.id !== item.id);
        persistLocalItems();
        render();
      }
    });

    listElement.appendChild(node);
  }

  const count = items.length;
  itemsLeftElement.textContent = `${count} article${count > 1 ? "s" : ""}`;
}

function renderAutocomplete(matches) {
  autocompleteList.innerHTML = "";

  if (matches.length === 0) {
    autocompleteList.hidden = false;
    const emptyState = document.createElement("li");
    emptyState.className = "autocomplete-empty";
    emptyState.textContent = "Aucune suggestion";
    autocompleteList.appendChild(emptyState);
    return;
  }

  const queryText = input.value.trim();
  for (const suggestion of matches) {
    const suggestionNode = document.createElement("li");
    suggestionNode.className = "autocomplete-item";
    suggestionNode.innerHTML = formatSuggestion(suggestion, queryText);
    suggestionNode.setAttribute("role", "option");

    suggestionNode.addEventListener("click", () => {
      input.value = suggestion;
      hideAutocomplete();
      input.focus();
    });

    autocompleteList.appendChild(suggestionNode);
  }

  autocompleteList.hidden = false;
}

function hideAutocomplete() {
  autocompleteList.innerHTML = "";
  autocompleteList.hidden = true;
}

function formatSuggestion(suggestion, queryText) {
  const lowerSuggestion = suggestion.toLowerCase();
  const lowerQuery = queryText.toLowerCase();
  const index = lowerSuggestion.indexOf(lowerQuery);
  if (index < 0 || !queryText) {
    return `<span class="suggestion-main">${escapeHtml(suggestion)}</span>`;
  }

  const before = suggestion.slice(0, index);
  const match = suggestion.slice(index, index + queryText.length);
  const after = suggestion.slice(index + queryText.length);

  return `
    <span class="suggestion-main">
      ${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}
    </span>
    <span class="suggestion-hint">Entrée</span>
  `;
}

function updateActiveSuggestion(suggestionItems) {
  suggestionItems.forEach((item, index) => {
    item.classList.toggle("is-active", index === activeSuggestionIndex);
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function persistLocalItems() {
  localStorage.setItem(localItemsStorageKey(), JSON.stringify(items));
}

function loadLocalItems() {
  try {
    const scopedKey = localItemsStorageKey();
    let raw = localStorage.getItem(scopedKey);

    if (!raw && currentUser.id === DEFAULT_USER.id) {
      // Migration douce de l'ancien stockage unique vers le stockage par utilisateur.
      raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(scopedKey, raw);
      }
    }

    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item.id === "string" && typeof item.text === "string")
      .map((item) => ({
        id: item.id,
        text: item.text,
        category: item.category || detectCategory(item.text),
        purchased: Boolean(item.purchased),
      }));
  } catch {
    return [];
  }
}

function loadUserProfile() {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) {
      return { ...DEFAULT_USER };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_USER };
    }
    if (typeof parsed.id !== "string" || typeof parsed.name !== "string") {
      return { ...DEFAULT_USER };
    }
    const id = sanitizeUserId(parsed.id);
    const name = parsed.name.trim();
    if (!id || !name) {
      return { ...DEFAULT_USER };
    }
    return { id, name };
  } catch {
    return { ...DEFAULT_USER };
  }
}

function saveUserProfile(profile) {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

function createUserProfile(name) {
  const trimmedName = (name || "").trim();
  if (!trimmedName) {
    return { ...currentUser };
  }
  const id = sanitizeUserId(trimmedName);
  return {
    id: id || `user-${crypto.randomUUID().slice(0, 8)}`,
    name: trimmedName,
  };
}

function sanitizeUserId(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

function localItemsStorageKey() {
  return `${LOCAL_STORAGE_KEY}_${currentUser.id}`;
}

function getAllSuggestions() {
  const unique = new Map();
  for (const suggestion of [...SUGGESTIONS, ...customSuggestions, ...cloudSuggestions]) {
    const key = suggestion.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, suggestion);
    }
  }
  return Array.from(unique.values());
}

async function rememberSuggestion(text) {
  const normalized = text.trim();
  if (!normalized) {
    return;
  }

  const existsInDefault = SUGGESTIONS.some(
    (suggestion) => suggestion.toLowerCase() === normalized.toLowerCase()
  );
  const existsInCustom = customSuggestions.some(
    (suggestion) => suggestion.toLowerCase() === normalized.toLowerCase()
  );
  const existsInCloud = cloudSuggestions.some(
    (suggestion) => suggestion.toLowerCase() === normalized.toLowerCase()
  );

  if (!existsInDefault && !existsInCustom) {
    customSuggestions.unshift(normalized);
    customSuggestions = customSuggestions.slice(0, 200);
    localStorage.setItem(CUSTOM_SUGGESTIONS_KEY, JSON.stringify(customSuggestions));
  }

  if (db && !existsInDefault && !existsInCloud) {
    const key = normalizeText(normalized).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (key) {
      try {
        await setDoc(
          suggestionDocRef(key),
          { text: normalized, createdAt: serverTimestamp() },
          { merge: true }
        );
      } catch {
        // Ne bloque jamais l'ajout d'article si la sync des suggestions échoue.
      }
    }
  }
}

function loadCustomSuggestions() {
  try {
    const raw = localStorage.getItem(CUSTOM_SUGGESTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  } catch {
    return [];
  }
}

function detectCategory(text) {
  const normalizedText = normalizeText(text);
  for (const category of CATEGORY_ORDER) {
    const keywords = CATEGORY_KEYWORDS[category] || [];
    for (const keyword of keywords) {
      if (normalizedText.includes(normalizeText(keyword))) {
        return category;
      }
    }
  }
  return "autres";
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function compareItemsByCategoryThenName(a, b) {
  const categoryA = a.category || detectCategory(a.text);
  const categoryB = b.category || detectCategory(b.text);
  const indexA = CATEGORY_ORDER.indexOf(categoryA);
  const indexB = CATEGORY_ORDER.indexOf(categoryB);

  if (indexA !== indexB) {
    return indexA - indexB;
  }

  return a.text.localeCompare(b.text, "fr", { sensitivity: "base" });
}
