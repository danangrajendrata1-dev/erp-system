export type Bank103 = {
  id: number;
  tgl: string | null;
  kode: string | null;
  keterangan: string | null;

  debet: number | string | null;
  kredit: number | string | null;
  saldo: number | string | null;

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

  bkpt_receivable_id?: number | null;
  no_invoice?: string | null;
  customer_name?: string | null;
  is_used?: boolean;
};

export type ApplyBank103ToBkptPayload = {
  bkpt_receivable_id: number;
};

export type AllocateBank103ToBkptItem = {
  bkpt_receivable_id: number;
  amount: number;
};

export type AllocateBank103ToBkptPayload = {
  allocations: AllocateBank103ToBkptItem[];
};

export type Bank103Allocation = {
  id: number;
  bank_103_id: number;
  bkpt_receivable_id: number;
  allocated_amount: number | string;
  created_at?: string | null;
};

export type ApplyBank103ToBkptResponse = {
  status: string;
  message: string;
  bank_103?: Bank103;
  bkpt?: unknown;
  allocations?: Bank103Allocation[];
};

export type AllocateBank103ToBkptResponse = {
  status: string;
  message: string;
  bank_103?: Bank103;
  bkpts?: unknown[];
  allocations?: Bank103Allocation[];
};