export interface Invoice103Source {
  id: number;

  tgl?: string | null;
  no_ord?: string | null;
  no_invoice?: string | null;
  no_faktur?: string | null;
  langganan?: string | null;
  jenis_cetak?: string | null;

  jml?: number | string | null;
  sat?: string | null;
  harga?: number | string | null;
  dpp?: number | string | null;
  ppn_keluar?: number | string | null;
  piutang_dagang?: number | string | null;

  keterangan?: string | null;
}

export interface Invoice103Group {
  no_invoice: string;
  no_faktur?: string | null;
  tgl?: string | null;
  langganan?: string | null;
  rows: Invoice103Source[];
  total_dpp: number;
  total_ppn_keluar: number;
  total_piutang_dagang: number;
}