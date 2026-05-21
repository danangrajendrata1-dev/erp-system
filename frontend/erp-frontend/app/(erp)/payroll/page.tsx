import StatusBadge from "@/components/status-badge";
export default function PayrollPage() {
  const payrolls = [
    {
      id: "PAY-001",
      employee: "Budi Santoso",
      position: "Operator Produksi",
      month: "Mei 2026",
      salary: "Rp 3.500.000",
      status: "PAID",
    },
    {
      id: "PAY-002",
      employee: "Siti Aminah",
      position: "Admin Finance",
      month: "Mei 2026",
      salary: "Rp 4.000.000",
      status: "UNPAID",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Payroll
          </h1>
          <p className="text-slate-500 mt-2">
            Halaman data karyawan, absensi, dan pembayaran gaji.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Input Payroll
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 text-sm">
            Total Karyawan
          </p>
          <h2 className="text-2xl font-bold mt-2">
            24
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 text-sm">
            Total Gaji Bulan Ini
          </p>
          <h2 className="text-2xl font-bold mt-2">
            Rp 72.000.000
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 text-sm">
            Belum Dibayar
          </p>
          <h2 className="text-2xl font-bold mt-2">
            Rp 12.000.000
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Payroll No</th>
              <th className="p-4 text-left">Employee</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">Month</th>
              <th className="p-4 text-left">Salary</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {payrolls.map((payroll) => (
              <tr key={payroll.id} className="border-t">
                <td className="p-4">{payroll.id}</td>
                <td className="p-4">{payroll.employee}</td>
                <td className="p-4">{payroll.position}</td>
                <td className="p-4">{payroll.month}</td>
                <td className="p-4">{payroll.salary}</td>
                <td className="p-4">
                   <StatusBadge status={payroll.status} />
                 </td>
                <td className="p-4">
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-lg">
                    Slip Gaji
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