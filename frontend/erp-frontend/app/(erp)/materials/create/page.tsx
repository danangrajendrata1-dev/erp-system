"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createMaterialType } from "@/services/material";
import { MaterialTypePayload } from "@/types/material";

export default function CreateMaterialTypePage() {
  const router = useRouter();

  const [form, setForm] = useState<MaterialTypePayload>({
    name: "",
    width_cm: 0,
    length_cm: 0,
    is_active: true,
  });

  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof MaterialTypePayload>(
    key: K,
    value: MaterialTypePayload[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Nama bahan wajib diisi.");
      return;
    }

    if (!form.width_cm || !form.length_cm) {
      alert("Lebar dan panjang bahan wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      await createMaterialType({
        ...form,
        name: form.name.trim(),
        width_cm: Number(form.width_cm),
        length_cm: Number(form.length_cm),
      });

      router.push("/materials");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tambah Jenis Bahan
        </h1>
        <p className="text-sm text-gray-500">
          Data ini akan muncul di search JENIS BAHAN pada BKOrder.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-5 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Nama Bahan
          </label>
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Contoh: BMJ Repse 81"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Lebar Bahan CM
            </label>
            <input
              type="number"
              step="0.01"
              value={form.width_cm === 0 ? "" : form.width_cm}
              onChange={(e) =>
                updateField(
                  "width_cm",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              placeholder="Contoh: 51"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Panjang Bahan CM
            </label>
            <input
              type="number"
              step="0.01"
              value={form.length_cm === 0 ? "" : form.length_cm}
              onChange={(e) =>
                updateField(
                  "length_cm",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              placeholder="Contoh: 76"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active ?? true}
            onChange={(e) => updateField("is_active", e.target.checked)}
          />
          Aktif dan tampil di pencarian BKOrder
        </label>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Ukuran bahan diisi dalam centimeter. Contoh bahan 51 x 76 cm akan
          dihitung otomatis menjadi 510 x 760 mm di BKOrder.
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/materials")}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Jenis Bahan"}
          </button>
        </div>
      </form>
    </div>
  );
}