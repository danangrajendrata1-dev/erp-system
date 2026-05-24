"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSales103, getSales103ById } from "@/services/sales103";
import { Sales103Create } from "@/types/sales103";

function formatNumber(value: number | null) {
  if (value === null || Number.isNaN(value)) return "";

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function CreateSales103Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copyFrom = searchParams.get("copyFrom");

  const [form, setForm] = useState<Sales103Create>({
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
  const [loadingCopy, setLoadingCopy] = useState(false);

  const preview = useMemo(() => {
    const jml = Number(form.jml || 0);
    const harga = Number(form.harga || 0);
    const ppnRate = Number(form.ppn_rate ?? 11);
    const ppnAdjustment = Number(form.ppn_adjustment || 0);

    const dpp = jml * harga;
    const ppnKeluar =
      form.ppn_keluar ?? (dpp * ppnRate) / 100 - ppnAdjustment;
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

  async function loadCopiedInvoice() {
    if (!copyFrom) return;

    try {
      setLoadingCopy(true);

      const copiedData = await getSales103ById(Number(copyFrom));

      setForm((prev) => ({
        ...prev,

        tgl: copiedData.tgl || "",
        no_ord: copiedData.no_ord || "",
        no_invoice: copiedData.no_invoice || "",
        no_faktur: copiedData.no_faktur || "",
        langganan: copiedData.langganan || "",

        jenis_cetak: "",
        jml: null,
        sat: copiedData.sat || "",
        harga: copiedData.harga === null ? null : Number(copiedData.harga),

        ppn_rate:
          copiedData.ppn_rate === null ? 11 : Number(copiedData.ppn_rate),
        ppn_adjustment: 0,
        ppn_keluar: null,

        dpp: null,
        piutang_dagang: null,
        keterangan: "",
      }));
    } catch (error) {
      console.error("Gagal menyalin data invoice:", error);
      alert("Gagal menyalin data invoice");
    } finally {
      setLoadingCopy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      await createSales103({
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
      console.error("Gagal menyimpan data 103:", error);
      alert("Gagal menyimpan data 103");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCopiedInvoice();
  }, [copyFrom]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {copyFrom ? "Tambah Baris Invoice 103" : "Tambah Data 103"}
        </h1>
        <p className="text-sm text-gray-500">
          {copyFrom
            ? "Membuat baris lanjutan untuk invoice yang sama"
            : "Form mengikuti sheet Excel 103"}
        </p>
      </div>

      {loadingCopy && (
        <div className="rounded border bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          Menyalin data invoice...
        </div>
      )}

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
              placeholder="Contoh: 01/XII/2022"
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
              placeholder="Contoh: LBR.0001"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">NO. FAKTUR</label>
            <input
              type="text"
              name="no_faktur"
              value={form.no_faktur || ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Contoh: 010.003-23.35009166"
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
              placeholder="Contoh: PT. Gelora Djaja"
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
              placeholder="Contoh: Ambri"
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
              className="w-full rounded border px-3 py-2 text-sm text-right"
              placeholder="Contoh: 381.54"
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
              placeholder="Contoh: Rim"
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
              className="w-full rounded border px-3 py-2 text-sm text-right"
              placeholder="Contoh: 22100"
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
                placeholder="Default 11"
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
                placeholder="Contoh: 100000"
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

          <p className="mt-3 text-sm text-gray-600">
            Jika PPN KELUAR MANUAL dikosongkan, sistem menghitung:
            PPN KELUAR = DPP × PPN RATE - PENGURANGAN PPN.
          </p>
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
            disabled={loading || loadingCopy}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan"}
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

export default function CreateSales103Page() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-gray-500">
          Loading halaman tambah data 103...
        </div>
      }
    >
      <CreateSales103Content />
    </Suspense>
  );
}