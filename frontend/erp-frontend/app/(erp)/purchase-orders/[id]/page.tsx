"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductionOrderTimeline } from "@/services/production";

type TimelineData = {
  order: any;
  material_receipts: any[];
  processes: any[];
  shipments: any[];
  invoices: any[];
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadTimeline() {
    try {
      const result = await getProductionOrderTimeline(id);
      setData(result);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal memuat detail PO");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadTimeline();
    }
  }, [id]);

  if (loading) {
    return <div className="p-6">Memuat detail PO...</div>;
  }

  if (!data || !data.order) {
    return <div className="p-6">Data PO tidak ditemukan.</div>;
  }

  const order = data.order;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Detail PO</h1>
          <p className="text-sm text-gray-500">
            Timeline order produksi dari PO masuk sampai invoice.
          </p>
        </div>

        <Link
          href="/purchase-orders"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Kembali
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Informasi PO</h2>
          <span className="rounded bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <Info label="No. Order" value={order.order_number} />
          <Info label="Tanggal Order" value={order.order_date} />
          <Info label="PO Date" value={order.po_date} />
          <Info label="PO Bahan" value={order.material_po_number} />
          <Info label="Delivery Date" value={order.delivery_date} />
          <Info label="Customer / PR" value={order.customer_name} />
          <Info label="Ukuran" value={order.size} />
          <Info label="Jenis Bahan" value={order.material_type} />
          <Info label="Jenis Cetak" value={order.print_type} />
          <Info label="Satuan" value={order.unit} />
          <Info label="Jumlah" value={order.quantity} />
          <Info label="Rim" value={order.rim} />
          <Info label="Harga" value={order.price} />
          <Info label="Total Qty" value={order.total_quantity} />
          <Info label="Tagihan Parsial" value={order.partial_billing_quantity} />
        </div>

        <div className="mt-4">
          <Info label="Spesifikasi" value={order.specification} />
        </div>

        <div className="mt-4">
          <Info label="Catatan" value={order.note} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionButton label="+ Bahan Datang" href={`/purchase-orders/${id}/material-receipts/create`} />
        <ActionButton label="+ Proses Produksi" href={`/purchase-orders/${id}/processes/create`} />
        <ActionButton label="+ Kirim" href={`/purchase-orders/${id}/shipments/create`} />
        <ActionButton label="+ Terbitkan Invoice" href={`/purchase-orders/${id}/invoices/create`} />
      </div>

      <Section title="Bahan Datang">
        <SimpleTable
          emptyText="Belum ada data bahan datang."
          headers={["Tanggal", "Bahan", "Supplier", "Qty", "Satuan", "Catatan"]}
          rows={data.material_receipts.map((item) => [
            item.receipt_date,
            item.material_name,
            item.supplier_name,
            item.quantity,
            item.unit,
            item.note,
          ])}
        />
      </Section>

      <Section title="Proses Produksi">
        <SimpleTable
          emptyText="Belum ada data proses produksi."
          headers={["Proses", "Mulai", "Selesai", "Operator", "Mesin", "Input", "Output", "Reject"]}
          rows={data.processes.map((item) => [
            item.process_type,
            item.start_date,
            item.finish_date,
            item.operator_name,
            item.machine_name,
            item.input_quantity,
            item.output_quantity,
            item.reject_quantity,
          ])}
        />
      </Section>

      <Section title="Pengiriman">
        <SimpleTable
          emptyText="Belum ada data pengiriman."
          headers={["No. Surat Jalan", "Tanggal", "Customer", "Driver", "Ekspedisi", "Qty", "Satuan"]}
          rows={data.shipments.map((item) => [
            item.delivery_note_number,
            item.shipment_date,
            item.customer_name,
            item.driver_name,
            item.expedition_name,
            item.shipped_quantity,
            item.unit,
          ])}
        />
      </Section>

      <Section title="Invoice">
        <SimpleTable
          emptyText="Belum ada invoice."
          headers={["No. Invoice", "Tanggal", "Customer", "Subtotal", "PPN", "Grand Total", "Status"]}
          rows={data.invoices.map((item) => [
            item.invoice_number,
            item.invoice_date,
            item.customer_name,
            item.subtotal,
            item.ppn_amount,
            item.grand_total,
            item.payment_status,
          ])}
        />
      </Section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value ?? "-"}</p>
    </div>
  );
}

function ActionButton({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-white p-4 text-center text-sm font-medium shadow-sm hover:bg-gray-50"
    >
      {label}
    </Link>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
  emptyText,
}: {
  headers: string[];
  rows: any[][];
  emptyText: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            {headers.map((header) => (
              <th key={header} className="border p-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border p-3">
                  {cell ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}