"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBKPtReceivable, updateBKPtReceivable } from "@/services/bkpt";

export default function EditBKPtPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);

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
    async function loadData() {
      try {
        setLoading(true);

        const data = await getBKPtReceivable(id);

        setForm({
          customer_name: data.customer_name || "",
          tgl: data.tgl ? data.tgl.slice(0, 10) : "",
          no_order: data.no_order || "",
          no_invoice: data.no_invoice || "",
          faktur: data.faktur || "",
          pr: data.pr || "",
          debet: String(data.debet || ""),
          kredit: String(data.kredit || ""),
          pph_psl_21: String(data.pph_psl_21 || ""),
          pph_psl_23: String(data.pph_psl_23 || ""),
          saldo: String(data.saldo || ""),
          keterangan: data.keterangan || "",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function calculateSaldo(nextForm: typeof form) {
    const debet = Number(nextForm.debet || 0);
    const kredit = Number(nextForm.kredit || 0);
    const pph21 = Number(nextForm.pph_psl_21 || 0);
    const pph23 = Number(nextForm.pph_psl_23 || 0);

    return String(debet - kredit - pph21 - pph23);
  }

  function getPaymentStatus() {
    const saldo = Number(form.saldo || 0);
    const debet = Number(form.debet || 0);

    if (debet <= 0) return "Belum ada nilai piutang";
    if (saldo <= 0) return "LUNAS";
    if (saldo < debet) return "PARSIAL";

    return "BELUM BAYAR";
  }

  function getPaymentStatusClass() {
    const status = getPaymentStatus();

    if (status === "LUNAS") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (status === "PARSIAL") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    if (status === "BELUM BAYAR") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
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

    await updateBKPtReceivable(id, {
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

  if (loading) {
    return <div className="p-6">Loading data BKPt...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit BKPt</h1>
          <p className="text-sm text-gray-500">
            Edit pembayaran dan saldo Buku Piutang.
          </p>
        </div>

        <div
          className={`rounded border px-4 py-2 text-sm font-semibold ${getPaymentStatusClass()}`}
        >
          STATUS: {getPaymentStatus()}
        </div>
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

        <div className="rounded border bg-gray-50 p-4">
          <h2 className="mb-3 font-semibold">Pembayaran / Pelunasan</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-medium">
                DEBET
              </label>

              <input
                type="number"
                name="debet"
                value={form.debet}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                KREDIT
              </label>

              <input
                type="number"
                name="kredit"
                value={form.kredit}
                onChange={handleChange}
                placeholder="Isi pembayaran"
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
              <label className="mb-1 block text-sm font-medium">
                SALDO
              </label>

              <input
                type="number"
                name="saldo"
                value={form.saldo}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 font-semibold"
              />
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Rumus: SALDO = DEBET - KREDIT - PPh Psl. 21 - PPh Psl. 23
          </p>
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

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Simpan Perubahan
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