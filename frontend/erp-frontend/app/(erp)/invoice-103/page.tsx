"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getInvoice103Groups } from "@/services/invoice103";
import { getBKPtReceivables } from "@/services/bkpt";
import { Invoice103Group } from "@/types/invoice103";

type Invoice103GroupWithStatus = Invoice103Group & {
  sudah_masuk_bkpt: boolean;
};

function formatCurrency(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);

  return Number.isNaN(numberValue)
    ? "0"
    : numberValue.toLocaleString("id-ID");
}

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("id-ID");
}

export default function Invoice103Page() {
  const [data, setData] = useState<Invoice103GroupWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [bkptStatus, setBkptStatus] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const invoiceGroups = await getInvoice103Groups();
        const bkptRows = await getBKPtReceivables();

        const bkptInvoiceSet = new Set(
          bkptRows
            .map((item) => item.no_invoice)
            .filter(Boolean)
            .map((item) => String(item))
        );

        const mergedData = invoiceGroups.map((item) => ({
          ...item,
          sudah_masuk_bkpt: bkptInvoiceSet.has(item.no_invoice),
        }));

        setData(mergedData);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();

    return data.filter((item) => {
      const matchKeyword =
        item.no_invoice.toLowerCase().includes(keyword) ||
        item.langganan?.toLowerCase().includes(keyword) ||
        item.no_faktur?.toLowerCase().includes(keyword);

      const matchBKPtStatus =
        !bkptStatus ||
        (bkptStatus === "sudah" && item.sudah_masuk_bkpt) ||
        (bkptStatus === "belum" && !item.sudah_masuk_bkpt);

      return matchKeyword && matchBKPtStatus;
    });
  }, [data, search, bkptStatus]);

  const summary = useMemo(() => {
    return data.reduce(
      (acc, item) => {
        acc.totalInvoice += 1;
        acc.totalDpp += Number(item.total_dpp || 0);
        acc.totalPpn += Number(item.total_ppn_keluar || 0);
        acc.totalPiutang += Number(item.total_piutang_dagang || 0);

        if (item.sudah_masuk_bkpt) {
          acc.sudahMasukBKPt += 1;
        } else {
          acc.belumMasukBKPt += 1;
        }

        return acc;
      },
      {
        totalInvoice: 0,
        totalDpp: 0,
        totalPpn: 0,
        totalPiutang: 0,
        sudahMasukBKPt: 0,
        belumMasukBKPt: 0,
      }
    );
  }, [data]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Invoice 103</h1>
        <p className="text-sm text-gray-500">
          Invoice dibuat dari data 103 / Buku Penjualan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">Total Invoice</div>
          <div className="mt-1 text-xl font-bold">
            {summary.totalInvoice}
          </div>
        </div>

        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">Total DPP</div>
          <div className="mt-1 text-xl font-bold">
            Rp {formatCurrency(summary.totalDpp)}
          </div>
        </div>

        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">Total PPN KELUAR</div>
          <div className="mt-1 text-xl font-bold">
            Rp {formatCurrency(summary.totalPpn)}
          </div>
        </div>

        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">Total PIUTANG DAGANG</div>
          <div className="mt-1 text-xl font-bold">
            Rp {formatCurrency(summary.totalPiutang)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div
          onClick={() => setBkptStatus("sudah")}
          className="cursor-pointer rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700 hover:bg-green-100"
        >
          Sudah Masuk BKPt:{" "}
          <span className="font-bold">{summary.sudahMasukBKPt}</span>
        </div>

        <div
          onClick={() => setBkptStatus("belum")}
          className="cursor-pointer rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 hover:bg-red-100"
        >
          Belum Masuk BKPt:{" "}
          <span className="font-bold">{summary.belumMasukBKPt}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded border bg-white p-4 md:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari NO. INVOICE, LANGGANAN, atau NO. FAKTUR"
          className="rounded border px-3 py-2 md:col-span-2"
        />

        <select
          value={bkptStatus}
          onChange={(e) => setBkptStatus(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">Semua Status BKPt</option>
          <option value="sudah">Sudah Masuk BKPt</option>
          <option value="belum">Belum Masuk BKPt</option>
        </select>
      </div>

      {bkptStatus && (
        <div className="flex items-center justify-between rounded border bg-white p-3 text-sm">
          <div>
            Filter BKPt aktif:{" "}
            <span className="font-bold">
              {bkptStatus === "sudah"
                ? "Sudah Masuk BKPt"
                : "Belum Masuk BKPt"}
            </span>
          </div>

          <button
            onClick={() => setBkptStatus("")}
            className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
          >
            Reset Status
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">TGL</th>
                <th className="border px-3 py-2 text-left">NO. INVOICE</th>
                <th className="border px-3 py-2 text-left">NO. FAKTUR</th>
                <th className="border px-3 py-2 text-left">LANGGANAN</th>
                <th className="border px-3 py-2 text-right">DPP</th>
                <th className="border px-3 py-2 text-right">PPN KELUAR</th>
                <th className="border px-3 py-2 text-right">
                  PIUTANG DAGANG
                </th>
                <th className="border px-3 py-2 text-center">
                  STATUS BKPt
                </th>
                <th className="border px-3 py-2 text-center">AKSI</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="border px-3 py-4 text-center">
                    Loading data Invoice 103...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border px-3 py-4 text-center">
                    Belum ada data invoice dari 103.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.no_invoice} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">
                      {formatDate(item.tgl)}
                    </td>

                    <td className="border px-3 py-2">
                      {item.no_invoice}
                    </td>

                    <td className="border px-3 py-2">
                      {item.no_faktur}
                    </td>

                    <td className="border px-3 py-2">
                      {item.langganan}
                    </td>

                    <td className="border px-3 py-2 text-right">
                      {formatCurrency(item.total_dpp)}
                    </td>

                    <td className="border px-3 py-2 text-right">
                      {formatCurrency(item.total_ppn_keluar)}
                    </td>

                    <td className="border px-3 py-2 text-right font-semibold">
                      {formatCurrency(item.total_piutang_dagang)}
                    </td>

                    <td className="border px-3 py-2 text-center">
                      {item.sudah_masuk_bkpt ? (
                        <span className="inline-block rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                          Sudah Masuk BKPt
                        </span>
                      ) : (
                        <span className="inline-block rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                          Belum Masuk BKPt
                        </span>
                      )}
                    </td>

                    <td className="border px-3 py-2 text-center">
                      <Link
                        href={`/invoice-103/${encodeURIComponent(
                          item.no_invoice
                        )}`}
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                      >
                        Buka Invoice
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}