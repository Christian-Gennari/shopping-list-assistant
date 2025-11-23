import "./preferences.css";
import { preferences, updatePreference } from "../../data/preferences";

export function initView() {
  initPreferencesUI();
}

function initPreferencesUI() {
  (document.getElementById("pref-vegetarian") as HTMLInputElement).checked =
    preferences.vegetarian;

  (document.getElementById("pref-restockWindow") as HTMLInputElement).value =
    preferences.autoRestockWindowDays.toString();

  (document.getElementById("pref-autoAddRestock") as HTMLInputElement).checked =
    preferences.autoAddRestock;

  (document.getElementById("pref-aiSuggestions") as HTMLInputElement).checked =
    preferences.aiSuggestions;

  (document.getElementById("pref-aiLimit") as HTMLInputElement).value =
    preferences.aiSuggestionLimit.toString();

  setupPrefListeners();
}

function setupPrefListeners() {
  document
    .getElementById("pref-vegetarian")
    ?.addEventListener("change", (e) =>
      updatePreference("vegetarian", (e.target as HTMLInputElement).checked)
    );

  document
    .getElementById("pref-restockWindow")
    ?.addEventListener("change", (e) =>
      updatePreference(
        "autoRestockWindowDays",
        Number((e.target as HTMLInputElement).value)
      )
    );

  document
    .getElementById("pref-autoAddRestock")
    ?.addEventListener("change", (e) =>
      updatePreference("autoAddRestock", (e.target as HTMLInputElement).checked)
    );

  document
    .getElementById("pref-aiSuggestions")
    ?.addEventListener("change", (e) =>
      updatePreference("aiSuggestions", (e.target as HTMLInputElement).checked)
    );

  document
    .getElementById("pref-aiLimit")
    ?.addEventListener("change", (e) =>
      updatePreference(
        "aiSuggestionLimit",
        Number((e.target as HTMLInputElement).value)
      )
    );
}
