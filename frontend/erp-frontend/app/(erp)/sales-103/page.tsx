"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSales103, deleteSales103 } from "@/services/sales103";
import { Sales103 } from "@/types/sales103";

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

function toNumber(value: string | number | null) {
  if (value === null || value === undefined || value === "") return 0;

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function formatNumber(value: string | number | null) {
  if (value === null || value === undefined || value === "") return "";

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return String(value);

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
}

function formatDate(value: string | null) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getMonthKey(value: string | null) {
  if (!value) return "9999-99";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "9999-99";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getMonthTitle(monthKey: string) {
  if (monthKey === "9999-99") {
    return "BUKU PENJUALAN TANPA TANGGAL";
  }

  const [year, month] = monthKey.split("-");
  const monthIndex = Number(month) - 1;

  return `BUKU PENJUALAN ${MONTH_NAMES[monthIndex]} ${year}`;
}

export default function Sales103Page() {
  const [data, setData] = useState<Sales103[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

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

  const groupedData = useMemo(() => {
    const filteredData =
      selectedMonth === "all"
        ? data
        : data.filter((item) => getMonthKey(item.tgl) === selectedMonth);

    const sortedData = [...filteredData].sort((a, b) => {
      const dateA = a.tgl ? new Date(`${a.tgl}T00:00:00`).getTime() : 0;
      const dateB = b.tgl ? new Date(`${b.tgl}T00:00:00`).getTime() : 0;

      if (dateA !== dateB) return dateA - dateB;

      const invoiceA = a.no_invoice || "";
      const invoiceB = b.no_invoice || "";

      if (invoiceA !== invoiceB) {
        return invoiceA.localeCompare(invoiceB);
      }

      return a.id - b.id;
    });

    const groups: Record<string, Sales103[]> = {};

    sortedData.forEach((item) => {
      const key = getMonthKey(item.tgl);

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);
    });

    return Object.entries(groups).sort(([keyA], [keyB]) => {
      if (keyA === "9999-99") return 1;
      if (keyB === "9999-99") return -1;

      return keyA.localeCompare(keyB);
    });
  }, [data, selectedMonth]);

  const monthOptions = useMemo(() => {
    const keys = Array.from(new Set(data.map((item) => getMonthKey(item.tgl))));

    return keys
      .filter((key) => key !== "9999-99")
      .sort((a, b) => a.localeCompare(b))
      .map((key) => ({
        value: key,
        label: getMonthTitle(key),
      }));
  }, [data]);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-6 print:p-0">
      <div className="print:hidden flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">103</h1>
          <p className="text-sm text-gray-500">
            Buku Penjualan sesuai sheet Excel 103
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="all">Semua Bulan</option>

            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
          >
            Cetak
          </button>

          <Link
            href="/sales-103/create"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Tambah Data 103
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
          Loading data...
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
          Belum ada data 103
        </div>
      ) : groupedData.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
          Tidak ada data untuk bulan yang dipilih
        </div>
      ) : (
        groupedData.map(([monthKey, items]) => {
          const totalDpp = items.reduce(
            (total, item) => total + toNumber(item.dpp),
            0
          );

          const totalPpnKeluar = items.reduce(
            (total, item) => total + toNumber(item.ppn_keluar),
            0
          );

          const totalPiutangDagang = items.reduce(
            (total, item) => total + toNumber(item.piutang_dagang),
            0
          );

          return (
            <div key={monthKey} className="space-y-2 print:break-after-page">
              <div className="rounded-t-lg border bg-gray-200 px-4 py-3 text-center font-bold print:rounded-none">
                {getMonthTitle(monthKey)}
              </div>

              <div className="overflow-x-auto rounded-b-lg border bg-white print:overflow-visible print:rounded-none">
                <table className="w-full min-w-[1800px] border-collapse text-sm print:min-w-0 print:text-[10px]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-3 py-2 text-left print:px-1 print:py-1">
                        TGL
                      </th>
                      <th className="border px-3 py-2 text-left print:px-1 print:py-1">
                        NO.ORD
                      </th>
                      <th className="border px-3 py-2 text-left print:px-1 print:py-1">
                        NO. INVOICE
                      </th>
                      <th className="border px-3 py-2 text-left print:px-1 print:py-1">
                        NO. FAKTUR
                      </th>
                      <th className="border px-3 py-2 text-left print:px-1 print:py-1">
                        LANGGANAN
                      </th>
                      <th className="border px-3 py-2 text-left print:px-1 print:py-1">
                        JENIS CETAK
                      </th>
                      <th className="border px-3 py-2 text-right print:px-1 print:py-1">
                        JML
                      </th>
                      <th className="border px-3 py-2 text-left print:px-1 print:py-1">
                        SAT
                      </th>
                      <th className="border px-3 py-2 text-right print:px-1 print:py-1">
                        HARGA
                      </th>
                      <th className="border px-3 py-2 text-right print:px-1 print:py-1">
                        DPP
                      </th>
                      <th className="border px-3 py-2 text-right print:px-1 print:py-1">
                        PPN KELUAR
                      </th>
                      <th className="border px-3 py-2 text-right print:px-1 print:py-1">
                        PIUTANG DAGANG
                      </th>
                      <th className="print:hidden border px-3 py-2 text-center">
                        AKSI
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, index) => {
                      const previousItem = items[index - 1];

                      const isSameInvoiceAsPrevious =
                        previousItem &&
                        item.no_invoice &&
                        previousItem.no_invoice === item.no_invoice;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="border px-3 py-2 print:px-1 print:py-1">
                            {isSameInvoiceAsPrevious
                              ? ""
                              : formatDate(item.tgl)}
                          </td>

                          <td className="border px-3 py-2 print:px-1 print:py-1">
                            {isSameInvoiceAsPrevious
                              ? ""
                              : item.no_ord || ""}
                          </td>

                          <td className="border px-3 py-2 print:px-1 print:py-1">
                            {isSameInvoiceAsPrevious
                              ? ""
                              : item.no_invoice || ""}
                          </td>

                          <td className="border px-3 py-2 print:px-1 print:py-1">
                            {isSameInvoiceAsPrevious
                              ? ""
                              : item.no_faktur || ""}
                          </td>

                          <td className="border px-3 py-2 print:px-1 print:py-1">
                            {isSameInvoiceAsPrevious
                              ? ""
                              : item.langganan || ""}
                          </td>

                          <td className="border px-3 py-2 print:px-1 print:py-1">
                            {item.jenis_cetak || ""}
                          </td>

                          <td className="border px-3 py-2 text-right print:px-1 print:py-1">
                            {formatNumber(item.jml)}
                          </td>

                          <td className="border px-3 py-2 print:px-1 print:py-1">
                            {item.sat || ""}
                          </td>

                          <td className="border px-3 py-2 text-right print:px-1 print:py-1">
                            {formatNumber(item.harga)}
                          </td>

                          <td className="border px-3 py-2 text-right print:px-1 print:py-1">
                            {formatNumber(item.dpp)}
                          </td>

                          <td className="border px-3 py-2 text-right print:px-1 print:py-1">
                            {formatNumber(item.ppn_keluar)}
                          </td>

                          <td className="border px-3 py-2 text-right print:px-1 print:py-1">
                            {formatNumber(item.piutang_dagang)}
                          </td>

                          <td className="print:hidden border px-3 py-2 text-center">
                            <div className="flex justify-center gap-2">
                              <Link
                                href={`/sales-103/create?copyFrom=${item.id}`}
                                className="rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                              >
                                + Baris
                              </Link>

                              <Link
                                href={`/sales-103/${item.id}`}
                                className="rounded bg-yellow-500 px-3 py-1 text-xs font-semibold text-white hover:bg-yellow-600"
                              >
                                Edit
                              </Link>

                                {item.no_invoice && (
                                  <Link
                                    href={`/invoice-103/${encodeURIComponent(item.no_invoice)}`}
                                    className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                                      >
                                      Cetak Invoice
                                  </Link>
                                )}
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    <tr className="bg-gray-100 font-bold">
                      <td
                        className="border px-3 py-2 text-right print:px-1 print:py-1"
                        colSpan={9}
                      >
                        TOTAL
                      </td>

                      <td className="border px-3 py-2 text-right print:px-1 print:py-1">
                        {formatNumber(totalDpp)}
                      </td>

                      <td className="border px-3 py-2 text-right print:px-1 print:py-1">
                        {formatNumber(totalPpnKeluar)}
                      </td>

                      <td className="border px-3 py-2 text-right print:px-1 print:py-1">
                        {formatNumber(totalPiutangDagang)}
                      </td>

                      <td className="print:hidden border px-3 py-2" />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}