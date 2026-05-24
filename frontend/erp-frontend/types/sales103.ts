import api from "./api";
import {
  Sales103,
  Sales103Create,
  Sales103Update,
} from "@/types/sales103";

export async function getSales103(): Promise<Sales103[]> {
  const response = await api.get("/sales-103/");
  return response.data;
}

export async function getSales103ById(id: number): Promise<Sales103> {
  const response = await api.get(`/sales-103/${id}`);
  return response.data;
}

export async function createSales103(data: Sales103Create): Promise<Sales103> {
  const response = await api.post("/sales-103/", data);
  return response.data;
}

export async function updateSales103(
  id: number,
  data: Sales103Update
): Promise<Sales103> {
  const response = await api.put(`/sales-103/${id}`, data);
  return response.data;
}

export async function deleteSales103(id: number): Promise<void> {
  await api.delete(`/sales-103/${id}`);
}