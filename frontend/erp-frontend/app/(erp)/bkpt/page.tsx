"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  deleteBKPtReceivable,
  getBKPtReceivables,
} from "@/services/bkpt";
import { BKPtReceivable } from "@/types/bkpt";
import { Bank103 } from "@/types/bank103";
import {
  applyBank103ToBkpt,
  getAvailableBkptPayments,
} from "@/services/bank103";

const MONTH_NAMES = [
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

const MONTH_OPTIONS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

type PaymentStatus = "LUNAS" | "PARSIAL" | "BELUM BAYAR" | "BELUM ADA PIUTANG";

function toNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function toDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string | null) {
  const date = toDate(value);

  if (!date) return "";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function formatNumber(value: unknown) {
  const numberValue = toNumber(value);

  if (numberValue === 0) return "";

  return numberValue.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function formatCurrency(value: unknown) {
  const numberValue = toNumber(value);

  if (numberValue === 0) return "";

  return numberValue.toLocaleString("id-ID", {
    maximumFractionDigits: 0,
  });
}

function getMonthKey(value?: string | null) {
  const date = toDate(value);

  if (!date) return "TANPA_TANGGAL";

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return `${year}-${String(month).padStart(2, "0")}`;
}

function getMonthTitle(monthKey: string) {
  if (monthKey === "TANPA_TANGGAL") {
    return "BUKU PIUTANG TANPA TANGGAL";
  }

  const [year, month] = monthKey.split("-");
  const monthName = MONTH_NAMES[Number(month) - 1];

  return `BUKU PIUTANG ${monthName} ${year}`;
}

function getInvoicePeriodLabel(item: BKPtReceivable) {
  if (item.invoice_year && item.invoice_month) {
    const monthName = MONTH_NAMES[item.invoice_month - 1];
    return `${monthName} ${item.invoice_year}`;
  }

  const date = toDate(item.tgl);
  if (!date) return "";

  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function getPaymentStatus(item: BKPtReceivable): PaymentStatus {
  const debet = toNumber(item.debet);
  const kredit = toNumber(item.kredit);
  const pph21 = toNumber(item.pph_psl_21);
  const pph23 = toNumber(item.pph_psl_23);
  const saldo = toNumber(item.saldo) || debet - kredit - pph21 - pph23;

  if (debet <= 0) return "BELUM ADA PIUTANG";
  if (saldo <= 0) return "LUNAS";
  if (saldo < debet) return "PARSIAL";

  return "BELUM BAYAR";
}

function getCalculatedSaldo(item: BKPtReceivable) {
  const debet = toNumber(item.debet);
  const kredit = toNumber(item.kredit);
  const pph21 = toNumber(item.pph_psl_21);
  const pph23 = toNumber(item.pph_psl_23);

  return toNumber(item.saldo) || debet - kredit - pph21 - pph23;
}

function getStatusClass(status: PaymentStatus) {
  switch (status) {
    case "LUNAS":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "PARSIAL":
      return "bg-blue-100 text-blue-700 ring-blue-200";
    case "BELUM BAYAR":
      return "bg-amber-100 text-amber-700 ring-amber-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

function BKPtPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const noInvoiceFromQuery = searchParams.get("no_invoice") || "";

  const [data, setData] = useState<BKPtReceivable[]>([]);
  const [loading, setLoading] = useState(true);

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [selectedBkptId, setSelectedBkptId] = useState<number | null>(null);
  const [availableBankPayments, setAvailableBankPayments] = useState<Bank103[]>([]);
  const [loadingBankPayments, setLoadingBankPayments] = useState(false);
  const [applyingBankPayment, setApplyingBankPayment] = useState(false);

  const [customerFilter, setCustomerFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState(noInvoiceFromQuery);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  async function loadData() {
    setLoading(true);

    try {
      const result = await getBKPtReceivables();
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setInvoiceFilter(noInvoiceFromQuery);
  }, [noInvoiceFromQuery]);

  const availableYears = useMemo(() => {
    const years = data
      .map((item) => toDate(item.tgl)?.getFullYear())
      .filter(Boolean) as number[];

    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [data]);

  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const date = toDate(item.tgl);

        const matchCustomer =
          !customerFilter ||
          (item.customer_name || "")
            .toLowerCase()
            .includes(customerFilter.toLowerCase());

        const matchInvoice =
          !invoiceFilter ||
          (item.no_invoice || "")
            .toLowerCase()
            .includes(invoiceFilter.toLowerCase());

        const matchMonth =
          !selectedMonth ||
          Boolean(date && date.getMonth() + 1 === Number(selectedMonth));

        const matchYear =
          !selectedYear ||
          Boolean(date && date.getFullYear() === Number(selectedYear));

        const matchStatus =
          !selectedStatus || getPaymentStatus(item) === selectedStatus;

        return (
          matchCustomer &&
          matchInvoice &&
          matchMonth &&
          matchYear &&
          matchStatus
        );
      })
      .sort((a, b) => {
        const dateA = toDate(a.tgl)?.getTime() || 0;
        const dateB = toDate(b.tgl)?.getTime() || 0;

        if (dateA !== dateB) return dateB - dateA;

        return (b.id || 0) - (a.id || 0);
      });
  }, [
    data,
    customerFilter,
    invoiceFilter,
    selectedMonth,
    selectedYear,
    selectedStatus,
  ]);

  const groupedByMonth = useMemo(() => {
    const map = new Map<string, BKPtReceivable[]>();

    filteredData.forEach((item) => {
      const key = getMonthKey(item.tgl);
      const current = map.get(key) || [];

      current.push(item);
      map.set(key, current);
    });

    return Array.from(map.entries()).sort(([keyA], [keyB]) => {
      if (keyA === "TANPA_TANGGAL") return 1;
      if (keyB === "TANPA_TANGGAL") return -1;

      return keyB.localeCompare(keyA);
    });
  }, [filteredData]);

  const summary = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => {
        const status = getPaymentStatus(item);

        acc.totalDebet += toNumber(item.debet);
        acc.totalKredit += toNumber(item.kredit);
        acc.totalPph += toNumber(item.pph_psl_21) + toNumber(item.pph_psl_23);
        acc.totalSaldo += getCalculatedSaldo(item);

        if (status === "LUNAS") acc.totalLunas += 1;
        if (status === "PARSIAL") acc.totalParsial += 1;
        if (status === "BELUM BAYAR") acc.totalBelumBayar += 1;

        return acc;
      },
      {
        totalDebet: 0,
        totalKredit: 0,
        totalPph: 0,
        totalSaldo: 0,
        totalLunas: 0,
        totalParsial: 0,
        totalBelumBayar: 0,
      }
    );
  }, [filteredData]);

  function resetFilters() {
    setCustomerFilter("");
    setInvoiceFilter("");
    setSelectedMonth("");
    setSelectedYear("");
    setSelectedStatus("");
  }

  async function handleDelete(id: number) {
    const confirmed = confirm("Yakin ingin menghapus data BKPt ini?");

    if (!confirmed) return;

    await deleteBKPtReceivable(id);
    await loadData();
  }

  async function openBank103Modal(bkptId: number) {
    try {
      setSelectedBkptId(bkptId);
      setBankModalOpen(true);
      setLoadingBankPayments(true);

      const result = await getAvailableBkptPayments();
      setAvailableBankPayments(result);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil transaksi Bank 103 yang tersedia.");
    } finally {
      setLoadingBankPayments(false);
    }
  }

  function closeBank103Modal() {
    setBankModalOpen(false);
    setSelectedBkptId(null);
    setAvailableBankPayments([]);
  }

  async function handleApplyBank103(bankId: number) {
    if (!selectedBkptId) {
      alert("Data BKPt belum dipilih.");
      return;
    }

    const confirmed = confirm(
      "Yakin ingin mengambil transaksi Bank 103 ini untuk pembayaran BKPt?"
    );

    if (!confirmed) return;

    try {
      setApplyingBankPayment(true);

      await applyBank103ToBkpt(bankId, {
        bkpt_receivable_id: selectedBkptId,
      });

      closeBank103Modal();
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil transaksi Bank 103 ke BKPt.");
    } finally {
      setApplyingBankPayment(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:shadow-none">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-5 text-white">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  Buku Piutang
                </p>
                <h1 className="mt-1 text-2xl font-bold">BKPt</h1>
                <p className="mt-1 text-sm text-slate-300">
                  Default menampilkan semua bulan, diurutkan dari bulan terbaru
                  ke bulan sebelumnya.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 print:hidden">
                <button
                  onClick={() => router.push("/bkpt/create")}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                >
                  + Tambah BKPt
                </button>

                <button
                  onClick={() => window.print()}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Cetak
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-4 print:hidden">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Piutang / Debet
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(summary.totalDebet) || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Total Pembayaran
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-800">
                {formatCurrency(summary.totalKredit) || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Total Potongan PPh
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-800">
                {formatCurrency(summary.totalPph) || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Sisa Saldo
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-800">
                {formatCurrency(summary.totalSaldo) || "-"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-slate-100 px-5 py-4 md:grid-cols-3 print:hidden">
            <button
              onClick={() => setSelectedStatus("LUNAS")}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedStatus === "LUNAS"
                  ? "border-emerald-300 bg-emerald-100"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Lunas
              </p>
              <p className="mt-1 text-xl font-bold text-emerald-700">
                {summary.totalLunas}
              </p>
            </button>

            <button
              onClick={() => setSelectedStatus("PARSIAL")}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedStatus === "PARSIAL"
                  ? "border-blue-300 bg-blue-100"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Parsial
              </p>
              <p className="mt-1 text-xl font-bold text-blue-700">
                {summary.totalParsial}
              </p>
            </button>

            <button
              onClick={() => setSelectedStatus("BELUM BAYAR")}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedStatus === "BELUM BAYAR"
                  ? "border-amber-300 bg-amber-100"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Belum Bayar
              </p>
              <p className="mt-1 text-xl font-bold text-amber-700">
                {summary.totalBelumBayar}
              </p>
            </button>
          </div>

          <div className="grid gap-3 border-t border-slate-100 px-5 py-4 lg:grid-cols-6 print:hidden">
            <input
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              placeholder="Cari Langganan / PR..."
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 lg:col-span-2"
            />

            <input
              value={invoiceFilter}
              onChange={(e) => setInvoiceFilter(e.target.value)}
              placeholder="Cari No. Invoice..."
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Semua Bulan</option>
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Semua Tahun</option>
              {availableYears.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Memuat data BKPt...
          </div>
        ) : groupedByMonth.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Belum ada data BKPt yang cocok dengan filter.
          </div>
        ) : (
          groupedByMonth.map(([monthKey, rows]) => {
            const monthSummary = rows.reduce(
              (acc, item) => {
                acc.debet += toNumber(item.debet);
                acc.kredit += toNumber(item.kredit);
                acc.pph +=
                  toNumber(item.pph_psl_21) + toNumber(item.pph_psl_23);
                acc.saldo += getCalculatedSaldo(item);
                return acc;
              },
              {
                debet: 0,
                kredit: 0,
                pph: 0,
                saldo: 0,
              }
            );

            return (
              <div
                key={monthKey}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                      Periode
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      {getMonthTitle(monthKey)}
                    </h2>
                  </div>

                  <div className="grid gap-2 text-xs text-slate-600 md:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <span className="block text-slate-400">Debet</span>
                      <b>{formatCurrency(monthSummary.debet) || "-"}</b>
                    </div>

                    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
                      <span className="block text-emerald-500">Kredit</span>
                      <b>{formatCurrency(monthSummary.kredit) || "-"}</b>
                    </div>

                    <div className="rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
                      <span className="block text-blue-500">PPh</span>
                      <b>{formatCurrency(monthSummary.pph) || "-"}</b>
                    </div>

                    <div className="rounded-xl bg-amber-50 px-3 py-2 text-amber-700">
                      <span className="block text-amber-500">Saldo</span>
                      <b>{formatCurrency(monthSummary.saldo) || "-"}</b>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1700px] table-fixed border-collapse text-xs">
                    {/* Lebar kolom BKPt dibuat proporsional agar tabel penuh sampai kanan dan tetap rapi. */}
                    <colgroup>
                      <col className="w-[5%]" />
                      <col className="w-[8%]" />
                      <col className="w-[8%]" />
                      <col className="w-[9%]" />
                      <col className="w-[10%]" />
                      <col className="w-[8%]" />
                      <col className="w-[8%]" />
                      <col className="w-[6%]" />
                      <col className="w-[6%]" />
                      <col className="w-[8%]" />
                      <col className="w-[10%]" />
                      <col className="w-[6%]" />
                      <col className="w-[8%]" />
                    </colgroup>

                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="border border-slate-700 px-3 py-3 text-left">
                          TGL
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-left">
                          NO.ORDER
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-left">
                          NO. INVOICE
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-left">
                          FAKTUR
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-left">
                          PR
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-right">
                          DEBET
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-right">
                          KREDIT
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-right">
                          PPh Psl. 21
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-right">
                          PPh Psl. 23
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-right">
                          SALDO
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-left">
                          KETERANGAN
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-left">
                          STATUS
                        </th>
                        <th className="border border-slate-700 px-3 py-3 text-center print:hidden">
                          AKSI
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((item) => {
                        const status = getPaymentStatus(item);
                        const saldo = getCalculatedSaldo(item);

                        return (
                          <tr
                            key={item.id}
                            className="bg-white transition hover:bg-slate-50"
                          >
                            <td className="border border-slate-200 px-3 py-2 text-slate-700">
                              {formatDate(item.tgl)}
                            </td>

                            <td className="border border-slate-200 px-3 py-2 font-medium text-slate-900">
                              {item.no_order}
                            </td>

                            <td className="border border-slate-200 px-3 py-2 font-semibold text-slate-900">
                              <div>{item.no_invoice}</div>
                              {getInvoicePeriodLabel(item) && (
                                <div className="mt-1 text-[11px] font-medium text-slate-500">
                                  {getInvoicePeriodLabel(item)}
                                </div>
                              )}
                            </td>

                            <td className="border border-slate-200 px-3 py-2 text-slate-700">
                              {item.faktur}
                            </td>

                            <td className="border border-slate-200 px-3 py-2 text-slate-700">
                              {item.pr || item.customer_name}
                            </td>

                            <td className="border border-slate-200 px-3 py-2 text-right font-medium text-slate-900">
                              {formatCurrency(item.debet)}
                            </td>

                            <td className="border border-slate-200 px-3 py-2 text-right text-emerald-700">
                              {formatCurrency(item.kredit)}
                            </td>

                            <td className="border border-slate-200 px-3 py-2 text-right text-blue-700">
                              {formatCurrency(item.pph_psl_21)}
                            </td>

                            <td className="border border-slate-200 px-3 py-2 text-right text-blue-700">
                              {formatCurrency(item.pph_psl_23)}
                            </td>

                            <td className="border border-slate-200 px-3 py-2 text-right font-bold text-amber-700">
                              {formatCurrency(saldo)}
                            </td>

                            <td className="border border-slate-200 px-3 py-2 text-slate-600">
                              <div className="max-w-[260px] whitespace-normal leading-relaxed">
                                {item.keterangan}
                              </div>
                            </td>

                            <td className="border border-slate-200 px-3 py-2">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${getStatusClass(
                                  status
                                )}`}
                              >
                                {status}
                              </span>
                            </td>

                            <td className="border border-slate-200 px-3 py-2 text-center print:hidden">
                              <div className="flex flex-wrap justify-center gap-2">
                                <button
                                  onClick={() => router.push(`/bkpt/${item.id}`)}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  Edit Bayar
                                </button>

                                {saldo > 0 && (
                                  <button
                                    onClick={() => openBank103Modal(item.id)}
                                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                                  >
                                    Ambil Bank 103
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="bg-slate-100 font-bold text-slate-900">
                        <td
                          colSpan={5}
                          className="border border-slate-300 px-3 py-3 text-right"
                        >
                          TOTAL {getMonthTitle(monthKey)}
                        </td>

                        <td className="border border-slate-300 px-3 py-3 text-right">
                          {formatCurrency(monthSummary.debet)}
                        </td>

                        <td className="border border-slate-300 px-3 py-3 text-right text-emerald-700">
                          {formatCurrency(monthSummary.kredit)}
                        </td>

                        <td
                          colSpan={2}
                          className="border border-slate-300 px-3 py-3 text-right text-blue-700"
                        >
                          {formatCurrency(monthSummary.pph)}
                        </td>

                        <td className="border border-slate-300 px-3 py-3 text-right text-amber-700">
                          {formatCurrency(monthSummary.saldo)}
                        </td>

                        <td colSpan={3} className="border border-slate-300 px-3 py-3" />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {bankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b bg-slate-950 px-6 py-4 text-white">
              <div>
                <h2 className="text-xl font-bold">Ambil dari Bank 103</h2>
                <p className="text-sm text-slate-300">
                  Pilih transaksi Bank 103 dengan KODE BkPt, DEBET lebih dari 0,
                  dan belum pernah dipakai ke BKPt.
                </p>
              </div>

              <button
                onClick={closeBank103Modal}
                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
              >
                Tutup
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              {loadingBankPayments ? (
                <div className="rounded-xl border p-8 text-center text-slate-500">
                  Memuat transaksi Bank 103...
                </div>
              ) : availableBankPayments.length === 0 ? (
                <div className="rounded-xl border p-8 text-center text-slate-500">
                  Tidak ada transaksi Bank 103 yang tersedia.
                  <div className="mt-2 text-sm">
                    Pastikan transaksi Bank 103 sudah diinput dengan KODE BkPt,
                    DEBET lebih dari 0, dan belum dipakai ke BKPt.
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full min-w-[850px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                        <th className="border px-3 py-3">TGL</th>
                        <th className="border px-3 py-3">KODE</th>
                        <th className="border px-3 py-3">KETERANGAN</th>
                        <th className="border px-3 py-3 text-right">DEBET</th>
                        <th className="border px-3 py-3 text-right">KREDIT</th>
                        <th className="border px-3 py-3 text-right">SALDO</th>
                        <th className="border px-3 py-3 text-center">AKSI</th>
                      </tr>
                    </thead>

                    <tbody>
                      {availableBankPayments.map((bank) => (
                        <tr key={bank.id} className="hover:bg-slate-50">
                          <td className="border px-3 py-2">
                            {formatDate(bank.tgl)}
                          </td>

                          <td className="border px-3 py-2 font-semibold">
                            {bank.kode || ""}
                          </td>

                          <td className="border px-3 py-2">
                            <div className="max-w-[320px] whitespace-normal leading-relaxed">
                              {bank.keterangan || ""}
                            </div>
                          </td>

                          <td className="border px-3 py-2 text-right font-semibold text-blue-700">
                            {formatCurrency(bank.debet)}
                          </td>

                          <td className="border px-3 py-2 text-right">
                            {formatCurrency(bank.kredit)}
                          </td>

                          <td className="border px-3 py-2 text-right">
                            {formatCurrency(bank.saldo)}
                          </td>

                          <td className="border px-3 py-2 text-center">
                            <button
                              disabled={applyingBankPayment}
                              onClick={() => handleApplyBank103(bank.id)}
                              className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                            >
                              {applyingBankPayment ? "Memproses..." : "Pakai"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t px-6 py-4">
              <button
                onClick={closeBank103Modal}
                className="rounded-xl border px-5 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BKPtPage() {
  return (
    <Suspense fallback={<div className="p-6">Memuat halaman BKPt...</div>}>
      <BKPtPageContent />
    </Suspense>
  );
}
