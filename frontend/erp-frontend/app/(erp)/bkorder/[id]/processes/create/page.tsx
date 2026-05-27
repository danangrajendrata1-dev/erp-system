"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createProductionProcess } from "@/services/productionProcess";

export default function CreatePotongCetakPage() {
  const params = useParams();
  const router = useRouter();

  const bkorderId = Number(params.id);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    process_type: "POTONG",
    start_date: "",
    finish_date: "",
    operator_name: "",
    machine_name: "",
    input_quantity: "",
    output_quantity: "",
    reject_quantity: "",
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
      await createProductionProcess({
        production_order_id: bkorderId,
        process_type: form.process_type as "POTONG" | "CETAK",
        start_date: form.start_date || null,
        finish_date: form.finish_date || null,
        operator_name: form.operator_name || null,
        machine_name: form.machine_name || null,
        input_quantity: form.input_quantity ? Number(form.input_quantity) : 0,
        output_quantity: form.output_quantity ? Number(form.output_quantity) : 0,
        reject_quantity: form.reject_quantity ? Number(form.reject_quantity) : 0,
        note: form.note || null,
      });

      alert("Data Potong & Cetak berhasil disimpan");
      router.push(`/bkorder/${bkorderId}`);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data Potong & Cetak"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Input Potong & Cetak</h1>
        <p className="text-sm text-gray-500">
          Catat proses potong dan cetak untuk BKOrder ini.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="mb-4 text-lg font-semibold">Data Proses</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select
              label="Proses"
              name="process_type"
              value={form.process_type}
              onChange={handleChange}
              options={[
                { label: "POTONG", value: "POTONG" },
                { label: "CETAK", value: "CETAK" },
              ]}
            />

            <Input
              label="Tanggal Mulai"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
            />

            <Input
              label="Tanggal Selesai"
              name="finish_date"
              type="date"
              value={form.finish_date}
              onChange={handleChange}
            />

            <Input
              label="Operator"
              name="operator_name"
              value={form.operator_name}
              onChange={handleChange}
            />

            <Input
              label="Mesin"
              name="machine_name"
              value={form.machine_name}
              onChange={handleChange}
            />

            <Input
              label="Input"
              name="input_quantity"
              type="number"
              value={form.input_quantity}
              onChange={handleChange}
            />

            <Input
              label="Output"
              name="output_quantity"
              type="number"
              value={form.output_quantity}
              onChange={handleChange}
            />

            <Input
              label="Reject"
              name="reject_quantity"
              type="number"
              value={form.reject_quantity}
              onChange={handleChange}
            />
          </div>
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
            {loading ? "Menyimpan..." : "Simpan Potong & Cetak"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/bkorder/${bkorderId}`)}
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
