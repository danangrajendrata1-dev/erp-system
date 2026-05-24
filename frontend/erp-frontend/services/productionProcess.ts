import api from "./api";

export type ProductionProcessCreate = {
  production_order_id: number;
  process_type: "POTONG" | "CETAK" | "FINISHING";
  start_date?: string | null;
  finish_date?: string | null;
  operator_name?: string | null;
  machine_name?: string | null;
  input_quantity?: number;
  output_quantity?: number;
  reject_quantity?: number;
  note?: string | null;
};

export async function createProductionProcess(data: ProductionProcessCreate) {
  const response = await api.post("/production-processes/", data);
  return response.data;
}