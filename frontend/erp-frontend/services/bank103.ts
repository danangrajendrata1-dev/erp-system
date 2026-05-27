import api from "./api";
import {
  Bank103,
  Bank103Payload,
  ApplyBank103ToBkptPayload,
  AllocateBank103ToBkptPayload,
} from "@/types/bank103";

function normalizeList(data: unknown): Bank103[] {
  if (Array.isArray(data)) return data as Bank103[];

  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: Bank103[] }).data;
  }

  return [];
}

function normalizeItem(data: unknown): Bank103 {
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    (data as { data?: unknown }).data
  ) {
    return (data as { data: Bank103 }).data;
  }

  return data as Bank103;
}

export async function getBank103List(): Promise<Bank103[]> {
  const res = await api.get("/bank-103/");
  return normalizeList(res.data);
}

export async function getBank103ById(id: number): Promise<Bank103> {
  const res = await api.get(`/bank-103/${id}`);
  return normalizeItem(res.data);
}

export async function createBank103(payload: Bank103Payload): Promise<Bank103> {
  const res = await api.post("/bank-103/", payload);
  return normalizeItem(res.data);
}

export async function updateBank103(
  id: number,
  payload: Bank103Payload
): Promise<Bank103> {
  const res = await api.put(`/bank-103/${id}`, payload);
  return normalizeItem(res.data);
}

export async function deleteBank103(id: number): Promise<void> {
  await api.delete(`/bank-103/${id}`);
}

export async function getAvailableBkptPayments(): Promise<Bank103[]> {
  const res = await api.get("/bank-103/available-bkpt-payments");
  return normalizeList(res.data);
}

export async function applyBank103ToBkpt(
  bankId: number,
  payload: ApplyBank103ToBkptPayload
): Promise<unknown> {
  const res = await api.post(`/bank-103/${bankId}/apply-to-bkpt`, payload);
  return res.data;
}

export async function allocateBank103ToMultipleBkpt(
  bankId: number,
  payload: AllocateBank103ToBkptPayload
): Promise<unknown> {
  const res = await api.post(`/bank-103/${bankId}/allocate-bkpt`, payload);
  return res.data;
}

export async function autoApplyBank103ToBkpt(bankId: number): Promise<unknown> {
  const res = await api.post(`/bank-103/${bankId}/auto-apply-to-bkpt`);
  return res.data;
}