"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProductionOrder,
  getProductionOrders,
} from "@/services/production";
import { ProductionOrder } from "@/types/production";

const REPEAT_COLUMNS = Array.from({ length: 14 }, (_, index) => index);

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatNumber(value: unknown) {
  return toNumber(value).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function formatCurrency(value: unknown) {
  return toNumber(value).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

function normalizeArray<T>(values: T[] | undefined | null, defaultValue: T) {
  const result = [...(values || [])].slice(0, 14);
  while (result.length < 14) result.push(defaultValue);
  return result;
}

export default function PurchaseOrdersPage() {
  const router = useRouter();

  const [data, setData] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadData() {
    setLoading(true);

    try {
      const result = await getProductionOrders();
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return data;

    return data.filter((item) => {
      return [
        item.order_number,
        item.do_number,
        item.customer_name,
        item.size,
        item.material_type,
        item.print_type,
        item.specification,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [data, search]);

  const summary = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => {
        acc.totalJumlah += toNumber(item.quantity);
        acc.totalKeping += toNumber(item.total_keping);
        acc.totalNilai += toNumber(item.quantity) * toNumber(item.price);
        return acc;
      },
      {
        totalJumlah: 0,
        totalKeping: 0,
        totalNilai: 0,
      }
    );
  }, [filteredData]);

  async function handleDelete(id: number) {
    const confirmed = confirm("Yakin ingin menghapus data BKOrder ini?");

    if (!confirmed) return;

    await deleteProductionOrder(id);
    await loadData();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BKOrder</h1>
          <p className="text-sm text-gray-500">
            Buku order sesuai format Excel client.
          </p>
        </div>

        <button
          onClick={() => router.push("/purchase-orders/create")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Tambah BKOrder
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total JUMLAH</p>
          <p className="mt-1 text-xl font-bold">
            {formatNumber(summary.totalJumlah)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Keping</p>
          <p className="mt-1 text-xl font-bold">
            {formatNumber(summary.totalKeping)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Estimasi Nilai</p>
          <p className="mt-1 text-xl font-bold">
            {formatCurrency(summary.totalNilai)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari NO.ORD, DO NUMBER, PR, jenis bahan, jenis cetak..."
          className="w-full rounded-lg border px-3 py-2 text-sm md:max-w-xl"
        />

        <button
          onClick={() => window.print()}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 print:hidden"
        >
          Cetak
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-[2600px] border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100 text-gray-900">
              <th rowSpan={2} className="border px-2 py-2 text-left">
                TGL
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left">
                NO.ORD
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left">
                PO Date
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left">
                DO NUMBER
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left">
                Deliv. Date
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left">
                PR
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left">
                UKURAN
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left">
                JENIS BAHAN
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left">
                JENIS CETAK
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left">
                SPESIFIKASI
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left">
                SAT
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-right">
                JUMLAH
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-right">
                Rim
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-right">
                HARGA
              </th>
              <th colSpan={14} className="border px-2 py-2 text-center">
                TGL KIRIM / SELESAI
              </th>
              <th colSpan={14} className="border px-2 py-2 text-center">
                TAGIHAN PARSIAL (Keping)
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-right">
                TOTAL (Keping)
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left">
                STATUS
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-center print:hidden">
                AKSI
              </th>
            </tr>

            <tr className="bg-gray-50 text-gray-700">
              {REPEAT_COLUMNS.map((index) => (
                <th key={`date-head-${index}`} className="border px-2 py-2">
                  {index + 1}
                </th>
              ))}

              {REPEAT_COLUMNS.map((index) => (
                <th key={`partial-head-${index}`} className="border px-2 py-2">
                  {index + 1}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={45} className="border px-3 py-6 text-center">
                  Memuat data BKOrder...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={45} className="border px-3 py-6 text-center">
                  Belum ada data BKOrder.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const deliveryDates = normalizeArray(
                  item.delivery_completed_dates,
                  null
                );

                const partials = normalizeArray(
                  item.partial_billing_quantities,
                  0
                );

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-2">
                      {formatDate(item.order_date)}
                    </td>
                    <td className="border px-2 py-2 font-medium">
                      {item.order_number}
                    </td>
                    <td className="border px-2 py-2">
                      {formatDate(item.po_date)}
                    </td>
                    <td className="border px-2 py-2">
                      {item.do_number}
                    </td>
                    <td className="border px-2 py-2">
                      {formatDate(item.delivery_date)}
                    </td>
                    <td className="border px-2 py-2">
                      {item.customer_name}
                    </td>
                    <td className="border px-2 py-2">
                      {item.size}
                    </td>
                    <td className="border px-2 py-2">
                      {item.material_type}
                    </td>
                    <td className="border px-2 py-2">
                      {item.print_type}
                    </td>
                    <td className="border px-2 py-2">
                      {item.specification}
                    </td>
                    <td className="border px-2 py-2">
                      {item.unit}
                    </td>
                    <td className="border px-2 py-2 text-right">
                      {formatNumber(item.quantity)}
                    </td>
                    <td className="border px-2 py-2 text-right">
                      {formatNumber(item.rim)}
                    </td>
                    <td className="border px-2 py-2 text-right">
                      {formatCurrency(item.price)}
                    </td>

                    {deliveryDates.map((dateValue, index) => (
                      <td
                        key={`date-${item.id}-${index}`}
                        className="border px-2 py-2 text-center"
                      >
                        {formatDate(dateValue)}
                      </td>
                    ))}

                    {partials.map((partialValue, index) => (
                      <td
                        key={`partial-${item.id}-${index}`}
                        className="border px-2 py-2 text-right"
                      >
                        {toNumber(partialValue)
                          ? formatNumber(partialValue)
                          : ""}
                      </td>
                    ))}

                    <td className="border px-2 py-2 text-right font-semibold">
                      {formatNumber(item.total_keping)}
                    </td>

                    <td className="border px-2 py-2">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold">
                        {item.status || "-"}
                      </span>
                    </td>

                    <td className="border px-2 py-2 text-center print:hidden">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/purchase-orders/${item.id}`)
                          }
                          className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={11} className="border px-2 py-2 text-right">
                TOTAL
              </td>
              <td className="border px-2 py-2 text-right">
                {formatNumber(summary.totalJumlah)}
              </td>
              <td className="border px-2 py-2" />
              <td className="border px-2 py-2 text-right">
                {formatCurrency(summary.totalNilai)}
              </td>
              <td colSpan={28} className="border px-2 py-2" />
              <td className="border px-2 py-2 text-right">
                {formatNumber(summary.totalKeping)}
              </td>
              <td colSpan={2} className="border px-2 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}