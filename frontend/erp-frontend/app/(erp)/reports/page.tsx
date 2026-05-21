export default function ReportsPage() {
  const reports = [
    {
      name: "Laporan Sales Order",
      description: "Rekap order customer berdasarkan periode.",
    },
    {
      name: "Laporan Stok Bahan",
      description: "Monitoring stok awal, masuk, keluar, dan sisa stok.",
    },
    {
      name: "Laporan Produksi",
      description: "Progress dan hasil produksi setiap order.",
    },
    {
      name: "Laporan Pengiriman",
      description: "Data surat jalan dan status pengiriman.",
    },
    {
      name: "Laporan Invoice",
      description: "Tagihan customer, status paid/unpaid.",
    },
    {
      name: "Laporan Kas",
      description: "Kas masuk, kas keluar, dan saldo akhir.",
    },
    {
      name: "Laporan Payroll",
      description: "Rekap gaji dan absensi karyawan.",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Reports
      </h1>

      <p className="text-slate-500 mt-2 mb-6">
        Halaman pusat laporan ERP perusahaan.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.name}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-lg font-bold mb-2">
              {report.name}
            </h2>

            <p className="text-slate-500 text-sm mb-4">
              {report.description}
            </p>

            <button className="bg-black text-white px-4 py-2 rounded-lg">
              View Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}