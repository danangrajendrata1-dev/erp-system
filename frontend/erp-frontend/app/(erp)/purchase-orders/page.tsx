"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteProductionOrder, getProductionOrders } from "@/services/production";
import { ProductionOrder } from "@/types/production";

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

const REPEAT_COLUMNS = Array.from({ length: 14 }, (_, index) => index);

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

function formatNumber(value?: number | string | null) {
  const numberValue = Number(value || 0);
  if (!Number.isFinite(numberValue) || numberValue === 0) return "";
  return numberValue.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function safeArray<T>(values: T[] | undefined | null, defaultValue: T) {
  const result = [...(values || [])].slice(0, 14);
  while (result.length < 14) result.push(defaultValue);
  return result;
}

function getMonthKey(item: ProductionOrder) {
  if (!item.order_date) return "BKORDER TANPA BULAN";
  const date = new Date(item.order_date);
  if (Number.isNaN(date.getTime())) return "BKORDER TANPA BULAN";
  return `BKORDER ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function groupByMonth(data: ProductionOrder[]) {
  return data.reduce<Record<string, ProductionOrder[]>>((groups, item) => {
    const key = getMonthKey(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

export default function PurchaseOrdersPage() {
  const [data, setData] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const result = await getProductionOrders({ search, status, month, year });
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: number) {
    const ok = window.confirm("Hapus data BKOrder ini?");
    if (!ok) return;
    await deleteProductionOrder(id);
    await loadData();
  }

  const groupedData = useMemo(() => groupByMonth(data), [data]);
  const totalJumlah = data.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalKeping = data.reduce((sum, item) => sum + Number(item.total_keping || 0), 0);
  const totalNilai = data.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
    0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BKOrder / PO Masuk</h1>
          <p className="text-sm text-gray-500">
            Tampilan mengikuti sheet BKOrder Excel: DO NUMBER, TGL KIRIM / SELESAI, TAGIHAN PARSIAL, TOTAL, STATUS.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cetak
          </button>
          <Link
            href="/purchase-orders/create"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Tambah BKOrder
          </Link>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-4 print:hidden">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari NO.ORD / DO NUMBER / PR / SPESIFIKASI"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Semua Status</option>
          <option value="OPEN">OPEN</option>
          <option value="PROSES">PROSES</option>
          <option value="SELESAI">SELESAI</option>
          <option value="BATAL">BATAL</option>
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Semua Bulan</option>
          {MONTH_NAMES.map((name, index) => (
            <option key={name} value={String(index + 1)}>
              {name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Tahun" className="w-full rounded-lg border px-3 py-2 text-sm" />
          <button onClick={loadData} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
            Filter
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3 print:hidden">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total JUMLAH</p>
          <p className="text-xl font-bold">{formatNumber(totalJumlah)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Keping Terkirim/Tagihan</p>
          <p className="text-xl font-bold">{formatNumber(totalKeping)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Estimasi Nilai</p>
          <p className="text-xl font-bold">{formatNumber(totalNilai)}</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">Memuat data BKOrder...</div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">Data BKOrder belum ada.</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedData).map(([title, rows]) => (
            <section key={title} className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="border-b bg-yellow-100 px-4 py-3 text-center text-lg font-bold uppercase text-gray-900">{title}</div>

              <div className="overflow-x-auto">
                <table className="min-w-[3600px] border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-gray-100 text-gray-900">
                      <th rowSpan={2} className="border px-2 py-2">TGL</th>
                      <th rowSpan={2} className="border px-2 py-2">NO.ORD</th>
                      <th rowSpan={2} className="border px-2 py-2">PO Date</th>
                      <th rowSpan={2} className="border px-2 py-2">DO NUMBER</th>
                      <th rowSpan={2} className="border px-2 py-2">Deliv. Date</th>
                      <th rowSpan={2} className="border px-2 py-2">PR</th>
                      <th rowSpan={2} className="border px-2 py-2">UKURAN</th>
                      <th rowSpan={2} className="border px-2 py-2">JENIS BAHAN</th>
                      <th rowSpan={2} className="border px-2 py-2">JENIS CETAK</th>
                      <th rowSpan={2} className="border px-2 py-2">SPESIFIKASI</th>
                      <th rowSpan={2} className="border px-2 py-2">SAT</th>
                      <th rowSpan={2} className="border px-2 py-2">JUMLAH</th>
                      <th rowSpan={2} className="border px-2 py-2">Rim</th>
                      <th rowSpan={2} className="border px-2 py-2">HARGA</th>
                      <th colSpan={14} className="border px-2 py-2 text-center">TGL KIRIM / SELESAI</th>
                      <th colSpan={14} className="border px-2 py-2 text-center">TAGIHAN PARSIAL (Keping)</th>
                      <th rowSpan={2} className="border px-2 py-2">TOTAL (Keping)</th>
                      <th rowSpan={2} className="border px-2 py-2">STATUS</th>
                      <th rowSpan={2} className="border px-2 py-2 print:hidden">AKSI</th>
                    </tr>
                    <tr className="bg-gray-50 text-gray-700">
                      {REPEAT_COLUMNS.map((index) => <th key={`date-${index}`} className="border px-2 py-2">{index + 1}</th>)}
                      {REPEAT_COLUMNS.map((index) => <th key={`bill-${index}`} className="border px-2 py-2">{index + 1}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item) => {
                      const kirimDates = safeArray(item.delivery_completed_dates, null);
                      const partials = safeArray(item.partial_billing_quantities, 0);
                      return (
                        <tr key={item.id} className="hover:bg-blue-50">
                          <td className="border px-2 py-2">{formatDate(item.order_date)}</td>
                          <td className="border px-2 py-2 font-medium">{item.order_number}</td>
                          <td className="border px-2 py-2">{formatDate(item.po_date)}</td>
                          <td className="border px-2 py-2">{item.do_number}</td>
                          <td className="border px-2 py-2">{formatDate(item.delivery_date)}</td>
                          <td className="border px-2 py-2">{item.customer_name}</td>
                          <td className="border px-2 py-2">{item.size}</td>
                          <td className="border px-2 py-2">{item.material_type}</td>
                          <td className="border px-2 py-2">{item.print_type}</td>
                          <td className="border px-2 py-2">{item.specification}</td>
                          <td className="border px-2 py-2 text-center">{item.unit}</td>
                          <td className="border px-2 py-2 text-right">{formatNumber(item.quantity)}</td>
                          <td className="border px-2 py-2 text-right">{formatNumber(item.rim)}</td>
                          <td className="border px-2 py-2 text-right">{formatNumber(item.price)}</td>
                          {kirimDates.map((value, index) => <td key={`d-${item.id}-${index}`} className="border px-2 py-2 text-center">{formatDate(value)}</td>)}
                          {partials.map((value, index) => <td key={`p-${item.id}-${index}`} className="border px-2 py-2 text-right">{formatNumber(value)}</td>)}
                          <td className="border px-2 py-2 text-right font-semibold">{formatNumber(item.total_keping)}</td>
                          <td className="border px-2 py-2 text-center">{item.status}</td>
                          <td className="border px-2 py-2 print:hidden">
                            <div className="flex justify-center gap-2">
                              <Link href={`/purchase-orders/${item.id}`} className="rounded bg-amber-500 px-2 py-1 text-white hover:bg-amber-600">Edit</Link>
                              <button onClick={() => handleDelete(item.id)} className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700">Hapus</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
