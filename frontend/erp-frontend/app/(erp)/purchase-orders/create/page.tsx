"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductionOrder } from "@/services/production";

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    order_date: "",
    order_number: "",
    po_date: "",
    material_po_number: "",
    delivery_date: "",
    customer_name: "",
    size: "",
    material_type: "",
    print_type: "",
    specification: "",
    unit: "",
    quantity: "",
    rim: "",
    price: "",
    partial_billing_quantity: "",
    total_quantity: "",
    status: "PO_MASUK",
    note: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createProductionOrder({
        order_date: form.order_date || null,
        order_number: form.order_number,
        po_date: form.po_date || null,
        material_po_number: form.material_po_number || null,
        delivery_date: form.delivery_date || null,

        customer_id: null,
        customer_name: form.customer_name || null,

        size: form.size || null,
        material_type: form.material_type || null,
        print_type: form.print_type || null,
        specification: form.specification || null,

        unit: form.unit || null,
        quantity: form.quantity ? Number(form.quantity) : 0,
        rim: form.rim ? Number(form.rim) : 0,
        price: form.price ? Number(form.price) : 0,
        partial_billing_quantity: form.partial_billing_quantity
          ? Number(form.partial_billing_quantity)
          : 0,
        total_quantity: form.total_quantity ? Number(form.total_quantity) : 0,

        status: form.status,
        note: form.note || null,
      });

      alert("Data BKOrder berhasil dibuat");
      router.push("/purchase-orders");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal membuat BKOrder");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah BKOrder / PO Masuk</h1>
        <p className="text-sm text-gray-500">
          Form input mengikuti kolom BKOrder dari file Excel client.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="mb-4 text-lg font-semibold">Data Order</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="TGL"
              name="order_date"
              type="date"
              value={form.order_date}
              onChange={handleChange}
            />

            <Input
              label="NO.ORD"
              name="order_number"
              value={form.order_number}
              onChange={handleChange}
              required
            />

            <Input
              label="PO Date"
              name="po_date"
              type="date"
              value={form.po_date}
              onChange={handleChange}
            />

            <Input
              label="PO Bahan"
              name="material_po_number"
              value={form.material_po_number}
              onChange={handleChange}
            />

            <Input
              label="Deliv. Date"
              name="delivery_date"
              type="date"
              value={form.delivery_date}
              onChange={handleChange}
            />

            <Input
              label="PR"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Spesifikasi Produksi</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="UKURAN"
              name="size"
              value={form.size}
              onChange={handleChange}
            />

            <Input
              label="JENIS BAHAN"
              name="material_type"
              value={form.material_type}
              onChange={handleChange}
            />

            <Input
              label="JENIS CETAK"
              name="print_type"
              value={form.print_type}
              onChange={handleChange}
            />

            <Input
              label="SAT"
              name="unit"
              value={form.unit}
              onChange={handleChange}
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="SPESIFIKASI"
              name="specification"
              value={form.specification}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Jumlah dan Harga</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <Input
              label="JUMLAH"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
            />

            <Input
              label="Rim"
              name="rim"
              type="number"
              value={form.rim}
              onChange={handleChange}
            />

            <Input
              label="HARGA"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
            />

            <Input
              label="TAGIHAN PARSIAL"
              name="partial_billing_quantity"
              type="number"
              value={form.partial_billing_quantity}
              onChange={handleChange}
            />

            <Input
              label="TOTAL"
              name="total_quantity"
              type="number"
              value={form.total_quantity}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Status</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="STATUS"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                { label: "PO_MASUK", value: "PO_MASUK" },
                { label: "BAHAN_DATANG", value: "BAHAN_DATANG" },
                { label: "POTONG_CETAK", value: "POTONG_CETAK" },
                { label: "FINISHING", value: "FINISHING" },
                { label: "DIKIRIM", value: "DIKIRIM" },
                { label: "INVOICE_TERBIT", value: "INVOICE_TERBIT" },
                { label: "SELESAI", value: "SELESAI" },
                { label: "CANCELLED", value: "CANCELLED" },
              ]}
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Catatan"
              name="note"
              value={form.note}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan BKOrder"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/purchase-orders")}
            className="rounded-lg border px-5 py-2 hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

type InputProps = {
  label: string;
  name: string;
  value: string;
  type?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Input({
  label,
  name,
  value,
  type = "text",
  required = false,
  onChange,
}: InputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        required={required}
        onChange={onChange}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
    </div>
  );
}

type SelectProps = {
  label: string;
  name: string;
  value: string;
  options: {
    label: string;
    value: string;
  }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

function Select({ label, name, value, options, onChange }: SelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type TextareaProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

function Textarea({ label, name, value, onChange }: TextareaProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
    </div>
  );
}