import api from "./api";
import { MaterialType, MaterialTypePayload } from "@/types/material";

export async function getMaterialTypes(): Promise<MaterialType[]> {
  const response = await api.get("/material-types/");
  return response.data;
}

export async function searchMaterialTypes(
  keyword: string
): Promise<MaterialType[]> {
  const response = await api.get("/material-types/search", {
    params: {
      q: keyword,
      limit: 10,
    },
  });

  return response.data;
}

export async function createMaterialType(
  payload: MaterialTypePayload
): Promise<MaterialType> {
  const response = await api.post("/material-types/", payload);
  return response.data;
}

export async function updateMaterialType(
  id: number,
  payload: Partial<MaterialTypePayload>
): Promise<MaterialType> {
  const response = await api.put(`/material-types/${id}`, payload);
  return response.data;
}

export async function deleteMaterialType(id: number): Promise<void> {
  await api.delete(`/material-types/${id}`);
}