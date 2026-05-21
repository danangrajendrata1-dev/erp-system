import StatusBadge from "@/components/status-badge";
export default function ProductionPage() {
  const productions = [
    {
      id: "WO-001",
      orderNo: "SO-001",
      customer: "PT Maju Jaya",
      process: "Printing",
      progress: "60%",
      status: "ON PROGRESS",
    },
    {
      id: "WO-002",
      orderNo: "SO-002",
      customer: "CV Sumber Rezeki",
      process: "Finishing",
      progress: "90%",
      status: "QC CHECK",
    },
    {
      id: "WO-003",
      orderNo: "SO-003",
      customer: "PT Sinar Abadi",
      process: "Packing",
      progress: "100%",
      status: "FINISHED",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Production Tracking
          </h1>
          <p className="text-slate-500 mt-2">
            Monitoring proses produksi dari setiap sales order.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Update Progress
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 text-sm">
            Waiting
          </p>
          <h2 className="text-2xl font-bold mt-2">
            5
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 text-sm">
            On Progress
          </p>
          <h2 className="text-2xl font-bold mt-2">
            12
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 text-sm">
            Finished
          </p>
          <h2 className="text-2xl font-bold mt-2">
            20
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Work Order</th>
              <th className="p-4 text-left">Order No</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Process</th>
              <th className="p-4 text-left">Progress</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {productions.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.orderNo}</td>
                <td className="p-4">{item.customer}</td>
                <td className="p-4">{item.process}</td>
                <td className="p-4">{item.progress}</td>
                <td className="p-4">
                    <StatusBadge status={item.status} />
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