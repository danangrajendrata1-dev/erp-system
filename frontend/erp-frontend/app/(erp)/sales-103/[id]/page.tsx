"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSales103ById, updateSales103 } from "@/services/sales103";
import { Sales103Update } from "@/types/sales103";

function formatNumber(value: number | null) {
  if (value === null || Number.isNaN(value)) return "";

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function EditSales103Page() {
  const router = useRouter();
  const params = useParams();

  const sales103Id = Number(params.id);

  const [form, setForm] = useState<Sales103Update>({
    tgl: "",
    no_ord: "",
    no_invoice: "",
    no_faktur: "",
    langganan: "",
    jenis_cetak: "",
    jml: null,
    sat: "",
    harga: null,
    dpp: null,
    ppn_rate: 11,
    ppn_adjustment: 0,
    ppn_keluar: null,
    piutang_dagang: null,
    production_order_id: null,
    keterangan: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const preview = useMemo(() => {
    const jml = Number(form.jml || 0);
    const harga = Number(form.harga || 0);
    const ppnRate = Number(form.ppn_rate ?? 11);
    const ppnAdjustment = Number(form.ppn_adjustment || 0);

    const dpp = jml * harga;
    const ppnKeluar = form.ppn_keluar ?? (dpp * ppnRate) / 100 - ppnAdjustment;
    const piutangDagang = form.piutang_dagang ?? dpp + ppnKeluar;

    return {
      dpp,
      ppn_keluar: ppnKeluar,
      piutang_dagang: piutangDagang,
    };
  }, [
    form.jml,
    form.harga,
    form.ppn_rate,
    form.ppn_adjustment,
    form.ppn_keluar,
    form.piutang_dagang,
  ]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    const numberFields = [
      "jml",
      "harga",
      "ppn_rate",
      "ppn_adjustment",
      "ppn_keluar",
      "piutang_dagang",
    ];

    if (numberFields.includes(name)) {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function loadData() {
    try {
      setLoadingData(true);

      const data = await getSales103ById(sales103Id);

      setForm({
        tgl: data.tgl || "",
        no_ord: data.no_ord || "",
        no_invoice: data.no_invoice || "",
        no_faktur: data.no_faktur || "",
        langganan: data.langganan || "",
        jenis_cetak: data.jenis_cetak || "",
        jml: data.jml === null ? null : Number(data.jml),
        sat: data.sat || "",
        harga: data.harga === null ? null : Number(data.harga),
        dpp: data.dpp === null ? null : Number(data.dpp),
        ppn_rate: data.ppn_rate === null ? 11 : Number(data.ppn_rate),
        ppn_adjustment:
          data.ppn_adjustment === null ? 0 : Number(data.ppn_adjustment),
        ppn_keluar:
          data.ppn_keluar === null ? null : Number(data.ppn_keluar),
        piutang_dagang:
          data.piutang_dagang === null
            ? null
            : Number(data.piutang_dagang),
        production_order_id: data.production_order_id,
        keterangan: data.keterangan || "",
      });
    } catch (error) {
      console.error("Gagal mengambil data 103:", error);
      alert("Gagal mengambil data 103");
    } finally {
      setLoadingData(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      await updateSales103(sales103Id, {
        ...form,
        tgl: form.tgl || null,
        no_ord: form.no_ord || null,
        no_invoice: form.no_invoice || null,
        no_faktur: form.no_faktur || null,
        langganan: form.langganan || null,
        jenis_cetak: form.jenis_cetak || null,
        sat: form.sat || null,
        keterangan: form.keterangan || null,

        dpp: null,
        ppn_keluar: form.ppn_keluar ?? null,
        piutang_dagang: form.piutang_dagang ?? null,
      });

      router.push("/sales-103");
      router.refresh();
    } catch (error) {
      console.error("Gagal mengupdate data 103:", error);
      alert("Gagal mengupdate data 103");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(sales103Id)) {
      loadData();
    }
  }, [sales103Id]);

  if (loadingData) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading data 103...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Data 103</h1>
        <p className="text-sm text-gray-500">
          Form mengikuti sheet Excel 103
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border bg-white p-6 space-y-5"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">TGL</label>
            <input
              type="date"
              name="tgl"
              value={form.tgl || ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">NO.ORD</label>
            <input
              type="text"
              name="no_ord"
              value={form.no_ord || ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              NO. INVOICE
            </label>
            <input
              type="text"
              name="no_invoice"
              value={form.no_invoice || ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              NO. FAKTUR
            </label>
            <input
              type="text"
              name="no_faktur"
              value={form.no_faktur || ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">LANGGANAN</label>
            <input
              type="text"
              name="langganan"
              value={form.langganan || ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              JENIS CETAK
            </label>
            <input
              type="text"
              name="jenis_cetak"
              value={form.jenis_cetak || ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">JML</label>
            <input
              type="number"
              step="0.01"
              name="jml"
              value={form.jml ?? ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">SAT</label>
            <input
              type="text"
              name="sat"
              value={form.sat || ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">HARGA</label>
            <input
              type="number"
              step="0.01"
              name="harga"
              value={form.harga ?? ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded border bg-gray-50 p-4">
          <h2 className="mb-3 text-sm font-semibold">PPN Fleksibel</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                PPN RATE (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="ppn_rate"
                value={form.ppn_rate ?? ""}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 text-sm text-right"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                PENGURANGAN PPN
              </label>
              <input
                type="number"
                step="0.01"
                name="ppn_adjustment"
                value={form.ppn_adjustment ?? ""}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 text-sm text-right"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                PPN KELUAR MANUAL
              </label>
              <input
                type="number"
                step="0.01"
                name="ppn_keluar"
                value={form.ppn_keluar ?? ""}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 text-sm text-right"
                placeholder="Kosongkan jika otomatis"
              />
            </div>
          </div>
        </div>

        <div className="rounded border bg-gray-50 p-4">
          <h2 className="mb-3 text-sm font-semibold">Preview Perhitungan</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">DPP</label>
              <input
                value={formatNumber(preview.dpp)}
                disabled
                className="w-full rounded border bg-white px-3 py-2 text-sm text-right"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                PPN KELUAR
              </label>
              <input
                value={formatNumber(preview.ppn_keluar)}
                disabled
                className="w-full rounded border bg-white px-3 py-2 text-sm text-right"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                PIUTANG DAGANG
              </label>
              <input
                value={formatNumber(preview.piutang_dagang)}
                disabled
                className="w-full rounded border bg-white px-3 py-2 text-sm text-right"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">KETERANGAN</label>
          <textarea
            name="keterangan"
            value={form.keterangan || ""}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Update"}
          </button>

          <Link
            href="/sales-103"
            className="rounded border px-4 py-2 text-sm font-semibold hover:bg-gray-100"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}