"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getProductionOrder, updateProductionOrder } from "@/services/production";
import { ProductionOrderPayload } from "@/types/production";

const REPEAT_COLUMNS = Array.from({ length: 14 }, (_, index) => index);

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

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

function numberInputValue(value: unknown) {
  const numberValue = toNumber(value);
  return numberValue === 0 ? "" : String(numberValue);
}

function normalizePayload(form: ProductionOrderPayload): ProductionOrderPayload {
  const partials = normalizeArray<number | null | undefined>(
    form.partial_billing_quantities,
    null
  ).map((value) => toNumber(value));

  const totalKeping =
    toNumber(form.total_keping) ||
    partials.reduce<number>((sum, value) => sum + toNumber(value), 0);

  return {
    ...form,
    order_date: normalizeStringDate(form.order_date),
    po_date: normalizeStringDate(form.po_date),
    delivery_date: normalizeStringDate(form.delivery_date),
    quantity: toNumber(form.quantity),
    rim: toNumber(form.rim),
    price: toNumber(form.price),
    delivery_completed_dates: normalizeArray(
      form.delivery_completed_dates,
      null
    ).map(normalizeStringDate),
    partial_billing_quantities: partials,
    total_keping: totalKeping,
  };
}

export default function EditPurchaseOrderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<ProductionOrderPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        const data = await getProductionOrder(params.id);

        setForm({
          order_date: toDateInput(data.order_date),
          order_number: data.order_number || "",
          po_date: toDateInput(data.po_date),
          do_number: data.do_number || "",
          delivery_date: toDateInput(data.delivery_date),
          customer_name: data.customer_name || "",
          size: data.size || "",
          material_type: data.material_type || "",
          print_type: data.print_type || "",
          specification: data.specification || "",
          unit: data.unit || "Rim",
          quantity: toNumber(data.quantity) || null,
          rim: toNumber(data.rim) || null,
          price: toNumber(data.price) || null,
          delivery_completed_dates: normalizeArray(
            data.delivery_completed_dates?.map(toDateInput),
            null
          ),
          partial_billing_quantities: normalizeArray(
            data.partial_billing_quantities?.map((value) =>
              toNumber(value) || null
            ),
            null
          ),
          total_keping: toNumber(data.total_keping) || null,
          status: data.status || "PO_MASUK",
          notes: data.notes || "",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id]);

  const autoTotalKeping = useMemo(() => {
    const values = normalizeArray<number | string | null | undefined>(
      form?.partial_billing_quantities,
      null
    );

    return values.reduce<number>((sum, value) => {
      return sum + toNumber(value);
    }, 0);
  }, [form?.partial_billing_quantities]);

  const kekurangan = useMemo(() => {
    return Math.max(toNumber(form?.quantity) - autoTotalKeping, 0);
  }, [form?.quantity, autoTotalKeping]);

  function updateField<K extends keyof ProductionOrderPayload>(
    key: K,
    value: ProductionOrderPayload[K]
  ) {
    setForm((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [key]: value,
      };
    });
  }

  function updateDateColumn(index: number, value: string) {
    setForm((prev) => {
      if (!prev) return prev;

      const next = normalizeArray(prev.delivery_completed_dates, null);
      next[index] = value || null;

      return {
        ...prev,
        delivery_completed_dates: next,
      };
    });
  }

  function updatePartialColumn(index: number, value: string) {
    setForm((prev) => {
      if (!prev) return prev;

      const next = normalizeArray<number | null | undefined>(
        prev.partial_billing_quantities,
        null
      );

      next[index] = value === "" ? null : Number(value);

      const totalKeping = next.reduce<number>((sum, item) => {
        return sum + toNumber(item);
      }, 0);

      return {
        ...prev,
        partial_billing_quantities: next,
        total_keping: totalKeping,
      };
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form) return;

    setSaving(true);

    try {
      await updateProductionOrder(params.id, normalizePayload(form));
      router.push("/purchase-orders");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Memuat data BKOrder...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit BKOrder</h1>
        <p className="text-sm text-gray-500">
          Ubah data BKOrder sesuai format Excel client.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">TGL</label>
            <input
              type="date"
              value={form.order_date || ""}
              onChange={(e) => updateField("order_date", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">NO.ORD</label>
            <input
              value={form.order_number || ""}
              onChange={(e) => updateField("order_number", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">PO Date</label>
            <input
              type="date"
              value={form.po_date || ""}
              onChange={(e) => updateField("po_date", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">DO NUMBER</label>
            <input
              value={form.do_number || ""}
              onChange={(e) => updateField("do_number", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Deliv. Date
            </label>
            <input
              type="date"
              value={form.delivery_date || ""}
              onChange={(e) => updateField("delivery_date", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">PR</label>
            <input
              value={form.customer_name || ""}
              onChange={(e) => updateField("customer_name", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">UKURAN</label>
            <input
              value={form.size || ""}
              onChange={(e) => updateField("size", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              JENIS BAHAN
            </label>
            <input
              value={form.material_type || ""}
              onChange={(e) => updateField("material_type", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              JENIS CETAK
            </label>
            <input
              value={form.print_type || ""}
              onChange={(e) => updateField("print_type", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium">
              SPESIFIKASI
            </label>
            <textarea
              value={form.specification || ""}
              onChange={(e) => updateField("specification", e.target.value)}
              className="min-h-20 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">SAT</label>
            <input
              value={form.unit || ""}
              onChange={(e) => updateField("unit", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Rim / Keping"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">KEPING</label>
            <input
              type="number"
              value={numberInputValue(form.quantity)}
              onChange={(e) =>
                updateField(
                  "quantity",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Kosongkan jika belum diisi"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Rim</label>
            <input
              type="number"
              step="0.01"
              value={numberInputValue(form.rim)}
              onChange={(e) =>
                updateField(
                  "rim",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Kosongkan jika belum diisi"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">HARGA</label>
            <input
              type="number"
              step="0.01"
              value={numberInputValue(form.price)}
              onChange={(e) =>
                updateField(
                  "price",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Kosongkan jika belum diisi"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              KEKURANGAN
            </label>
            <input
              value={kekurangan === 0 ? "" : kekurangan.toLocaleString("id-ID")}
              readOnly
              className="w-full rounded-lg border bg-gray-100 px-3 py-2 text-sm"
              placeholder="Otomatis"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              TOTAL (Keping)
            </label>
            <input
              type="number"
              step="0.01"
              value={numberInputValue(form.total_keping)}
              onChange={(e) =>
                updateField(
                  "total_keping",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Otomatis dari tagihan parsial"
            />
            <p className="mt-1 text-xs text-gray-500">
              Auto dari Tagihan Parsial:{" "}
              {autoTotalKeping === 0
                ? "-"
                : autoTotalKeping.toLocaleString("id-ID")}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">STATUS</label>
            <select
              value={form.status || "PO_MASUK"}
              onChange={(e) => updateField("status", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="PO_MASUK">PO_MASUK</option>
              <option value="OPEN">OPEN</option>
              <option value="PROSES">PROSES</option>
              <option value="SELESAI">SELESAI</option>
              <option value="BATAL">BATAL</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border bg-gray-50 p-4">
          <h2 className="font-semibold text-gray-900">
            TGL KIRIM / SELESAI
          </h2>

          <div className="grid gap-3 md:grid-cols-7">
            {REPEAT_COLUMNS.map((index) => (
              <div key={index}>
                <label className="mb-1 block text-xs font-medium">
                  Tanggal {index + 1}
                </label>
                <input
                  type="date"
                  value={form.delivery_completed_dates?.[index] || ""}
                  onChange={(e) => updateDateColumn(index, e.target.value)}
                  className="w-full rounded-lg border px-2 py-2 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border bg-gray-50 p-4">
          <h2 className="font-semibold text-gray-900">
            TAGIHAN PARSIAL (Keping)
          </h2>

          <div className="grid gap-3 md:grid-cols-7">
            {REPEAT_COLUMNS.map((index) => (
              <div key={index}>
                <label className="mb-1 block text-xs font-medium">
                  Keping {index + 1}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={numberInputValue(
                    form.partial_billing_quantities?.[index]
                  )}
                  onChange={(e) => updatePartialColumn(index, e.target.value)}
                  className="w-full rounded-lg border px-2 py-2 text-xs"
                  placeholder=""
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/purchase-orders")}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            disabled={saving}
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}