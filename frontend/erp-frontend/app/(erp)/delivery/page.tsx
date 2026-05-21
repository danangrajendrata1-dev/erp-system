import StatusBadge from "@/components/status-badge";

export default function DeliveryPage() {
  const deliveries = [
    {
      id: "DO-001",
      date: "2026-05-20",
      orderNo: "SO-001",
      customer: "PT Maju Jaya",
      driver: "Budi",
      status: "DELIVERED",
    },
    {
      id: "DO-002",
      date: "2026-05-21",
      orderNo: "SO-002",
      customer: "CV Sumber Rezeki",
      driver: "Andi",
      status: "ON DELIVERY",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Pengiriman
          </h1>
          <p className="text-slate-500 mt-2">
            Halaman input pengiriman dan surat jalan.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Input Pengiriman
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Delivery No</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Order No</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Driver</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="border-t">
                <td className="p-4">{delivery.id}</td>
                <td className="p-4">{delivery.date}</td>
                <td className="p-4">{delivery.orderNo}</td>
                <td className="p-4">{delivery.customer}</td>
                <td className="p-4">{delivery.driver}</td>
                <td className="p-4">
                  <StatusBadge status={delivery.status} />
                </td>
                <td className="p-4">
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-lg">
                    Surat Jalan
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