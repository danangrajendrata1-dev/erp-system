"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getInvoice103Groups } from "@/services/invoice103";
import { Invoice103Group } from "@/types/invoice103";

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
  const [data, setData] = useState<Invoice103Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const result = await getInvoice103Groups();
        setData(result);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();

    return data.filter((item) => {
      return (
        item.no_invoice.toLowerCase().includes(keyword) ||
        item.langganan?.toLowerCase().includes(keyword) ||
        item.no_faktur?.toLowerCase().includes(keyword)
      );
    });
  }, [data, search]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Invoice 103</h1>
        <p className="text-sm text-gray-500">
          Invoice dibuat dari data 103 / Buku Penjualan.
        </p>
      </div>

      <div className="rounded border bg-white p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari NO. INVOICE, LANGGANAN, atau NO. FAKTUR"
          className="w-full rounded border px-3 py-2"
        />
      </div>

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
                <th className="border px-3 py-2 text-right">PIUTANG DAGANG</th>
                <th className="border px-3 py-2 text-center">AKSI</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="border px-3 py-4 text-center">
                    Loading data Invoice 103...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border px-3 py-4 text-center">
                    Belum ada data invoice dari 103.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.no_invoice} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{formatDate(item.tgl)}</td>
                    <td className="border px-3 py-2">{item.no_invoice}</td>
                    <td className="border px-3 py-2">{item.no_faktur}</td>
                    <td className="border px-3 py-2">{item.langganan}</td>
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
                      <Link
                        href={`/invoice-103/${encodeURIComponent(
                          item.no_invoice
                        )}`}
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                      >
                        Cetak Invoice
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