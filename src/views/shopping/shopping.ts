import "./shopping.css";

import { loadPantry } from "../../data/pantry";
import { loadPurchaseHistory } from "../../data/purchaseHistory";
import { preferences } from "../../data/preferences";
import {
  loadShoppingList,
  addItemToShoppingList,
  updateQuantity,
  removeItem,
} from "../../data/shoppingList";

import { getChatReply } from "../../ai/chatAssistant";

export async function initView() {
  renderRestock();
  setupAIChat();
  setupCustomAdd();
  renderFinalList();
}

/* -----------------------------------------------
   1. AUTO-RESTOCK SECTION
------------------------------------------------ */
function renderRestock() {
  const pantry = loadPantry().items;
  const history = loadPurchaseHistory();
  const windowDays = preferences.autoRestockWindowDays;

  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;

  const recentBuys = new Set(
    history
      .filter((h) => h.timestamp >= cutoff)
      .flatMap((h) => h.items.map((i) => i.name.toLowerCase()))
  );

  const zeroQtyItems = pantry.filter((i) => i.quantity === 0);

  const restockCandidates = zeroQtyItems.filter((i) =>
    recentBuys.has(i.name.toLowerCase())
  );

  const container = document.getElementById("restock-list")!;
  container.innerHTML = "";

  restockCandidates.forEach((item) => {
    const div = document.createElement("div");
    div.className = "shopping-item";

    div.innerHTML = `
      <span class="shopping-name">${item.name}</span>
      <button class="parse-btn" data-add>+ Add</button>
    `;

    div.querySelector("[data-add]")?.addEventListener("click", () => {
      addItemToShoppingList(item.name, "restock");
      renderFinalList();
    });

    container.appendChild(div);
  });

  if (restockCandidates.length === 0) {
    container.innerHTML = `<p class="subtitle">No restock suggestions.</p>`;
  }
}

/* -----------------------------------------------
   2. AI CHAT ASSISTANT
------------------------------------------------ */
function setupAIChat() {
  const chat = document.getElementById("ai-chat")!;
  const input = document.getElementById("ai-input") as HTMLInputElement;
  const send = document.getElementById("ai-send")!;

  send.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) return;

    appendUserMessage(text);
    input.value = "";

    try {
      const pantry = loadPantry().items;
      const history = loadPurchaseHistory();

      const reply = await getChatReply(text, pantry, history, preferences);

      appendAssistantMessage(reply);
      renderSuggestionsFromReply(reply);
    } catch (err) {
      appendAssistantMessage("[Error] Unable to reach AI.");
    }
  });

  function appendUserMessage(msg: string) {
    const div = document.createElement("div");
    div.className = "ai-message user";
    div.textContent = msg;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function appendAssistantMessage(msg: string) {
    const div = document.createElement("div");
    div.className = "ai-message assistant";
    div.textContent = msg;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function renderSuggestionsFromReply(msg: string) {
    const matches = [...msg.matchAll(/\[([^\]]+)\]/g)];

    matches.forEach((match) => {
      const itemName = match[1];

      const button = document.createElement("button");
      button.textContent = `Add ${itemName}`;
      button.className = "parse-btn";
      button.style.marginTop = "6px";

      button.addEventListener("click", () => {
        addItemToShoppingList(itemName, "ai");
        renderFinalList();
      });

      const wrap = document.createElement("div");
      wrap.className = "ai-suggestion";
      wrap.appendChild(button);

      chat.appendChild(wrap);
      chat.scrollTop = chat.scrollHeight;
    });
  }
}
/* -----------------------------------------------
   3. CUSTOM ADD
------------------------------------------------ */
function setupCustomAdd() {
  const input = document.getElementById("custom-input") as HTMLInputElement;
  const btn = document.getElementById("custom-add")!;

  btn.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;
    addItemToShoppingList(name, "manual");
    input.value = "";
    renderFinalList();
  });
}

/* -----------------------------------------------
   4. FINAL SHOPPING LIST
------------------------------------------------ */
function renderFinalList() {
  const container = document.getElementById("shopping-list")!;
  const list = loadShoppingList();

  container.innerHTML = "";

  list.forEach((item) => {
    const div = document.createElement("div");
    div.className = "shopping-item";

    div.innerHTML = `
      <span class="shopping-name">${item.quantity}× ${item.name}</span>

      <div class="shopping-controls">
        <button class="pantry-btn" data-inc>+</button>
        <button class="pantry-btn" data-dec>−</button>
        <button class="pantry-btn delete" data-del>×</button>
      </div>
    `;

    div.querySelector("[data-inc]")?.addEventListener("click", () => {
      updateQuantity(item.id, +1);
      renderFinalList();
    });

    div.querySelector("[data-dec]")?.addEventListener("click", () => {
      updateQuantity(item.id, -1);
      renderFinalList();
    });

    div.querySelector("[data-del]")?.addEventListener("click", () => {
      removeItem(item.id);
      renderFinalList();
    });

    container.appendChild(div);
  });

  if (list.length === 0) {
    container.innerHTML = `<p class="subtitle">Your shopping list is empty.</p>`;
  }

  setupExport();
}

/* -----------------------------------------------
   5. EXPORT / COPY
------------------------------------------------ */
function setupExport() {
  document.getElementById("export-shopping")?.addEventListener("click", () => {
    const list = loadShoppingList();
    const json = JSON.stringify(list, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "shopping_list.json";
    a.click();

    URL.revokeObjectURL(url);
  });

  document.getElementById("copy-shopping")?.addEventListener("click", () => {
    const list = loadShoppingList();
    const text = list.map((i) => `${i.quantity}× ${i.name}`).join("\n");
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard.");
  });
}
