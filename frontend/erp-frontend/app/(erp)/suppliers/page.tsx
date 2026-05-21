export default function SuppliersPage() {
  const suppliers = [
    {
      id: "SUP-001",
      name: "PT Bahan Makmur",
      phone: "0812-1111-2222",
      address: "Jakarta",
      category: "Bahan Baku",
    },
    {
      id: "SUP-002",
      name: "CV Sinar Plastik",
      phone: "0813-3333-4444",
      address: "Surabaya",
      category: "Packaging",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Suppliers
          </h1>
          <p className="text-slate-500 mt-2">
            Halaman data supplier bahan dan vendor perusahaan.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Supplier ID</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Address</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-t">
                <td className="p-4">{supplier.id}</td>
                <td className="p-4">{supplier.name}</td>
                <td className="p-4">{supplier.phone}</td>
                <td className="p-4">{supplier.address}</td>
                <td className="p-4">{supplier.category}</td>
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