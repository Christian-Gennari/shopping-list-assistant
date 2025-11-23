// FILE: src/ai/simpleSuggestions.ts

import type { PantryItem } from "../data/types";
import type { PurchaseEntry } from "../data/purchaseHistory";
import type { UserPreferences } from "../data/preferences";

export function getSimpleAISuggestions(
  pantry: PantryItem[],
  history: PurchaseEntry[],
  prefs: UserPreferences
): string[] {
  // Very simple deterministic rules for now

  const suggestions: string[] = [];

  const lowerPantry = pantry.map((p) => p.name.toLowerCase());

  // Suggest vegetables if vegetarian
  if (prefs.vegetarian) {
    ["broccoli", "spinach", "tomatoes", "chickpeas", "lentils"].forEach((i) => {
      if (!lowerPantry.includes(i)) suggestions.push(i);
    });
  }

  // Suggest "basics" missing
  ["milk", "bread", "eggs", "rice", "olive oil"].forEach((i) => {
    if (!lowerPantry.includes(i)) suggestions.push(i);
  });

  // Limit
  return suggestions.slice(0, prefs.aiSuggestionLimit);
}
