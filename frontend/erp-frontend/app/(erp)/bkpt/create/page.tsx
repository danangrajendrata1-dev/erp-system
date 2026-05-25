"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBKPtReceivable } from "@/services/bkpt";

function CreateBKPtContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    customer_name: "",
    tgl: "",
    no_order: "",
    no_invoice: "",
    faktur: "",
    pr: "",
    debet: "",
    kredit: "",
    pph_psl_21: "",
    pph_psl_23: "",
    saldo: "",
    keterangan: "",
  });

  useEffect(() => {
    const customerName = searchParams.get("customer_name") || "";
    const tgl = searchParams.get("tgl") || "";
    const noInvoice = searchParams.get("no_invoice") || "";
    const faktur = searchParams.get("faktur") || "";
    const debet = searchParams.get("debet") || "";
    const keterangan = searchParams.get("keterangan") || "";

    if (
      customerName ||
      tgl ||
      noInvoice ||
      faktur ||
      debet ||
      keterangan
    ) {
      setForm((prev) => ({
        ...prev,
        customer_name: customerName,
        tgl: tgl ? tgl.slice(0, 10) : "",
        no_invoice: noInvoice,
        faktur,
        debet,
        saldo: debet,
        keterangan,
      }));
    }
  }, [searchParams]);

  function calculateSaldo(nextForm: typeof form) {
    const debet = Number(nextForm.debet || 0);
    const kredit = Number(nextForm.kredit || 0);
    const pph21 = Number(nextForm.pph_psl_21 || 0);
    const pph23 = Number(nextForm.pph_psl_23 || 0);

    return String(debet - kredit - pph21 - pph23);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => {
      const nextForm = {
        ...prev,
        [name]: value,
      };

      if (
        name === "debet" ||
        name === "kredit" ||
        name === "pph_psl_21" ||
        name === "pph_psl_23"
      ) {
        nextForm.saldo = calculateSaldo(nextForm);
      }

      return nextForm;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    await createBKPtReceivable({
      customer_name: form.customer_name,
      tgl: form.tgl || null,
      no_order: form.no_order || null,
      no_invoice: form.no_invoice || null,
      faktur: form.faktur || null,
      pr: form.pr || null,
      debet: Number(form.debet || 0),
      kredit: Number(form.kredit || 0),
      pph_psl_21: Number(form.pph_psl_21 || 0),
      pph_psl_23: Number(form.pph_psl_23 || 0),
      saldo: Number(form.saldo || 0),
      keterangan: form.keterangan || null,
    });

    router.push("/bkpt");
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tambah BKPt</h1>
        <p className="text-sm text-gray-500">
          Input data Buku Piutang sesuai sheet BKPt.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded border bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            LANGGANAN
          </label>

          <input
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">TGL</label>

            <input
              type="date"
              name="tgl"
              value={form.tgl}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              NO.ORDER
            </label>

            <input
              name="no_order"
              value={form.no_order}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              NO. INVOICE
            </label>

            <input
              name="no_invoice"
              value={form.no_invoice}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">FAKTUR</label>

            <input
              name="faktur"
              value={form.faktur}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">PR</label>

          <input
            name="pr"
            value={form.pr}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div>
            <label className="mb-1 block text-sm font-medium">DEBET</label>

            <input
              type="number"
              name="debet"
              value={form.debet}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">KREDIT</label>

            <input
              type="number"
              name="kredit"
              value={form.kredit}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              PPh Psl. 21
            </label>

            <input
              type="number"
              name="pph_psl_21"
              value={form.pph_psl_21}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              PPh Psl. 23
            </label>

            <input
              type="number"
              name="pph_psl_23"
              value={form.pph_psl_23}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">SALDO</label>

            <input
              type="number"
              name="saldo"
              value={form.saldo}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            KETERANGAN
          </label>

          <textarea
            name="keterangan"
            value={form.keterangan}
            onChange={handleChange}
            rows={3}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Simpan
          </button>

          <button
            type="button"
            onClick={() => router.push("/bkpt")}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateBKPtPage() {
  return (
    <Suspense
      fallback={<div className="p-6">Loading halaman tambah BKPt...</div>}
    >
      <CreateBKPtContent />
    </Suspense>
  );
}