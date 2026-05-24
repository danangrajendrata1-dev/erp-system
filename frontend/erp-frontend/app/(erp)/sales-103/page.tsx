"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSales103, deleteSales103 } from "@/services/sales103";
import { Sales103 } from "@/types/sales103";

function formatNumber(value: string | number | null) {
  if (value === null || value === undefined || value === "") return "";

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return String(value);

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
      alert("Gagal mengambil data 103");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmDelete = confirm("Yakin ingin menghapus data ini?");

    if (!confirmDelete) return;

    try {
      await deleteSales103(id);
      await loadData();
    } catch (error) {
      console.error("Gagal menghapus data 103:", error);
      alert("Gagal menghapus data 103");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">103</h1>
          <p className="text-sm text-gray-500">
            Buku Penjualan sesuai sheet Excel 103
          </p>
        </div>

        <Link
          href="/sales-103/create"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Tambah Data 103
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[1700px] border-collapse text-sm">
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
              <th className="border px-3 py-2 text-center">AKSI</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={13} className="border px-3 py-6 text-center">
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={13} className="border px-3 py-6 text-center">
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

                  <td className="border px-3 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/sales-103/${item.id}`}
                        className="rounded bg-yellow-500 px-3 py-1 text-xs font-semibold text-white hover:bg-yellow-600"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </div>
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