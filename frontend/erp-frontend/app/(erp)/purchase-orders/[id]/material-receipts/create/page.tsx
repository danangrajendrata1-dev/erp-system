"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createMaterialReceipt } from "@/services/materialReceipt";

export default function CreateMaterialReceiptPage() {
  const params = useParams();
  const router = useRouter();

  const productionOrderId = Number(params.id);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    receipt_date: "",
    material_name: "",
    supplier_name: "",
    quantity: "",
    unit: "",
    note: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      await createMaterialReceipt({
        production_order_id: productionOrderId,
        material_id: null,
        supplier_id: null,
        receipt_date: form.receipt_date || null,
        material_name: form.material_name,
        supplier_name: form.supplier_name,
        quantity: form.quantity ? Number(form.quantity) : 0,
        unit: form.unit,
        note: form.note,
      });

      alert("Data bahan datang berhasil disimpan");
      router.push(`/purchase-orders/${productionOrderId}`);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan bahan datang"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Input Bahan Datang</h1>
        <p className="text-sm text-gray-500">
          Catat bahan yang datang untuk PO ini.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Tanggal Datang"
            name="receipt_date"
            type="date"
            value={form.receipt_date}
            onChange={handleChange}
          />

          <Input
            label="Nama Bahan"
            name="material_name"
            value={form.material_name}
            onChange={handleChange}
          />

          <Input
            label="Supplier"
            name="supplier_name"
            value={form.supplier_name}
            onChange={handleChange}
          />

          <Input
            label="Jumlah"
            name="quantity"
            type="number"
            value={form.quantity}
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
            {loading ? "Menyimpan..." : "Simpan Bahan Datang"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/purchase-orders/${productionOrderId}`)}
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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Input({
  label,
  name,
  value,
  type = "text",
  onChange,
}: InputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
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