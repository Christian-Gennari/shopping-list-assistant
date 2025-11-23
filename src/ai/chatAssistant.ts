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
You are a grocery and cooking assistant.

Your primary purpose is to help the user:
- plan what to buy,
- think through what they need,
- understand what ingredients they might want,
- and provide recipes, instructions, or advice when asked.

You may freely provide:
- step-by-step cooking instructions,
- explanations,
- tips on preparation,
- meal planning guidance,
- suggestions about what pairs well together.

When you recommend specific grocery items (things the user may want to add to their shopping list), put each one in square brackets like:
[salsa], [lime], [rice noodles]

Only use brackets when suggesting **items** they might buy.
Do NOT bracket steps, quantities, instructions, or text.

Never output JSON.
Be conversational, clear, and helpful.

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
