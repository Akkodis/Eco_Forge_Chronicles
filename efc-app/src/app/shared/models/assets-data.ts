export interface Asset {
  asset: string;
  amount: number;
  rarity: number;
  age: number;
  element: string;
  profession?: string;
  race?: string;
  type: string;
  job?: string;
  attack?: number;
  defense?: number;
  health?: number;
  price?: number;
  totalAmount?: number;
}
