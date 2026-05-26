"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";

import { deleteMaterialType, getMaterialTypes } from "@/services/material";
import { MaterialType } from "@/types/material";

export default function MaterialTypesPage() {
  const [items, setItems] = useState<MaterialType[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadData() {
    setLoading(true);

    try {
      const data = await getMaterialTypes();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const q = keyword.toLowerCase().trim();

    if (!q) return items;

    return items.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [items, keyword]);

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Hapus jenis bahan ini?");

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await deleteMaterialType(id);
      await loadData();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Master Jenis Bahan
          </h1>
          <p className="text-sm text-gray-500">
            Data bahan untuk perhitungan otomatis Rim ↔ Keping di BKOrder.
          </p>
        </div>

        <Link
          href="/materials/create"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Tambah Jenis Bahan
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Bahan</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {items.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Aktif</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {items.filter((item) => item.is_active).length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Nonaktif</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {items.filter((item) => !item.is_active).length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Digunakan di</p>
          <p className="mt-2 text-lg font-bold text-gray-900">BKOrder</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Daftar Jenis Bahan</h2>
            <p className="text-sm text-gray-500">
              Ukuran bahan menggunakan satuan centimeter.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari jenis bahan..."
              className="w-full rounded-lg border px-9 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-900 text-left text-white">
                <th className="border px-3 py-3">NO</th>
                <th className="border px-3 py-3">NAMA BAHAN</th>
                <th className="border px-3 py-3">LEBAR CM</th>
                <th className="border px-3 py-3">PANJANG CM</th>
                <th className="border px-3 py-3">STATUS</th>
                <th className="border px-3 py-3 text-center">AKSI</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="border px-3 py-6 text-center text-gray-500"
                  >
                    Memuat data jenis bahan...
                  </td>
                </tr>
              )}

              {!loading && filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="border px-3 py-6 text-center text-gray-500"
                  >
                    Data jenis bahan tidak ditemukan.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{index + 1}</td>
                    <td className="border px-3 py-2 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="border px-3 py-2">
                      {Number(item.width_cm).toLocaleString("id-ID")}
                    </td>
                    <td className="border px-3 py-2">
                      {Number(item.length_cm).toLocaleString("id-ID")}
                    </td>
                    <td className="border px-3 py-2">
                      {item.is_active ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/materials/${item.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium hover:bg-gray-50"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Link>

                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          <Trash2 className="h-3 w-3" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}