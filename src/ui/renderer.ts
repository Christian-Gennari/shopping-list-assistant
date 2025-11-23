// FILE: src/ui/renderer.ts

import type { PantryItem } from "../data/types";
import {
  pantry,
  increaseItem,
  decreaseItem,
  deleteItem,
  loadPantry,
} from "../data/pantry";

/* ------------------------------------------
   Refresh pantry after changes
------------------------------------------- */
export function refreshPantryUI() {
  const fresh = loadPantry();
  displayPantry(fresh.items);
}

/* ------------------------------------------
   Display parsed Foodora items
------------------------------------------- */
export function displayParsedResults(parsed: any[]) {
  const container = document.getElementById("parsed-results");
  if (!container) return;

  container.innerHTML = `
    <h3>Parsed Items (${parsed.length})</h3>
    ${parsed
      .map(
        (item) => `
        <div class="parsed-item">
          <strong>${item.qty}× ${item.name}</strong><br>
          <span>${item.price}</span>
        </div>
      `
      )
      .join("")}
  `;
}

/* ------------------------------------------
   Display entire pantry
------------------------------------------- */
export function displayPantry(items: PantryItem[]) {
  const list = document.getElementById("pantry-items");
  if (!list) return;

  list.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "pantry-item";

    row.innerHTML = `
      <div>
        <span class="pantry-qty">${item.quantity}×</span>
        <span class="pantry-name">${item.name}</span>
      </div>

      <div class="pantry-actions">
        <button class="pantry-btn" data-action="inc">+</button>
        <button class="pantry-btn" data-action="dec">−</button>
        <button class="pantry-btn delete" data-action="del">×</button>
      </div>
    `;

    // Increase
    row.querySelector("[data-action='inc']")?.addEventListener("click", () => {
      increaseItem(item.name);
      refreshPantryUI();
    });

    // Decrease
    row.querySelector("[data-action='dec']")?.addEventListener("click", () => {
      decreaseItem(item.name);
      refreshPantryUI();
    });

    // Delete
    row.querySelector("[data-action='del']")?.addEventListener("click", () => {
      deleteItem(item.name);
      refreshPantryUI();
    });

    list.appendChild(row);
  });
}
