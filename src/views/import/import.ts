import "./import.css";

import { parseFoodoraHtml } from "../../parsing/foodoraParser";
import {
  mergeIntoPantry,
  exportPantry,
  importPantryJson,
} from "../../data/pantry";
import { addPurchaseEntry } from "../../data/purchaseHistory";
import { displayParsedResults } from "../../ui/renderer";

export function initView() {
  const htmlInput = document.getElementById("htmlInput") as HTMLTextAreaElement;
  const parseButton = document.getElementById(
    "parseButton"
  ) as HTMLButtonElement;
  const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement;
  const importFileInput = document.getElementById(
    "importFile"
  ) as HTMLInputElement;

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
    alert(`Imported ${parsedItems.length} items into pantry.`);
  });

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

  importFileInput.addEventListener("change", async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const text = await file.text();
    importPantryJson(text);

    alert("Pantry imported successfully.");
  });
}
