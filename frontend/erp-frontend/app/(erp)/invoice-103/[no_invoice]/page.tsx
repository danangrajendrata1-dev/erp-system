"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInvoice103ByNoInvoice } from "@/services/invoice103";
import { Invoice103Group } from "@/types/invoice103";

function toNumber(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function formatCurrency(value: number | string | null | undefined) {
  return toNumber(value).toLocaleString("id-ID");
}

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("id-ID");
}

export default function Invoice103DetailPage() {
  const params = useParams();
  const router = useRouter();

  const noInvoice = decodeURIComponent(params.no_invoice as string);

  const [data, setData] = useState<Invoice103Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const result = await getInvoice103ByNoInvoice(noInvoice);

        setData(result);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [noInvoice]);

  function handleMasukBKPt() {
    if (!data) return;

    const query = new URLSearchParams({
      customer_name: data.langganan || "",
      tgl: data.tgl || "",
      no_invoice: data.no_invoice || "",
      faktur: data.no_faktur || "",
      debet: String(data.total_piutang_dagang || 0),
      keterangan: `Piutang dari Invoice 103 ${data.no_invoice}`,
    });

    router.push(`/bkpt/create?${query.toString()}`);
  }

  if (loading) {
    return <div className="p-6">Loading invoice...</div>;
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="rounded border bg-white p-6">
          <h1 className="text-xl font-bold">Invoice tidak ditemukan</h1>

          <p className="mt-2 text-sm text-gray-500">
            Data invoice dengan nomor {noInvoice} tidak ditemukan di 103.
          </p>

          <button
            onClick={() => router.push("/invoice-103")}
            className="mt-4 rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 print:bg-white print:p-0">
      <div className="print:hidden mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => router.push("/invoice-103")}
          className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
        >
          Kembali
        </button>

        <button
          onClick={() => window.print()}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Cetak
        </button>

        <button
          onClick={handleMasukBKPt}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          + Masuk BKPt
        </button>
      </div>

      <div className="mx-auto min-h-[1000px] max-w-4xl bg-white p-10 shadow print:min-h-0 print:max-w-none print:p-0 print:shadow-none">
        <div className="border-b pb-4">
          <div className="flex justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-wide">INVOICE</h1>
              <p className="mt-1 text-sm text-gray-500">
                Invoice 103 / Buku Penjualan
              </p>
            </div>

            <div className="text-right text-sm">
              <div>
                <span className="font-semibold">No. Invoice: </span>
                {data.no_invoice}
              </div>

              <div>
                <span className="font-semibold">No. Faktur: </span>
                {data.no_faktur || "-"}
              </div>

              <div>
                <span className="font-semibold">Tanggal: </span>
                {formatDate(data.tgl)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <div className="font-semibold">Ditagihkan Kepada:</div>
            <div className="mt-1 text-lg font-bold">
              {data.langganan || "-"}
            </div>
          </div>

          <div className="text-right">
            <div className="font-semibold">Sumber Data:</div>
            <div className="mt-1">103 / Buku Penjualan</div>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-center">NO</th>
                <th className="border px-3 py-2 text-left">NO.ORD</th>
                <th className="border px-3 py-2 text-left">JENIS CETAK</th>
                <th className="border px-3 py-2 text-right">JML</th>
                <th className="border px-3 py-2 text-left">SAT</th>
                <th className="border px-3 py-2 text-right">HARGA</th>
                <th className="border px-3 py-2 text-right">DPP</th>
              </tr>
            </thead>

            <tbody>
              {data.rows.map((item, index) => (
                <tr key={item.id}>
                  <td className="border px-3 py-2 text-center">
                    {index + 1}
                  </td>

                  <td className="border px-3 py-2">
                    {item.no_ord || ""}
                  </td>

                  <td className="border px-3 py-2">
                    {item.jenis_cetak || ""}
                  </td>

                  <td className="border px-3 py-2 text-right">
                    {formatCurrency(item.jml)}
                  </td>

                  <td className="border px-3 py-2">
                    {item.sat || ""}
                  </td>

                  <td className="border px-3 py-2 text-right">
                    {formatCurrency(item.harga)}
                  </td>

                  <td className="border px-3 py-2 text-right">
                    {formatCurrency(item.dpp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-sm text-sm">
            <div className="flex justify-between border-b py-2">
              <span>DPP</span>
              <span>Rp {formatCurrency(data.total_dpp)}</span>
            </div>

            <div className="flex justify-between border-b py-2">
              <span>PPN KELUAR</span>
              <span>Rp {formatCurrency(data.total_ppn_keluar)}</span>
            </div>

            <div className="flex justify-between border-b py-3 text-lg font-bold">
              <span>PIUTANG DAGANG</span>
              <span>Rp {formatCurrency(data.total_piutang_dagang)}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-10 text-center text-sm">
          <div>
            <div>Penerima,</div>
            <div className="mt-20 border-t pt-2">____________________</div>
          </div>

          <div>
            <div>Hormat Kami,</div>
            <div className="mt-20 border-t pt-2">____________________</div>
          </div>
        </div>
      </div>
    </div>
  );
}