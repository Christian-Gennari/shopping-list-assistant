// FILE: src/main.ts

import { parseFoodoraHtml } from "./parsing/foodoraParser";

import {
  pantry,
  mergeIntoPantry,
  exportPantry,
  importPantryJson,
} from "./data/pantry";

import { addPurchaseEntry, loadPurchaseHistory } from "./data/purchaseHistory";

import {
  displayParsedResults,
  displayPantry,
  displayHistory,
} from "./ui/renderer";

import {
  parseButton,
  htmlInput,
  exportBtn,
  importFileInput,
} from "./ui/elements";

console.log("GrocerAI App Loaded");

/* ------------------------------------------
   VIEW SWITCHING
------------------------------------------- */
document.querySelectorAll(".sidebar a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const view = link.getAttribute("data-view");
    if (!view) return;

    // Update active tab
    document
      .querySelectorAll(".sidebar a")
      .forEach((a) => a.classList.remove("active"));
    link.classList.add("active");

    // Hide all views
    document
      .querySelectorAll(".view")
      .forEach((section) => section.classList.add("hidden"));

    // Show selected view
    const target = document.querySelector(`.view[data-view="${view}"]`);
    target?.classList.remove("hidden");

    // Render content for that view
    if (view === "pantry") {
      displayPantry(pantry.items);
    }

    if (view === "history") {
      const entries = loadPurchaseHistory();
      displayHistory(entries);
    }

    // Import view: no auto-render needed, stays clean
  });
});

/* ------------------------------------------
   Initial render (default = pantry)
------------------------------------------- */
displayPantry(pantry.items);
// Initialize preferences screen
initPreferencesUI();

/* ------------------------------------------
   Parse Foodora HTML
------------------------------------------- */
parseButton.addEventListener("click", () => {
  const html = htmlInput.value.trim();
  if (!html) {
    alert("Please paste your Foodora checkout HTML first.");
    return;
  }

  const parsedItems = parseFoodoraHtml(html);

  mergeIntoPantry(parsedItems);
  addPurchaseEntry(parsedItems, "foodora");

  displayParsedResults(parsedItems);
  displayPantry(pantry.items);
});

/* ------------------------------------------
   Export pantry
------------------------------------------- */
exportBtn.addEventListener("click", () => {
  const json = exportPantry();
  const blob = new Blob([json], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "grocerai_pantry.json";
  a.click();

  URL.revokeObjectURL(url);
});

/* ------------------------------------------
   Import pantry
------------------------------------------- */
importFileInput.addEventListener("change", async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const text = await file.text();
  importPantryJson(text);

  displayPantry(pantry.items);
  alert("Pantry imported successfully.");
});

import { preferences, updatePreference } from "./data/preferences";

function initPreferencesUI() {
  (document.getElementById("pref-vegetarian") as HTMLInputElement).checked =
    preferences.vegetarian;

  (document.getElementById("pref-restockWindow") as HTMLInputElement).value =
    preferences.autoRestockWindowDays.toString();

  (document.getElementById("pref-autoAddRestock") as HTMLInputElement).checked =
    preferences.autoAddRestock;

  (document.getElementById("pref-aiSuggestions") as HTMLInputElement).checked =
    preferences.aiSuggestions;

  (document.getElementById("pref-aiLimit") as HTMLInputElement).value =
    preferences.aiSuggestionLimit.toString();

  setupPrefListeners();
}

function setupPrefListeners() {
  document
    .getElementById("pref-vegetarian")
    ?.addEventListener("change", (e) =>
      updatePreference("vegetarian", (e.target as HTMLInputElement).checked)
    );

  document
    .getElementById("pref-restockWindow")
    ?.addEventListener("change", (e) =>
      updatePreference(
        "autoRestockWindowDays",
        Number((e.target as HTMLInputElement).value)
      )
    );

  document
    .getElementById("pref-autoAddRestock")
    ?.addEventListener("change", (e) =>
      updatePreference("autoAddRestock", (e.target as HTMLInputElement).checked)
    );

  document
    .getElementById("pref-aiSuggestions")
    ?.addEventListener("change", (e) =>
      updatePreference("aiSuggestions", (e.target as HTMLInputElement).checked)
    );

  document
    .getElementById("pref-aiLimit")
    ?.addEventListener("change", (e) =>
      updatePreference(
        "aiSuggestionLimit",
        Number((e.target as HTMLInputElement).value)
      )
    );
}
