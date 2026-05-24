"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductionOrder } from "@/services/production";

export default function CreateProductionOrderPage() {
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
    total_quantity: "",
    partial_billing_quantity: "",
    status: "PO_MASUK",
    note: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        ...form,
        customer_id: null,
        quantity: form.quantity ? Number(form.quantity) : 0,
        rim: form.rim ? Number(form.rim) : 0,
        price: form.price ? Number(form.price) : 0,
        total_quantity: form.total_quantity ? Number(form.total_quantity) : 0,
        partial_billing_quantity: form.partial_billing_quantity
          ? Number(form.partial_billing_quantity)
          : 0,
      });

      alert("PO berhasil dibuat");
      router.push("/production-orders");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal membuat PO");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah PO Masuk</h1>
        <p className="text-sm text-gray-500">
          Form input order produksi sesuai data BKOrder.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Tanggal Order"
            name="order_date"
            type="date"
            value={form.order_date}
            onChange={handleChange}
          />

          <Input
            label="No. Order"
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
            label="Delivery Date"
            name="delivery_date"
            type="date"
            value={form.delivery_date}
            onChange={handleChange}
          />

          <Input
            label="Customer / PR"
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Ukuran"
            name="size"
            value={form.size}
            onChange={handleChange}
          />

          <Input
            label="Jenis Bahan"
            name="material_type"
            value={form.material_type}
            onChange={handleChange}
          />

          <Input
            label="Jenis Cetak"
            name="print_type"
            value={form.print_type}
            onChange={handleChange}
          />

          <Input
            label="Satuan"
            name="unit"
            value={form.unit}
            onChange={handleChange}
          />
        </div>

        <Textarea
          label="Spesifikasi"
          name="specification"
          value={form.specification}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <Input
            label="Jumlah"
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
            label="Harga"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
          />

          <Input
            label="Total"
            name="total_quantity"
            type="number"
            value={form.total_quantity}
            onChange={handleChange}
          />

          <Input
            label="Tagihan Parsial"
            name="partial_billing_quantity"
            type="number"
            value={form.partial_billing_quantity}
            onChange={handleChange}
          />
        </div>

        <Textarea
          label="Catatan"
          name="note"
          value={form.note}
          onChange={handleChange}
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan PO"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/production-orders")}
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