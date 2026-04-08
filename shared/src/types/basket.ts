export interface BasketItem {
  id: number;
  item_key: string;
  name: string;
  unit_label: string;
  category: string;
  spec: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BasketItemQuantity {
  id: number;
  basket_item_id: number;
  effective_month: string;
  monthly_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface BasketItemWithQuantity extends BasketItem {
  monthly_quantity: number | null;
  effective_month: string | null;
}
