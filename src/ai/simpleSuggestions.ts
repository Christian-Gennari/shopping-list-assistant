// FILE: src/ai/simpleSuggestions.ts

import type { PantryItem } from "../data/types";
import type { PurchaseEntry } from "../data/purchaseHistory";
import type { UserPreferences } from "../data/preferences";

/* ------------------------------------------
   Call OpenAI for actual suggestions
------------------------------------------- */
export async function getSimpleAISuggestions(
  pantry: PantryItem[],
  _history: PurchaseEntry[],
  prefs: UserPreferences
): Promise<string[]> {
  if (!prefs.aiSuggestions) {
    throw new Error("AI suggestions are disabled in preferences.");
  }

  const apiKey = import.meta.env.VITE_OPENAI_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API key. Set VITE_OPENAI_KEY in .env");
  }

  const prompt = `
Here is my current pantry:
${pantry.map((p) => `- ${p.quantity}× ${p.name}`).join("\n")}

Here are my preferences:
- vegetarian: ${prefs.vegetarian}
- restock window: ${prefs.autoRestockWindowDays} days

Suggest ${prefs.aiSuggestionLimit} grocery items I should consider buying.
Only return a list of item names, one per line.
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a grocery planning assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("OpenAI API error:", body);
    throw new Error("AI request failed. Unable to generate suggestions.");
  }

  const data = await res.json();

  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text) {
    throw new Error("AI returned no suggestions.");
  }

  // Parse AI text into item names
  const items = text
    .split("\n")
    .map((line: string) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line: string) => line.length > 0);

  // Trim based on user preference
  return items.slice(0, prefs.aiSuggestionLimit);
}
