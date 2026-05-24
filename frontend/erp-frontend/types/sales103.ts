export interface Sales103 {
  id: number;

  tgl: string | null;
  no_ord: string | null;
  no_invoice: string | null;
  no_faktur: string | null;
  langganan: string | null;
  jenis_cetak: string | null;

  jml: string | number | null;
  sat: string | null;
  harga: string | number | null;

  dpp: string | number | null;
  ppn_keluar: string | number | null;
  piutang_dagang: string | number | null;

  production_order_id: number | null;
  keterangan: string | null;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface Sales103Create {
  tgl?: string | null;
  no_ord?: string | null;
  no_invoice?: string | null;
  no_faktur?: string | null;
  langganan?: string | null;
  jenis_cetak?: string | null;

  jml?: number | null;
  sat?: string | null;
  harga?: number | null;

  dpp?: number | null;
  ppn_keluar?: number | null;
  piutang_dagang?: number | null;

  production_order_id?: number | null;
  keterangan?: string | null;
}

export interface Sales103Update extends Sales103Create {}