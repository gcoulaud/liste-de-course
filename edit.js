import { firebaseConfig } from "./firebase-config.js";

const CUSTOM_SUGGESTIONS_KEY = "shopping_list_custom_suggestions_v1";
const USER_PROFILE_KEY = "shopping_list_user_profile_v1";
const DEFAULT_USER = { id: "home", name: "Maison" };

const listElement = document.getElementById("saved-data-list");
const emptyElement = document.getElementById("saved-data-empty");
const statusElement = document.getElementById("edit-status");

let localSuggestions = loadLocalSuggestions();
let cloudEntries = [];
let db = null;
let firestore = null;
const currentUser = loadUserProfile();

render();
connectCloud();

async function connectCloud() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    statusElement.textContent = `Mode local - Utilisateur : ${currentUser.name}`;
    return;
  }

  try {
    const [appModule, firestoreModule] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
    ]);
    firestore = firestoreModule;
    db = firestoreModule.getFirestore(appModule.initializeApp(firebaseConfig));
    firestoreModule.onSnapshot(
      suggestionsCollection(),
      (snapshot) => {
        cloudEntries = snapshot.docs
          .map((entry) => ({ id: entry.id, text: entry.data()?.text }))
          .filter((entry) => typeof entry.text === "string" && entry.text.trim());
        statusElement.textContent = `Synchronisé - Utilisateur : ${currentUser.name}`;
        render();
      },
      () => {
        statusElement.textContent = `Cloud indisponible - données locales affichées`;
      }
    );
  } catch {
    statusElement.textContent = `Mode local - Utilisateur : ${currentUser.name}`;
  }
}

function render() {
  listElement.innerHTML = "";
  const entries = mergeEntries();
  emptyElement.hidden = entries.length > 0;

  for (const entry of entries) {
    const item = document.createElement("li");
    item.className = "saved-data-item";

    const input = document.createElement("input");
    input.type = "text";
    input.value = entry.text;
    input.maxLength = 80;
    input.setAttribute("aria-label", `Modifier ${entry.text}`);

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "saved-data-save";
    saveButton.textContent = "Enregistrer";
    saveButton.addEventListener("click", () => saveEntry(entry, input.value, saveButton));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Supprimer";
    deleteButton.addEventListener("click", () => deleteEntry(entry));

    item.append(input, saveButton, deleteButton);
    listElement.appendChild(item);
  }
}

function mergeEntries() {
  const entries = new Map();
  for (const text of localSuggestions) {
    entries.set(normalizeText(text), { text, local: true, cloudIds: [] });
  }
  for (const cloudEntry of cloudEntries) {
    const key = normalizeText(cloudEntry.text);
    const existing = entries.get(key) || { text: cloudEntry.text, local: false, cloudIds: [] };
    existing.cloudIds.push(cloudEntry.id);
    entries.set(key, existing);
  }
  return [...entries.values()].sort((a, b) => a.text.localeCompare(b.text, "fr"));
}

async function saveEntry(entry, nextValue, button) {
  const nextText = nextValue.trim();
  if (!nextText) return;
  button.disabled = true;

  replaceLocal(entry.text, nextText);
  if (db && firestore && entry.cloudIds.length) {
    try {
      const nextId = slugify(nextText);
      if (nextId) {
        await firestore.setDoc(
          firestore.doc(db, "users", currentUser.id, "suggestions", nextId),
          { text: nextText, createdAt: firestore.serverTimestamp() },
          { merge: true }
        );
        await Promise.all(
          entry.cloudIds
            .filter((id) => id !== nextId)
            .map((id) => firestore.deleteDoc(firestore.doc(db, "users", currentUser.id, "suggestions", id)))
        );
      }
    } catch {
      statusElement.textContent = "Correction enregistrée localement, synchronisation impossible";
    }
  }
  button.disabled = false;
  render();
}

async function deleteEntry(entry) {
  localSuggestions = localSuggestions.filter(
    (text) => normalizeText(text) !== normalizeText(entry.text)
  );
  persistLocalSuggestions();
  render();

  if (db && firestore && entry.cloudIds.length) {
    try {
      await Promise.all(
        entry.cloudIds.map((id) =>
          firestore.deleteDoc(firestore.doc(db, "users", currentUser.id, "suggestions", id))
        )
      );
    } catch {
      statusElement.textContent = "Suppression locale effectuée, synchronisation impossible";
    }
  }
}

function replaceLocal(previousText, nextText) {
  const previousKey = normalizeText(previousText);
  const withoutPrevious = localSuggestions.filter((text) => normalizeText(text) !== previousKey);
  if (!withoutPrevious.some((text) => normalizeText(text) === normalizeText(nextText))) {
    withoutPrevious.unshift(nextText);
  }
  localSuggestions = withoutPrevious.slice(0, 200);
  persistLocalSuggestions();
}

function persistLocalSuggestions() {
  localStorage.setItem(CUSTOM_SUGGESTIONS_KEY, JSON.stringify(localSuggestions));
}

function loadLocalSuggestions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_SUGGESTIONS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string" && value.trim()) : [];
  } catch {
    return [];
  }
}

function loadUserProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem(USER_PROFILE_KEY) || "null");
    return profile && typeof profile.id === "string" && typeof profile.name === "string"
      ? profile
      : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

function suggestionsCollection() {
  return firestore.collection(db, "users", currentUser.id, "suggestions");
}

function slugify(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalizeText(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
