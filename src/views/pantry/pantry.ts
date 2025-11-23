import "./pantry.css";
import {
  increaseItem,
  decreaseItem,
  deleteItem,
  loadPantry,
} from "../../data/pantry";

export function initView() {
  renderPantry();
}

function renderPantry() {
  const container = document.getElementById("pantry-items");
  if (!container) return;

  const items = loadPantry().items;
  container.innerHTML = "";

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

    row.querySelector("[data-action='inc']")?.addEventListener("click", () => {
      increaseItem(item.name);
      renderPantry();
    });

    row.querySelector("[data-action='dec']")?.addEventListener("click", () => {
      decreaseItem(item.name);
      renderPantry();
    });

    row.querySelector("[data-action='del']")?.addEventListener("click", () => {
      deleteItem(item.name);
      renderPantry();
    });

    container.appendChild(row);
  });
}
