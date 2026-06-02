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
  partial_billing_input_quantities?: NullableNumber[] | null;
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
  partial_billing_input_quantities?: NullableNumber[] | null;
  total_keping?: NullableNumber;

  status?: string | null;
  notes?: string | null;
}

export interface BKOrderImportPreviewRow {
  row_number: number;
  data: Partial<BKOrderPayload> & {
    order_number?: string | null;
    customer_name?: string | null;
    unit?: string | null;
  };
  errors: string[];
  warnings: string[];
  is_valid: boolean;
  is_header_row: boolean;
}

export interface BKOrderImportPreviewGroup {
  order_number?: string | null;
  customer_name?: string | null;
  order_date?: string | null;
  po_date?: string | null;
  do_number?: string | null;
  delivery_date?: string | null;
  row_count: number;
  valid_count: number;
  error_count: number;
  duplicate_count: number;
  rows: BKOrderImportPreviewRow[];
}

export interface BKOrderImportPreviewResponse {
  groups: BKOrderImportPreviewGroup[];
  rows: BKOrderImportPreviewRow[];
  valid_count: number;
  error_count: number;
  duplicate_count: number;
}

export interface BKOrderImportCommitResponse {
  success_count: number;
  failed_count: number;
  duplicate_count: number;
  errors: { row: number; message: string }[];
  success: boolean;
}
