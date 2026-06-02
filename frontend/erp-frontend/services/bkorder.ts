import api from "./api";
import {
  BKOrderImportCommitResponse,
  BKOrderImportPreviewResponse,
  BKOrder,
  BKOrderPayload,
} from "@/types/bkorder";

type BKOrderQueryParams = {
  year?: number;
  month?: number;
};

// Service BKOrder untuk komunikasi frontend ke backend.
// Frontend memakai endpoint baru /bkorders.
// Backend masih menyediakan /production-orders sebagai kompatibilitas endpoint lama.
export async function getBKOrders(
  params?: BKOrderQueryParams
): Promise<BKOrder[]> {
  const config = params ? { params } : undefined;
  const response = await api.get("/bkorders/", config);
  return response.data;
}

export async function getBKOrder(
  id: string | number
): Promise<BKOrder> {
  const response = await api.get(`/bkorders/${id}`);
  return response.data;
}

export async function createBKOrder(
  payload: BKOrderPayload
): Promise<BKOrder> {
  const response = await api.post("/bkorders/", payload);
  return response.data;
}

export async function updateBKOrder(
  id: string | number,
  payload: BKOrderPayload
): Promise<BKOrder> {
  const response = await api.put(`/bkorders/${id}`, payload);
  return response.data;
}

export async function deleteBKOrder(id: string | number): Promise<void> {
  await api.delete(`/bkorders/${id}`);
}

export async function previewBKOrderImport(
  file: File
): Promise<BKOrderImportPreviewResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/bkorders/import/preview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function commitBKOrderImport(payload: {
  rows: BKOrderImportPreviewResponse["rows"];
}): Promise<BKOrderImportCommitResponse> {
  const response = await api.post("/bkorders/import/commit", payload);
  return response.data;
}
