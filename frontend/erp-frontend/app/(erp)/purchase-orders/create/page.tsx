"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { createProductionOrder } from "@/services/production";
import { ProductionOrderPayload } from "@/types/production";

const REPEAT_COLUMNS = Array.from({ length: 14 }, (_, index) => index);

const emptyForm: ProductionOrderPayload = {
  order_date: "",
  order_number: "",
  po_date: "",
  do_number: "",
  delivery_date: "",
  customer_name: "",
  size: "",
  material_type: "",
  print_type: "",
  specification: "",
  unit: "Rim",
  quantity: 0,
  rim: 0,
  price: 0,
  delivery_completed_dates: Array(14).fill(null),
  partial_billing_quantities: Array(14).fill(0),
  total_keping: 0,
  status: "OPEN",
  notes: "",
};

function toNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeStringDate(value?: string | null) {
  return value && value.trim() !== "" ? value : null;
}

function normalizeArray<T>(values: T[] | undefined | null, defaultValue: T) {
  const result = [...(values || [])].slice(0, 14);
  while (result.length < 14) result.push(defaultValue);
  return result;
}

function normalizePayload(form: ProductionOrderPayload): ProductionOrderPayload {
  const partials = normalizeArray(form.partial_billing_quantities, 0).map((value) => toNumber(value));
  const totalKeping = toNumber(form.total_keping) || partials.reduce((sum, value) => sum + value, 0);

  return {
    ...form,
    order_date: normalizeStringDate(form.order_date),
    po_date: normalizeStringDate(form.po_date),
    delivery_date: normalizeStringDate(form.delivery_date),
    quantity: toNumber(form.quantity),
    rim: toNumber(form.rim),
    price: toNumber(form.price),
    delivery_completed_dates: normalizeArray(form.delivery_completed_dates, null).map(normalizeStringDate),
    partial_billing_quantities: partials,
    total_keping: totalKeping,
  };
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductionOrderPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  const estimatedValue = useMemo(() => toNumber(form.quantity) * toNumber(form.price), [form.quantity, form.price]);

  const autoTotalKeping = useMemo(
    () => normalizeArray(form.partial_billing_quantities, 0).reduce((sum, value) => sum + toNumber(value), 0),
    [form.partial_billing_quantities]
  );

  function updateField<K extends keyof ProductionOrderPayload>(key: K, value: ProductionOrderPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDateColumn(index: number, value: string) {
    setForm((prev) => {
      const next = normalizeArray(prev.delivery_completed_dates, null);
      next[index] = value || null;
      return { ...prev, delivery_completed_dates: next };
    });
  }

  function updatePartialColumn(index: number, value: number) {
    setForm((prev) => {
      const next = normalizeArray(prev.partial_billing_quantities, 0);
      next[index] = value;
      return { ...prev, partial_billing_quantities: next, total_keping: next.reduce((sum, item) => sum + toNumber(item), 0) };
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await createProductionOrder(normalizePayload(form));
      router.push("/purchase-orders");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tambah BKOrder</h1>
        <p className="text-sm text-gray-500">Form input mengikuti header sheet BKOrder Excel client terbaru.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">TGL</label>
            <input type="date" value={form.order_date || ""} onChange={(e) => updateField("order_date", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">NO.ORD</label>
            <input value={form.order_number || ""} onChange={(e) => updateField("order_number", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">PO Date</label>
            <input type="date" value={form.po_date || ""} onChange={(e) => updateField("po_date", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">DO NUMBER</label>
            <input value={form.do_number || ""} onChange={(e) => updateField("do_number", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Deliv. Date</label>
            <input type="date" value={form.delivery_date || ""} onChange={(e) => updateField("delivery_date", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">PR</label>
            <input value={form.customer_name || ""} onChange={(e) => updateField("customer_name", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">UKURAN</label>
            <input value={form.size || ""} onChange={(e) => updateField("size", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">JENIS BAHAN</label>
            <input value={form.material_type || ""} onChange={(e) => updateField("material_type", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">JENIS CETAK</label>
            <input value={form.print_type || ""} onChange={(e) => updateField("print_type", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium">SPESIFIKASI</label>
            <textarea value={form.specification || ""} onChange={(e) => updateField("specification", e.target.value)} className="min-h-20 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">SAT</label>
            <input value={form.unit || ""} onChange={(e) => updateField("unit", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">JUMLAH</label>
            <input type="number" value={form.quantity || 0} onChange={(e) => updateField("quantity", Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Rim</label>
            <input type="number" step="0.01" value={form.rim || 0} onChange={(e) => updateField("rim", Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">HARGA</label>
            <input type="number" step="0.01" value={form.price || 0} onChange={(e) => updateField("price", Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">TOTAL (Keping)</label>
            <input type="number" step="0.01" value={form.total_keping || 0} onChange={(e) => updateField("total_keping", Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-gray-500">Auto dari Tagihan Parsial: {autoTotalKeping.toLocaleString("id-ID")}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">STATUS</label>
            <select value={form.status || "OPEN"} onChange={(e) => updateField("status", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
              <option value="OPEN">OPEN</option>
              <option value="PROSES">PROSES</option>
              <option value="SELESAI">SELESAI</option>
              <option value="BATAL">BATAL</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border bg-gray-50 p-4">
          <h2 className="font-semibold text-gray-900">TGL KIRIM / SELESAI</h2>
          <div className="grid gap-3 md:grid-cols-7">
            {REPEAT_COLUMNS.map((index) => (
              <div key={index}>
                <label className="mb-1 block text-xs font-medium">Tanggal {index + 1}</label>
                <input type="date" value={form.delivery_completed_dates?.[index] || ""} onChange={(e) => updateDateColumn(index, e.target.value)} className="w-full rounded-lg border px-2 py-2 text-xs" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border bg-gray-50 p-4">
          <h2 className="font-semibold text-gray-900">TAGIHAN PARSIAL (Keping)</h2>
          <div className="grid gap-3 md:grid-cols-7">
            {REPEAT_COLUMNS.map((index) => (
              <div key={index}>
                <label className="mb-1 block text-xs font-medium">Keping {index + 1}</label>
                <input type="number" step="0.01" value={form.partial_billing_quantities?.[index] || 0} onChange={(e) => updatePartialColumn(index, Number(e.target.value))} className="w-full rounded-lg border px-2 py-2 text-xs" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-sm">
          Estimasi Nilai: <span className="font-bold">{estimatedValue.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => router.push("/purchase-orders")} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Batal</button>
          <button disabled={saving} type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Menyimpan..." : "Simpan BKOrder"}
          </button>
        </div>
      </form>
    </div>
  );
}
