import StatusBadge from "@/components/status-badge";

export default function MaterialUsagePage() {
  const usages = [
    {
      id: "USE-001",
      date: "2026-05-20",
      orderNo: "SO-001",
      material: "Kertas Roll",
      qty: "5 Roll",
      usedBy: "Produksi",
    },
    {
      id: "USE-002",
      date: "2026-05-21",
      orderNo: "SO-002",
      material: "Tinta Hitam",
      qty: "2 Liter",
      usedBy: "Printing",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Bahan Terpakai
          </h1>
          <p className="text-slate-500 mt-2">
            Halaman input pemakaian bahan untuk produksi.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Input Bahan Terpakai
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Usage No</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Order No</th>
              <th className="p-4 text-left">Material</th>
              <th className="p-4 text-left">Qty Used</th>
              <th className="p-4 text-left">Used By</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {usages.map((usage) => (
              <tr key={usage.id} className="border-t">
                <td className="p-4">{usage.id}</td>
                <td className="p-4">{usage.date}</td>
                <td className="p-4">{usage.orderNo}</td>
                <td className="p-4">{usage.material}</td>
                <td className="p-4">{usage.qty}</td>
                <td className="p-4">{usage.usedBy}</td>
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