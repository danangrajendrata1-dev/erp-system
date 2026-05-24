import api from "./api";

export type MaterialReceiptCreate = {
  production_order_id: number;
  material_id?: number | null;
  supplier_id?: number | null;
  receipt_date?: string | null;
  material_name?: string | null;
  supplier_name?: string | null;
  quantity?: number;
  unit?: string | null;
  note?: string | null;
};

export async function createMaterialReceipt(data: MaterialReceiptCreate) {
  const response = await api.post("/material-receipts/", data);
  return response.data;
}