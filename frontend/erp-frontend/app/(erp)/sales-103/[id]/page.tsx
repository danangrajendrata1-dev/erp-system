"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSales103ById, updateSales103 } from "@/services/sales103";
import { Sales103Update } from "@/types/sales103";
import { getBKOrders } from "@/services/bkorder";
import { BKOrder } from "@/types/bkorder";

function formatDecimal(value: number | null) {
  if (value === null || Number.isNaN(value)) return "";

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) return "";

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function toNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function roundMoney(value: unknown) {
  return Math.round(toNumber(value));
}

function normalizeText(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function isRimUnit(unit?: string | null) {
  return normalizeText(unit).includes("rim");
}

function getKepingPerRim(order: BKOrder) {
  const quantity = toNumber(order.quantity);
  const rim = toNumber(order.rim);

  if (quantity > 0 && rim > 0) {
    return quantity / rim;
  }

  return 0;
}

function convertStoredKepingToDisplay(order: BKOrder, kepingValue: unknown) {
  const keping = toNumber(kepingValue);

  if (keping <= 0) {
    return 0;
  }

  if (isRimUnit(order.unit)) {
    const kepingPerRim = getKepingPerRim(order);

    if (kepingPerRim > 0) {
      return Number((keping / kepingPerRim).toFixed(4));
    }
  }

  return keping;
}

function getDefaultBKOrderQuantity(order: BKOrder) {
  return toNumber(order.rim) || toNumber(order.quantity);
}

function getPartialOptions(order: BKOrder | null) {
  if (!order) return [];

  const inputQuantities = order.partial_billing_input_quantities || [];
  const storedQuantities = order.partial_billing_quantities || [];
  const dates = order.delivery_completed_dates || [];

  return storedQuantities
    .map((quantity, index) => {
      const inputQuantity = inputQuantities[index];
      return {
        index,
        quantity:
          inputQuantity !== null && inputQuantity !== undefined
            ? toNumber(inputQuantity)
            : convertStoredKepingToDisplay(order, quantity),
        deliveryDate: dates[index] || null,
      };
    })
    .filter((item) => item.quantity > 0 || item.deliveryDate);
}

function buildInvoice103DetailHref(
  invoiceDate?: string | null,
  noInvoice?: string | null,
) {
  if (!invoiceDate || !noInvoice) {
    return "/sales-103";
  }

  const date = new Date(invoiceDate);

  if (Number.isNaN(date.getTime())) {
    return `/invoice-103/${encodeURIComponent(noInvoice)}`;
  }

  return `/invoice-103/${date.getFullYear()}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}/${encodeURIComponent(noInvoice)}`;
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
  const [bkorders, setBKOrders] = useState<BKOrder[]>([]);
  const [selectedBKOrderId, setSelectedBKOrderId] = useState("");
  const [selectedPartialIndex, setSelectedPartialIndex] = useState("");

  const preview = useMemo(() => {
    const jml = Number(form.jml || 0);
    const harga = roundMoney(form.harga);
    const ppnRate = Number(form.ppn_rate ?? 11);
    const ppnAdjustment = roundMoney(form.ppn_adjustment);

    const dpp = roundMoney(jml * harga);
    const ppnKeluar =
      form.ppn_keluar ?? roundMoney((dpp * ppnRate) / 100 - ppnAdjustment);
    const piutangDagang =
      form.piutang_dagang ?? roundMoney(dpp + ppnKeluar);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      const moneyFields = [
        "harga",
        "ppn_adjustment",
        "ppn_keluar",
        "piutang_dagang",
      ];

      setForm((prev) => ({
        ...prev,
        [name]:
          value === ""
            ? null
            : moneyFields.includes(name)
              ? roundMoney(value)
              : Number(value),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function applyBKOrder(order: BKOrder, partialIndex = "") {
    const partialOptions = getPartialOptions(order);
    const selectedPartial =
      partialIndex === ""
        ? null
        : partialOptions.find((item) => item.index === Number(partialIndex));

    setForm((prev) => ({
      ...prev,
      tgl: selectedPartial?.deliveryDate || order.delivery_date || prev.tgl || "",
      no_ord: order.order_number || "",
      langganan: order.customer_name || "",
      jenis_cetak: order.print_type || "",
      jml: selectedPartial?.quantity || getDefaultBKOrderQuantity(order) || null,
      sat: order.unit || "",
      harga:
        order.price === null || order.price === undefined
          ? null
          : roundMoney(order.price),
      production_order_id: order.id,
    }));
  }

  function handleBKOrderSelect(value: string) {
    setSelectedBKOrderId(value);
    setSelectedPartialIndex("");

    const order = bkorders.find((item) => String(item.id) === value);

    if (order) {
      applyBKOrder(order);
    }
  }

  function handlePartialSelect(value: string) {
    setSelectedPartialIndex(value);

    const order = bkorders.find((item) => String(item.id) === selectedBKOrderId);

    if (order) {
      applyBKOrder(order, value);
    }
  }

  async function loadBKOrders() {
    try {
      const result = await getBKOrders();
      setBKOrders(result);
    } catch (error) {
      console.error("Gagal mengambil BKOrder:", error);
    }
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
        harga: data.harga === null ? null : roundMoney(data.harga),
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

      if (data.production_order_id) {
        setSelectedBKOrderId(String(data.production_order_id));
      }
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

      const savedData = await updateSales103(sales103Id, {
        ...form,
        tgl: form.tgl || null,
        no_ord: form.no_ord || null,
        no_invoice: form.no_invoice || null,
        no_faktur: form.no_faktur || null,
        langganan: form.langganan || null,
        jenis_cetak: form.jenis_cetak || null,
        sat: form.sat || null,
        harga: form.harga === null ? null : roundMoney(form.harga),
        keterangan: form.keterangan || null,

        dpp: null,
        ppn_adjustment:
          form.ppn_adjustment === null ? null : roundMoney(form.ppn_adjustment),
        ppn_keluar: form.ppn_keluar === null ? null : roundMoney(form.ppn_keluar),
        piutang_dagang:
          form.piutang_dagang === null
            ? null
            : roundMoney(form.piutang_dagang),
      });

      if (savedData.no_invoice) {
        router.push(buildInvoice103DetailHref(savedData.tgl, savedData.no_invoice));
        return;
      }

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
    loadBKOrders();
  }, []);

  useEffect(() => {
    if (!Number.isNaN(sales103Id)) {
      loadData();
    }
  }, [sales103Id]);

  const selectedBKOrder = useMemo(() => {
    return (
      bkorders.find((item) => String(item.id) === selectedBKOrderId) || null
    );
  }, [bkorders, selectedBKOrderId]);

  const partialOptions = useMemo(() => {
    return getPartialOptions(selectedBKOrder);
  }, [selectedBKOrder]);

  const matchedOrderByNoOrd = useMemo(() => {
    const noOrd = normalizeText(form.no_ord);

    if (!noOrd) return null;

    return (
      bkorders.find((item) => normalizeText(item.order_number) === noOrd) || null
    );
  }, [bkorders, form.no_ord]);

  const hasBKOrderWarning = Boolean(form.no_ord && !form.production_order_id);
  const hasManualMismatchWarning = Boolean(
    form.no_ord && !form.production_order_id && !matchedOrderByNoOrd
  );

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
        <div className="rounded border bg-slate-50 p-4">
          <h2 className="mb-3 text-sm font-semibold">Ambil Data dari BKOrder</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">BKOrder</label>
              <select
                value={selectedBKOrderId}
                onChange={(event) => handleBKOrderSelect(event.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Pilih BKOrder</option>
                {bkorders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.order_number || `BKOrder #${order.id}`} -{" "}
                    {order.customer_name || "-"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Tagihan Parsial / Pengiriman
              </label>
              <select
                value={selectedPartialIndex}
                onChange={(event) => handlePartialSelect(event.target.value)}
                disabled={!selectedBKOrder}
                className="w-full rounded border px-3 py-2 text-sm disabled:bg-gray-100"
              >
                <option value="">Pakai jumlah utama BKOrder</option>
                {partialOptions.map((item) => (
                  <option key={item.index} value={item.index}>
                    #{item.index + 1} - {formatDecimal(item.quantity)}{" "}
                    {selectedBKOrder?.unit || ""} -{" "}
                    {item.deliveryDate || "tanpa tanggal"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasBKOrderWarning && (
            <div className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Data 103 ini belum terhubung ke BKOrder. Invoice 103 tidak bisa
              mengambil PO Date dan DO Number otomatis.
            </div>
          )}

          {hasManualMismatchWarning && (
            <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              NO.ORD belum cocok dengan order_number di BKOrder. Pilih BKOrder
              dari dropdown agar data tidak salah.
            </div>
          )}
        </div>

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
                step="1"
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
                step="1"
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
                step="1"
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
                value={formatCurrency(preview.dpp)}
                disabled
                className="w-full rounded border bg-white px-3 py-2 text-sm text-right"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                PPN KELUAR
              </label>
              <input
                value={formatCurrency(preview.ppn_keluar)}
                disabled
                className="w-full rounded border bg-white px-3 py-2 text-sm text-right"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                PIUTANG DAGANG
              </label>
              <input
                value={formatCurrency(preview.piutang_dagang)}
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
