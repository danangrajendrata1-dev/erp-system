"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function getPaymentStatus(item: BKPtReceivable) {
  const debet = toNumber(item.debet);
  const saldo = toNumber(item.saldo);

  if (debet <= 0) return "BELUM ADA PIUTANG";
  if (saldo <= 0) return "LUNAS";
  if (saldo < debet) return "PARSIAL";

  return "BELUM BAYAR";
}

function getPaymentStatusClass(status: string) {
  if (status === "LUNAS") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (status === "PARSIAL") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  if (status === "BELUM BAYAR") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
}

function BKPtContent() {
  const searchParams = useSearchParams();

  const [data, setData] = useState<BKPtReceivable[]>([]);
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [year, setYear] = useState("2023");
  const [month, setMonth] = useState("");
  const [noInvoice, setNoInvoice] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  async function loadData(customNoInvoice?: string) {
    try {
      setLoading(true);

      const selectedNoInvoice =
        customNoInvoice !== undefined ? customNoInvoice : noInvoice;

      const result = await getBKPtReceivables({
        customer_name: customerName || undefined,
        year: year || undefined,
        month: month || undefined,
        no_invoice: selectedNoInvoice || undefined,
      });

      setData(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const invoiceFromQuery = searchParams.get("no_invoice") || "";

    if (invoiceFromQuery) {
      setNoInvoice(invoiceFromQuery);
      loadData(invoiceFromQuery);
    } else {
      loadData();
    }
  }, [searchParams]);

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm("Hapus data BKPt ini?");

    if (!confirmDelete) return;

    await deleteBKPtReceivable(id);
    await loadData();
  }

  const filteredData = useMemo(() => {
    if (!paymentStatus) return data;

    return data.filter((item) => {
      return getPaymentStatus(item) === paymentStatus;
    });
  }, [data, paymentStatus]);

  const groupedData = useMemo(() => {
    return filteredData.reduce<Record<string, BKPtReceivable[]>>((acc, item) => {
      const key = item.customer_name || "Tanpa Langganan";

      if (!acc[key]) acc[key] = [];
      acc[key].push(item);

      return acc;
    }, {});
  }, [filteredData]);

  const summary = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => {
        acc.totalDebet += toNumber(item.debet);
        acc.totalKredit += toNumber(item.kredit);
        acc.totalPph21 += toNumber(item.pph_psl_21);
        acc.totalPph23 += toNumber(item.pph_psl_23);
        acc.totalSaldo += toNumber(item.saldo);

        const status = getPaymentStatus(item);

        if (status === "LUNAS") acc.totalLunas += 1;
        if (status === "PARSIAL") acc.totalParsial += 1;
        if (status === "BELUM BAYAR") acc.totalBelumBayar += 1;

        return acc;
      },
      {
        totalDebet: 0,
        totalKredit: 0,
        totalPph21: 0,
        totalPph23: 0,
        totalSaldo: 0,
        totalLunas: 0,
        totalParsial: 0,
        totalBelumBayar: 0,
      }
    );
  }, [filteredData]);

  function resetInvoiceFilter() {
    setNoInvoice("");
    loadData("");
  }

  return (
    <div className="space-y-6 p-6">
      <div className="print:hidden flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">BKPt</h1>
          <p className="text-sm text-gray-500">
            Buku Piutang berdasarkan sheet BKPt Excel client.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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

      <div className="print:hidden grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">Total Piutang / DEBET</div>
          <div className="mt-1 text-xl font-bold">
            Rp {formatCurrency(summary.totalDebet)}
          </div>
        </div>

        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">Total Pembayaran / KREDIT</div>
          <div className="mt-1 text-xl font-bold">
            Rp {formatCurrency(summary.totalKredit)}
          </div>
        </div>

        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">Total Potongan PPh</div>
          <div className="mt-1 text-xl font-bold">
            Rp {formatCurrency(summary.totalPph21 + summary.totalPph23)}
          </div>
        </div>

        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">Sisa SALDO</div>
          <div className="mt-1 text-xl font-bold">
            Rp {formatCurrency(summary.totalSaldo)}
          </div>
        </div>
      </div>

      <div className="print:hidden grid grid-cols-1 gap-3 rounded border bg-white p-4 md:grid-cols-6">
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Cari LANGGANAN"
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

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">Semua Status</option>
          <option value="LUNAS">LUNAS</option>
          <option value="PARSIAL">PARSIAL</option>
          <option value="BELUM BAYAR">BELUM BAYAR</option>
        </select>

        <button
          onClick={() => loadData()}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Filter
        </button>
      </div>

      {noInvoice && (
        <div className="print:hidden flex items-center justify-between rounded border bg-white p-3 text-sm">
          <div>
            Filter NO. INVOICE aktif:{" "}
            <span className="font-bold">{noInvoice}</span>
          </div>

          <button
            onClick={resetInvoiceFilter}
            className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
          >
            Reset Invoice
          </button>
        </div>
      )}

      <div className="print:hidden grid grid-cols-1 gap-3 md:grid-cols-3">
        <div
          onClick={() => setPaymentStatus("LUNAS")}
          className="cursor-pointer rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700 hover:bg-green-100"
        >
          LUNAS: <span className="font-bold">{summary.totalLunas}</span>
        </div>

        <div
          onClick={() => setPaymentStatus("PARSIAL")}
          className="cursor-pointer rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700 hover:bg-yellow-100"
        >
          PARSIAL: <span className="font-bold">{summary.totalParsial}</span>
        </div>

        <div
          onClick={() => setPaymentStatus("BELUM BAYAR")}
          className="cursor-pointer rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 hover:bg-red-100"
        >
          BELUM BAYAR:{" "}
          <span className="font-bold">{summary.totalBelumBayar}</span>
        </div>
      </div>

      {paymentStatus && (
        <div className="print:hidden flex items-center justify-between rounded border bg-white p-3 text-sm">
          <div>
            Filter status aktif:{" "}
            <span className="font-bold">{paymentStatus}</span>
          </div>

          <button
            onClick={() => setPaymentStatus("")}
            className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
          >
            Reset Status
          </button>
        </div>
      )}

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

          const totalSaldo = rows.reduce(
            (sum, item) => sum + toNumber(item.saldo),
            0
          );

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
                      <th className="border px-2 py-2 text-right">
                        PPh Psl. 21
                      </th>
                      <th className="border px-2 py-2 text-right">
                        PPh Psl. 23
                      </th>
                      <th className="border px-2 py-2 text-right">SALDO</th>
                      <th className="border px-2 py-2">STATUS</th>
                      <th className="border px-2 py-2">KETERANGAN</th>
                      <th className="print:hidden border px-2 py-2">AKSI</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((item) => {
                      const status = getPaymentStatus(item);

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="border px-2 py-2">
                            {formatDate(item.tgl)}
                          </td>

                          <td className="border px-2 py-2">
                            {item.no_order}
                          </td>

                          <td className="border px-2 py-2">
                            {item.no_invoice}
                          </td>

                          <td className="border px-2 py-2">
                            {item.faktur}
                          </td>

                          <td className="border px-2 py-2">
                            {item.pr}
                          </td>

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

                          <td className="border px-2 py-2 text-right font-semibold">
                            {formatCurrency(item.saldo)}
                          </td>

                          <td className="border px-2 py-2">
                            <span
                              className={`inline-block rounded border px-2 py-1 text-xs font-semibold ${getPaymentStatusClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="border px-2 py-2">
                            {item.keterangan}
                          </td>

                          <td className="print:hidden border px-2 py-2">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/bkpt/${item.id}`}
                                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                              >
                                Edit Bayar
                              </Link>

                              <button
                                onClick={() => handleDelete(item.id)}
                                className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    <tr className="bg-gray-50 font-bold">
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
                        {formatCurrency(totalSaldo)}
                      </td>

                      <td className="border px-2 py-2" />
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

export default function BKPtPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading halaman BKPt...</div>}>
      <BKPtContent />
    </Suspense>
  );
}