export interface BKPtReceivable {
  id: number;

  customer_name: string;

  tgl?: string | null;
  invoice_year?: number | null;
  invoice_month?: number | null;
  no_order?: string | null;
  no_invoice?: string | null;
  faktur?: string | null;
  pr?: string | null;

  debet?: number | string | null;
  kredit?: number | string | null;
  pph_psl_21?: number | string | null;
  pph_psl_23?: number | string | null;
  saldo?: number | string | null;

  keterangan?: string | null;
  sales_103_id?: number | null;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface BKPtReceivablePayload {
  customer_name: string;

  tgl?: string | null;
  invoice_year?: number | null;
  invoice_month?: number | null;
  no_order?: string | null;
  no_invoice?: string | null;
  faktur?: string | null;
  pr?: string | null;

  debet?: number;
  kredit?: number;
  pph_psl_21?: number;
  pph_psl_23?: number;
  saldo?: number;

  keterangan?: string | null;
  sales_103_id?: number | null;
}
