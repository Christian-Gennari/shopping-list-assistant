import "./shopping.css";

import { loadPantry } from "../../data/pantry";
import { loadPurchaseHistory } from "../../data/purchaseHistory";
import { preferences } from "../../data/preferences";
import { markdownToHtml } from "../../services/markdownParser";
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
  const send = document.getElementById("ai-send") as HTMLButtonElement;
  const clear = document.getElementById("ai-clear") as HTMLButtonElement;

  // FULLSCREEN ELEMENTS
  const modal = document.getElementById("ai-modal")!;
  const modalChat = document.getElementById("ai-modal-chat")!;
  const modalInput = document.getElementById(
    "ai-modal-input"
  ) as HTMLInputElement;
  const modalSend = document.getElementById(
    "ai-modal-send"
  ) as HTMLButtonElement;
  const modalClose = document.getElementById("ai-modal-close")!;
  const expandBtn = document.getElementById("ai-fullscreen")!;

  let loadingEl: HTMLDivElement | null = null;

  /* ------------------------------------------
     Helper: attach suggestion click events
  ------------------------------------------ */
  function attachInlineSuggestionHandlers(root: HTMLElement) {
    root.querySelectorAll(".ai-inline-suggestion").forEach((el) => {
      el.addEventListener("click", () => {
        const name = (el as HTMLElement).dataset.item!;
        addItemToShoppingList(name, "ai");
        renderFinalList();
      });
    });
  }

  /* ------------------------------------------
     APPEND USER MESSAGE
  ------------------------------------------ */
  function appendUserMessage(msg: string) {
    const div = document.createElement("div");
    div.className = "ai-message user";
    div.textContent = msg;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    // Also append to modal if open
    if (!modal.classList.contains("hidden")) {
      const copy = div.cloneNode(true) as HTMLElement;
      modalChat.appendChild(copy);
      modalChat.scrollTop = modalChat.scrollHeight;
    }
  }

  /* ------------------------------------------
     APPEND ASSISTANT MESSAGE
  ------------------------------------------ */
  async function appendAssistantMessage(msg: string) {
    const div = document.createElement("div");
    div.className = "ai-message assistant";

    // Markdown → HTML
    let html = await markdownToHtml(msg);

    // Replace [item] → clickable
    html = html.replace(/\[([^\]]+)\]/g, (_, itemName: string) => {
      return `
        <span class="ai-inline-suggestion" data-item="${itemName}">
          ${itemName}
        </span>
      `;
    });

    div.innerHTML = html;
    chat.appendChild(div);
    attachInlineSuggestionHandlers(div);
    chat.scrollTop = chat.scrollHeight;

    // Also mirror into modal if open
    if (!modal.classList.contains("hidden")) {
      const modalDiv = document.createElement("div");
      modalDiv.className = "ai-message assistant";
      modalDiv.innerHTML = html;
      modalChat.appendChild(modalDiv);
      attachInlineSuggestionHandlers(modalDiv);
      modalChat.scrollTop = modalChat.scrollHeight;
    }
  }

  /* ------------------------------------------
     LOADING INDICATOR
  ------------------------------------------ */
  function setLoading(on: boolean) {
    if (on) {
      send.disabled = true;
      input.disabled = true;

      if (!loadingEl) {
        loadingEl = document.createElement("div");
        loadingEl.className = "ai-loading";
        loadingEl.innerHTML = `
          <span>Thinking</span>
          <span class="ai-loading-dot"></span>
          <span class="ai-loading-dot"></span>
          <span class="ai-loading-dot"></span>
        `;
        chat.appendChild(loadingEl);
        chat.scrollTop = chat.scrollHeight;
      }
    } else {
      send.disabled = false;
      input.disabled = false;

      if (loadingEl?.parentElement) {
        loadingEl.parentElement.removeChild(loadingEl);
      }
      loadingEl = null;
    }
  }

  /* ------------------------------------------
     SEND MESSAGE LOGIC
  ------------------------------------------ */
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || send.disabled) return;

    appendUserMessage(text);
    input.value = "";
    setLoading(true);

    const pantry = loadPantry().items;
    const history = loadPurchaseHistory();

    try {
      const reply = await getChatReply(text, pantry, history, preferences);
      await appendAssistantMessage(reply);
    } catch (err) {
      console.error(err);
      await appendAssistantMessage("[Error] Unable to reach AI.");
    } finally {
      setLoading(false);
    }
  }

  send.addEventListener("click", () => void sendMessage());

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void sendMessage();
    }
  });

  clear.addEventListener("click", () => {
    chat.innerHTML = "";
    modalChat.innerHTML = "";
  });

  /* ------------------------------------------
     FULLSCREEN MODE
  ------------------------------------------ */

  expandBtn.addEventListener("click", () => {
    // Clone content
    modalChat.innerHTML = chat.innerHTML;

    // Reattach handlers inside modal
    attachInlineSuggestionHandlers(modalChat);

    modal.classList.remove("hidden");
    modalInput.focus();
  });

  modalClose.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modalSend.addEventListener("click", () => {
    const txt = modalInput.value.trim();
    if (!txt) return;

    appendUserMessage(txt);
    input.value = txt; // forward to main input
    modalInput.value = "";
    send.click();
  });
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
