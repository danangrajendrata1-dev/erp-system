export type NullableDate = string | null;

export interface ProductionOrder {
  id: number;

  order_date?: NullableDate;
  order_number?: string | null;
  po_date?: NullableDate;
  do_number?: string | null;
  delivery_date?: NullableDate;

  customer_name?: string | null;
  size?: string | null;
  material_type?: string | null;
  print_type?: string | null;
  specification?: string | null;

  unit?: string | null;
  quantity?: number | null;
  rim?: number | null;
  price?: number | null;

  delivery_completed_dates?: NullableDate[] | null;
  partial_billing_quantities?: number[] | null;
  total_keping?: number | null;

  status?: string | null;
  notes?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProductionOrderPayload {
  order_date?: NullableDate;
  order_number?: string | null;
  po_date?: NullableDate;
  do_number?: string | null;
  delivery_date?: NullableDate;

  customer_name?: string | null;
  size?: string | null;
  material_type?: string | null;
  print_type?: string | null;
  specification?: string | null;

  unit?: string | null;
  quantity?: number | null;
  rim?: number | null;
  price?: number | null;

  delivery_completed_dates?: NullableDate[] | null;
  partial_billing_quantities?: number[] | null;
  total_keping?: number | null;

  status?: string | null;
  notes?: string | null;
}