import type { PantryItem, Pantry } from "./types";

const PANTRY_KEY = "grocerai-pantry";

/* ------------------------------------------
   Load pantry from localStorage (safe)
------------------------------------------- */
export function loadPantry(): Pantry {
  try {
    const raw = localStorage.getItem(PANTRY_KEY);
    if (!raw) return { items: [] };

    const parsed = JSON.parse(raw) as Pantry;

    if (!parsed.items || !Array.isArray(parsed.items)) {
      return { items: [] };
    }

    return parsed;
  } catch {
    return { items: [] };
  }
}

/* ------------------------------------------
   Save pantry to localStorage
------------------------------------------- */
function savePantry(pantry: Pantry) {
  localStorage.setItem(PANTRY_KEY, JSON.stringify(pantry));
}

/* ------------------------------------------
   Exported shared pantry object
------------------------------------------- */
export const pantry: Pantry = loadPantry();

/* ------------------------------------------
   Merge parsed Foodora items into pantry
------------------------------------------- */
export function mergeIntoPantry(
  parsed: { qty: string; name: string; price: string }[]
): void {
  parsed.forEach((p) => {
    const qty = Number(p.qty) || 1;
    const priceNum = parseFloat(p.price.replace(",", "."));

    const existing = pantry.items.find((i) => i.name === p.name);

    if (existing) {
      existing.quantity += qty;
    } else {
      pantry.items.push({
        name: p.name,
        quantity: qty,
        price: isNaN(priceNum) ? undefined : priceNum,
      });
    }
  });

  savePantry(pantry);
}

/* ------------------------------------------
   Export pantry to JSON string
------------------------------------------- */
export function exportPantry(): string {
  return JSON.stringify(pantry, null, 2);
}

/* ------------------------------------------
   Import JSON text into pantry
------------------------------------------- */
export function importPantryJson(json: string) {
  try {
    const parsed = JSON.parse(json) as Pantry;

    if (!parsed.items || !Array.isArray(parsed.items)) {
      alert("Import failed: invalid pantry format");
      return;
    }

    pantry.items = parsed.items;
    savePantry(pantry);
  } catch {
    alert("Import failed: invalid JSON");
  }
}

export function increaseItem(name: string) {
  const p = loadPantry();
  const item = p.items.find((i) => i.name === name);
  if (!item) return;

  item.quantity++;
  localStorage.setItem(PANTRY_KEY, JSON.stringify(p));
}

export function decreaseItem(name: string) {
  const p = loadPantry();
  const item = p.items.find((i) => i.name === name);
  if (!item) return;

  item.quantity = Math.max(0, item.quantity - 1);

  if (item.quantity === 0) {
    p.items = p.items.filter((i) => i.name !== name);
  }

  localStorage.setItem(PANTRY_KEY, JSON.stringify(p));
}

export function deleteItem(name: string) {
  const p = loadPantry();
  p.items = p.items.filter((i) => i.name !== name);
  localStorage.setItem(PANTRY_KEY, JSON.stringify(p));
}
