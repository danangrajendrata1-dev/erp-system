"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  RefreshCcw,
  FileText,
  PlusCircle,
  Eye,
} from "lucide-react";

import api from "@/services/api";

type Sales103Row = {
  id?: number | string;

  tgl?: string;
  date?: string;

  no_ord?: string;
  no_order?: string;

  no_invoice?: string;
  invoice_number?: string;

  no_faktur?: string;
  tax_invoice_number?: string;

  pelanggan?: string;
  langganan?: string;
  customer?: string;
  customer_name?: string;

  alamat?: string;
  address?: string;
  ship_to_address?: string;

  jenis_cetak?: string;
  description?: string;
  spesifikasi?: string;

  jml?: number | string;
  quantity?: number | string;

  sat?: string;
  satuan?: string;
  unit?: string;

  harga?: number | string;
  price?: number | string;

  dpp?: number | string;
  amount?: number | string;

  ppn_keluar?: number | string;
  vat?: number | string;

  piutang_dagang?: number | string;
  total?: number | string;
  grand_total?: number | string;

  po_date?: string;
  po_number?: string;
  po_no?: string;
  po?: string;

  do_number?: string;
  do_no?: string;

  terms_of_payment?: string;
};

type BkptRow = {
  id?: number | string;
  no_invoice?: string;
  invoice_number?: string;
};

function getArrayData<T>(res: any): T[] {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res)) return res;
  return [];
}

function normalizeText(value: any) {
  return String(value ?? "").trim();
}

function toNumber(value: any) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const raw = String(value)
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number, minimumFractionDigits = 0) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(date);
}

function formatLongDate(value?: string) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
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
    if (n < 200) return `seratus${n - 100 ? ` ${baca(n - 100)}` : ""}`;
    if (n < 1000) {
      const ratus = Math.floor(n / 100);
      const sisa = n % 100;
      return `${baca(ratus)} ratus${sisa ? ` ${baca(sisa)}` : ""}`;
    }
    if (n < 2000) return `seribu${n - 1000 ? ` ${baca(n - 1000)}` : ""}`;
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

function getInvoiceNo(row: Sales103Row) {
  return normalizeText(row.no_invoice || row.invoice_number);
}

function getCustomer(row: Sales103Row) {
  return normalizeText(
    row.pelanggan || row.langganan || row.customer || row.customer_name
  );
}

function getDescription(row: Sales103Row) {
  return normalizeText(row.description || row.spesifikasi || row.jenis_cetak || "-");
}

function getQuantity(row: Sales103Row) {
  return toNumber(row.jml ?? row.quantity);
}

function getUnit(row: Sales103Row) {
  const unit = normalizeText(row.sat || row.satuan || row.unit);

  if (!unit) return "-";

  if (unit.toLowerCase() === "keping") return "KSH";
  if (unit.toLowerCase() === "rim") return "Rim";

  return unit;
}

function getPrice(row: Sales103Row) {
  return toNumber(row.harga ?? row.price);
}

function getDpp(row: Sales103Row) {
  const existing = toNumber(row.dpp ?? row.amount);
  if (existing > 0) return existing;

  return getQuantity(row) * getPrice(row);
}

function getVat(row: Sales103Row) {
  const existing = toNumber(row.ppn_keluar ?? row.vat);
  if (existing > 0) return existing;

  return Math.round(getDpp(row) * 0.11);
}

function getGrandTotal(row: Sales103Row) {
  const existing = toNumber(row.piutang_dagang ?? row.total ?? row.grand_total);
  if (existing > 0) return existing;

  return getDpp(row) + getVat(row);
}

function getPoDate(row: Sales103Row) {
  return normalizeText(row.po_date || row.tgl || row.date);
}

function getPoNumber(row: Sales103Row) {
  return normalizeText(row.po_number || row.po_no || row.po || row.no_ord || row.no_order);
}

function getDoNumber(row: Sales103Row) {
  return normalizeText(row.do_number || row.do_no);
}

function uniquePoRows(rows: Sales103Row[]) {
  const map = new Map<string, Sales103Row>();

  rows.forEach((row) => {
    const poDate = getPoDate(row);
    const poNumber = getPoNumber(row);
    const doNumber = getDoNumber(row);

    const key = `${poDate}|${poNumber}|${doNumber}`;
    if (!map.has(key)) map.set(key, row);
  });

  return Array.from(map.values());
}

export default function Invoice103PrintPage() {
  const params = useParams();
  const router = useRouter();

  const noInvoice = decodeURIComponent(String(params?.no_invoice ?? ""));

  const [rows, setRows] = useState<Sales103Row[]>([]);
  const [bkptRows, setBkptRows] = useState<BkptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [salesRes, bkptRes] = await Promise.allSettled([
        api.get("/sales-103/"),
        api.get("/bkpt/"),
      ]);

      if (salesRes.status === "rejected") {
        throw salesRes.reason;
      }

      const allSales = getArrayData<Sales103Row>(salesRes.value);

      const filtered = allSales.filter(
        (item) => getInvoiceNo(item).toLowerCase() === noInvoice.toLowerCase()
      );

      setRows(filtered);

      if (bkptRes.status === "fulfilled") {
        setBkptRows(getArrayData<BkptRow>(bkptRes.value));
      } else {
        setBkptRows([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Gagal mengambil data invoice."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (noInvoice) fetchData();
  }, [noInvoice]);

  const invoiceInfo = useMemo(() => {
    const first = rows[0];

    const subtotal = rows.reduce((sum, row) => sum + getDpp(row), 0);
    const vat = rows.reduce((sum, row) => sum + getVat(row), 0);
    const grandTotal = rows.reduce((sum, row) => sum + getGrandTotal(row), 0);

    const poRows = uniquePoRows(rows);

    const alreadyInBkpt = bkptRows.some((item) => {
      const inv = normalizeText(item.no_invoice || item.invoice_number);
      return inv.toLowerCase() === noInvoice.toLowerCase();
    });

    return {
      first,
      subtotal,
      vat,
      grandTotal,
      poRows,
      alreadyInBkpt,
      customer: first ? getCustomer(first) : "-",
      address:
        normalizeText(first?.ship_to_address || first?.alamat || first?.address) || "-",
      invoiceDate: first?.tgl || first?.date,
      terms: normalizeText(first?.terms_of_payment) || "30 Days",
    };
  }, [rows, bkptRows, noInvoice]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <RefreshCcw className="h-5 w-5 animate-spin" />
            Mengambil data invoice...
          </div>
        </div>
      </div>
    );
  }

  if (error || rows.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border bg-white p-8 shadow-sm">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <h2 className="mb-1 font-semibold">Invoice tidak ditemukan</h2>
            <p className="text-sm">
              {error ||
                `Data dengan NO. INVOICE "${noInvoice}" tidak ditemukan di 103.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-area {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }

          .invoice-paper {
            border: none !important;
            padding: 0 !important;
            min-height: auto !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-100 p-4 print:bg-white">
        <div className="no-print mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-700" />
              <h1 className="text-lg font-bold text-slate-900">
                Cetak Invoice 103
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Invoice bersumber dari 103 dan digabung berdasarkan NO. INVOICE.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/invoice-103"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>

            {invoiceInfo.alreadyInBkpt ? (
              <Link
                href={`/bkpt?no_invoice=${encodeURIComponent(noInvoice)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
              >
                <Eye className="h-4 w-4" />
                Lihat BKPt
              </Link>
            ) : (
              <Link
                href={`/bkpt/create?no_invoice=${encodeURIComponent(noInvoice)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4" />
                Masuk BKPt
              </Link>
            )}

            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
            >
              <Printer className="h-4 w-4" />
              Cetak
            </button>
          </div>
        </div>

        <div className="print-area mx-auto max-w-5xl rounded-2xl border bg-white p-6 shadow-sm">
          <div className="invoice-paper min-h-[1120px] border border-slate-200 bg-white p-6 text-[12px] text-slate-900">
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
                <div className="font-bold uppercase">{invoiceInfo.customer}</div>
                <div className="whitespace-pre-line">{invoiceInfo.address}</div>
              </div>

              <div className="col-span-6 pl-4">
                <div className="grid grid-cols-[150px_10px_1fr] gap-y-1">
                  <div>Invoice Number</div>
                  <div>:</div>
                  <div>{noInvoice}</div>

                  {invoiceInfo.poRows.length <= 1 ? (
                    <>
                      <div>PO Date</div>
                      <div>:</div>
                      <div>{formatDate(getPoDate(invoiceInfo.poRows[0]))}</div>

                      <div>PO Number</div>
                      <div>:</div>
                      <div>{getPoNumber(invoiceInfo.poRows[0]) || "-"}</div>

                      <div>DO Number</div>
                      <div>:</div>
                      <div>{getDoNumber(invoiceInfo.poRows[0]) || "-"}</div>
                    </>
                  ) : (
                    invoiceInfo.poRows.map((poRow, index) => (
                      <div className="contents" key={`${getPoNumber(poRow)}-${index}`}>
                        <div>PO Date</div>
                        <div>:</div>
                        <div>{formatDate(getPoDate(poRow))}</div>

                        <div>PO Number</div>
                        <div>:</div>
                        <div>{getPoNumber(poRow) || "-"}</div>

                        <div>DO Number</div>
                        <div>:</div>
                        <div>{getDoNumber(poRow) || "-"}</div>
                      </div>
                    ))
                  )}

                  <div>Terms of Payment</div>
                  <div>:</div>
                  <div>{invoiceInfo.terms}</div>
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
                {rows.map((row, index) => {
                  const quantity = getQuantity(row);
                  const unit = getUnit(row);
                  const price = getPrice(row);
                  const amount = getDpp(row);

                  return (
                    <tr key={`${row.id ?? index}`}>
                      <td className="border-x border-slate-800 px-2 py-3 text-center align-top">
                        {index + 1}
                      </td>
                      <td className="border-x border-slate-800 px-3 py-3 align-top">
                        {getDescription(row)}
                      </td>
                      <td className="border-x border-slate-800 px-3 py-3 text-center align-top">
                        <span>{formatNumber(quantity, quantity % 1 ? 2 : 0)}</span>
                        <span className="ml-4">{unit}</span>
                      </td>
                      <td className="border-x border-slate-800 px-3 py-3 text-right align-top">
                        {formatNumber(price, price % 1 ? 2 : 0)}
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
                    {formatCurrency(invoiceInfo.vat)}
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
                <div>Malang, {formatLongDate(invoiceInfo.invoiceDate)}</div>
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