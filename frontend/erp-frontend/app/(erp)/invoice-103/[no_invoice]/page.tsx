"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  finalizeInvoice103ToBKPt,
  getInvoice103ByNoInvoice,
  getInvoice103Metadata,
  saveInvoice103Metadata,
} from "@/services/invoice103";
import { getBKPtReceivables } from "@/services/bkpt";
import { Invoice103Group, Invoice103Metadata } from "@/types/invoice103";

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const raw = String(value).trim().replace(/\s/g, "");

  if (!raw) return 0;

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  // Format Indonesia: 1.234.567,89
  if (hasComma && hasDot) {
    const normalized = raw.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  // Format Indonesia decimal: 13,2
  if (hasComma && !hasDot) {
    const normalized = raw.replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  // Format backend decimal: 5280000.00 / 400000.00 / 13.200
  if (hasDot && !hasComma) {
    const dotCount = (raw.match(/\./g) || []).length;

    if (dotCount > 1) {
      const normalized = raw.replace(/\./g, "");
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number | string | null | undefined) {
  const numberValue = toNumber(value);

  return numberValue.toLocaleString("id-ID", {
    minimumFractionDigits: numberValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function formatCurrency(value: number | string | null | undefined) {
  return toNumber(value).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function formatLongDate(value?: string | null) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function normalizeText(value: any) {
  return String(value ?? "").trim();
}

function getUnit(value?: string | null) {
  const unit = normalizeText(value);

  if (!unit) return "-";

  const lower = unit.toLowerCase();

  if (lower === "rim") return "Rim";
  if (lower === "keping") return "KSH";
  if (lower === "ksh") return "KSH";

  return unit;
}

function terbilangRupiah(value: number) {
  const angka = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
    "sepuluh",
    "sebelas",
  ];

  const bilangan = Math.round(value);

  function baca(n: number): string {
    n = Math.floor(n);

    if (n < 12) return angka[n];

    if (n < 20) return `${baca(n - 10)} belas`;

    if (n < 100) {
      const puluh = Math.floor(n / 10);
      const sisa = n % 10;

      return `${baca(puluh)} puluh${sisa ? ` ${baca(sisa)}` : ""}`;
    }

    if (n < 200) {
      return `seratus${n - 100 ? ` ${baca(n - 100)}` : ""}`;
    }

    if (n < 1000) {
      const ratus = Math.floor(n / 100);
      const sisa = n % 100;

      return `${baca(ratus)} ratus${sisa ? ` ${baca(sisa)}` : ""}`;
    }

    if (n < 2000) {
      return `seribu${n - 1000 ? ` ${baca(n - 1000)}` : ""}`;
    }

    if (n < 1_000_000) {
      const ribu = Math.floor(n / 1000);
      const sisa = n % 1000;

      return `${baca(ribu)} ribu${sisa ? ` ${baca(sisa)}` : ""}`;
    }

    if (n < 1_000_000_000) {
      const juta = Math.floor(n / 1_000_000);
      const sisa = n % 1_000_000;

      return `${baca(juta)} juta${sisa ? ` ${baca(sisa)}` : ""}`;
    }

    if (n < 1_000_000_000_000) {
      const miliar = Math.floor(n / 1_000_000_000);
      const sisa = n % 1_000_000_000;

      return `${baca(miliar)} miliar${sisa ? ` ${baca(sisa)}` : ""}`;
    }

    return "";
  }

  if (bilangan === 0) return "Nol rupiah";

  const text = `${baca(bilangan)} rupiah`;

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getPoDate(item: any, fallbackDate?: string | null) {
  return normalizeText(item.po_date || item.tgl || fallbackDate);
}

function getPoNumber(item: any) {
  return normalizeText(
    item.po_number || item.po_no || item.po || item.no_ord || item.no_order
  );
}

function getDoNumber(item: any) {
  return normalizeText(
    item.do_number || item.do_no || item.no_sj || item.surat_jalan
  );
}

function getDescription(item: any) {
  return normalizeText(
    item.jenis_cetak || item.spesifikasi || item.description || "-"
  );
}

function getQuantity(item: any) {
  return toNumber(item.jml ?? item.quantity);
}

function getPrice(item: any) {
  return toNumber(item.harga ?? item.price);
}

function getRowDpp(item: any) {
  const dpp = toNumber(item.dpp ?? item.amount);

  if (dpp > 0) return dpp;

  return getQuantity(item) * getPrice(item);
}

function getRowPpn(item: any) {
  const ppn = toNumber(item.ppn_keluar ?? item.vat);

  if (ppn > 0) return ppn;

  return Math.round(getRowDpp(item) * 0.11);
}

function getRowPiutang(item: any) {
  const piutang = toNumber(
    item.piutang_dagang ?? item.total ?? item.grand_total
  );

  if (piutang > 0) return piutang;

  return getRowDpp(item) + getRowPpn(item);
}

function uniquePoRows(data: Invoice103Group | null) {
  if (!data) return [];

  const rows = data.rows || [];
  const map = new Map<string, any>();

  rows.forEach((item: any) => {
    const poDate = getPoDate(item, data.tgl);
    const poNumber = getPoNumber(item);
    const doNumber = getDoNumber(item);

    const key = `${poDate}|${poNumber}|${doNumber}`;

    if (!map.has(key)) {
      map.set(key, {
        poDate,
        poNumber,
        doNumber,
      });
    }
  });

  return Array.from(map.values());
}

export default function Invoice103DetailPage() {
  const params = useParams();
  const router = useRouter();

  const noInvoice = decodeURIComponent(String(params.no_invoice ?? ""));

  const [data, setData] = useState<Invoice103Group | null>(null);
  const [metadata, setMetadata] = useState<Invoice103Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyInBKPt, setAlreadyInBKPt] = useState(false);
  const [error, setError] = useState("");
  const [shipToName, setShipToName] = useState("");
  const [shipToAddress, setShipToAddress] = useState("");
  const [termsOfPayment, setTermsOfPayment] = useState("30 Days");
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [metadataMessage, setMetadataMessage] = useState("");
  const [finalizingBKPt, setFinalizingBKPt] = useState(false);
  const [finalizationMessage, setFinalizationMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const invoiceResult = await getInvoice103ByNoInvoice(noInvoice);

        setData(invoiceResult);
        setMetadata(null);
        setMetadataMessage("");
        setFinalizationMessage("");

        // Default alamat cetak mengikuti nama langganan dari Sales 103.
        setShipToName(invoiceResult?.langganan || "");
        setShipToAddress("");
        setTermsOfPayment("30 Days");

        if (invoiceResult) {
          try {
            const metadataResult = await getInvoice103Metadata(noInvoice);

            setMetadata(metadataResult);
            setShipToName(
              metadataResult.ship_to_name || invoiceResult.langganan || ""
            );
            setShipToAddress(metadataResult.ship_to_address || "");
            setTermsOfPayment(metadataResult.terms_of_payment || "30 Days");
          } catch (metadataError: any) {
            if (metadataError?.response?.status !== 404) {
              console.error(metadataError);
            }
          }
        }

        try {
          const bkptResult = await getBKPtReceivables({
            no_invoice: noInvoice,
          });

          setAlreadyInBKPt(bkptResult.length > 0);
        } catch {
          setAlreadyInBKPt(false);
        }
      } catch (err: any) {
        console.error(err);
        setData(null);
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Gagal mengambil data invoice."
        );
      } finally {
        setLoading(false);
      }
    }

    if (noInvoice) {
      loadData();
    }
  }, [noInvoice]);

  const invoiceInfo = useMemo(() => {
    if (!data) {
      return {
        subtotal: 0,
        ppn: 0,
        grandTotal: 0,
        poRows: [],
      };
    }

    const rows = data.rows || [];

    const subtotal =
      toNumber((data as any).total_dpp) ||
      toNumber((data as any).subtotal) ||
      rows.reduce((sum: number, item: any) => sum + getRowDpp(item), 0);

    const ppn =
      toNumber((data as any).total_ppn_keluar) ||
      toNumber((data as any).ppn_keluar) ||
      rows.reduce((sum: number, item: any) => sum + getRowPpn(item), 0);

    const grandTotal =
      toNumber((data as any).total_piutang_dagang) ||
      toNumber((data as any).piutang_dagang) ||
      rows.reduce((sum: number, item: any) => sum + getRowPiutang(item), 0);

    return {
      subtotal,
      ppn,
      grandTotal,
      poRows: uniquePoRows(data),
    };
  }, [data]);

  async function handleMasukBKPt() {
    if (!data || alreadyInBKPt) return;

    const confirmed = confirm(
      "Finalisasi invoice ini ke BKPt? Sistem akan membuat piutang otomatis."
    );

    if (!confirmed) return;

    try {
      setFinalizingBKPt(true);
      setFinalizationMessage("");

      await finalizeInvoice103ToBKPt(data.no_invoice);

      setAlreadyInBKPt(true);
      setFinalizationMessage("Invoice berhasil difinalisasi ke BKPt.");
    } catch (finalizeError: any) {
      console.error(finalizeError);
      setFinalizationMessage(
        finalizeError?.response?.data?.detail ||
          "Gagal finalisasi Invoice 103 ke BKPt."
      );
    } finally {
      setFinalizingBKPt(false);
    }
  }

  function handleLihatBKPt() {
    if (!data) return;

    const query = new URLSearchParams({
      no_invoice: data.no_invoice || "",
    });

    router.push(`/bkpt?${query.toString()}`);
  }

  async function handleSaveMetadata() {
    if (!data) return;

    try {
      setSavingMetadata(true);
      setMetadataMessage("");

      const result = await saveInvoice103Metadata(data.no_invoice, {
        ship_to_name: shipToName,
        ship_to_address: shipToAddress,
        terms_of_payment: termsOfPayment,
      });

      setMetadata(result);
      setShipToName(result.ship_to_name || data.langganan || "");
      setShipToAddress(result.ship_to_address || "");
      setTermsOfPayment(result.terms_of_payment || "30 Days");
      setMetadataMessage("Alamat invoice berhasil disimpan.");
    } catch (saveError) {
      console.error(saveError);
      setMetadataMessage("Gagal menyimpan alamat invoice.");
    } finally {
      setSavingMetadata(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
            Mengambil data invoice...
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold">Invoice tidak ditemukan</h1>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              `Data invoice dengan nomor ${noInvoice} tidak ditemukan di 103.`}
          </p>

          <button
            onClick={() => router.push("/sales-103")}
            className="mt-4 rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
          >
            Kembali ke 103
          </button>
        </div>
      </div>
    );
  }

  const rows = data.rows || [];
  const printedShipToName = shipToName || data.langganan || "-";
  const printedShipToAddress = shipToAddress || "-";
  const printedTermsOfPayment =
    termsOfPayment || (data as any).terms_of_payment || "30 Days";

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm;
          }

          html,
          body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-area,
          .print-area * {
            visibility: visible !important;
          }

          aside,
          nav,
          header,
          .sidebar,
          .topbar,
          .navbar,
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }

          .print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }

          .invoice-paper {
            width: 198mm !important;
            height: 285mm !important;
            margin: 0 auto !important;
            padding: 4mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            overflow: hidden !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            transform: scale(0.96);
            transform-origin: top center;
          }

          table,
          tr,
          td,
          th {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-100 p-4 print:bg-white print:p-0">
        <div className="no-print mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Cetak Invoice 103
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Invoice bersumber dari 103 dan bisa berisi beberapa PO.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/sales-103")}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
            >
              Kembali
            </button>

            <button
              onClick={() => window.print()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
            >
              Cetak
            </button>

            {alreadyInBKPt ? (
              <button
                onClick={handleLihatBKPt}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                Lihat BKPt
              </button>
            ) : (
              <button
                onClick={handleMasukBKPt}
                disabled={finalizingBKPt}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {finalizingBKPt ? "Memproses..." : "Finalisasi ke BKPt"}
              </button>
            )}
          </div>
        </div>

        {alreadyInBKPt && (
          <div className="no-print mx-auto mb-4 max-w-5xl rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Invoice ini sudah tercatat di BKPt / Buku Piutang.
          </div>
        )}

        {finalizationMessage && (
          <div className="no-print mx-auto mb-4 max-w-5xl rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            {finalizationMessage}
          </div>
        )}

        <div className="no-print mx-auto mb-4 max-w-5xl rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Alamat Cetak Invoice
              </h2>
              <p className="text-sm text-slate-500">
                Alamat ini khusus untuk cetak Invoice 103 dan disimpan per nomor invoice.
              </p>
            </div>

            <div className="text-xs text-slate-500">
              {metadata ? "Sudah tersimpan" : "Belum ada alamat tersimpan"}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_2fr_180px]">
            <input
              value={shipToName}
              onChange={(event) => setShipToName(event.target.value)}
              placeholder="Nama tujuan / Ship to"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />

            <textarea
              value={shipToAddress}
              onChange={(event) => setShipToAddress(event.target.value)}
              placeholder="Alamat lengkap tujuan cetak invoice"
              rows={3}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />

            <div className="flex flex-col gap-3">
              <input
                value={termsOfPayment}
                onChange={(event) => setTermsOfPayment(event.target.value)}
                placeholder="Terms of Payment"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />

              <button
                onClick={handleSaveMetadata}
                disabled={savingMetadata}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {savingMetadata ? "Menyimpan..." : "Simpan Alamat"}
              </button>
            </div>
          </div>

          {metadataMessage && (
            <div className="mt-3 text-sm text-slate-600">
              {metadataMessage}
            </div>
          )}
        </div>

        <div className="print-area mx-auto max-w-5xl rounded-2xl border bg-white p-6 shadow-sm">
          <div className="invoice-paper border border-slate-200 bg-white p-6 text-[12px] text-slate-900">
            <div className="mb-4">
              <div className="text-[12px] font-semibold tracking-wide">
                CV. LIBRA OFFSET INDONESIA
              </div>
              <div>Jl. Janti Barat No. 34 RT.01 RW.004, Sukun</div>
              <div className="font-semibold">MALANG</div>
              <div className="mt-1 h-[2px] w-[330px] bg-slate-700" />
            </div>

            <h2 className="mb-5 text-center font-serif text-4xl tracking-[0.15em] text-slate-800 underline">
              INVOICE
            </h2>

            <div className="mb-5 grid grid-cols-12 gap-6">
              <div className="col-span-6 min-h-[105px] border border-slate-700 p-3">
                <div className="mb-1 font-semibold">Ship to :</div>
                <div className="font-bold uppercase">
                  {printedShipToName}
                </div>
                <div className="whitespace-pre-line">
                  {printedShipToAddress}
                </div>
              </div>

              <div className="col-span-6 pl-4">
                <div className="grid grid-cols-[150px_10px_1fr] gap-y-1">
                  <div>Invoice Number</div>
                  <div>:</div>
                  <div>{data.no_invoice}</div>

                  {invoiceInfo.poRows.length <= 1 ? (
                    <>
                      <div>PO Date</div>
                      <div>:</div>
                      <div>
                        {formatDate(invoiceInfo.poRows[0]?.poDate || data.tgl)}
                      </div>

                      <div>PO Number</div>
                      <div>:</div>
                      <div>{invoiceInfo.poRows[0]?.poNumber || "-"}</div>

                      <div>DO Number</div>
                      <div>:</div>
                      <div>{invoiceInfo.poRows[0]?.doNumber || "-"}</div>
                    </>
                  ) : (
                    invoiceInfo.poRows.map((po: any, index: number) => (
                      <div
                        className="contents"
                        key={`${po.poDate}-${po.poNumber}-${po.doNumber}-${index}`}
                      >
                        <div>PO Date</div>
                        <div>:</div>
                        <div>{formatDate(po.poDate)}</div>

                        <div>PO Number</div>
                        <div>:</div>
                        <div>{po.poNumber || "-"}</div>

                        <div>DO Number</div>
                        <div>:</div>
                        <div>{po.doNumber || "-"}</div>
                      </div>
                    ))
                  )}

                  <div>Terms of Payment</div>
                  <div>:</div>
                  <div>{printedTermsOfPayment}</div>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[12px]">
              <thead>
                <tr className="text-center font-semibold">
                  <th className="w-[45px] border border-slate-800 py-2">No</th>
                  <th className="border border-slate-800 py-2">Descriptions</th>
                  <th className="w-[150px] border border-slate-800 py-2">
                    Quantity
                  </th>
                  <th className="w-[125px] border border-slate-800 py-2">
                    Price
                  </th>
                  <th className="w-[160px] border border-slate-800 py-2">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((item: any, index: number) => {
                  const quantity = getQuantity(item);
                  const unit = getUnit(item.sat ?? item.satuan ?? item.unit);
                  const price = getPrice(item);
                  const amount = getRowDpp(item);

                  return (
                    <tr key={item.id ?? index}>
                      <td className="border-x border-slate-800 px-2 py-3 text-center align-top">
                        {index + 1}
                      </td>

                      <td className="border-x border-slate-800 px-3 py-3 align-top">
                        {getDescription(item)}
                      </td>

                      <td className="border-x border-slate-800 px-3 py-3 text-center align-top">
                        <span>{formatNumber(quantity)}</span>
                        <span className="ml-4">{unit}</span>
                      </td>

                      <td className="border-x border-slate-800 px-3 py-3 text-right align-top">
                        {formatNumber(price)}
                      </td>

                      <td className="border-x border-slate-800 px-3 py-3 text-right align-top">
                        {formatCurrency(amount)}
                      </td>
                    </tr>
                  );
                })}

                {Array.from({ length: Math.max(0, 5 - rows.length) }).map(
                  (_, index) => (
                    <tr key={`empty-${index}`}>
                      <td className="h-[42px] border-x border-slate-800" />
                      <td className="border-x border-slate-800" />
                      <td className="border-x border-slate-800" />
                      <td className="border-x border-slate-800" />
                      <td className="border-x border-slate-800" />
                    </tr>
                  )
                )}

                <tr>
                  <td
                    colSpan={4}
                    className="border border-slate-800 px-2 py-1 font-semibold"
                  >
                    TOTAL
                  </td>
                  <td className="border border-slate-800 px-2 py-1 text-right font-semibold">
                    {formatCurrency(invoiceInfo.subtotal)}
                  </td>
                </tr>

                <tr>
                  <td
                    colSpan={4}
                    className="border border-slate-800 px-2 py-1 font-semibold"
                  >
                    VAT ( 11 % )
                  </td>
                  <td className="border border-slate-800 px-2 py-1 text-right font-semibold">
                    {formatCurrency(invoiceInfo.ppn)}
                  </td>
                </tr>

                <tr>
                  <td
                    colSpan={4}
                    className="border border-slate-800 px-2 py-1 font-semibold"
                  >
                    TOTAL
                  </td>
                  <td className="border border-slate-800 px-2 py-1 text-right font-bold">
                    {formatCurrency(invoiceInfo.grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 border border-slate-800 p-3">
              <div className="mb-2 font-semibold">Terbilang :</div>
              <div className="text-center font-serif text-[15px] font-semibold">
                {terbilangRupiah(invoiceInfo.grandTotal)}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-8 text-[12px]">
              <div>
                <div className="grid grid-cols-[115px_15px_1fr] gap-y-1">
                  <div>Alamat Transfer</div>
                  <div>:</div>
                  <div>Bank Central Asia (BCA), KCU Malang</div>

                  <div />
                  <div />
                  <div>Jl. Jend. Basuki Rachmat 70-74 Klojen Malang</div>

                  <div>A/C No.</div>
                  <div>:</div>
                  <div className="font-bold">011 3426 761</div>

                  <div>A/N</div>
                  <div>:</div>
                  <div className="font-bold tracking-wide">
                    LIBRA OFFSET INDONESIA CV
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div>Malang, {formatLongDate(data.tgl)}</div>
                <div>Hormat Kami,</div>

                <div className="h-36" />

                <div className="inline-block border-b border-slate-800 px-3 font-semibold">
                  Dinovianto Ronoyudo
                </div>
                <div>Direktur</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
