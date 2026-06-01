"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import MaterialSearchInput from "@/components/MaterialSearchInput";
import { createBKOrder, getBKOrder } from "@/services/bkorder";
import { BKOrderPayload } from "@/types/bkorder";
import { MaterialType } from "@/types/material";
import {
  parseUkuranMm,
  hitungKepingPerRim,
  hitungKepingDariRim,
  hitungRimDariKeping,
} from "@/utils/bkorder-calculation";

const REPEAT_COLUMNS = Array.from({ length: 14 }, (_, index) => index);

const emptyForm: BKOrderPayload = {
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
  quantity: null,
  rim: null,
  price: null,
  delivery_completed_dates: Array(14).fill(null),
  partial_billing_quantities: Array(14).fill(null),
  partial_billing_input_quantities: Array(14).fill(null),
  total_keping: null,
  status: "PO_MASUK",
  notes: "",
};

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function roundMoney(value: unknown) {
  return Math.round(toNumber(value));
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

function formatNumber(value: number) {
  if (!value || value <= 0) return "-";
  return value.toLocaleString("id-ID");
}

function isRimUnit(unit?: string | null) {
  return String(unit || "").toLowerCase().includes("rim");
}

function getKepingPerRimFromForm(
  form: BKOrderPayload | null,
  cuttingInfo: {
    kepingPerRim: number;
  }
) {
  if (cuttingInfo.kepingPerRim > 0) return cuttingInfo.kepingPerRim;

  const quantity = toNumber(form?.quantity);
  const rim = toNumber(form?.rim);

  if (quantity > 0 && rim > 0) return quantity / rim;

  return 0;
}

function convertDisplayToKeping(params: {
  value: number;
  unit?: string | null;
  kepingPerRim: number;
}) {
  const { value, unit, kepingPerRim } = params;

  if (isRimUnit(unit) && kepingPerRim > 0) {
    return value * kepingPerRim;
  }

  return value;
}

function convertKepingToDisplay(params: {
  value: unknown;
  unit?: string | null;
  kepingPerRim: number;
}) {
  const { value, unit, kepingPerRim } = params;
  const keping = toNumber(value);

  if (keping === 0) return "";

  if (isRimUnit(unit) && kepingPerRim > 0) {
    return String(Number((keping / kepingPerRim).toFixed(4)));
  }

  return String(keping);
}

function getPartialInputValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return toNumber(value);
}

function formatDisplayValue(value: number, unit?: string | null) {
  if (!value || value <= 0) return "";

  return `${value.toLocaleString("id-ID", {
    maximumFractionDigits: 4,
  })} ${isRimUnit(unit) ? "Rim" : "Keping"}`;
}

function normalizePayload(form: BKOrderPayload): BKOrderPayload {
  const partials = normalizeArray<number | null>(
    form.partial_billing_quantities ?? null,
    null
  ).map((value) => toNumber(value));
  const partialInputs = normalizeArray<number | null>(
    form.partial_billing_input_quantities ?? null,
    null
  ).map(getPartialInputValue);

  const totalKeping = partials.reduce<number>((sum, value) => {
    return sum + toNumber(value);
  }, 0);

  return {
    ...form,
    order_date: normalizeStringDate(form.order_date),
    po_date: normalizeStringDate(form.po_date),
    delivery_date: normalizeStringDate(form.delivery_date),
    quantity: toNumber(form.quantity),
    rim: toNumber(form.rim),
    price: roundMoney(form.price),
    delivery_completed_dates: normalizeArray(
      form.delivery_completed_dates,
      null
    ).map(normalizeStringDate),
    partial_billing_quantities: partials,
    partial_billing_input_quantities: partialInputs,
    total_keping: totalKeping,
  };
}

function CreatePurchaseOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copyFrom = searchParams.get("copyFrom");

  const [form, setForm] = useState<BKOrderPayload>(emptyForm);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | null>(
    null
  );
  const [loadingCopy, setLoadingCopy] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCopyData() {
      if (!copyFrom) return;

      setLoadingCopy(true);

      try {
        const data = await getBKOrder(copyFrom);

        setForm({
          ...emptyForm,
          order_date: toDateInput(data.order_date),
          order_number: data.order_number || "",
          po_date: toDateInput(data.po_date),
          do_number: data.do_number || "",
          delivery_date: toDateInput(data.delivery_date),
          customer_name: data.customer_name || "",
          size: "",
          material_type: "",
          print_type: "",
          specification: "",
          unit: data.unit || "Rim",
          quantity: null,
          rim: null,
          price: null,
          delivery_completed_dates: Array(14).fill(null),
          partial_billing_quantities: Array(14).fill(null),
          partial_billing_input_quantities: Array(14).fill(null),
          total_keping: null,
          status: data.status || "PO_MASUK",
          notes: "",
        });

        setSelectedMaterial(null);
      } finally {
        setLoadingCopy(false);
      }
    }

    loadCopyData();
  }, [copyFrom]);

  const autoTotalKeping = useMemo(() => {
    const values = normalizeArray<number | string | null>(
      form.partial_billing_quantities ?? null,
      null
    );

    return values.reduce<number>((sum, value) => sum + toNumber(value), 0);
  }, [form.partial_billing_quantities]);

  const cuttingInfo = useMemo(() => {
    if (!selectedMaterial) {
      return {
        keping: 0,
        lajur: 0,
        kepingPerLembar: 0,
        kepingPerRim: 0,
      };
    }

    const { lebarMm, panjangMm } = parseUkuranMm(form.size || "");

    return hitungKepingPerRim({
      lebarOrderMm: lebarMm,
      panjangOrderMm: panjangMm,
      lebarBahanCm: Number(selectedMaterial.width_cm),
      panjangBahanCm: Number(selectedMaterial.length_cm),
    });
  }, [form.size, selectedMaterial]);

  const kepingPerRim = useMemo(() => {
    return getKepingPerRimFromForm(form, cuttingInfo);
  }, [form, cuttingInfo]);

  const totalTerkirimDisplay = useMemo(() => {
    if (isRimUnit(form.unit) && kepingPerRim > 0) {
      return autoTotalKeping / kepingPerRim;
    }

    return autoTotalKeping;
  }, [form.unit, autoTotalKeping, kepingPerRim]);

  const kekuranganKeping = useMemo(() => {
    return Math.max(toNumber(form.quantity) - autoTotalKeping, 0);
  }, [form.quantity, autoTotalKeping]);

  const kekuranganDisplay = useMemo(() => {
    if (isRimUnit(form.unit) && kepingPerRim > 0) {
      return {
        value: kekuranganKeping / kepingPerRim,
        unit: "Rim",
      };
    }

    return {
      value: kekuranganKeping,
      unit: "Keping",
    };
  }, [form.unit, kekuranganKeping, kepingPerRim]);

  function updateField<K extends keyof BKOrderPayload>(
    key: K,
    value: BKOrderPayload[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateDateColumn(index: number, value: string) {
    setForm((prev) => {
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
      const currentKepingPerRim = getKepingPerRimFromForm(prev, cuttingInfo);

      const next: (number | null)[] = normalizeArray<number | null>(
        prev.partial_billing_quantities ?? null,
        null
      );

      const inputValue = value === "" ? null : Number(value);

      next[index] =
        inputValue === null
          ? null
          : convertDisplayToKeping({
              value: inputValue,
              unit: prev.unit,
              kepingPerRim: currentKepingPerRim,
            });

      const totalKeping = next.reduce<number>((sum, item) => {
        return sum + toNumber(item);
      }, 0);

      return {
        ...prev,
        partial_billing_quantities: next,
        partial_billing_input_quantities: normalizeArray<number | null>(
          prev.partial_billing_input_quantities ?? null,
          null
        ).map((item, itemIndex) => (itemIndex === index ? inputValue : item)),
        total_keping: totalKeping,
      };
    });
  }

  function handleMaterialSelect(material: MaterialType) {
    setSelectedMaterial(material);

    setForm((prev) => {
      const nextForm = {
        ...prev,
        material_type: material.name,
      };

      const { lebarMm, panjangMm } = parseUkuranMm(nextForm.size || "");

      if (toNumber(nextForm.rim) > 0) {
        const hasil = hitungKepingDariRim({
          rim: toNumber(nextForm.rim),
          lebarOrderMm: lebarMm,
          panjangOrderMm: panjangMm,
          lebarBahanCm: Number(material.width_cm),
          panjangBahanCm: Number(material.length_cm),
        });

        return {
          ...nextForm,
          quantity: hasil.totalKeping > 0 ? hasil.totalKeping : null,
        };
      }

      if (toNumber(nextForm.quantity) > 0) {
        const hasil = hitungRimDariKeping({
          totalKeping: toNumber(nextForm.quantity),
          lebarOrderMm: lebarMm,
          panjangOrderMm: panjangMm,
          lebarBahanCm: Number(material.width_cm),
          panjangBahanCm: Number(material.length_cm),
        });

        return {
          ...nextForm,
          rim: hasil.totalRim > 0 ? Number(hasil.totalRim.toFixed(4)) : null,
        };
      }

      return nextForm;
    });
  }

  function handleSizeChange(value: string) {
    setForm((prev) => {
      const nextForm = {
        ...prev,
        size: value,
      };

      if (!selectedMaterial) return nextForm;

      const { lebarMm, panjangMm } = parseUkuranMm(value);

      if (toNumber(nextForm.rim) > 0) {
        const hasil = hitungKepingDariRim({
          rim: toNumber(nextForm.rim),
          lebarOrderMm: lebarMm,
          panjangOrderMm: panjangMm,
          lebarBahanCm: Number(selectedMaterial.width_cm),
          panjangBahanCm: Number(selectedMaterial.length_cm),
        });

        return {
          ...nextForm,
          quantity: hasil.totalKeping > 0 ? hasil.totalKeping : null,
        };
      }

      if (toNumber(nextForm.quantity) > 0) {
        const hasil = hitungRimDariKeping({
          totalKeping: toNumber(nextForm.quantity),
          lebarOrderMm: lebarMm,
          panjangOrderMm: panjangMm,
          lebarBahanCm: Number(selectedMaterial.width_cm),
          panjangBahanCm: Number(selectedMaterial.length_cm),
        });

        return {
          ...nextForm,
          rim: hasil.totalRim > 0 ? Number(hasil.totalRim.toFixed(4)) : null,
        };
      }

      return nextForm;
    });
  }

  function handleKepingChange(value: string) {
    const totalKeping = value === "" ? null : Number(value);

    if (!selectedMaterial) {
      setForm((prev) => ({
        ...prev,
        quantity: totalKeping,
      }));
      return;
    }

    const { lebarMm, panjangMm } = parseUkuranMm(form.size || "");

    const hasil = hitungRimDariKeping({
      totalKeping: toNumber(totalKeping),
      lebarOrderMm: lebarMm,
      panjangOrderMm: panjangMm,
      lebarBahanCm: Number(selectedMaterial.width_cm),
      panjangBahanCm: Number(selectedMaterial.length_cm),
    });

    setForm((prev) => ({
      ...prev,
      quantity: totalKeping,
      rim: hasil.totalRim > 0 ? Number(hasil.totalRim.toFixed(4)) : null,
    }));
  }

  function handleRimChange(value: string) {
    const rim = value === "" ? null : Number(value);

    if (!selectedMaterial) {
      setForm((prev) => ({
        ...prev,
        rim,
      }));
      return;
    }

    const { lebarMm, panjangMm } = parseUkuranMm(form.size || "");

    const hasil = hitungKepingDariRim({
      rim: toNumber(rim),
      lebarOrderMm: lebarMm,
      panjangOrderMm: panjangMm,
      lebarBahanCm: Number(selectedMaterial.width_cm),
      panjangBahanCm: Number(selectedMaterial.length_cm),
    });

    setForm((prev) => ({
      ...prev,
      rim,
      quantity: hasil.totalKeping > 0 ? hasil.totalKeping : null,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      await createBKOrder(normalizePayload(form));
      router.push("/bkorder");
    } finally {
      setSaving(false);
    }
  }

  if (loadingCopy) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Menyalin header DO NUMBER untuk tambah order baru...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {copyFrom ? "Tambah Order di DO NUMBER Ini" : "Tambah BKOrder"}
        </h1>
        <p className="text-sm text-gray-500">
          {copyFrom
            ? "Header DO NUMBER disalin, isi detail order baru di bawah."
            : "Form input mengikuti format BKOrder Excel client."}
        </p>
      </div>

      {copyFrom && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Mode tambah baris order dalam DO NUMBER yang sama. Field TGL,
          NO.ORD, PO Date, DO NUMBER, Deliv. Date, dan PR sudah disalin
          otomatis.
        </div>
      )}

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
              onChange={(e) => handleSizeChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Contoh: 45 x 81"
            />
            <p className="mt-1 text-xs text-gray-500">
              Isi ukuran order dalam mm. Contoh: 45 x 81
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              JENIS BAHAN
            </label>
            <MaterialSearchInput
              value={form.material_type || ""}
              onChange={(value) => {
                setSelectedMaterial(null);
                updateField("material_type", value);
              }}
              onSelect={handleMaterialSelect}
            />

            {selectedMaterial && (
              <p className="mt-1 text-xs text-blue-700">
                Ukuran bahan: {Number(selectedMaterial.width_cm)} x{" "}
                {Number(selectedMaterial.length_cm)} cm
              </p>
            )}
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
            <select
              value={form.unit || "Rim"}
              onChange={(e) => updateField("unit", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="Rim">Rim</option>
              <option value="Keping">Keping</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">KEPING</label>
            <input
              type="number"
              value={numberInputValue(form.quantity)}
              onChange={(e) => handleKepingChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Otomatis dari Rim"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Rim</label>
            <input
              type="number"
              step="0.0001"
              value={numberInputValue(form.rim)}
              onChange={(e) => handleRimChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Otomatis dari Keping"
            />
          </div>

          {selectedMaterial && cuttingInfo.kepingPerRim > 0 && (
            <div className="md:col-span-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <div className="font-semibold">Hitungan Rim ↔ Keping</div>
              <div className="mt-1">
                {cuttingInfo.keping} keping x {cuttingInfo.lajur} lajur x 500
                lembar ={" "}
                <span className="font-bold">
                  {formatNumber(cuttingInfo.kepingPerRim)} keping / rim
                </span>
              </div>
            </div>
          )}

          {selectedMaterial && cuttingInfo.kepingPerRim <= 0 && (
            <div className="md:col-span-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Isi UKURAN dengan format benar, contoh: 45 x 81, agar sistem bisa
              menghitung Rim ↔ Keping.
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">HARGA</label>
            <input
              type="number"
              step="1"
              value={numberInputValue(form.price)}
              onChange={(e) =>
                updateField(
                  "price",
                  e.target.value === "" ? null : roundMoney(e.target.value)
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
              value={formatDisplayValue(
                kekuranganDisplay.value,
                kekuranganDisplay.unit
              )}
              readOnly
              className="w-full rounded-lg border bg-gray-100 px-3 py-2 text-sm"
              placeholder="Otomatis"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              TOTAL TERKIRIM
            </label>
            <input
              value={formatDisplayValue(totalTerkirimDisplay, form.unit)}
              readOnly
              className="w-full rounded-lg border bg-gray-100 px-3 py-2 text-sm"
              placeholder="Otomatis dari tagihan parsial"
            />
            <p className="mt-1 text-xs text-gray-500">
              Total tersimpan untuk 103:{" "}
              {autoTotalKeping === 0
                ? "-"
                : `${autoTotalKeping.toLocaleString("id-ID")} keping`}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">STATUS</label>
            <select
              value={form.status || "PO_MASUK"}
              onChange={(e) =>
                updateField(
                  "status",
                  e.target.value as BKOrderPayload["status"]
                )
              }
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
          <h2 className="font-semibold text-gray-900">TAGIHAN PARSIAL</h2>

          <p className="text-xs text-gray-500">
            Input mengikuti SAT order: {isRimUnit(form.unit) ? "Rim" : "Keping"}
          </p>

          <div className="grid gap-3 md:grid-cols-7">
            {REPEAT_COLUMNS.map((index) => (
              <div key={index}>
                <label className="mb-1 block text-xs font-medium">
                  {isRimUnit(form.unit) ? "Rim" : "Keping"} {index + 1}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.partial_billing_input_quantities?.[index] ?? ""}
                  onChange={(e) => updatePartialColumn(index, e.target.value)}
                  className="w-full rounded-lg border px-2 py-2 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/bkorder")}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            disabled={saving}
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan BKOrder"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreatePurchaseOrderPage() {
  return (
    <Suspense
      fallback={<div className="p-6">Memuat halaman tambah BKOrder...</div>}
    >
      <CreatePurchaseOrderContent />
    </Suspense>
  );
}
