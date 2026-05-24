import api from "./api";
import { ProductionOrder } from "@/types/production";

export async function getProductionOrders(): Promise<ProductionOrder[]> {
  const response = await api.get("/production-orders/");
  return response.data;
}

export async function getProductionOrder(id: number): Promise<ProductionOrder> {
  const response = await api.get(`/production-orders/${id}`);
  return response.data;
}

export async function getProductionOrderTimeline(id: number) {
  const response = await api.get(`/production-orders/${id}/timeline`);
  return response.data;
}

export async function createProductionOrder(data: Partial<ProductionOrder>) {
  const response = await api.post("/production-orders/", data);
  return response.data;
}

export async function updateProductionOrder(
  id: number,
  data: Partial<ProductionOrder>
) {
  const response = await api.put(`/production-orders/${id}`, data);
  return response.data;
}

export async function updateProductionOrderStatus(id: number, status: string) {
  const response = await api.patch(
    `/production-orders/${id}/status?status=${status}`
  );
  return response.data;
}