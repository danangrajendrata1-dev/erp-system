import api from "./api";
import { Invoice103Group, Invoice103Source } from "@/types/invoice103";

function toNumber(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

export async function getInvoice103Source() {
  const response = await api.get<Invoice103Source[]>("/sales-103/");
  return response.data;
}

export async function getInvoice103Groups(): Promise<Invoice103Group[]> {
  const data = await getInvoice103Source();

  const grouped = data.reduce<Record<string, Invoice103Group>>((acc, item) => {
    const invoiceNumber = item.no_invoice?.trim();

    if (!invoiceNumber) return acc;

    if (!acc[invoiceNumber]) {
      acc[invoiceNumber] = {
        no_invoice: invoiceNumber,
        no_faktur: item.no_faktur || "",
        tgl: item.tgl || "",
        langganan: item.langganan || "",
        rows: [],
        total_dpp: 0,
        total_ppn_keluar: 0,
        total_piutang_dagang: 0,
      };
    }

    acc[invoiceNumber].rows.push(item);
    acc[invoiceNumber].total_dpp += toNumber(item.dpp);
    acc[invoiceNumber].total_ppn_keluar += toNumber(item.ppn_keluar);
    acc[invoiceNumber].total_piutang_dagang += toNumber(item.piutang_dagang);

    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => {
    const dateA = a.tgl ? new Date(a.tgl).getTime() : 0;
    const dateB = b.tgl ? new Date(b.tgl).getTime() : 0;

    return dateB - dateA;
  });
}

export async function getInvoice103ByNoInvoice(noInvoice: string) {
  const groups = await getInvoice103Groups();

  return groups.find((item) => item.no_invoice === noInvoice) || null;
}