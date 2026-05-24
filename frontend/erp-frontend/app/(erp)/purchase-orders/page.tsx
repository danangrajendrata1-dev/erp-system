"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductionOrders } from "@/services/production";
import { ProductionOrder } from "@/types/production";

export default function ProductionOrdersPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      const data = await getProductionOrders();
      setOrders(data);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PO Masuk / Order Produksi</h1>
          <p className="text-sm text-gray-500">
            Data order produksi sesuai alur BKOrder client.
          </p>
        </div>

        <Link
          href="/purchase-orders/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          + Tambah PO
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-3">No</th>
              <th className="border p-3">No. Order</th>
              <th className="border p-3">Customer</th>
              <th className="border p-3">Bahan</th>
              <th className="border p-3">Cetak</th>
              <th className="border p-3">Qty</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  Memuat data...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  Belum ada data PO
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr key={order.id}>
                  <td className="border p-3">{index + 1}</td>
                  <td className="border p-3">{order.order_number}</td>
                  <td className="border p-3">{order.customer_name}</td>
                  <td className="border p-3">{order.material_type}</td>
                  <td className="border p-3">{order.print_type}</td>
                  <td className="border p-3">{order.quantity}</td>
                  <td className="border p-3">
                    <span className="rounded bg-yellow-100 px-2 py-1 text-xs">
                      {order.status}
                    </span>
                  </td>
                  <td className="border p-3">
                    <Link
                      href={`/purchase-orders/${order.id}`}
                      className="text-blue-600 underline"
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