export default function SalesOrdersPage() {
  const orders = [
    {
      id: "SO-001",
      customer: "PT Maju Jaya",
      date: "2026-05-20",
      item: "Banner 3x1",
      qty: "50 Pcs",
      status: "PRODUCTION",
    },
    {
      id: "SO-002",
      customer: "CV Sumber Rezeki",
      date: "2026-05-21",
      item: "Sticker Label",
      qty: "1.000 Pcs",
      status: "PENDING",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Sales Order
          </h1>
          <p className="text-slate-500 mt-2">
            Halaman input order customer dan tracking status pesanan.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Create Sales Order
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Order No</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Item</th>
              <th className="p-4 text-left">Qty</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-4">{order.id}</td>
                <td className="p-4">{order.customer}</td>
                <td className="p-4">{order.date}</td>
                <td className="p-4">{order.item}</td>
                <td className="p-4">{order.qty}</td>
                <td className="p-4">{order.status}</td>
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