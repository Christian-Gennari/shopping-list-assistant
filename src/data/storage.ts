import type { Pantry } from "./types";

const KEY = "grocerai_pantry";

export const Storage = {
  save(pantry: Pantry) {
    localStorage.setItem(KEY, JSON.stringify(pantry));
  },

  load(): Pantry | null {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },

  export(): string {
    return localStorage.getItem(KEY) ?? "";
  },

  import(json: string) {
    localStorage.setItem(KEY, json);
  },
};
