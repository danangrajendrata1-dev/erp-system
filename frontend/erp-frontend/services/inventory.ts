import api from "./api";

export const getInventory =
  async () => {

    const response = await api.get(
      "/inventory"
    );

    return response.data;
};

export const createInventory =
  async (data: any) => {

    const response = await api.post(
      "/inventory",
      data
    );

    return response.data;
};

export const deleteInventory =
  async (id: number) => {

    const response = await api.delete(
      `/inventory/${id}`
    );

    return response.data;
};