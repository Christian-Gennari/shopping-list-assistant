// --------------------------------------------------------
// Display results from the *most recent* parse
// --------------------------------------------------------
export function displayParsedResults(parsed: any[]) {
  const container = document.getElementById("parsed-results");
  if (!container) return;

  container.innerHTML = `
    <h3>Parsed Items (${parsed.length})</h3>
    ${parsed
      .map(
        (i) => `
        <div class="parsed-item">
          <strong>${i.qty}× ${i.name}</strong><br>
          <span>${i.price}</span>
        </div>
      `
      )
      .join("")}
  `;
}

// --------------------------------------------------------
// Display the *entire pantry*
// --------------------------------------------------------
import type { PantryItem } from "../data/types";
import {
  loadPantry,
  increaseItem,
  decreaseItem,
  deleteItem,
} from "../data/pantry";

export function refreshPantryUI() {
  const fresh = loadPantry();
  displayPantry(fresh.items);
}

export function displayPantry(items: PantryItem[]) {
  const list = document.getElementById("pantry-items");
  if (!list) return;

  list.innerHTML = ""; // clear list

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

    // Button: increase item
    row.querySelector("[data-action='inc']")?.addEventListener("click", () => {
      increaseItem(item.name);
      refreshPantryUI();
    });

    // Button: decrease item
    row.querySelector("[data-action='dec']")?.addEventListener("click", () => {
      decreaseItem(item.name);
      refreshPantryUI();
    });

    // Button: delete item
    row.querySelector("[data-action='del']")?.addEventListener("click", () => {
      deleteItem(item.name);
      refreshPantryUI();
    });

    list.appendChild(row);
  });
}
