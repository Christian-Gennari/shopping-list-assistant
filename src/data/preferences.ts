export interface UserPreferences {
  vegetarian: boolean;
  autoRestockWindowDays: number;
  autoAddRestock: boolean;
  aiSuggestions: boolean;
  aiSuggestionLimit: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  vegetarian: true,
  autoRestockWindowDays: 90,
  autoAddRestock: true,
  aiSuggestions: true,
  aiSuggestionLimit: 10,
};

const PREF_KEY = "grocerai-preferences";

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

export let preferences = loadPreferences();

export function updatePreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
) {
  preferences[key] = value;
  savePreferences(preferences);
}
