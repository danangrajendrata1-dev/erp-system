export type ProductionOrderStatus = "OPEN" | "PROSES" | "SELESAI" | "BATAL" | string;

export interface ProductionOrder {
  id: number;
  order_date?: string | null; // TGL
  order_number?: string | null; // NO.ORD
  po_date?: string | null; // PO Date
  do_number?: string | null; // DO NUMBER
  delivery_date?: string | null; // Deliv. Date
  customer_name?: string | null; // PR
  size?: string | null; // UKURAN
  material_type?: string | null; // JENIS BAHAN
  print_type?: string | null; // JENIS CETAK
  specification?: string | null; // SPESIFIKASI
  unit?: string | null; // SAT
  quantity?: number | string | null; // JUMLAH
  rim?: number | string | null; // Rim
  price?: number | string | null; // HARGA
  delivery_completed_dates?: Array<string | null>; // TGL KIRIM / SELESAI O:AB
  partial_billing_quantities?: Array<number | string | null>; // TAGIHAN PARSIAL AC:AP
  total_keping?: number | string | null; // TOTAL (Keping)
  status?: ProductionOrderStatus | null; // STATUS
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProductionOrderPayload {
  order_date?: string | null;
  order_number?: string | null;
  po_date?: string | null;
  do_number?: string | null;
  delivery_date?: string | null;
  customer_name?: string | null;
  size?: string | null;
  material_type?: string | null;
  print_type?: string | null;
  specification?: string | null;
  unit?: string | null;
  quantity?: number;
  rim?: number;
  price?: number;
  delivery_completed_dates?: Array<string | null>;
  partial_billing_quantities?: Array<number | null>;
  total_keping?: number;
  status?: ProductionOrderStatus;
  notes?: string | null;
}

export interface ProductionOrderFilters {
  search?: string;
  status?: string;
  month?: string;
  year?: string;
}
