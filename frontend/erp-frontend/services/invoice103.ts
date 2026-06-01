import api from "./api";
import { BKPtReceivable } from "@/types/bkpt";
import {
  Invoice103Group,
  Invoice103Metadata,
  Invoice103MetadataPayload,
  Invoice103Source,
} from "@/types/invoice103";

function toNumber(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function getInvoicePeriod(value: string | null | undefined) {
  if (!value) {
    return { year: null, month: null };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { year: null, month: null };
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

export async function getInvoice103Source() {
  const response = await api.get<Invoice103Source[]>("/sales-103/");
  return response.data;
}

export async function getInvoice103Groups(): Promise<Invoice103Group[]> {
  const data = await getInvoice103Source();

  const grouped = data.reduce<Record<string, Invoice103Group>>((acc, item) => {
    const invoiceNumber = item.no_invoice?.trim();
    const period = getInvoicePeriod(item.tgl);

    if (!invoiceNumber || !period.year || !period.month) return acc;

    const groupKey = `${period.year}-${period.month}-${invoiceNumber}`;

    if (!acc[groupKey]) {
      acc[groupKey] = {
        no_invoice: invoiceNumber,
        year: period.year,
        month: period.month,
        no_faktur: item.no_faktur || "",
        tgl: item.tgl || "",
        langganan: item.langganan || "",
        rows: [],
        total_dpp: 0,
        total_ppn_keluar: 0,
        total_piutang_dagang: 0,
      };
    }

    acc[groupKey].rows.push(item);
    acc[groupKey].total_dpp += toNumber(item.dpp);
    acc[groupKey].total_ppn_keluar += toNumber(item.ppn_keluar);
    acc[groupKey].total_piutang_dagang += toNumber(item.piutang_dagang);

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

export async function getInvoice103ByPeriod(
  noInvoice: string,
  year: number,
  month: number
) {
  const periodPath = `/sales-103/invoice/${year}/${String(month).padStart(2, "0")}/${encodeURIComponent(noInvoice)}`;

  try {
    const response = await api.get<Invoice103Source[]>(periodPath);
    const rows = response.data;

    if (!rows.length) {
      return null;
    }

    return {
      no_invoice: noInvoice,
      year,
      month,
      no_faktur: rows[0]?.no_faktur || "",
      tgl: rows[0]?.tgl || "",
      langganan: rows[0]?.langganan || "",
      rows,
      total_dpp: rows.reduce((sum, item) => sum + toNumber(item.dpp), 0),
      total_ppn_keluar: rows.reduce((sum, item) => sum + toNumber(item.ppn_keluar), 0),
      total_piutang_dagang: rows.reduce(
        (sum, item) => sum + toNumber(item.piutang_dagang),
        0
      ),
    } satisfies Invoice103Group;
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;

    if (status !== 404) {
      throw error;
    }

    const fallbackResponse = await api.get<Invoice103Source[]>(
      `/sales-103/invoice/${encodeURIComponent(noInvoice)}`
    );
    const rows = fallbackResponse.data.filter((item) => {
      if (!item.tgl) return false;

      const invoiceDate = new Date(item.tgl);

      return (
        !Number.isNaN(invoiceDate.getTime()) &&
        invoiceDate.getFullYear() === year &&
        invoiceDate.getMonth() + 1 === month
      );
    });

    if (!rows.length) {
      return null;
    }

    return {
      no_invoice: noInvoice,
      year,
      month,
      no_faktur: rows[0]?.no_faktur || "",
      tgl: rows[0]?.tgl || "",
      langganan: rows[0]?.langganan || "",
      rows,
      total_dpp: rows.reduce((sum, item) => sum + toNumber(item.dpp), 0),
      total_ppn_keluar: rows.reduce((sum, item) => sum + toNumber(item.ppn_keluar), 0),
      total_piutang_dagang: rows.reduce(
        (sum, item) => sum + toNumber(item.piutang_dagang),
        0
      ),
    } satisfies Invoice103Group;
  }
}

export async function getInvoice103Metadata(
  noInvoice: string,
  year?: number | null,
  month?: number | null
) {
  const response = await api.get<Invoice103Metadata>(
    `/invoice-103-metadata/${encodeURIComponent(noInvoice)}`,
    {
      params:
        year && month
          ? {
              year,
              month,
            }
          : undefined,
    }
  );

  return response.data;
}

export async function saveInvoice103Metadata(
  noInvoice: string,
  data: Invoice103MetadataPayload,
  year?: number | null,
  month?: number | null
) {
  const response = await api.put<Invoice103Metadata>(
    `/invoice-103-metadata/${encodeURIComponent(noInvoice)}`,
    data,
    {
      params:
        year && month
          ? {
              year,
              month,
            }
          : undefined,
    }
  );

  return response.data;
}

export async function finalizeInvoice103ToBKPt(
  noInvoice: string,
  year?: number | null,
  month?: number | null
) {
  const response = await api.post<BKPtReceivable>(
    "/sales-103/finalize-bkpt",
    null,
    {
      params: {
        no_invoice: noInvoice,
        year: year ?? undefined,
        month: month ?? undefined,
      },
    }
  );

  return response.data;
}
