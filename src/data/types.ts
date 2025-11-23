export interface PantryItem {
  name: string;
  quantity: number;
  price?: number;
}

export interface Pantry {
  items: PantryItem[];
}
