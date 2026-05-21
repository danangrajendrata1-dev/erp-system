import StatusBadge from "@/components/status-badge";

export default function EmployeesPage() {
  const employees = [
    {
      id: "EMP-001",
      name: "Budi Santoso",
      position: "Operator Produksi",
      phone: "0812-1111-2222",
      salary: "Rp 3.500.000",
      status: "ACTIVE",
    },
    {
      id: "EMP-002",
      name: "Siti Aminah",
      position: "Admin Finance",
      phone: "0813-3333-4444",
      salary: "Rp 4.000.000",
      status: "ACTIVE",
    },
    {
      id: "EMP-003",
      name: "Andi Wijaya",
      position: "Driver",
      phone: "0815-5555-6666",
      salary: "Rp 3.000.000",
      status: "INACTIVE",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Employees
          </h1>

          <p className="text-slate-500 mt-2">
            Data karyawan perusahaan untuk payroll dan absensi.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Employee ID</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Salary</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t">
                <td className="p-4">{employee.id}</td>
                <td className="p-4">{employee.name}</td>
                <td className="p-4">{employee.position}</td>
                <td className="p-4">{employee.phone}</td>
                <td className="p-4">{employee.salary}</td>

                <td className="p-4">
                  <StatusBadge status={employee.status} />
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