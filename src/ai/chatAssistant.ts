import type { PantryItem } from "../data/types";
import type { PurchaseEntry } from "../data/purchaseHistory";
import type { UserPreferences } from "../data/preferences";

export async function getChatReply(
  userMessage: string,
  pantry: PantryItem[],
  _history: PurchaseEntry[],
  prefs: UserPreferences
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API key");
  }

  const prompt = `
You are a grocery planning assistant.
You help the user plan what to buy based on their pantry, habits, and preferences.
Respond conversationally and naturally.

When you recommend specific grocery items, put each one in square brackets like:
[salsa], [lime], [rice noodles]

Never list items outside brackets unless you're explaining something.
Never output JSON.
Stay friendly and helpful.

User message:
${userMessage}

Pantry:
${pantry.map((p) => `${p.quantity}× ${p.name}`).join("\n")}

Preferences:
Vegetarian: ${prefs.vegetarian}
AI suggestion limit: ${prefs.aiSuggestionLimit}
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
        {
          role: "system",
          content: "You are a helpful grocery shopping assistant.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "I didn't understand that.";
}
