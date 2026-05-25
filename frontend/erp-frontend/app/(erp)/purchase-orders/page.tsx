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
    month: "short",
    year: "2-digit",
  });
}

function toNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatNumber(value: unknown) {
  const numberValue = toNumber(value);
  if (numberValue === 0) return "";

  return numberValue.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function formatCurrency(value: unknown) {
  const numberValue = toNumber(value);
  if (numberValue === 0) return "";

  return numberValue.toLocaleString("id-ID", {
    maximumFractionDigits: 0,
  });
}

function normalizeArray<T>(values: T[] | undefined | null, defaultValue: T) {
  const result = [...(values || [])].slice(0, 14);
  while (result.length < 14) result.push(defaultValue);
  return result;
}

function getTotalKeping(item: ProductionOrder) {
  const partials = normalizeArray(item.partial_billing_quantities, null);

  const partialTotal = partials.reduce<number>((sum, value) => {
    return sum + toNumber(value);
  }, 0);

  return toNumber(item.total_keping) || partialTotal;
}

function getKekurangan(item: ProductionOrder) {
  return Math.max(toNumber(item.quantity) - getTotalKeping(item), 0);
}

function getGroupKey(item: ProductionOrder) {
  return [
    item.order_date || "",
    item.order_number || "",
    item.po_date || "",
    item.do_number || "",
    item.delivery_date || "",
    item.customer_name || "",
  ].join("|");
}

function sortBKOrder(a: ProductionOrder, b: ProductionOrder) {
  const dateA = a.order_date || "";
  const dateB = b.order_date || "";

  if (dateA !== dateB) return dateA.localeCompare(dateB);

  const orderA = a.order_number || "";
  const orderB = b.order_number || "";

  if (orderA !== orderB) return orderA.localeCompare(orderB);

  const poA = a.do_number || "";
  const poB = b.do_number || "";

  if (poA !== poB) return poA.localeCompare(poB);

  return a.id - b.id;
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

    const sorted = [...data].sort(sortBKOrder);

    if (!keyword) return sorted;

    return sorted.filter((item) => {
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

  const groupedData = useMemo(() => {
    const groups: {
      key: string;
      header: ProductionOrder;
      rows: ProductionOrder[];
    }[] = [];

    const map = new Map<string, ProductionOrder[]>();

    filteredData.forEach((item) => {
      const key = getGroupKey(item);
      const current = map.get(key) || [];
      current.push(item);
      map.set(key, current);
    });

    map.forEach((rows, key) => {
      groups.push({
        key,
        header: rows[0],
        rows,
      });
    });

    return groups;
  }, [filteredData]);

  const summary = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => {
        acc.totalOrderKeping += toNumber(item.quantity);
        acc.totalTerkirim += getTotalKeping(item);
        acc.totalKekurangan += getKekurangan(item);
        return acc;
      },
      {
        totalOrderKeping: 0,
        totalTerkirim: 0,
        totalKekurangan: 0,
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
            Buku order sesuai format Excel client. Satu PO bisa berisi banyak
            baris order.
          </p>
        </div>

        <button
          onClick={() => router.push("/purchase-orders/create")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Tambah PO / BKOrder
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 print:hidden">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Order Keping</p>
          <p className="mt-1 text-xl font-bold">
            {summary.totalOrderKeping === 0
              ? "-"
              : summary.totalOrderKeping.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Terkirim</p>
          <p className="mt-1 text-xl font-bold">
            {summary.totalTerkirim === 0
              ? "-"
              : summary.totalTerkirim.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Kekurangan</p>
          <p className="mt-1 text-xl font-bold">
            {summary.totalKekurangan === 0
              ? "-"
              : summary.totalKekurangan.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between print:hidden">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari NO.ORD, PO, PR, jenis bahan, jenis cetak..."
          className="w-full rounded-lg border px-3 py-2 text-sm md:max-w-xl"
        />

        <button
          onClick={() => window.print()}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Cetak
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-[2700px] border-collapse text-xs">
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
                PO
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
                KEPING
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-right">
                Rim
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-right">
                HARGA
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-right">
                KEKURANGAN
              </th>
              <th colSpan={14} className="border px-2 py-2 text-center">
                TGL KIRIM/SELESAI
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
                <td colSpan={46} className="border px-3 py-6 text-center">
                  Memuat data BKOrder...
                </td>
              </tr>
            ) : groupedData.length === 0 ? (
              <tr>
                <td colSpan={46} className="border px-3 py-6 text-center">
                  Belum ada data BKOrder.
                </td>
              </tr>
            ) : (
              groupedData.map((group) => {
                return group.rows.map((item, rowIndex) => {
                  const isFirstRow = rowIndex === 0;
                  const rowSpan = group.rows.length;

                  const deliveryDates = normalizeArray(
                    item.delivery_completed_dates,
                    null
                  );

                  const partials = normalizeArray(
                    item.partial_billing_quantities,
                    null
                  );

                  const totalKeping = getTotalKeping(item);
                  const kekurangan = getKekurangan(item);

                  return (
                    <tr
                      key={item.id}
                      className={
                        isFirstRow
                          ? "border-t-2 border-t-gray-400 hover:bg-gray-50"
                          : "hover:bg-gray-50"
                      }
                    >
                      {isFirstRow && (
                        <>
                          <td
                            rowSpan={rowSpan}
                            className="border px-2 py-2 align-top"
                          >
                            {formatDate(group.header.order_date)}
                          </td>

                          <td
                            rowSpan={rowSpan}
                            className="border px-2 py-2 align-top font-medium"
                          >
                            {group.header.order_number}
                          </td>

                          <td
                            rowSpan={rowSpan}
                            className="border px-2 py-2 align-top"
                          >
                            {formatDate(group.header.po_date)}
                          </td>

                          <td
                            rowSpan={rowSpan}
                            className="border px-2 py-2 align-top"
                          >
                            {group.header.do_number}
                          </td>

                          <td
                            rowSpan={rowSpan}
                            className="border px-2 py-2 align-top"
                          >
                            {formatDate(group.header.delivery_date)}
                          </td>

                          <td
                            rowSpan={rowSpan}
                            className="border px-2 py-2 align-top"
                          >
                            <div className="font-medium">
                              {group.header.customer_name}
                            </div>

                            <button
                              onClick={() =>
                                router.push(
                                  `/purchase-orders/create?copyFrom=${group.header.id}`
                                )
                              }
                              className="mt-2 rounded bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 print:hidden"
                            >
                              + Tambah Order di PO ini
                            </button>
                          </td>
                        </>
                      )}

                      <td className="border px-2 py-2">{item.size}</td>

                      <td className="border px-2 py-2">
                        {item.material_type}
                      </td>

                      <td className="border px-2 py-2">{item.print_type}</td>

                      <td className="border px-2 py-2">
                        {item.specification}
                      </td>

                      <td className="border px-2 py-2">{item.unit}</td>

                      <td className="border px-2 py-2 text-right">
                        {formatNumber(item.quantity)}
                      </td>

                      <td className="border px-2 py-2 text-right">
                        {formatNumber(item.rim)}
                      </td>

                      <td className="border px-2 py-2 text-right">
                        {formatCurrency(item.price)}
                      </td>

                      <td className="border px-2 py-2 text-right font-semibold">
                        {formatNumber(kekurangan)}
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
                          {formatNumber(partialValue)}
                        </td>
                      ))}

                      <td className="border px-2 py-2 text-right font-semibold">
                        {formatNumber(totalKeping)}
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
                });
              })
            )}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={11} className="border px-2 py-2 text-right">
                TOTAL
              </td>

              <td className="border px-2 py-2 text-right">
                {formatNumber(summary.totalOrderKeping)}
              </td>

              <td className="border px-2 py-2" />
              <td className="border px-2 py-2" />

              <td className="border px-2 py-2 text-right">
                {formatNumber(summary.totalKekurangan)}
              </td>

              <td colSpan={28} className="border px-2 py-2" />

              <td className="border px-2 py-2 text-right">
                {formatNumber(summary.totalTerkirim)}
              </td>

              <td colSpan={2} className="border px-2 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}