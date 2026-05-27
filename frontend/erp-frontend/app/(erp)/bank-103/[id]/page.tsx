"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import {
  deleteBank103,
  getBank103ById,
  updateBank103,
} from "@/services/bank103";
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

function toInputDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toInputNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const raw = String(value).trim().replace(/\s/g, "");

  if (!raw) return 0;

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  if (hasComma && hasDot) {
    const normalized = raw.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (hasComma && !hasDot) {
    const normalized = raw.replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function EditBank103Page() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUsed, setIsUsed] = useState(false);

  const previewSaldo = useMemo(() => {
    return toNumber(form.saldo);
  }, [form.saldo]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getBank103ById(id);

          setForm({
          tgl: data.tgl || "",
          kode: data.kode || "",
          keterangan: data.keterangan || "",
          debet: String(toInputNumber(data.debet)),
         kredit: String(toInputNumber(data.kredit)),
         saldo: String(toInputNumber(data.saldo)),
          });

        setIsUsed(Boolean(data.is_used));
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data Bank 103.");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadData();
  }, [id]);

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
      await updateBank103(id, payload);
      router.push("/bank-103");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan perubahan Bank 103.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const ok = confirm("Yakin ingin menghapus transaksi Bank 103 ini?");
    if (!ok) return;

    try {
      await deleteBank103(id);
      router.push("/bank-103");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data Bank 103.");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
          Memuat data Bank 103...
        </div>
      </div>
    );
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
            <h1 className="text-2xl font-bold">Edit Bank 103</h1>
            <p className="text-sm text-slate-300">
              Ubah transaksi buku bank sesuai Excel.
            </p>
          </div>
        </div>
      </div>

      {isUsed && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Transaksi ini sudah dipakai ke BKPt. Sebaiknya jangan mengubah nominal
          jika sudah menjadi pembayaran piutang.
        </div>
      )}

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
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              KETERANGAN
            </label>
            <textarea
              value={form.keterangan}
              onChange={(e) => updateField("keterangan", e.target.value)}
              rows={4}
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
              className="w-full rounded-xl border px-4 py-2 text-right outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              KREDIT
            </label>
            <input
              type="number"
              value={form.kredit}
              onChange={(e) => updateField("kredit", e.target.value)}
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

        <div className="mt-8 flex flex-col justify-between gap-3 md:flex-row">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </button>

          <div className="flex justify-end gap-3">
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
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}