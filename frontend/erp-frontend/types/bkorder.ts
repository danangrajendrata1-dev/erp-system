export type NullableDate = string | null;

export type NullableNumber = number | null;

export interface BKOrder {
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
  quantity?: NullableNumber;
  rim?: NullableNumber;
  price?: NullableNumber;

  delivery_completed_dates?: NullableDate[] | null;
  partial_billing_quantities?: NullableNumber[] | null;
  total_keping?: NullableNumber;

  status?: string | null;
  notes?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface BKOrderPayload {
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
  quantity?: NullableNumber;
  rim?: NullableNumber;
  price?: NullableNumber;

  delivery_completed_dates?: NullableDate[] | null;
  partial_billing_quantities?: NullableNumber[] | null;
  total_keping?: NullableNumber;

  status?: string | null;
  notes?: string | null;
}
