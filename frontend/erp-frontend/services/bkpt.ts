import api from "./api";
import { BKPtReceivable, BKPtReceivablePayload } from "@/types/bkpt";

export async function getBKPtReceivables(params?: {
  customer_name?: string;
  month?: string;
  year?: string;
  no_invoice?: string;
  invoice_year?: string | number;
  invoice_month?: string | number;
}) {
  const response = await api.get<BKPtReceivable[]>("/bkpt-receivables/", {
    params,
  });

  return response.data;
}

export async function getBKPtReceivable(id: string | number) {
  const response = await api.get<BKPtReceivable>(`/bkpt-receivables/${id}`);

  return response.data;
}

export async function createBKPtReceivable(data: BKPtReceivablePayload) {
  const response = await api.post<BKPtReceivable>("/bkpt-receivables/", data);

  return response.data;
}

export async function updateBKPtReceivable(
  id: string | number,
  data: Partial<BKPtReceivablePayload>
) {
  const response = await api.put<BKPtReceivable>(
    `/bkpt-receivables/${id}`,
    data
  );

  return response.data;
}

export async function deleteBKPtReceivable(id: string | number) {
  const response = await api.delete(`/bkpt-receivables/${id}`);

  return response.data;
}
