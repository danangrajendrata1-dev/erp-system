"use client";
import { getBKPtReceivables } from "@/services/bkpt";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Printer,
  Pencil,
  Trash2,
  RefreshCcw,
  CheckCircle2,
  WalletCards,
  X,
} from "lucide-react";

import api from "@/services/api";
import { Bank103 } from "@/types/bank103";
import {
  allocateBank103ToMultipleBkpt,
  autoApplyBank103ToBkpt,
  deleteBank103,
  getBank103List,
} from "@/services/bank103";

const MONTHS = [
  "JANUARI",
  "FEBRUARI",
  "MARET",
  "APRIL",
  "MEI",
  "JUNI",
  "JULI",
  "AGUSTUS",
  "SEPTEMBER",
  "OKTOBER",
  "NOVEMBER",
  "DESEMBER",
];

type BKPtCandidate = {
  id: number;
  tgl?: string | null;
  no_order?: string | null;
  no_invoice?: string | null;
  faktur?: string | null;
  customer_name?: string | null;
  langganan?: string | null;
  debet?: number | string | null;
  kredit?: number | string | null;
  pph_psl_21?: number | string | null;
  pph_psl_23?: number | string | null;
  saldo?: number | string | null;
  keterangan?: string | null;
};

function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];

  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: T[] }).data;
  }

  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: T[] }).items;
  }

  return [];
}

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const raw = String(value).trim().replace(/\s/g, "");
  if (!raw) return 0;

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  if (hasComma && hasDot) {
    const normalized = raw.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (hasComma && !hasDot) {
    const normalized = raw.replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value?: unknown) {
  const numberValue = toNumber(value);

  if (!numberValue) return "";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numberValue);
}

function getMonthKey(item: Bank103) {
  if (!item.tgl) return "TANPA TANGGAL";
  const date = new Date(item.tgl);
  if (Number.isNaN(date.getTime())) return "TANPA TANGGAL";

  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${year}`;
}

function getSortDate(item: Bank103) {
  if (!item.tgl) return 0;
  const date = new Date(item.tgl);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getBKPtCustomer(item: BKPtCandidate) {
  return item.customer_name || item.langganan || "";
}

function getBKPtSaldo(item: BKPtCandidate) {
  const saldo = toNumber(item.saldo);

  if (saldo > 0) return saldo;

  const debet = toNumber(item.debet);
  const kredit = toNumber(item.kredit);
  const pph21 = toNumber(item.pph_psl_21);
  const pph23 = toNumber(item.pph_psl_23);

  return Math.max(0, debet - kredit - pph21 - pph23);
}

export default function Bank103Page() {
  const [items, setItems] = useState<Bank103[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kodeFilter, setKodeFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [usedFilter, setUsedFilter] = useState("ALL");
  const [autoApplyingId, setAutoApplyingId] = useState<number | null>(null);

  const [allocationOpen, setAllocationOpen] = useState(false);
  const [allocationBank, setAllocationBank] = useState<Bank103 | null>(null);
  const [bkptCandidates, setBkptCandidates] = useState<BKPtCandidate[]>([]);
  const [bkptLoading, setBkptLoading] = useState(false);
  const [bkptSearch, setBkptSearch] = useState("");
  const [allocationAmounts, setAllocationAmounts] = useState<
    Record<number, string>
  >({});
  const [savingAllocation, setSavingAllocation] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getBank103List();
      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data Bank 103.");
    } finally {
      setLoading(false);
    }
  }

 async function loadBKPtCandidates() {
  try {
    setBkptLoading(true);

    const data = await getBKPtReceivables({});
    const available = data.filter((item: BKPtCandidate) => getBKPtSaldo(item) > 0);

    setBkptCandidates(available);
  } catch (error: any) {
    console.error(error);
    alert(
      error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Gagal mengambil data BKPt."
    );
  } finally {
    setBkptLoading(false);
  }
}

  useEffect(() => {
    loadData();
  }, []);

  const availableCodes = useMemo(() => {
    const codes = items
      .map((item) => item.kode)
      .filter((kode): kode is string => Boolean(kode));

    return Array.from(new Set(codes)).sort();
  }, [items]);

  const availableYears = useMemo(() => {
    const years = items
      .map((item) => {
        if (!item.tgl) return null;
        const date = new Date(item.tgl);
        if (Number.isNaN(date.getTime())) return null;
        return String(date.getFullYear());
      })
      .filter((year): year is string => Boolean(year));

    return Array.from(new Set(years)).sort((a, b) => Number(b) - Number(a));
  }, [items]);

  const filteredItems = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return items
      .filter((item) => {
        const date = item.tgl ? new Date(item.tgl) : null;
        const month =
          date && !Number.isNaN(date.getTime()) ? date.getMonth() + 1 : null;
        const year =
          date && !Number.isNaN(date.getTime()) ? date.getFullYear() : null;

        const matchSearch =
          !keyword ||
          item.kode?.toLowerCase().includes(keyword) ||
          item.keterangan?.toLowerCase().includes(keyword) ||
          item.no_invoice?.toLowerCase().includes(keyword) ||
          item.customer_name?.toLowerCase().includes(keyword);

        const matchKode = kodeFilter === "ALL" || item.kode === kodeFilter;
        const matchMonth =
          monthFilter === "ALL" || String(month) === monthFilter;
        const matchYear = yearFilter === "ALL" || String(year) === yearFilter;

        const matchUsed =
          usedFilter === "ALL" ||
          (usedFilter === "USED" && item.is_used) ||
          (usedFilter === "UNUSED" && !item.is_used);

        return matchSearch && matchKode && matchMonth && matchYear && matchUsed;
      })
      .sort((a, b) => getSortDate(b) - getSortDate(a));
  }, [items, search, kodeFilter, monthFilter, yearFilter, usedFilter]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, Bank103[]> = {};

    filteredItems.forEach((item) => {
      const key = getMonthKey(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups);
  }, [filteredItems]);

  const totalDebet = filteredItems.reduce(
    (sum, item) => sum + toNumber(item.debet),
    0
  );

  const totalKredit = filteredItems.reduce(
    (sum, item) => sum + toNumber(item.kredit),
    0
  );

  const latestSaldo =
    filteredItems.length > 0 ? toNumber(filteredItems[0].saldo) : 0;

  const availableBkptCount = filteredItems.filter(
    (item) =>
      String(item.kode || "").toLowerCase() === "bkpt" &&
      toNumber(item.debet) > 0 &&
      !item.is_used
  ).length;

  const filteredBKPtCandidates = useMemo(() => {
    const keyword = bkptSearch.toLowerCase().trim();

    if (!keyword) return bkptCandidates;

    return bkptCandidates.filter((item) => {
      const source = [
        item.no_invoice,
        item.no_order,
        item.faktur,
        getBKPtCustomer(item),
        item.keterangan,
      ]
        .join(" ")
        .toLowerCase();

      return source.includes(keyword);
    });
  }, [bkptCandidates, bkptSearch]);

  const selectedAllocations = useMemo(() => {
    return Object.entries(allocationAmounts)
      .map(([bkptId, amount]) => ({
        bkpt_receivable_id: Number(bkptId),
        amount: toNumber(amount),
      }))
      .filter((item) => item.amount > 0);
  }, [allocationAmounts]);

  const totalAllocation = selectedAllocations.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const allocationBankDebet = toNumber(allocationBank?.debet);
  const allocationDifference = allocationBankDebet - totalAllocation;

  async function handleDelete(id: number) {
    const ok = confirm("Yakin ingin menghapus transaksi Bank 103 ini?");
    if (!ok) return;

    try {
      await deleteBank103(id);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data Bank 103.");
    }
  }

  async function handleAutoApplyToBkpt(id: number) {
    const ok = confirm(
      "Cocokkan transaksi Bank 103 ini ke BKPt otomatis berdasarkan nomor invoice?"
    );

    if (!ok) return;

    try {
      setAutoApplyingId(id);

      const result = await autoApplyBank103ToBkpt(id);
      const message =
        result && typeof result === "object" && "message" in result
          ? String((result as { message?: unknown }).message || "")
          : "Proses auto BKPt selesai.";

      alert(message);
      await loadData();
    } catch (error: any) {
      console.error(error);
      alert(
        error?.response?.data?.detail ||
          "Gagal mencocokkan transaksi Bank 103 ke BKPt."
      );
    } finally {
      setAutoApplyingId(null);
    }
  }

  async function openAllocationModal(bank: Bank103) {
    setAllocationBank(bank);
    setAllocationOpen(true);
    setBkptSearch("");
    setAllocationAmounts({});
    await loadBKPtCandidates();
  }

  function closeAllocationModal() {
    if (savingAllocation) return;

    setAllocationOpen(false);
    setAllocationBank(null);
    setBkptSearch("");
    setAllocationAmounts({});
  }

  function setAllocationAmount(bkptId: number, value: string) {
    setAllocationAmounts((prev) => ({
      ...prev,
      [bkptId]: value,
    }));
  }

  function fillFullSaldo(item: BKPtCandidate) {
    const saldo = getBKPtSaldo(item);

    setAllocationAmount(item.id, String(saldo));
  }

  function clearAllocationAmount(bkptId: number) {
    setAllocationAmounts((prev) => {
      const next = { ...prev };
      delete next[bkptId];
      return next;
    });
  }

  async function handleSaveAllocation() {
    if (!allocationBank) return;

    if (selectedAllocations.length === 0) {
      alert("Pilih minimal 1 BKPt untuk dialokasikan.");
      return;
    }

    if (totalAllocation !== allocationBankDebet) {
      alert(
        `Total alokasi harus sama dengan DEBET Bank 103.\n\nDEBET: ${
          formatCurrency(allocationBankDebet) || "Rp 0"
        }\nTotal Alokasi: ${formatCurrency(totalAllocation) || "Rp 0"}`
      );
      return;
    }

    const ok = confirm(
      "Simpan alokasi pembayaran Bank 103 ke beberapa BKPt?"
    );

    if (!ok) return;

    try {
      setSavingAllocation(true);

      const result = await allocateBank103ToMultipleBkpt(allocationBank.id, {
        allocations: selectedAllocations,
      });

      const message =
        result && typeof result === "object" && "message" in result
          ? String((result as { message?: unknown }).message || "")
          : "Alokasi BKPt berhasil disimpan.";

      alert(message);
      closeAllocationModal();
      await loadData();
    } catch (error: any) {
      console.error(error);
      alert(
        error?.response?.data?.detail ||
          "Gagal menyimpan alokasi pembayaran BKPt."
      );
    } finally {
      setSavingAllocation(false);
    }
  }

  function resetFilter() {
    setSearch("");
    setKodeFilter("ALL");
    setMonthFilter("ALL");
    setYearFilter("ALL");
    setUsedFilter("ALL");
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-6 text-white shadow-sm print:hidden md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <FileText className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bank 103</h1>
              <p className="text-sm text-slate-300">
                Buku Bank sesuai Excel: NO, TGL, KODE, KETERANGAN, DEBET,
                KREDIT, SALDO.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
          >
            <Printer className="h-4 w-4" />
            Cetak
          </button>

          <Link
            href="/bank-103/create"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            Tambah Bank 103
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 print:hidden">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Debet</p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatCurrency(totalDebet) || "Rp 0"}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Kredit</p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatCurrency(totalKredit) || "Rp 0"}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Saldo Terakhir</p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatCurrency(latestSaldo) || "Rp 0"}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Siap Diambil BKPt</p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {availableBkptCount} Transaksi
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm print:hidden">
        <div className="grid gap-3 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari keterangan, kode, invoice, pelanggan..."
              className="w-full rounded-xl border px-9 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <select
            value={kodeFilter}
            onChange={(e) => setKodeFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
          >
            <option value="ALL">Semua Kode</option>
            {availableCodes.map((kode) => (
              <option key={kode} value={kode}>
                {kode}
              </option>
            ))}
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
          >
            <option value="ALL">Semua Bulan</option>
            {MONTHS.map((month, index) => (
              <option key={month} value={String(index + 1)}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
          >
            <option value="ALL">Semua Tahun</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={usedFilter}
            onChange={(e) => setUsedFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
          >
            <option value="ALL">Semua Status</option>
            <option value="UNUSED">Belum Dipakai BKPt</option>
            <option value="USED">Sudah Dipakai BKPt</option>
          </select>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={resetFilter}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
          Memuat data Bank 103...
        </div>
      ) : groupedItems.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
          Belum ada data Bank 103.
        </div>
      ) : (
        <div className="space-y-8">
          {groupedItems.map(([monthTitle, rows]) => {
            const monthDebet = rows.reduce(
              (sum, item) => sum + toNumber(item.debet),
              0
            );

            const monthKredit = rows.reduce(
              (sum, item) => sum + toNumber(item.kredit),
              0
            );

            return (
              <div
                key={monthTitle}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <div className="border-b bg-slate-950 px-5 py-4 text-white">
                  <h2 className="text-lg font-bold">BANK {monthTitle}</h2>
                  <p className="text-sm text-slate-300">
                    Debet {formatCurrency(monthDebet) || "Rp 0"} · Kredit{" "}
                    {formatCurrency(monthKredit) || "Rp 0"}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1120px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                        <th className="border px-3 py-3 text-center">NO</th>
                        <th className="border px-3 py-3">TGL</th>
                        <th className="border px-3 py-3">KODE</th>
                        <th className="border px-3 py-3">KETERANGAN</th>
                        <th className="border px-3 py-3 text-right">DEBET</th>
                        <th className="border px-3 py-3 text-right">KREDIT</th>
                        <th className="border px-3 py-3 text-right">SALDO</th>
                        <th className="border px-3 py-3 text-center print:hidden">
                          STATUS
                        </th>
                        <th className="border px-3 py-3 text-center print:hidden">
                          AKSI
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((item, index) => {
                        const canUseForBkpt =
                          String(item.kode || "").toLowerCase() === "bkpt" &&
                          toNumber(item.debet) > 0 &&
                          !item.is_used;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="border px-3 py-2 text-center">
                              {index + 1}
                            </td>

                            <td className="border px-3 py-2">
                              {formatDate(item.tgl)}
                            </td>

                            <td className="border px-3 py-2 font-medium">
                              {item.kode || ""}
                            </td>

                            <td className="border px-3 py-2">
                              <div>{item.keterangan || ""}</div>

                              {(item.no_invoice || item.customer_name) && (
                                <div className="mt-1 text-xs text-slate-500 print:hidden">
                                  {item.no_invoice
                                    ? `Invoice: ${item.no_invoice}`
                                    : ""}
                                  {item.no_invoice && item.customer_name
                                    ? " · "
                                    : ""}
                                  {item.customer_name || ""}
                                </div>
                              )}
                            </td>

                            <td className="border px-3 py-2 text-right">
                              {formatCurrency(item.debet)}
                            </td>

                            <td className="border px-3 py-2 text-right">
                              {formatCurrency(item.kredit)}
                            </td>

                            <td className="border px-3 py-2 text-right font-semibold">
                              {formatCurrency(item.saldo)}
                            </td>

                            <td className="border px-3 py-2 text-center print:hidden">
                              {item.is_used ? (
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  Sudah Dipakai BKPt
                                </span>
                              ) : canUseForBkpt ? (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                  Siap BKPt
                                </span>
                              ) : (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  Manual
                                </span>
                              )}
                            </td>

                            <td className="border px-3 py-2 print:hidden">
                              <div className="flex flex-wrap justify-center gap-2">
                                {canUseForBkpt && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleAutoApplyToBkpt(item.id)
                                      }
                                      disabled={autoApplyingId === item.id}
                                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                                      title="Cocokkan otomatis ke BKPt"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                      {autoApplyingId === item.id
                                        ? "Proses"
                                        : "Auto BKPt"}
                                    </button>

                                    <button
                                      onClick={() => openAllocationModal(item)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                      title="Alokasi ke beberapa BKPt"
                                    >
                                      <WalletCards className="h-4 w-4" />
                                      Alokasi BKPt
                                    </button>
                                  </>
                                )}

                                <Link
                                  href={`/bank-103/${item.id}`}
                                  className="rounded-lg border p-2 hover:bg-slate-100"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>

                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="bg-slate-50 font-bold">
                        <td colSpan={4} className="border px-3 py-3 text-right">
                          TOTAL {monthTitle}
                        </td>
                        <td className="border px-3 py-3 text-right">
                          {formatCurrency(monthDebet) || "Rp 0"}
                        </td>
                        <td className="border px-3 py-3 text-right">
                          {formatCurrency(monthKredit) || "Rp 0"}
                        </td>
                        <td className="border px-3 py-3 text-right"></td>
                        <td className="border px-3 py-3 print:hidden"></td>
                        <td className="border px-3 py-3 print:hidden"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {allocationOpen && allocationBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b bg-slate-950 p-5 text-white">
              <div>
                <h2 className="text-lg font-bold">Alokasi BKPt</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Pilih beberapa invoice BKPt untuk transaksi Bank 103 ini.
                </p>
              </div>

              <button
                onClick={closeAllocationModal}
                className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 border-b p-5 md:grid-cols-4">
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs text-slate-500">TGL Bank</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatDate(allocationBank.tgl) || "-"}
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Keterangan</p>
                <p className="mt-1 line-clamp-2 font-semibold text-slate-900">
                  {allocationBank.keterangan || "-"}
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs text-slate-500">DEBET Bank 103</p>
                <p className="mt-1 font-bold text-slate-900">
                  {formatCurrency(allocationBankDebet) || "Rp 0"}
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  allocationDifference === 0
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <p className="text-xs text-slate-500">Selisih</p>
                <p
                  className={`mt-1 font-bold ${
                    allocationDifference === 0
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {formatCurrency(allocationDifference) || "Rp 0"}
                </p>
              </div>
            </div>

            <div className="border-b p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full md:w-[420px]">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    value={bkptSearch}
                    onChange={(e) => setBkptSearch(e.target.value)}
                    placeholder="Cari invoice, order, customer, faktur..."
                    className="w-full rounded-xl border px-9 py-2 text-sm outline-none focus:border-slate-900"
                  />
                </div>

                <div className="text-sm text-slate-600">
                  Total alokasi:{" "}
                  <span className="font-bold text-slate-900">
                    {formatCurrency(totalAllocation) || "Rp 0"}
                  </span>
                </div>
              </div>
            </div>

            <div className="max-h-[45vh] overflow-auto">
              <table className="w-full min-w-[1000px] border-collapse text-sm">
                <thead className="sticky top-0 bg-slate-100">
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-600">
                    <th className="border px-3 py-3">TGL</th>
                    <th className="border px-3 py-3">Customer</th>
                    <th className="border px-3 py-3">No Invoice</th>
                    <th className="border px-3 py-3">No Order</th>
                    <th className="border px-3 py-3 text-right">Debet</th>
                    <th className="border px-3 py-3 text-right">Kredit</th>
                    <th className="border px-3 py-3 text-right">Saldo</th>
                    <th className="border px-3 py-3 text-right">
                      Alokasi
                    </th>
                    <th className="border px-3 py-3 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {bkptLoading ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="border px-3 py-8 text-center text-slate-500"
                      >
                        Mengambil data BKPt...
                      </td>
                    </tr>
                  ) : filteredBKPtCandidates.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="border px-3 py-8 text-center text-slate-500"
                      >
                        Tidak ada BKPt dengan saldo terbuka.
                      </td>
                    </tr>
                  ) : (
                    filteredBKPtCandidates.map((item) => {
                      const saldo = getBKPtSaldo(item);
                      const amountValue = allocationAmounts[item.id] || "";

                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="border px-3 py-2">
                            {formatDate(item.tgl)}
                          </td>

                          <td className="border px-3 py-2 font-medium">
                            {getBKPtCustomer(item) || "-"}
                          </td>

                          <td className="border px-3 py-2">
                            {item.no_invoice || "-"}
                          </td>

                          <td className="border px-3 py-2">
                            {item.no_order || "-"}
                          </td>

                          <td className="border px-3 py-2 text-right">
                            {formatCurrency(item.debet)}
                          </td>

                          <td className="border px-3 py-2 text-right">
                            {formatCurrency(item.kredit)}
                          </td>

                          <td className="border px-3 py-2 text-right font-semibold">
                            {formatCurrency(saldo) || "Rp 0"}
                          </td>

                          <td className="border px-3 py-2 text-right">
                            <input
                              value={amountValue}
                              onChange={(e) =>
                                setAllocationAmount(item.id, e.target.value)
                              }
                              placeholder="0"
                              className="w-32 rounded-lg border px-3 py-1.5 text-right text-sm outline-none focus:border-slate-900"
                            />
                          </td>

                          <td className="border px-3 py-2">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => fillFullSaldo(item)}
                                className="rounded-lg border px-2 py-1 text-xs font-semibold hover:bg-slate-100"
                              >
                                Isi Saldo
                              </button>

                              <button
                                onClick={() => clearAllocationAmount(item.id)}
                                className="rounded-lg border px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Clear
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-slate-50 p-5">
              <div className="text-sm text-slate-600">
                Total alokasi harus sama dengan DEBET Bank 103. Backend juga
                akan menolak jika customer BKPt berbeda.
              </div>

              <div className="flex gap-2">
                <button
                  onClick={closeAllocationModal}
                  disabled={savingAllocation}
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  onClick={handleSaveAllocation}
                  disabled={
                    savingAllocation ||
                    selectedAllocations.length === 0 ||
                    allocationDifference !== 0
                  }
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingAllocation ? "Menyimpan..." : "Simpan Alokasi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}