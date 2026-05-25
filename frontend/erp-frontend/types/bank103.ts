export type Bank103 = {
  id: number;
  tgl: string | null;
  kode: string | null;
  keterangan: string | null;
  debet: number | null;
  kredit: number | null;
  saldo: number | null;

  bkpt_receivable_id?: number | null;
  no_invoice?: string | null;
  customer_name?: string | null;
  is_used?: boolean;

  created_at?: string | null;
  updated_at?: string | null;
};

export type Bank103Payload = {
  tgl: string | null;
  kode: string | null;
  keterangan: string | null;
  debet: number;
  kredit: number;
  saldo: number;
};

export type ApplyBank103ToBkptPayload = {
  bkpt_receivable_id: number;
};