import StatusBadge from "@/components/status-badge";

export default function InvoicesPage() {
  const invoices = [
    {
      id: "INV-001",
      customer: "PT Maju Jaya",
      date: "2026-05-20",
      total: "Rp 5.000.000",
      status: "UNPAID",
    },
    {
      id: "INV-002",
      customer: "CV Sumber Rezeki",
      date: "2026-05-21",
      total: "Rp 2.750.000",
      status: "PAID",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Invoice
          </h1>

          <p className="text-slate-500 mt-2">
            Data tagihan customer dan cetak invoice.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Invoice No</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t">
                <td className="p-4">{invoice.id}</td>
                <td className="p-4">{invoice.customer}</td>
                <td className="p-4">{invoice.date}</td>
                <td className="p-4">{invoice.total}</td>

                <td className="p-4">
                  <StatusBadge status={invoice.status} />
                </td>

                <td className="p-4">
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-lg">
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}