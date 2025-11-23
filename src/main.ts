import { parseFoodoraHtml } from "./parsing/foodoraParser";

import {
  pantry,
  loadPantry,
  mergeIntoPantry,
  exportPantry,
  importPantryJson,
} from "./data/pantry";

import { displayParsedResults, displayPantry } from "./ui/renderer";

import {
  parseButton,
  htmlInput,
  exportBtn,
  importFileInput,
} from "./ui/elements";

console.log("GrocerAI App Loaded");

// --------------------------------------------------------
// INITIAL RENDER
// --------------------------------------------------------
displayPantry(pantry.items);

// --------------------------------------------------------
// PARSE FOODORA HTML
// --------------------------------------------------------
parseButton.addEventListener("click", () => {
  const html = htmlInput.value.trim();
  if (!html) {
    alert("Please paste your Foodora checkout HTML first.");
    return;
  }

  const parsedItems = parseFoodoraHtml(html);

  mergeIntoPantry(parsedItems);

  displayParsedResults(parsedItems);
  displayPantry(pantry.items);
});

// --------------------------------------------------------
// EXPORT PANTRY
// --------------------------------------------------------
exportBtn?.addEventListener("click", () => {
  const json = exportPantry();
  const blob = new Blob([json], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "grocerai_pantry.json";
  a.click();

  URL.revokeObjectURL(url);
});

// --------------------------------------------------------
// IMPORT PANTRY
// --------------------------------------------------------
importFileInput?.addEventListener("change", async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const text = await file.text();
  importPantryJson(text);

  displayPantry(pantry.items);

  alert("Pantry imported successfully!");
});
