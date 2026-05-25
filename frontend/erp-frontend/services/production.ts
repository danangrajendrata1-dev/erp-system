import api from "./api";
import {
  ProductionOrder,
  ProductionOrderPayload,
} from "@/types/production";

export async function getProductionOrders(): Promise<ProductionOrder[]> {
  const response = await api.get("/production-orders/");
  return response.data;
}

export async function getProductionOrder(
  id: string | number
): Promise<ProductionOrder> {
  const response = await api.get(`/production-orders/${id}`);
  return response.data;
}

export async function createProductionOrder(
  payload: ProductionOrderPayload
): Promise<ProductionOrder> {
  const response = await api.post("/production-orders/", payload);
  return response.data;
}

export async function updateProductionOrder(
  id: string | number,
  payload: ProductionOrderPayload
): Promise<ProductionOrder> {
  const response = await api.put(`/production-orders/${id}`, payload);
  return response.data;
}

export async function deleteProductionOrder(id: string | number): Promise<void> {
  await api.delete(`/production-orders/${id}`);
}