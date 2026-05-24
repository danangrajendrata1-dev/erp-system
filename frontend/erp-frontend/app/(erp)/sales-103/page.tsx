"use client";

import { useEffect, useState } from "react";
import { getSales103 } from "@/services/sales103";
import { Sales103 } from "@/types/sales103";

function formatNumber(value: string | number | null) {
  if (value === null || value === undefined || value === "") return "";

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return value;

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
}

export default function Sales103Page() {
  const [data, setData] = useState<Sales103[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const result = await getSales103();
      setData(result);
    } catch (error) {
      console.error("Gagal mengambil data 103:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">103</h1>
        <p className="text-sm text-gray-500">
          Buku Penjualan sesuai sheet Excel 103
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[1500px] border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">TGL</th>
              <th className="border px-3 py-2 text-left">NO.ORD</th>
              <th className="border px-3 py-2 text-left">NO. INVOICE</th>
              <th className="border px-3 py-2 text-left">NO. FAKTUR</th>
              <th className="border px-3 py-2 text-left">LANGGANAN</th>
              <th className="border px-3 py-2 text-left">JENIS CETAK</th>
              <th className="border px-3 py-2 text-right">JML</th>
              <th className="border px-3 py-2 text-left">SAT</th>
              <th className="border px-3 py-2 text-right">HARGA</th>
              <th className="border px-3 py-2 text-right">DPP</th>
              <th className="border px-3 py-2 text-right">PPN KELUAR</th>
              <th className="border px-3 py-2 text-right">PIUTANG DAGANG</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} className="border px-3 py-6 text-center">
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={12} className="border px-3 py-6 text-center">
                  Belum ada data 103
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{item.tgl || ""}</td>
                  <td className="border px-3 py-2">{item.no_ord || ""}</td>
                  <td className="border px-3 py-2">
                    {item.no_invoice || ""}
                  </td>
                  <td className="border px-3 py-2">
                    {item.no_faktur || ""}
                  </td>
                  <td className="border px-3 py-2">
                    {item.langganan || ""}
                  </td>
                  <td className="border px-3 py-2">
                    {item.jenis_cetak || ""}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    {formatNumber(item.jml)}
                  </td>
                  <td className="border px-3 py-2">{item.sat || ""}</td>
                  <td className="border px-3 py-2 text-right">
                    {formatNumber(item.harga)}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    {formatNumber(item.dpp)}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    {formatNumber(item.ppn_keluar)}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    {formatNumber(item.piutang_dagang)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}