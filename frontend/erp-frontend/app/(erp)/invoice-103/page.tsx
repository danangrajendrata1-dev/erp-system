"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Printer,
  RefreshCcw,
  Search,
} from "lucide-react";

import { getBKPtReceivables } from "@/services/bkpt";
import { getInvoice103Groups } from "@/services/invoice103";
import { BKPtReceivable } from "@/types/bkpt";
import { Invoice103Group } from "@/types/invoice103";

type InvoiceStatus = "all" | "in_bkpt" | "not_in_bkpt";

function toNumber(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeText(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function formatCurrency(value: number | string | null | undefined) {
  return Math.round(toNumber(value)).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function buildBKPtInvoiceSet(items: BKPtReceivable[]) {
  return new Set(
    items
      .map((item) => normalizeText(item.no_invoice))
      .filter((value) => value.length > 0)
  );
}

export default function Invoice103Page() {
  const [invoices, setInvoices] = useState<Invoice103Group[]>([]);
  const [bkptInvoiceSet, setBKPtInvoiceSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("all");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      // Invoice 103 bersumber dari Sales 103, lalu dicek apakah sudah masuk BKPt.
      const [invoiceResult, bkptResult] = await Promise.all([
        getInvoice103Groups(),
        getBKPtReceivables(),
      ]);

      setInvoices(invoiceResult);
      setBKPtInvoiceSet(buildBKPtInvoiceSet(bkptResult));
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data Invoice 103.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredInvoices = useMemo(() => {
    const keyword = normalizeText(search);

    return invoices.filter((invoice) => {
      const invoiceKey = normalizeText(invoice.no_invoice);
      const alreadyInBKPt = bkptInvoiceSet.has(invoiceKey);

      const matchStatus =
        status === "all" ||
        (status === "in_bkpt" && alreadyInBKPt) ||
        (status === "not_in_bkpt" && !alreadyInBKPt);

      const matchSearch =
        !keyword ||
        [
          invoice.no_invoice,
          invoice.no_faktur,
          invoice.langganan,
          invoice.tgl,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchStatus && matchSearch;
    });
  }, [bkptInvoiceSet, invoices, search, status]);

  const summary = useMemo(() => {
    return filteredInvoices.reduce(
      (acc, invoice) => {
        const alreadyInBKPt = bkptInvoiceSet.has(
          normalizeText(invoice.no_invoice)
        );

        acc.totalInvoice += 1;
        acc.totalDpp += toNumber(invoice.total_dpp);
        acc.totalPpn += toNumber(invoice.total_ppn_keluar);
        acc.totalPiutang += toNumber(invoice.total_piutang_dagang);

        if (alreadyInBKPt) {
          acc.totalMasukBKPt += 1;
        } else {
          acc.totalBelumMasukBKPt += 1;
        }

        return acc;
      },
      {
        totalInvoice: 0,
        totalMasukBKPt: 0,
        totalBelumMasukBKPt: 0,
        totalDpp: 0,
        totalPpn: 0,
        totalPiutang: 0,
      }
    );
  }, [bkptInvoiceSet, filteredInvoices]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-950 px-6 py-5 text-white">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  Invoice 103
                </p>
                <h1 className="mt-1 text-2xl font-bold">
                  Monitor Invoice 103
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Pantau invoice dari Sales 103 sebelum atau sesudah masuk BKPt.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/sales-103"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <FileText size={16} />
                  Buku 103
                </Link>

                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  <RefreshCcw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Invoice
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {summary.totalInvoice}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Sudah Masuk BKPt
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-800">
                {summary.totalMasukBKPt}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Belum Masuk BKPt
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-800">
                {summary.totalBelumMasukBKPt}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Total Piutang
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-800">
                {formatCurrency(summary.totalPiutang)}
              </p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-slate-100 px-5 py-4 lg:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari no invoice, no faktur, langganan, atau tanggal..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as InvoiceStatus)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">Semua Status</option>
              <option value="not_in_bkpt">Belum Masuk BKPt</option>
              <option value="in_bkpt">Sudah Masuk BKPt</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1360px] table-fixed border-collapse text-sm">
              {/* Lebar kolom dibuat proporsional agar tabel penuh sampai kanan dan tetap mudah dibaca. */}
              <colgroup>
                <col className="w-[7%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
                <col className="w-[19%]" />
                <col className="w-[9%]" />
                <col className="w-[9%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
              </colgroup>

              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="border border-slate-700 px-3 py-3 text-left">
                    TGL
                  </th>
                  <th className="border border-slate-700 px-3 py-3 text-left">
                    NO. INVOICE
                  </th>
                  <th className="border border-slate-700 px-3 py-3 text-left">
                    NO. FAKTUR
                  </th>
                  <th className="border border-slate-700 px-3 py-3 text-left">
                    LANGGANAN
                  </th>
                  <th className="border border-slate-700 px-3 py-3 text-right">
                    DPP
                  </th>
                  <th className="border border-slate-700 px-3 py-3 text-right">
                    PPN KELUAR
                  </th>
                  <th className="border border-slate-700 px-3 py-3 text-right">
                    PIUTANG DAGANG
                  </th>
                  <th className="border border-slate-700 px-3 py-3 text-center">
                    STATUS BKPt
                  </th>
                  <th className="border border-slate-700 px-3 py-3 text-center">
                    AKSI
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="border px-3 py-10 text-center text-slate-500"
                    >
                      Memuat data Invoice 103...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="border px-3 py-10 text-center text-slate-500"
                    >
                      Tidak ada Invoice 103 yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const alreadyInBKPt = bkptInvoiceSet.has(
                      normalizeText(invoice.no_invoice)
                    );

                    return (
                      <tr key={invoice.no_invoice} className="hover:bg-slate-50">
                        <td className="border border-slate-200 px-3 py-2 text-slate-700">
                          {formatDate(invoice.tgl)}
                        </td>
                        <td className="border border-slate-200 px-3 py-2 font-semibold text-slate-900">
                          {invoice.no_invoice}
                        </td>
                        <td className="border border-slate-200 px-3 py-2 text-slate-700">
                          {invoice.no_faktur || "-"}
                        </td>
                        <td className="border border-slate-200 px-3 py-2 text-slate-700">
                          {invoice.langganan || "-"}
                        </td>
                        <td className="border border-slate-200 px-3 py-2 text-right text-slate-700">
                          {formatCurrency(invoice.total_dpp)}
                        </td>
                        <td className="border border-slate-200 px-3 py-2 text-right text-slate-700">
                          {formatCurrency(invoice.total_ppn_keluar)}
                        </td>
                        <td className="border border-slate-200 px-3 py-2 text-right font-semibold text-slate-900">
                          {formatCurrency(invoice.total_piutang_dagang)}
                        </td>
                        <td className="border border-slate-200 px-3 py-2 text-center">
                          {alreadyInBKPt ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                              <CheckCircle2 size={14} />
                              Sudah Masuk
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                              Belum Masuk
                            </span>
                          )}
                        </td>
                        <td className="border border-slate-200 px-3 py-2 text-center">
                          <Link
                            href={`/invoice-103/${encodeURIComponent(
                              invoice.no_invoice
                            )}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            <Printer size={14} />
                            Detail / Cetak
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {!loading && filteredInvoices.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td
                      colSpan={4}
                      className="border border-slate-300 px-3 py-3 text-right"
                    >
                      TOTAL
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-right">
                      {formatCurrency(summary.totalDpp)}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-right">
                      {formatCurrency(summary.totalPpn)}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-right">
                      {formatCurrency(summary.totalPiutang)}
                    </td>
                    <td colSpan={2} className="border border-slate-300" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
