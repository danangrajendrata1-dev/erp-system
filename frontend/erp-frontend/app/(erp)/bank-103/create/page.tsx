"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { createBank103 } from "@/services/bank103";
import { Bank103Payload } from "@/types/bank103";

type FormState = {
  tgl: string;
  kode: string;
  keterangan: string;
  debet: string;
  kredit: string;
  saldo: string;
};

const initialForm: FormState = {
  tgl: "",
  kode: "",
  keterangan: "",
  debet: "",
  kredit: "",
  saldo: "",
};

function toNumber(value: string) {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function CreateBank103Page() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);

  const previewSaldo = useMemo(() => {
    return toNumber(form.saldo);
  }, [form.saldo]);

  function updateField(name: keyof FormState, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload: Bank103Payload = {
      tgl: form.tgl || null,
      kode: form.kode || null,
      keterangan: form.keterangan || null,
      debet: toNumber(form.debet),
      kredit: toNumber(form.kredit),
      saldo: toNumber(form.saldo),
    };

    try {
      setSaving(true);
      await createBank103(payload);
      router.push("/bank-103");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data Bank 103.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/bank-103"
            className="rounded-xl bg-white/10 p-2 hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold">Tambah Bank 103</h1>
            <p className="text-sm text-slate-300">
              Input manual transaksi buku bank sesuai Excel.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              TGL
            </label>
            <input
              type="date"
              value={form.tgl}
              onChange={(e) => updateField("tgl", e.target.value)}
              className="w-full rounded-xl border px-4 py-2 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              KODE
            </label>
            <select
              value={form.kode}
              onChange={(e) => updateField("kode", e.target.value)}
              className="w-full rounded-xl border px-4 py-2 outline-none focus:border-slate-900"
            >
              <option value="">Pilih Kode</option>
              <option value="BkPt">BkPt - Pembayaran Piutang</option>
              <option value="BkUt">BkUt - Pembayaran Hutang</option>
              <option value="BB">BB - Biaya Bank</option>
              <option value="Pen.Bng">Pen.Bng - Pendapatan Bunga</option>
              <option value="Kas">Kas</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Untuk pembayaran pelanggan yang nanti diambil BKPt, gunakan kode BkPt.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              KETERANGAN
            </label>
            <textarea
              value={form.keterangan}
              onChange={(e) => updateField("keterangan", e.target.value)}
              rows={4}
              placeholder="Contoh: Pembayaran invoice dari PT ..."
              className="w-full rounded-xl border px-4 py-2 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              DEBET
            </label>
            <input
              type="number"
              value={form.debet}
              onChange={(e) => updateField("debet", e.target.value)}
              placeholder="Kosongkan jika tidak ada"
              className="w-full rounded-xl border px-4 py-2 text-right outline-none focus:border-slate-900"
            />
            <p className="mt-1 text-xs text-slate-500">
              Untuk pembayaran piutang pelanggan, nominal masuk di DEBET.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              KREDIT
            </label>
            <input
              type="number"
              value={form.kredit}
              onChange={(e) => updateField("kredit", e.target.value)}
              placeholder="Kosongkan jika tidak ada"
              className="w-full rounded-xl border px-4 py-2 text-right outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              SALDO
            </label>
            <input
              type="number"
              value={form.saldo}
              onChange={(e) => updateField("saldo", e.target.value)}
              placeholder="Saldo akhir sesuai buku bank"
              className="w-full rounded-xl border px-4 py-2 text-right outline-none focus:border-slate-900"
            />
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Preview Saldo</p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(previewSaldo)}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link
            href="/bank-103"
            className="rounded-xl border px-5 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}