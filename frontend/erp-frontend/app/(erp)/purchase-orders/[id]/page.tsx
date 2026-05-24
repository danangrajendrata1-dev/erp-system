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
      alert(error instanceof Error ? error.message : "Gagal memuat detail BKOrder");
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
    return <div className="p-6">Memuat detail BKOrder...</div>;
  }

  if (!data || !data.order) {
    return <div className="p-6">Data BKOrder tidak ditemukan.</div>;
  }

  const order = data.order;

  const potongCetak = data.processes.filter(
    (item) => item.process_type === "POTONG" || item.process_type === "CETAK"
  );

  const finishing = data.processes.filter(
    (item) => item.process_type === "FINISHING"
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Detail BKOrder</h1>
          <p className="text-sm text-gray-500">
            Detail order berdasarkan alur kerja client dari PO masuk sampai invoice terbit.
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
          <h2 className="text-lg font-semibold">Data BKOrder</h2>
          <span className="rounded bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <Info label="TGL" value={order.order_date} />
          <Info label="NO.ORD" value={order.order_number} />
          <Info label="PO Date" value={order.po_date} />
          <Info label="PO Bahan" value={order.material_po_number} />
          <Info label="Deliv. Date" value={order.delivery_date} />
          <Info label="PR" value={order.customer_name} />
          <Info label="UKURAN" value={order.size} />
          <Info label="JENIS BAHAN" value={order.material_type} />
          <Info label="JENIS CETAK" value={order.print_type} />
          <Info label="SAT" value={order.unit} />
          <Info label="JUMLAH" value={order.quantity} />
          <Info label="Rim" value={order.rim} />
          <Info label="HARGA" value={order.price} />
          <Info label="TAGIHAN PARSIAL" value={order.partial_billing_quantity} />
          <Info label="TOTAL" value={order.total_quantity} />
        </div>

        <div className="mt-4">
          <Info label="SPESIFIKASI" value={order.specification} />
        </div>

        <div className="mt-4">
          <Info label="Catatan" value={order.note} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <ActionButton
          label="+ Bahan Datang"
          href={`/purchase-orders/${id}/material-receipts/create`}
        />
        <ActionButton
          label="+ Potong & Cetak"
          href={`/purchase-orders/${id}/processes/create`}
        />
        <ActionButton
          label="+ Finishing"
          href={`/purchase-orders/${id}/finishings/create`}
        />
        <ActionButton
          label="+ Kirim"
          href={`/purchase-orders/${id}/shipments/create`}
        />
        <ActionButton
          label="+ Invoice Terbit"
          href={`/purchase-orders/${id}/invoices/create`}
        />
      </div>

      <Section title="1. PO Masuk">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
          <Info label="NO.ORD" value={order.order_number} />
          <Info label="TGL" value={order.order_date} />
          <Info label="PR" value={order.customer_name} />
          <Info label="STATUS" value={order.status} />
        </div>
      </Section>

      <Section title="2. Bahan Datang">
        <SimpleTable
          emptyText="Belum ada data bahan datang."
          headers={["Tanggal Datang", "Nama Bahan", "Supplier", "Jumlah", "SAT", "Catatan"]}
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

      <Section title="3. Potong & Cetak">
        <SimpleTable
          emptyText="Belum ada data potong dan cetak."
          headers={[
            "Proses",
            "Tanggal Mulai",
            "Tanggal Selesai",
            "Operator",
            "Mesin",
            "Input",
            "Output",
            "Reject",
            "Catatan",
          ]}
          rows={potongCetak.map((item) => [
            item.process_type,
            item.start_date,
            item.finish_date,
            item.operator_name,
            item.machine_name,
            item.input_quantity,
            item.output_quantity,
            item.reject_quantity,
            item.note,
          ])}
        />
      </Section>

      <Section title="4. Proses Finishing">
        <SimpleTable
          emptyText="Belum ada data finishing."
          headers={[
            "Proses",
            "Tanggal Mulai",
            "Tanggal Selesai",
            "Operator",
            "Mesin",
            "Input",
            "Output",
            "Reject",
            "Catatan",
          ]}
          rows={finishing.map((item) => [
            item.process_type,
            item.start_date,
            item.finish_date,
            item.operator_name,
            item.machine_name,
            item.input_quantity,
            item.output_quantity,
            item.reject_quantity,
            item.note,
          ])}
        />
      </Section>

      <Section title="5. Kirim">
        <SimpleTable
          emptyText="Belum ada data pengiriman."
          headers={[
            "No. Surat Jalan",
            "Tanggal Kirim",
            "Customer",
            "Alamat",
            "Driver",
            "Ekspedisi",
            "Jumlah Kirim",
            "SAT",
            "Catatan",
          ]}
          rows={data.shipments.map((item) => [
            item.delivery_note_number,
            item.shipment_date,
            item.customer_name,
            item.delivery_address,
            item.driver_name,
            item.expedition_name,
            item.shipped_quantity,
            item.unit,
            item.note,
          ])}
        />
      </Section>

      <Section title="6. Invoice Terbit">
        <SimpleTable
          emptyText="Belum ada invoice."
          headers={[
            "No. Invoice",
            "Tanggal Invoice",
            "Customer",
            "Subtotal",
            "PPN",
            "Grand Total",
            "Status Pembayaran",
            "Catatan",
          ]}
          rows={data.invoices.map((item) => [
            item.invoice_number,
            item.invoice_date,
            item.customer_name,
            item.subtotal,
            item.ppn_amount,
            item.grand_total,
            item.payment_status,
            item.note,
          ])}
        />
      </Section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="font-semibold">{value ?? "-"}</p>
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