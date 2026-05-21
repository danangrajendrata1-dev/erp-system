import StatusBadge from "@/components/status-badge";
export default function PurchaseOrdersPage() {
  const purchaseOrders = [
    {
      id: "PO-001",
      supplier: "PT Bahan Makmur",
      date: "2026-05-20",
      item: "Kertas Roll",
      qty: "20 Roll",
      status: "ORDERED",
    },
    {
      id: "PO-002",
      supplier: "CV Sinar Plastik",
      date: "2026-05-21",
      item: "Plastik Packing",
      qty: "100 Kg",
      status: "RECEIVED",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Purchase Order
          </h1>
          <p className="text-slate-500 mt-2">
            Halaman input PO pembelian bahan ke supplier.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Create PO
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">PO No</th>
              <th className="p-4 text-left">Supplier</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Item</th>
              <th className="p-4 text-left">Qty</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {purchaseOrders.map((po) => (
              <tr key={po.id} className="border-t">
                <td className="p-4">{po.id}</td>
                <td className="p-4">{po.supplier}</td>
                <td className="p-4">{po.date}</td>
                <td className="p-4">{po.item}</td>
                <td className="p-4">{po.qty}</td>
                <td className="p-4">
                    <StatusBadge status={po.status} />
                </td>
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