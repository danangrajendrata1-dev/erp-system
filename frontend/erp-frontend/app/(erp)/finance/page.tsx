export default function FinancePage() {
  const transactions = [
    {
      id: "KS-001",
      date: "2026-05-20",
      type: "IN",
      description: "Pembayaran invoice INV-001",
      amount: "Rp 5.000.000",
    },
    {
      id: "KS-002",
      date: "2026-05-21",
      type: "OUT",
      description: "Pembelian bahan",
      amount: "Rp 1.500.000",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Finance / Kas
        </h1>
        <p className="text-slate-500 mt-2">
          Halaman pencatatan kas masuk, kas keluar, dan saldo.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 text-sm">
            Kas Masuk
          </p>
          <h2 className="text-2xl font-bold mt-2">
            Rp 5.000.000
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 text-sm">
            Kas Keluar
          </p>
          <h2 className="text-2xl font-bold mt-2">
            Rp 1.500.000
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 text-sm">
            Saldo Kas
          </p>
          <h2 className="text-2xl font-bold mt-2">
            Rp 3.500.000
          </h2>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Input Transaksi Kas
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Trans No</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((trx) => (
              <tr key={trx.id} className="border-t">
                <td className="p-4">{trx.id}</td>
                <td className="p-4">{trx.date}</td>
                <td className="p-4">{trx.type}</td>
                <td className="p-4">{trx.description}</td>
                <td className="p-4">{trx.amount}</td>
                <td className="p-4">
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-lg">
                    Detail
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