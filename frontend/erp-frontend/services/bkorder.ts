import api from "./api";
import {
  BKOrder,
  BKOrderPayload,
} from "@/types/bkorder";

// Service BKOrder untuk komunikasi frontend ke backend.
// Frontend memakai endpoint baru /bkorders.
// Backend masih menyediakan /production-orders sebagai kompatibilitas endpoint lama.
export async function getBKOrders(): Promise<BKOrder[]> {
  const response = await api.get("/bkorders/");
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
