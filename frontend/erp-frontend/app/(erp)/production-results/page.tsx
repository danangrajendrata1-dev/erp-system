export default function ProductionResultsPage() {
  const results = [
    {
      id: "PRD-001",
      date: "2026-05-20",
      orderNo: "SO-001",
      product: "Banner 3x1",
      qty: "50 Pcs",
      status: "FINISHED",
    },
    {
      id: "PRD-002",
      date: "2026-05-21",
      orderNo: "SO-002",
      product: "Sticker Label",
      qty: "1.000 Pcs",
      status: "QC CHECK",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Hasil Produksi
          </h1>
          <p className="text-slate-500 mt-2">
            Halaman input hasil produksi dari order customer.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Input Hasil Produksi
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Result No</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Order No</th>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">Qty Result</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {results.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.date}</td>
                <td className="p-4">{item.orderNo}</td>
                <td className="p-4">{item.product}</td>
                <td className="p-4">{item.qty}</td>
                <td className="p-4">{item.status}</td>
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