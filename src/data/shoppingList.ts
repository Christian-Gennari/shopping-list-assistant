// FILE: src/data/shoppingList.ts

export interface ShoppingListItem {
  id: string; // unique ID for stable updates
  name: string;
  quantity: number;
  source: "restock" | "ai" | "manual";
}

const SHOPPING_KEY = "grocerai-shopping-list";

export function loadShoppingList(): ShoppingListItem[] {
  try {
    const raw = localStorage.getItem(SHOPPING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveShoppingList(list: ShoppingListItem[]) {
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(list));
}

export function addItemToShoppingList(
  name: string,
  source: ShoppingListItem["source"],
  quantity = 1
) {
  const list = loadShoppingList();

  // Try merge with existing item
  const existing = list.find(
    (i) => i.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) {
    existing.quantity += quantity;
    saveShoppingList(list);
    return;
  }

  list.push({
    id: crypto.randomUUID(),
    name,
    quantity,
    source,
  });

  saveShoppingList(list);
}

export function updateQuantity(id: string, delta: number) {
  const list = loadShoppingList();
  const item = list.find((i) => i.id === id);
  if (!item) return;

  item.quantity = Math.max(1, item.quantity + delta);
  saveShoppingList(list);
}

export function removeItem(id: string) {
  const list = loadShoppingList().filter((i) => i.id !== id);
  saveShoppingList(list);
}

export function clearShoppingList() {
  saveShoppingList([]);
}
