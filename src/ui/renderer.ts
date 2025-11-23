// FILE: src/ui/renderer.ts

import type { PantryItem } from "../data/types";
import {
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
  <ul class="parsed-list">
    ${parsed
      .map(
        (item) => `
        <li>
          <strong>${item.qty}× ${item.name}</strong>
          <span class="price">${item.price}</span>
        </li>
        `
      )
      .join("")}
  </ul>
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

import type { PurchaseEntry } from "../data/purchaseHistory";

export function displayHistory(entries: PurchaseEntry[]) {
  const container = document.getElementById("history-list");
  if (!container) return;

  if (entries.length === 0) {
    container.innerHTML = `<p class="history-empty">No history recorded yet.</p>`;
    return;
  }

  container.innerHTML = entries
    .map((entry) => {
      const date = new Date(entry.timestamp).toLocaleString("sv-SE");

      const items = entry.items
        .map(
          (i) => `
            <li>
              <span class="history-item-name">${i.qty}× ${i.name}</span>
              <span class="history-item-price">
                ${i.price ? i.price + " kr" : ""}
              </span>
            </li>
          `
        )
        .join("");

      return `
        <div class="history-entry">
          <h3>${date}</h3>
          <ul>${items}</ul>
        </div>
      `;
    })
    .join("");
}
