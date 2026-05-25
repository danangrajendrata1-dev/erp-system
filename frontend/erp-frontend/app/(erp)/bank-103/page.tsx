"use client";

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
} from "lucide-react";
import { Bank103 } from "@/types/bank103";
import { deleteBank103, getBank103List } from "@/services/bank103";

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

function formatCurrency(value?: number | null) {
  const numberValue = Number(value || 0);
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

export default function Bank103Page() {
  const [items, setItems] = useState<Bank103[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kodeFilter, setKodeFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [usedFilter, setUsedFilter] = useState("ALL");

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
        const month = date && !Number.isNaN(date.getTime()) ? date.getMonth() + 1 : null;
        const year = date && !Number.isNaN(date.getTime()) ? date.getFullYear() : null;

        const matchSearch =
          !keyword ||
          item.kode?.toLowerCase().includes(keyword) ||
          item.keterangan?.toLowerCase().includes(keyword) ||
          item.no_invoice?.toLowerCase().includes(keyword) ||
          item.customer_name?.toLowerCase().includes(keyword);

        const matchKode = kodeFilter === "ALL" || item.kode === kodeFilter;
        const matchMonth = monthFilter === "ALL" || String(month) === monthFilter;
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
    (sum, item) => sum + Number(item.debet || 0),
    0
  );

  const totalKredit = filteredItems.reduce(
    (sum, item) => sum + Number(item.kredit || 0),
    0
  );

  const latestSaldo =
    filteredItems.length > 0 ? Number(filteredItems[0].saldo || 0) : 0;

  const availableBkptCount = filteredItems.filter(
    (item) =>
      item.kode === "BkPt" &&
      Number(item.debet || 0) > 0 &&
      !item.is_used
  ).length;

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
                Buku Bank sesuai Excel: NO, TGL, KODE, KETERANGAN, DEBET, KREDIT, SALDO.
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
              (sum, item) => sum + Number(item.debet || 0),
              0
            );
            const monthKredit = rows.reduce(
              (sum, item) => sum + Number(item.kredit || 0),
              0
            );

            return (
              <div key={monthTitle} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="border-b bg-slate-950 px-5 py-4 text-white">
                  <h2 className="text-lg font-bold">BANK {monthTitle}</h2>
                  <p className="text-sm text-slate-300">
                    Debet {formatCurrency(monthDebet) || "Rp 0"} · Kredit{" "}
                    {formatCurrency(monthKredit) || "Rp 0"}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                        <th className="border px-3 py-3 text-center">NO</th>
                        <th className="border px-3 py-3">TGL</th>
                        <th className="border px-3 py-3">KODE</th>
                        <th className="border px-3 py-3">KETERANGAN</th>
                        <th className="border px-3 py-3 text-right">DEBET</th>
                        <th className="border px-3 py-3 text-right">KREDIT</th>
                        <th className="border px-3 py-3 text-right">SALDO</th>
                        <th className="border px-3 py-3 text-center print:hidden">STATUS</th>
                        <th className="border px-3 py-3 text-center print:hidden">AKSI</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((item, index) => {
                        const canUseForBkpt =
                          item.kode === "BkPt" &&
                          Number(item.debet || 0) > 0 &&
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
                                  {item.no_invoice ? `Invoice: ${item.no_invoice}` : ""}
                                  {item.no_invoice && item.customer_name ? " · " : ""}
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
                              <div className="flex justify-center gap-2">
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
    </div>
  );
}