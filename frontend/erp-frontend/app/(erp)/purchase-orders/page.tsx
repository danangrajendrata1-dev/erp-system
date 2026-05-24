"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductionOrders } from "@/services/production";
import { ProductionOrder } from "@/types/production";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      const data = await getProductionOrders();
      setOrders(data);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal memuat data BKOrder");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">BKOrder / PO Masuk</h1>
          <p className="text-sm text-gray-500">
            Data order berdasarkan format BKOrder dari file Excel client.
          </p>
        </div>

        <Link
          href="/purchase-orders/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Tambah PO
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-3">No</th>
              <th className="border p-3">TGL</th>
              <th className="border p-3">NO.ORD</th>
              <th className="border p-3">PO Date</th>
              <th className="border p-3">PO Bahan</th>
              <th className="border p-3">Deliv. Date</th>
              <th className="border p-3">PR</th>
              <th className="border p-3">UKURAN</th>
              <th className="border p-3">JENIS BAHAN</th>
              <th className="border p-3">JENIS CETAK</th>
              <th className="border p-3">SPESIFIKASI</th>
              <th className="border p-3">SAT</th>
              <th className="border p-3">JUMLAH</th>
              <th className="border p-3">Rim</th>
              <th className="border p-3">HARGA</th>
              <th className="border p-3">TAGIHAN PARSIAL</th>
              <th className="border p-3">TOTAL</th>
              <th className="border p-3">STATUS</th>
              <th className="border p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={19} className="p-6 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={19} className="p-6 text-center text-gray-500">
                  Belum ada data BKOrder.
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="border p-3">{index + 1}</td>
                  <td className="border p-3">{order.order_date || "-"}</td>
                  <td className="border p-3 font-medium">
                    {order.order_number || "-"}
                  </td>
                  <td className="border p-3">{order.po_date || "-"}</td>
                  <td className="border p-3">
                    {order.material_po_number || "-"}
                  </td>
                  <td className="border p-3">{order.delivery_date || "-"}</td>
                  <td className="border p-3">{order.customer_name || "-"}</td>
                  <td className="border p-3">{order.size || "-"}</td>
                  <td className="border p-3">{order.material_type || "-"}</td>
                  <td className="border p-3">{order.print_type || "-"}</td>
                  <td className="border p-3 max-w-[240px] truncate">
                    {order.specification || "-"}
                  </td>
                  <td className="border p-3">{order.unit || "-"}</td>
                  <td className="border p-3">{order.quantity || 0}</td>
                  <td className="border p-3">{order.rim || 0}</td>
                  <td className="border p-3">{order.price || 0}</td>
                  <td className="border p-3">
                    {order.partial_billing_quantity || 0}
                  </td>
                  <td className="border p-3">{order.total_quantity || 0}</td>
                  <td className="border p-3">
                    <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      {order.status || "-"}
                    </span>
                  </td>
                  <td className="border p-3">
                    <Link
                      href={`/purchase-orders/${order.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Detail
                    </Link>
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