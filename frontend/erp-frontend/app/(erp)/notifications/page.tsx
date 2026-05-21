export default function NotificationsPage() {
  const notifications = [
    {
      title: "Stok bahan menipis",
      description: "Kertas Roll tersisa 5 roll.",
      time: "Hari ini",
    },
    {
      title: "Invoice belum dibayar",
      description: "INV-001 masih berstatus UNPAID.",
      time: "Hari ini",
    },
    {
      title: "Produksi hampir selesai",
      description: "SO-002 sudah masuk tahap QC CHECK.",
      time: "Kemarin",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Notifications
      </h1>

      <p className="text-slate-500 mt-2 mb-6">
        Informasi penting dari sistem ERP.
      </p>

      <div className="space-y-4">
        {notifications.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-2xl shadow p-6"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {item.title}
                </h2>

                <p className="text-slate-500 mt-1">
                  {item.description}
                </p>
              </div>

              <span className="text-sm text-slate-400">
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}