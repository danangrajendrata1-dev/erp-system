"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  commitBKOrderImport,
  deleteBKOrder,
  getBKOrders,
  previewBKOrderImport,
} from "@/services/bkorder";
import {
  BKOrder,
  BKOrderImportPreviewResponse,
} from "@/types/bkorder";

const REPEAT_COLUMNS = Array.from({ length: 14 }, (_, index) => index);

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function formatDateValue(value?: string | null) {
  if (!value) return "-";
  return formatDate(value);
}

function toNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatNumber(value: unknown) {
  const numberValue = toNumber(value);
  if (numberValue === 0) return "";
  return numberValue.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

function formatCurrency(value: unknown) {
  const numberValue = toNumber(value);
  if (numberValue === 0) return "";
  return numberValue.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function isRimUnit(unit?: string | null) {
  return String(unit || "").toLowerCase().includes("rim");
}

function normalizeArray<T>(values: T[] | undefined | null, defaultValue: T) {
  const result = [...(values || [])].slice(0, 14);
  while (result.length < 14) result.push(defaultValue);
  return result;
}

function getTotalKeping(item: BKOrder) {
  const partials = normalizeArray(item.partial_billing_quantities, null);
  const partialTotal = partials.reduce<number>((sum, value) => sum + toNumber(value), 0);
  return toNumber(item.total_keping) || partialTotal;
}

function getKekuranganKeping(item: BKOrder) {
  return Math.max(toNumber(item.quantity) - getTotalKeping(item), 0);
}

function getKepingPerRimFromItem(item: BKOrder) {
  const quantity = toNumber(item.quantity);
  const rim = toNumber(item.rim);
  return quantity > 0 && rim > 0 ? quantity / rim : 0;
}

function convertKepingToDisplay(params: {
  value: unknown;
  unit?: string | null;
  kepingPerRim: number;
}) {
  const { value, unit, kepingPerRim } = params;
  const keping = toNumber(value);
  if (keping === 0) return "";
  if (isRimUnit(unit) && kepingPerRim > 0) {
    return (keping / kepingPerRim).toLocaleString("id-ID", { maximumFractionDigits: 4 });
  }
  return keping.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

function getKekuranganDisplay(item: BKOrder) {
  const kekuranganKeping = getKekuranganKeping(item);
  const kepingPerRim = getKepingPerRimFromItem(item);
  if (isRimUnit(item.unit) && kepingPerRim > 0) {
    return { value: kekuranganKeping / kepingPerRim, unit: "Rim" };
  }
  return { value: kekuranganKeping, unit: "Keping" };
}

function getTotalTerkirimDisplay(item: BKOrder) {
  const totalKeping = getTotalKeping(item);
  const kepingPerRim = getKepingPerRimFromItem(item);
  if (isRimUnit(item.unit) && kepingPerRim > 0) {
    return { value: totalKeping / kepingPerRim, unit: "Rim" };
  }
  return { value: totalKeping, unit: "Keping" };
}

function formatDisplayWithUnit(value: number, unit: string) {
  if (!value || value <= 0) return "";
  return `${value.toLocaleString("id-ID", { maximumFractionDigits: 4 })} ${unit}`;
}

function addDisplaySummary(
  summary: Record<string, number>,
  item: { value: number; unit: string }
) {
  if (!item.value || item.value <= 0) return summary;
  summary[item.unit] = (summary[item.unit] || 0) + item.value;
  return summary;
}

function formatSummaryByUnit(summary: Record<string, number>) {
  const parts = Object.entries(summary)
    .filter(([, value]) => value > 0)
    .map(([unit, value]) => formatDisplayWithUnit(value, unit));
  return parts.length > 0 ? parts.join(" + ") : "-";
}

function getGroupKey(item: BKOrder) {
  return [item.order_date || "", item.order_number || "", item.po_date || "", item.do_number || "", item.delivery_date || "", item.customer_name || ""].join("|");
}

function sortBKOrder(a: BKOrder, b: BKOrder) {
  const dateA = a.order_date || "";
  const dateB = b.order_date || "";
  if (dateA !== dateB) return dateB.localeCompare(dateA);
  const orderA = a.order_number || "";
  const orderB = b.order_number || "";
  if (orderA !== orderB) return orderB.localeCompare(orderA);
  const doNumberA = a.do_number || "";
  const doNumberB = b.do_number || "";
  if (doNumberA !== doNumberB) return doNumberB.localeCompare(doNumberA);
  return b.id - a.id;
}

function getStatusClass(status?: string | null) {
  switch (status) {
    case "SELESAI":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "PROSES":
      return "bg-blue-100 text-blue-700 ring-blue-200";
    case "BATAL":
      return "bg-red-100 text-red-700 ring-red-200";
    case "OPEN":
      return "bg-amber-100 text-amber-700 ring-amber-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function getMonthName(month: number) {
  return MONTHS[month - 1] || "";
}

function getPeriodLabel(year: number, month: number) {
  return `${getMonthName(month).toUpperCase()} ${year}`;
}

function getMonthYearKey(item: BKOrder) {
  if (!item.order_date) return "tanpa-tanggal";
  const date = new Date(item.order_date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (Number.isNaN(year) || Number.isNaN(month)) return "tanpa-tanggal";
  return `${year}-${String(month).padStart(2, "0")}`;
}

function buildGroups(items: BKOrder[]) {
  const map = new Map<string, BKOrder[]>();
  items.forEach((item) => {
    const key = getGroupKey(item);
    const current = map.get(key) || [];
    current.push(item);
    map.set(key, current);
  });
  return Array.from(map.entries()).map(([key, rows]) => ({ key, header: rows[0], rows }));
}

function buildSummary(items: BKOrder[]) {
  return items.reduce(
    (acc, item) => {
      acc.totalOrderKeping += toNumber(item.quantity);
      acc.totalTerkirimKeping += getTotalKeping(item);
      acc.totalKekuranganKeping += getKekuranganKeping(item);
      addDisplaySummary(acc.totalTerkirimDisplay, getTotalTerkirimDisplay(item));
      addDisplaySummary(acc.totalKekuranganDisplay, getKekuranganDisplay(item));
      return acc;
    },
    {
      totalOrderKeping: 0,
      totalTerkirimKeping: 0,
      totalKekuranganKeping: 0,
      totalTerkirimDisplay: {} as Record<string, number>,
      totalKekuranganDisplay: {} as Record<string, number>,
    }
  );
}

function BKOrderTable({
  items,
  loading,
  emptyMessage,
  router,
  onDelete,
}: {
  items: BKOrder[];
  loading: boolean;
  emptyMessage: string;
  router: ReturnType<typeof useRouter>;
  onDelete: (id: number) => Promise<void>;
}) {
  const groupedData = buildGroups(items);
  const summary = buildSummary(items);
  const totalTerkirimText = formatSummaryByUnit(summary.totalTerkirimDisplay);
  const totalKekuranganText = formatSummaryByUnit(summary.totalKekuranganDisplay);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[2800px] border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-800 text-white">
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">TGL</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">NO.ORD</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">PO Date</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">DO NUMBER</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">Deliv. Date</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">PR</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">UKURAN</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">JENIS BAHAN</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">JENIS CETAK</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">SPESIFIKASI</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">SAT</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-right">KEPING</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-right">Rim</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-right">HARGA</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-right">KEKURANGAN</th>
              <th colSpan={14} className="border border-slate-700 px-3 py-3 text-center">TGL KIRIM / SELESAI</th>
              <th colSpan={14} className="border border-slate-700 px-3 py-3 text-center">TAGIHAN PARSIAL</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-right">TOTAL TERKIRIM</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-left">STATUS</th>
              <th rowSpan={2} className="border border-slate-700 px-3 py-3 text-center print:hidden">AKSI</th>
            </tr>
            <tr className="bg-slate-700 text-white">
              {REPEAT_COLUMNS.map((index) => <th key={`date-head-${index}`} className="border border-slate-600 px-2 py-2">{index + 1}</th>)}
              {REPEAT_COLUMNS.map((index) => <th key={`partial-head-${index}`} className="border border-slate-600 px-2 py-2">{index + 1}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={46} className="border px-3 py-10 text-center text-slate-500">Memuat data BKOrder...</td></tr>
            ) : groupedData.length === 0 ? (
              <tr><td colSpan={46} className="border px-3 py-10 text-center text-slate-500">{emptyMessage}</td></tr>
            ) : (
              groupedData.map((group) => group.rows.map((item, rowIndex) => {
                const isFirstRow = rowIndex === 0;
                const rowSpan = group.rows.length;
                const deliveryDates = normalizeArray(item.delivery_completed_dates, null);
                const partials = normalizeArray(item.partial_billing_quantities, null);
                const kepingPerRim = getKepingPerRimFromItem(item);
                const kekuranganDisplay = getKekuranganDisplay(item);
                const totalTerkirimDisplay = getTotalTerkirimDisplay(item);

                return (
                  <tr key={item.id} className={isFirstRow ? "border-t-4 border-t-slate-300 bg-white hover:bg-slate-50" : "bg-white hover:bg-slate-50"}>
                    {isFirstRow && (
                      <>
                        <td rowSpan={rowSpan} className="border border-slate-200 bg-slate-50 px-3 py-3 align-top font-medium text-slate-700">{formatDate(group.header.order_date)}</td>
                        <td rowSpan={rowSpan} className="border border-slate-200 bg-slate-50 px-3 py-3 align-top font-semibold text-slate-900">{group.header.order_number}</td>
                        <td rowSpan={rowSpan} className="border border-slate-200 bg-slate-50 px-3 py-3 align-top text-slate-700">{formatDate(group.header.po_date)}</td>
                        <td rowSpan={rowSpan} className="border border-slate-200 bg-slate-50 px-3 py-3 align-top font-semibold text-slate-900">{group.header.do_number}</td>
                        <td rowSpan={rowSpan} className="border border-slate-200 bg-slate-50 px-3 py-3 align-top text-slate-700">{formatDate(group.header.delivery_date)}</td>
                        <td rowSpan={rowSpan} className="border border-slate-200 bg-slate-50 px-3 py-3 align-top">
                          <div className="min-w-[170px]">
                            <div className="font-semibold text-slate-900">{group.header.customer_name}</div>
                            <div className="mt-1 text-[11px] text-slate-500">{group.rows.length} baris order</div>
                            <button onClick={() => router.push(`/bkorder/create?copyFrom=${group.header.id}`)} className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-700 print:hidden">+ Tambah Order</button>
                          </div>
                        </td>
                      </>
                    )}
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">{item.size}</td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">{item.material_type}</td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">{item.print_type}</td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700"><div className="max-w-[240px] whitespace-normal leading-relaxed">{item.specification}</div></td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">{item.unit}</td>
                    <td className="border border-slate-200 px-3 py-2 text-right font-medium text-slate-900">{formatNumber(item.quantity)}</td>
                    <td className="border border-slate-200 px-3 py-2 text-right text-slate-700">{formatNumber(item.rim)}</td>
                    <td className="border border-slate-200 px-3 py-2 text-right text-slate-700">{formatCurrency(item.price)}</td>
                    <td className="border border-slate-200 px-3 py-2 text-right font-semibold text-amber-700">{formatDisplayWithUnit(kekuranganDisplay.value, kekuranganDisplay.unit)}</td>
                    {deliveryDates.map((dateValue, index) => <td key={`date-${item.id}-${index}`} className="border border-slate-200 px-2 py-2 text-center text-red-600">{formatDate(dateValue)}</td>)}
                    {partials.map((partialValue, index) => <td key={`partial-${item.id}-${index}`} className="border border-slate-200 px-2 py-2 text-right text-slate-700">{convertKepingToDisplay({ value: partialValue, unit: item.unit, kepingPerRim })}</td>)}
                    <td className="border border-slate-200 px-3 py-2 text-right font-bold text-slate-900">{formatDisplayWithUnit(totalTerkirimDisplay.value, totalTerkirimDisplay.unit)}</td>
                    <td className="border border-slate-200 px-3 py-2"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${getStatusClass(item.status)}`}>{item.status || "-"}</span></td>
                    <td className="border border-slate-200 px-3 py-2 text-center print:hidden">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => router.push(`/bkorder/${item.id}`)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">Edit</button>
                        <button onClick={() => onDelete(item.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100">Hapus</button>
                      </div>
                    </td>
                  </tr>
                );
              }))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold text-slate-900">
              <td colSpan={11} className="border border-slate-300 px-3 py-3 text-right">TOTAL</td>
              <td className="border border-slate-300 px-3 py-3 text-right">{formatNumber(summary.totalOrderKeping)}</td>
              <td className="border border-slate-300 px-3 py-3" />
              <td className="border border-slate-300 px-3 py-3" />
              <td className="border border-slate-300 px-3 py-3 text-right text-amber-700">{formatSummaryByUnit(summary.totalKekuranganDisplay)}</td>
              <td colSpan={28} className="border border-slate-300 px-3 py-3" />
              <td className="border border-slate-300 px-3 py-3 text-right">{totalTerkirimText}</td>
              <td colSpan={2} className="border border-slate-300 px-3 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const now = new Date();

  const [data, setData] = useState<BKOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [allMonths, setAllMonths] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<BKOrderImportPreviewResponse | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const loadData = useCallback(async (params?: { year?: number; month?: number }) => {
    setLoading(true);
    try {
      const result = await getBKOrders(params);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (allMonths) loadData();
    else loadData({ year: selectedYear, month: selectedMonth });
  }, [allMonths, loadData, selectedMonth, selectedYear]);

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    const sorted = [...data].sort(sortBKOrder);
    if (!keyword) return sorted;
    return sorted.filter((item) =>
      [
        item.order_number,
        item.do_number,
        item.customer_name,
        item.size,
        item.material_type,
        item.print_type,
        item.specification,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [data, search]);

  const currentMonthName = getMonthName(selectedMonth) || "";
  const summary = useMemo(() => buildSummary(filteredData), [filteredData]);
  const allMonthSections = useMemo(() => {
    if (!allMonths) return [];
    const map = new Map<string, BKOrder[]>();
    filteredData.forEach((item) => {
      const key = getMonthYearKey(item);
      const rows = map.get(key) || [];
      rows.push(item);
      map.set(key, rows);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, rows]) => {
        if (key === "tanpa-tanggal") return { key, title: "TANPA TANGGAL", rows: rows.sort(sortBKOrder) };
        const [yearText, monthText] = key.split("-");
        return { key, title: getPeriodLabel(Number(yearText), Number(monthText)), rows: rows.sort(sortBKOrder) };
      });
  }, [allMonths, filteredData]);

  const importGroups = useMemo(() => importPreview?.groups || [], [importPreview]);

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus data BKOrder ini?")) return;
    await deleteBKOrder(id);
    await loadData(allMonths ? undefined : { year: selectedYear, month: selectedMonth });
  }

  async function handlePreviewImport() {
    if (!importFile) return;
    setImportLoading(true);
    setImportSummary(null);
    try {
      const result = await previewBKOrderImport(importFile);
      setImportPreview(result);
      setImportSummary(
        `Valid: ${result.valid_count}, error: ${result.error_count}, duplicate: ${result.duplicate_count}`
      );
    } finally {
      setImportLoading(false);
    }
  }

  async function handleCommitImport() {
    if (!importPreview) return;
    setImportLoading(true);
    try {
      const result = await commitBKOrderImport({ rows: importPreview.rows });
      setImportSummary(
        `Sukses: ${result.success_count}, gagal: ${result.failed_count}, duplikat: ${result.duplicate_count}`
      );
      if (result.errors?.length > 0) {
        setImportPreview((current) =>
          current
            ? {
                ...current,
                rows: current.rows.map((row) => {
                  const matched = result.errors.find((item) => item.row === row.row_number);
                  if (!matched) return row;
                  return {
                    ...row,
                    errors: [...row.errors, matched.message],
                    is_valid: false,
                  };
                }),
              }
            : current
        );
      } else {
        setImportOpen(false);
        setImportFile(null);
        setImportPreview(null);
      }
      await loadData(allMonths ? undefined : { year: selectedYear, month: selectedMonth });
    } finally {
      setImportLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:shadow-none">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-5 text-white">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Buku Order</p>
                <h1 className="mt-1 text-2xl font-bold">{allMonths ? "BK ORDER SEMUA BULAN" : `BK ORDER ${currentMonthName.toUpperCase()} ${selectedYear}`}</h1>
                <p className="mt-1 text-sm text-slate-300">Satu DO NUMBER bisa berisi banyak baris order seperti format Excel client.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setImportOpen(true)} className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-300 print:hidden">Import Excel</button>
                <button onClick={() => router.push("/bkorder/create")} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 print:hidden">+ Tambah BKOrder</button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-3 print:hidden">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Order Keping</p><p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalOrderKeping === 0 ? "-" : summary.totalOrderKeping.toLocaleString("id-ID")}</p></div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Total Terkirim</p><p className="mt-2 text-2xl font-bold text-emerald-800">{formatSummaryByUnit(summary.totalTerkirimDisplay)}</p></div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Total Kekurangan</p><p className="mt-2 text-2xl font-bold text-amber-800">{formatSummaryByUnit(summary.totalKekuranganDisplay)}</p></div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between print:hidden">
            <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
              <div className="grid w-full gap-3 md:grid-cols-3 lg:max-w-2xl">
                <button onClick={() => setAllMonths((current) => !current)} className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${allMonths ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>Semua Bulan</button>
                <select value={selectedMonth} onChange={(e) => { setAllMonths(false); setSelectedMonth(Number(e.target.value)); }} disabled={allMonths} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200">{MONTHS.map((monthName, index) => <option key={monthName} value={index + 1}>{monthName}</option>)}</select>
                <select value={selectedYear} onChange={(e) => { setAllMonths(false); setSelectedYear(Number(e.target.value)); }} disabled={allMonths} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200">{Array.from({ length: 6 }, (_, index) => now.getFullYear() - 3 + index).map((year) => <option key={year} value={year}>{year}</option>)}</select>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari NO.ORD, DO NUMBER, PR, bahan, jenis cetak, spesifikasi..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 md:max-w-xl" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => (allMonths ? loadData() : loadData({ year: selectedYear, month: selectedMonth }))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Refresh</button>
              <button onClick={() => window.print()} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cetak</button>
            </div>
          </div>
        </div>

        {allMonths && !loading ? (
          <div className="space-y-6">
            {allMonthSections.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-slate-500 shadow-sm">Belum ada data BKOrder.</div>
            ) : (
              allMonthSections.map((section) => (
                <div key={section.key} className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-800 px-5 py-4 text-white">
                      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">BK ORDER</p>
                          <h2 className="text-xl font-bold">{section.title}</h2>
                        </div>
                        <p className="text-sm text-slate-300">{section.rows.length} baris</p>
                      </div>
                    </div>
                  </div>
                  <BKOrderTable items={section.rows} loading={false} emptyMessage={`Belum ada data BKOrder untuk ${section.title}.`} router={router} onDelete={handleDelete} />
                </div>
              ))
            )}
          </div>
        ) : (
          <BKOrderTable items={filteredData} loading={loading} emptyMessage={`Belum ada data BKOrder untuk ${currentMonthName} ${selectedYear}.`} router={router} onDelete={handleDelete} />
        )}

        {importOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Import Excel BKOrder</h3>
                  <p className="mt-1 text-sm text-slate-500">Upload file .xlsx, preview dulu, lalu simpan jika sudah sesuai.</p>
                </div>
                <button onClick={() => setImportOpen(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700">Tutup</button>
              </div>

              <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
                <input type="file" accept=".xlsx" onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                <button onClick={handlePreviewImport} disabled={!importFile || importLoading} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Preview</button>
                <button onClick={handleCommitImport} disabled={!importPreview?.rows.some((row) => row.is_valid) || importLoading} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Simpan Import</button>
              </div>

              {importSummary && <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{importSummary}</div>}

              {importPreview && (
                <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                  <div className="space-y-4 p-4">
                    {importGroups.map((group) => (
                      <div key={`${group.order_number || "no-order"}-${group.row_count}`} className="rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 bg-slate-900 px-4 py-3 text-white">
                          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                            <div>
                              <div className="text-xs uppercase tracking-[0.25em] text-slate-300">Order</div>
                              <div className="text-lg font-bold">
                                {group.order_number || "-"} - {group.customer_name || "-"}
                              </div>
                              <div className="mt-1 text-xs text-slate-300">
                                TGL {formatDateValue(group.order_date)} | PO {formatDateValue(group.po_date)} | DO {group.do_number || "-"} | Deliv. {formatDateValue(group.delivery_date)}
                              </div>
                            </div>
                            <div className="text-sm text-slate-300">
                              {group.row_count} row | valid {group.valid_count} | error {group.error_count}
                            </div>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse text-xs">
                            <thead className="bg-slate-100 text-slate-700">
                              <tr>
                                <th className="border px-3 py-2 text-left">Baris</th>
                                <th className="border px-3 py-2 text-left">Jenis</th>
                                <th className="border px-3 py-2 text-left">Size</th>
                                <th className="border px-3 py-2 text-left">Bahan</th>
                                <th className="border px-3 py-2 text-left">Cetak</th>
                                <th className="border px-3 py-2 text-left">Spesifikasi</th>
                                <th className="border px-3 py-2 text-left">Unit</th>
                                <th className="border px-3 py-2 text-left">Qty</th>
                                <th className="border px-3 py-2 text-left">Rim</th>
                                <th className="border px-3 py-2 text-left">Harga</th>
                                <th className="border px-3 py-2 text-left">Status</th>
                                <th className="border px-3 py-2 text-left">Error</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.rows.map((row) => (
                                <tr key={row.row_number} className={row.is_valid ? "bg-white" : "bg-red-50"}>
                                  <td className="border px-3 py-2">{row.row_number}</td>
                                  <td className="border px-3 py-2">{row.is_header_row ? "Header" : "Item"}</td>
                                  <td className="border px-3 py-2">{row.data.size || "-"}</td>
                                  <td className="border px-3 py-2">{row.data.material_type || "-"}</td>
                                  <td className="border px-3 py-2">{row.data.print_type || "-"}</td>
                                  <td className="border px-3 py-2">{row.data.specification || "-"}</td>
                                  <td className="border px-3 py-2">{row.data.unit || "-"}</td>
                                  <td className="border px-3 py-2">{row.data.quantity ?? "-"}</td>
                                  <td className="border px-3 py-2">{row.data.rim ?? "-"}</td>
                                  <td className="border px-3 py-2">{row.data.price ?? "-"}</td>
                                  <td className="border px-3 py-2">{row.is_valid ? "VALID" : "ERROR"}</td>
                                  <td className="border px-3 py-2 text-red-700">
                                    <div>{row.errors.join(", ") || "-"}</div>
                                    {row.warnings?.length > 0 && (
                                      <div className="mt-1 text-amber-700">
                                        Warning: {row.warnings.join(", ")}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
