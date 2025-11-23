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
   Sidebar view switching
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
    document
      .querySelector(`.view[data-view="${view}"]`)
      ?.classList.remove("hidden");

    // Load history on switch
    if (view === "history") {
      const entries = loadPurchaseHistory();
      displayHistory(entries);
    }
  });
});

/* ------------------------------------------
   Initial render
------------------------------------------- */
displayPantry(pantry.items);

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
