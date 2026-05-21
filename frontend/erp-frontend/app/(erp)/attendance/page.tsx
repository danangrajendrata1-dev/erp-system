import StatusBadge from "@/components/status-badge";

export default function AttendancePage() {
  const attendance = [
    {
      id: "ATT-001",
      date: "2026-05-20",
      employee: "Budi Santoso",
      position: "Operator Produksi",
      checkIn: "08:00",
      checkOut: "17:00",
      status: "PRESENT",
    },
    {
      id: "ATT-002",
      date: "2026-05-20",
      employee: "Siti Aminah",
      position: "Admin Finance",
      checkIn: "08:10",
      checkOut: "17:00",
      status: "PRESENT",
    },
    {
      id: "ATT-003",
      date: "2026-05-20",
      employee: "Andi Wijaya",
      position: "Driver",
      checkIn: "-",
      checkOut: "-",
      status: "ABSENT",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Attendance
          </h1>

          <p className="text-slate-500 mt-2">
            Data absensi harian karyawan.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Input Attendance
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Attendance ID</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Employee</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">Check In</th>
              <th className="p-4 text-left">Check Out</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.date}</td>
                <td className="p-4">{item.employee}</td>
                <td className="p-4">{item.position}</td>
                <td className="p-4">{item.checkIn}</td>
                <td className="p-4">{item.checkOut}</td>

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