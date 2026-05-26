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

function isRimUnit(unit?: string | null) {
  return String(unit || "").toLowerCase().includes("rim");
}

function normalizeArray<T>(values: T[] | undefined | null, defaultValue: T) {
  const result = [...(values || [])].slice(0, 14);

  while (result.length < 14) {
    result.push(defaultValue);
  }

  return result;
}

function getTotalKeping(item: ProductionOrder) {
  const partials = normalizeArray(item.partial_billing_quantities, null);

  const partialTotal = partials.reduce<number>((sum, value) => {
    return sum + toNumber(value);
  }, 0);

  return toNumber(item.total_keping) || partialTotal;
}

function getKekuranganKeping(item: ProductionOrder) {
  return Math.max(toNumber(item.quantity) - getTotalKeping(item), 0);
}

function getKepingPerRimFromItem(item: ProductionOrder) {
  const quantity = toNumber(item.quantity);
  const rim = toNumber(item.rim);

  if (quantity > 0 && rim > 0) {
    return quantity / rim;
  }

  return 0;
}

function convertKepingToDisplay(params: {
  value: unknown;
  unit?: string | null;
  kepingPerRim: number;
}) {
  const { value, unit, kepingPerRim } = params;
  const keping = toNumber(value);

  if (keping === 0) return "";

  if (isRimUnit(unit) && kepingPerRim > 0) {
    return (keping / kepingPerRim).toLocaleString("id-ID", {
      maximumFractionDigits: 4,
    });
  }

  return keping.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function getKekuranganDisplay(item: ProductionOrder) {
  const kekuranganKeping = getKekuranganKeping(item);
  const kepingPerRim = getKepingPerRimFromItem(item);

  if (isRimUnit(item.unit) && kepingPerRim > 0) {
    return {
      value: kekuranganKeping / kepingPerRim,
      unit: "Rim",
    };
  }

  return {
    value: kekuranganKeping,
    unit: "Keping",
  };
}

function getTotalTerkirimDisplay(item: ProductionOrder) {
  const totalKeping = getTotalKeping(item);
  const kepingPerRim = getKepingPerRimFromItem(item);

  if (isRimUnit(item.unit) && kepingPerRim > 0) {
    return {
      value: totalKeping / kepingPerRim,
      unit: "Rim",
    };
  }

  return {
    value: totalKeping,
    unit: "Keping",
  };
}

function formatDisplayWithUnit(value: number, unit: string) {
  if (!value || value <= 0) return "";

  return `${value.toLocaleString("id-ID", {
    maximumFractionDigits: 4,
  })} ${unit}`;
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

  const doNumberA = a.do_number || "";
  const doNumberB = b.do_number || "";

  if (doNumberA !== doNumberB) {
    return doNumberA.localeCompare(doNumberB);
  }

  return a.id - b.id;
}

function getStatusClass(status?: string | null) {
  switch (status) {
    case "SELESAI":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "PROSES":
      return "bg-blue-100 text-blue-700 ring-blue-200";
    case "BATAL":
      return "bg-red-100 text-red-700 ring-red-200";
    case "OPEN":
      return "bg-amber-100 text-amber-700 ring-amber-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
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
        acc.totalTerkirimKeping += getTotalKeping(item);
        acc.totalKekuranganKeping += getKekuranganKeping(item);

        return acc;
      },
      {
        totalOrderKeping: 0,
        totalTerkirimKeping: 0,
        totalKekuranganKeping: 0,
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:shadow-none">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-5 text-white">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  Buku Order
                </p>

                <h1 className="mt-1 text-2xl font-bold">BKOrder</h1>

                <p className="mt-1 text-sm text-slate-300">
                  Satu DO NUMBER bisa berisi banyak baris order seperti format
                  Excel client.
                </p>
              </div>

              <button
                onClick={() => router.push("/purchase-orders/create")}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 print:hidden"
              >
                + Tambah BKOrder
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-3 print:hidden">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Order Keping
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {summary.totalOrderKeping === 0
                  ? "-"
                  : summary.totalOrderKeping.toLocaleString("id-ID")}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Summary ini tetap dalam keping untuk kebutuhan data internal.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Total Terkirim
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-800">-</p>

              <p className="mt-1 text-xs text-emerald-700">
                Total campuran Rim/Keping ditampilkan per baris order.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Total Kekurangan
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-800">-</p>

              <p className="mt-1 text-xs text-amber-700">
                Kekurangan mengikuti SAT masing-masing order.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between print:hidden">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NO.ORD, DO NUMBER, PR, bahan, jenis cetak, spesifikasi..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 md:max-w-xl"
            />

            <div className="flex gap-2">
              <button
                onClick={loadData}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Refresh
              </button>

              <button
                onClick={() => window.print()}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cetak
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[2800px] border-collapse text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-800 text-white">
                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    TGL
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    NO.ORD
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    PO Date
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    DO NUMBER
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    Deliv. Date
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    PR
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    UKURAN
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    JENIS BAHAN
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    JENIS CETAK
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    SPESIFIKASI
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    SAT
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-right"
                  >
                    KEPING
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-right"
                  >
                    Rim
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-right"
                  >
                    HARGA
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-right"
                  >
                    KEKURANGAN
                  </th>

                  <th
                    colSpan={14}
                    className="border border-slate-700 px-3 py-3 text-center"
                  >
                    TGL KIRIM / SELESAI
                  </th>

                  <th
                    colSpan={14}
                    className="border border-slate-700 px-3 py-3 text-center"
                  >
                    TAGIHAN PARSIAL
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-right"
                  >
                    TOTAL TERKIRIM
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-left"
                  >
                    STATUS
                  </th>

                  <th
                    rowSpan={2}
                    className="border border-slate-700 px-3 py-3 text-center print:hidden"
                  >
                    AKSI
                  </th>
                </tr>

                <tr className="bg-slate-700 text-white">
                  {REPEAT_COLUMNS.map((index) => (
                    <th
                      key={`date-head-${index}`}
                      className="border border-slate-600 px-2 py-2"
                    >
                      {index + 1}
                    </th>
                  ))}

                  {REPEAT_COLUMNS.map((index) => (
                    <th
                      key={`partial-head-${index}`}
                      className="border border-slate-600 px-2 py-2"
                    >
                      {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={46}
                      className="border px-3 py-10 text-center text-slate-500"
                    >
                      Memuat data BKOrder...
                    </td>
                  </tr>
                ) : groupedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={46}
                      className="border px-3 py-10 text-center text-slate-500"
                    >
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

                      const kepingPerRim = getKepingPerRimFromItem(item);
                      const kekuranganDisplay = getKekuranganDisplay(item);
                      const totalTerkirimDisplay =
                        getTotalTerkirimDisplay(item);

                      return (
                        <tr
                          key={item.id}
                          className={
                            isFirstRow
                              ? "border-t-4 border-t-slate-300 bg-white hover:bg-slate-50"
                              : "bg-white hover:bg-slate-50"
                          }
                        >
                          {isFirstRow && (
                            <>
                              <td
                                rowSpan={rowSpan}
                                className="border border-slate-200 bg-slate-50 px-3 py-3 align-top font-medium text-slate-700"
                              >
                                {formatDate(group.header.order_date)}
                              </td>

                              <td
                                rowSpan={rowSpan}
                                className="border border-slate-200 bg-slate-50 px-3 py-3 align-top font-semibold text-slate-900"
                              >
                                {group.header.order_number}
                              </td>

                              <td
                                rowSpan={rowSpan}
                                className="border border-slate-200 bg-slate-50 px-3 py-3 align-top text-slate-700"
                              >
                                {formatDate(group.header.po_date)}
                              </td>

                              <td
                                rowSpan={rowSpan}
                                className="border border-slate-200 bg-slate-50 px-3 py-3 align-top font-semibold text-slate-900"
                              >
                                {group.header.do_number}
                              </td>

                              <td
                                rowSpan={rowSpan}
                                className="border border-slate-200 bg-slate-50 px-3 py-3 align-top text-slate-700"
                              >
                                {formatDate(group.header.delivery_date)}
                              </td>

                              <td
                                rowSpan={rowSpan}
                                className="border border-slate-200 bg-slate-50 px-3 py-3 align-top"
                              >
                                <div className="min-w-[170px]">
                                  <div className="font-semibold text-slate-900">
                                    {group.header.customer_name}
                                  </div>

                                  <div className="mt-1 text-[11px] text-slate-500">
                                    {group.rows.length} baris order
                                  </div>

                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/purchase-orders/create?copyFrom=${group.header.id}`
                                      )
                                    }
                                    className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-700 print:hidden"
                                  >
                                    + Tambah Order
                                  </button>
                                </div>
                              </td>
                            </>
                          )}

                          <td className="border border-slate-200 px-3 py-2 text-slate-700">
                            {item.size}
                          </td>

                          <td className="border border-slate-200 px-3 py-2 text-slate-700">
                            {item.material_type}
                          </td>

                          <td className="border border-slate-200 px-3 py-2 text-slate-700">
                            {item.print_type}
                          </td>

                          <td className="border border-slate-200 px-3 py-2 text-slate-700">
                            <div className="max-w-[240px] whitespace-normal leading-relaxed">
                              {item.specification}
                            </div>
                          </td>

                          <td className="border border-slate-200 px-3 py-2 text-slate-700">
                            {item.unit}
                          </td>

                          <td className="border border-slate-200 px-3 py-2 text-right font-medium text-slate-900">
                            {formatNumber(item.quantity)}
                          </td>

                          <td className="border border-slate-200 px-3 py-2 text-right text-slate-700">
                            {formatNumber(item.rim)}
                          </td>

                          <td className="border border-slate-200 px-3 py-2 text-right text-slate-700">
                            {formatCurrency(item.price)}
                          </td>

                          <td className="border border-slate-200 px-3 py-2 text-right font-semibold text-amber-700">
                            {formatDisplayWithUnit(
                              kekuranganDisplay.value,
                              kekuranganDisplay.unit
                            )}
                          </td>

                          {deliveryDates.map((dateValue, index) => (
                            <td
                              key={`date-${item.id}-${index}`}
                              className="border border-slate-200 px-2 py-2 text-center text-red-600"
                            >
                              {formatDate(dateValue)}
                            </td>
                          ))}

                          {partials.map((partialValue, index) => (
                            <td
                              key={`partial-${item.id}-${index}`}
                              className="border border-slate-200 px-2 py-2 text-right text-slate-700"
                            >
                              {convertKepingToDisplay({
                                value: partialValue,
                                unit: item.unit,
                                kepingPerRim,
                              })}
                            </td>
                          ))}

                          <td className="border border-slate-200 px-3 py-2 text-right font-bold text-slate-900">
                            {formatDisplayWithUnit(
                              totalTerkirimDisplay.value,
                              totalTerkirimDisplay.unit
                            )}
                          </td>

                          <td className="border border-slate-200 px-3 py-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {item.status || "-"}
                            </span>
                          </td>

                          <td className="border border-slate-200 px-3 py-2 text-center print:hidden">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  router.push(`/purchase-orders/${item.id}`)
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(item.id)}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
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
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td
                    colSpan={11}
                    className="border border-slate-300 px-3 py-3 text-right"
                  >
                    TOTAL
                  </td>

                  <td className="border border-slate-300 px-3 py-3 text-right">
                    {formatNumber(summary.totalOrderKeping)}
                  </td>

                  <td className="border border-slate-300 px-3 py-3" />
                  <td className="border border-slate-300 px-3 py-3" />

                  <td className="border border-slate-300 px-3 py-3 text-right text-amber-700">
                    -
                  </td>

                  <td
                    colSpan={28}
                    className="border border-slate-300 px-3 py-3"
                  />

                  <td className="border border-slate-300 px-3 py-3 text-right">
                    -
                  </td>

                  <td
                    colSpan={2}
                    className="border border-slate-300 px-3 py-3"
                  />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}