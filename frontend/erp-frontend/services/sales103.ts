import api from "./api";
import {
  NextSales103InvoiceResponse,
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

export async function getNextSales103InvoiceNumber(
  tgl: string
): Promise<string> {
  try {
    const response = await api.get<NextSales103InvoiceResponse>(
      "/sales-103/invoices/next-number",
      {
        params: { tgl },
      }
    );

    return response.data.next_invoice;
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;

    if (status !== 404) {
      throw error;
    }

    const fallbackResponse = await api.get<Sales103[]>("/sales-103/");
    const invoiceDate = new Date(tgl);

    if (Number.isNaN(invoiceDate.getTime())) {
      return "LOI.0001";
    }

    const year = invoiceDate.getFullYear();
    const month = invoiceDate.getMonth() + 1;

    const invoiceRows = fallbackResponse.data.filter((item) => {
      if (!item.tgl || item.no_invoice !== "LOI.0001") {
        return item.tgl === tgl && item.no_invoice?.trim() === "LOI.0001";
      }

      const rowDate = new Date(item.tgl);

      return (
        !Number.isNaN(rowDate.getTime()) &&
        rowDate.getFullYear() === year &&
        rowDate.getMonth() + 1 === month
      );
    });

    let maxNumber = 0;

    invoiceRows.forEach((item) => {
      const match = String(item.no_invoice || "")
        .trim()
        .toUpperCase()
        .match(/^LOI\.(\d+)$/);

      if (!match) return;

      const number = Number(match[1]);
      if (Number.isFinite(number)) {
        maxNumber = Math.max(maxNumber, number);
      }
    });

    return `LOI.${String(maxNumber + 1).padStart(4, "0")}`;
  }
}
