"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteBKPtReceivable,
  getBKPtReceivables,
} from "@/services/bkpt";
import { BKPtReceivable } from "@/types/bkpt";

function toNumber(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function formatCurrency(value: number | string | null | undefined) {
  return toNumber(value).toLocaleString("id-ID");
}

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("id-ID");
}

export default function BKPtPage() {
  const [data, setData] = useState<BKPtReceivable[]>([]);
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [year, setYear] = useState("2023");
  const [month, setMonth] = useState("");
  const [noInvoice, setNoInvoice] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const result = await getBKPtReceivables({
        customer_name: customerName || undefined,
        year: year || undefined,
        month: month || undefined,
        no_invoice: noInvoice || undefined,
      });

      setData(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm("Hapus data BKPt ini?");

    if (!confirmDelete) return;

    await deleteBKPtReceivable(id);
    await loadData();
  }

  const groupedData = useMemo(() => {
    return data.reduce<Record<string, BKPtReceivable[]>>((acc, item) => {
      const key = item.customer_name || "Tanpa Langganan";

      if (!acc[key]) acc[key] = [];
      acc[key].push(item);

      return acc;
    }, {});
  }, [data]);

  return (
    <div className="space-y-6 p-6">
      <div className="print:hidden flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">BKPt</h1>
          <p className="text-sm text-gray-500">
            Buku Piutang berdasarkan sheet BKPt Excel client.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
          >
            Cetak
          </button>

          <Link
            href="/bkpt/create"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Tambah BKPt
          </Link>
        </div>
      </div>

      <div className="print:hidden grid grid-cols-1 gap-3 rounded border bg-white p-4 md:grid-cols-5">
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Cari Langganan"
          className="rounded border px-3 py-2"
        />

        <input
          value={noInvoice}
          onChange={(e) => setNoInvoice(e.target.value)}
          placeholder="Cari NO. INVOICE"
          className="rounded border px-3 py-2"
        />

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">Semua Bulan</option>
          <option value="1">Januari</option>
          <option value="2">Februari</option>
          <option value="3">Maret</option>
          <option value="4">April</option>
          <option value="5">Mei</option>
          <option value="6">Juni</option>
          <option value="7">Juli</option>
          <option value="8">Agustus</option>
          <option value="9">September</option>
          <option value="10">Oktober</option>
          <option value="11">November</option>
          <option value="12">Desember</option>
        </select>

        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Tahun"
          className="rounded border px-3 py-2"
        />

        <button
          onClick={loadData}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Filter
        </button>
      </div>

      {loading ? (
        <div className="rounded border bg-white p-4">Loading data BKPt...</div>
      ) : Object.keys(groupedData).length === 0 ? (
        <div className="rounded border bg-white p-4">
          Belum ada data BKPt.
        </div>
      ) : (
        Object.entries(groupedData).map(([customer, rows]) => {
          const totalDebet = rows.reduce(
            (sum, item) => sum + toNumber(item.debet),
            0
          );
          const totalKredit = rows.reduce(
            (sum, item) => sum + toNumber(item.kredit),
            0
          );
          const totalPph21 = rows.reduce(
            (sum, item) => sum + toNumber(item.pph_psl_21),
            0
          );
          const totalPph23 = rows.reduce(
            (sum, item) => sum + toNumber(item.pph_psl_23),
            0
          );
          const lastSaldo = rows.length
            ? rows[rows.length - 1].saldo
            : 0;

          return (
            <div key={customer} className="overflow-hidden rounded border bg-white">
              <div className="border-b bg-gray-100 p-3 text-center font-bold uppercase">
                BUKU PIUTANG &quot;{customer}&quot; TH. {year || "2023"}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-2 py-2">TGL</th>
                      <th className="border px-2 py-2">NO.ORDER</th>
                      <th className="border px-2 py-2">NO. INVOICE</th>
                      <th className="border px-2 py-2">FAKTUR</th>
                      <th className="border px-2 py-2">PR</th>
                      <th className="border px-2 py-2 text-right">DEBET</th>
                      <th className="border px-2 py-2 text-right">KREDIT</th>
                      <th className="border px-2 py-2 text-right">PPh Psl. 21</th>
                      <th className="border px-2 py-2 text-right">PPh Psl. 23</th>
                      <th className="border px-2 py-2 text-right">SALDO</th>
                      <th className="border px-2 py-2">KETERANGAN</th>
                      <th className="print:hidden border px-2 py-2">AKSI</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border px-2 py-2">{formatDate(item.tgl)}</td>
                        <td className="border px-2 py-2">{item.no_order}</td>
                        <td className="border px-2 py-2">{item.no_invoice}</td>
                        <td className="border px-2 py-2">{item.faktur}</td>
                        <td className="border px-2 py-2">{item.pr}</td>
                        <td className="border px-2 py-2 text-right">
                          {formatCurrency(item.debet)}
                        </td>
                        <td className="border px-2 py-2 text-right">
                          {formatCurrency(item.kredit)}
                        </td>
                        <td className="border px-2 py-2 text-right">
                          {formatCurrency(item.pph_psl_21)}
                        </td>
                        <td className="border px-2 py-2 text-right">
                          {formatCurrency(item.pph_psl_23)}
                        </td>
                        <td className="border px-2 py-2 text-right">
                          {formatCurrency(item.saldo)}
                        </td>
                        <td className="border px-2 py-2">{item.keterangan}</td>
                        <td className="print:hidden border px-2 py-2">
                          <div className="flex gap-2">
                            <Link
                              href={`/bkpt/${item.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              Edit
                            </Link>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:underline"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    <tr className="font-bold bg-gray-50">
                      <td colSpan={5} className="border px-2 py-2 text-right">
                        TOTAL
                      </td>
                      <td className="border px-2 py-2 text-right">
                        {formatCurrency(totalDebet)}
                      </td>
                      <td className="border px-2 py-2 text-right">
                        {formatCurrency(totalKredit)}
                      </td>
                      <td className="border px-2 py-2 text-right">
                        {formatCurrency(totalPph21)}
                      </td>
                      <td className="border px-2 py-2 text-right">
                        {formatCurrency(totalPph23)}
                      </td>
                      <td className="border px-2 py-2 text-right">
                        {formatCurrency(lastSaldo)}
                      </td>
                      <td className="border px-2 py-2" />
                      <td className="print:hidden border px-2 py-2" />
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