"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getMaterialTypes, updateMaterialType } from "@/services/material";
import { MaterialTypePayload } from "@/types/material";

export default function EditMaterialTypePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<MaterialTypePayload>({
    name: "",
    width_cm: 0,
    length_cm: 0,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        const items = await getMaterialTypes();
        const found = items.find((item) => String(item.id) === params.id);

        if (!found) {
          alert("Jenis bahan tidak ditemukan.");
          router.push("/materials");
          return;
        }

        setForm({
          name: found.name,
          width_cm: Number(found.width_cm),
          length_cm: Number(found.length_cm),
          is_active: found.is_active,
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id, router]);

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
      await updateMaterialType(Number(params.id), {
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

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Memuat data jenis bahan...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Jenis Bahan
        </h1>
        <p className="text-sm text-gray-500">
          Perubahan ini akan mempengaruhi pencarian bahan di BKOrder.
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

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Jika bahan sudah pernah dipakai di BKOrder lama, data lama tetap
          menyimpan nama bahan sebagai teks. Perubahan master ini dipakai untuk
          pencarian dan hitungan order berikutnya.
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
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}