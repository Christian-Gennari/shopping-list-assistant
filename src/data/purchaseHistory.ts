// FILE: src/data/purchaseHistory.ts

export interface PurchasedItem {
  name: string;
  qty: number;
  price?: number;
}

export interface PurchaseEntry {
  timestamp: number; // Date.now()
  items: PurchasedItem[];
  source?: "foodora" | "manual";
}

const HISTORY_KEY = "grocerai-purchase-history";

/* ------------------------------------------
   Load full purchase history
------------------------------------------- */
export function loadPurchaseHistory(): PurchaseEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as PurchaseEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* ------------------------------------------
   Save full purchase history
------------------------------------------- */
function savePurchaseHistory(entries: PurchaseEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

/* ------------------------------------------
   Add a new purchase entry
------------------------------------------- */
export function addPurchaseEntry(
  items: { qty: string; name: string; price: string }[],
  source: PurchaseEntry["source"] = "foodora"
) {
  const history = loadPurchaseHistory();

  const normalizedItems: PurchasedItem[] = items.map((i) => {
    const qty = Number(i.qty) || 1;
    const priceNum = parseFloat(i.price.replace(",", "."));

    return {
      name: i.name.trim(),
      qty,
      price: isNaN(priceNum) ? undefined : priceNum,
    };
  });

  history.push({
    timestamp: Date.now(),
    items: normalizedItems,
    source,
  });

  savePurchaseHistory(history);
}

/* ------------------------------------------
   Simple helper: total quantities bought
------------------------------------------- */
export function getTotalBoughtMap(): Record<string, number> {
  const history = loadPurchaseHistory();
  const map: Record<string, number> = {};

  history.forEach((entry) => {
    entry.items.forEach((item) => {
      map[item.name] = (map[item.name] ?? 0) + item.qty;
    });
  });

  return map;
}

/* ------------------------------------------
   Simple helper: most bought items
------------------------------------------- */
export function getMostBoughtItems(
  limit = 5
): { name: string; totalQty: number }[] {
  const map = getTotalBoughtMap();

  return Object.entries(map)
    .map(([name, totalQty]) => ({ name, totalQty }))
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, limit);
}
