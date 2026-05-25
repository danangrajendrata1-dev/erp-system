import api from "./api";
import {
  ProductionOrder,
  ProductionOrderFilters,
  ProductionOrderPayload,
} from "@/types/production";

export async function getProductionOrders(filters?: ProductionOrderFilters) {
  const params: Record<string, string> = {};

  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;
  if (filters?.month) params.month = filters.month;
  if (filters?.year) params.year = filters.year;

  const response = await api.get<ProductionOrder[]>("/production-orders/", {
    params,
  });

  return response.data;
}

export async function getProductionOrder(id: string | number) {
  const response = await api.get<ProductionOrder>(`/production-orders/${id}`);
  return response.data;
}

export async function createProductionOrder(payload: ProductionOrderPayload) {
  const response = await api.post<ProductionOrder>("/production-orders/", payload);
  return response.data;
}

export async function updateProductionOrder(
  id: string | number,
  payload: ProductionOrderPayload
) {
  const response = await api.put<ProductionOrder>(
    `/production-orders/${id}`,
    payload
  );
  return response.data;
}

export async function deleteProductionOrder(id: string | number) {
  const response = await api.delete(`/production-orders/${id}`);
  return response.data;
}

export async function getProductionOrderTimeline(id: string | number) {
  const response = await api.get(`/production-orders/${id}/timeline`);
  return response.data;
}
