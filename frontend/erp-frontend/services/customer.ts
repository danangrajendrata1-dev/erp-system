import api from "./api";

export const getCustomers = async () => {

  const response = await api.get(
    "/customers"
  );

  return response.data;
};

export const createCustomer =
  async (

    data: {

      name: string;
      phone: string;
      address: string;

    }

  ) => {

    const response = await api.post(
      "/customers",
      data
    );

    return response.data;
};

export const deleteCustomer =
  async (id: number) => {

    const response = await api.delete(
      `/customers/${id}`
    );

    return response.data;
};