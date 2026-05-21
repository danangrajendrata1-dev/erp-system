import StatusBadge from "@/components/status-badge";

export default function ProductsPage() {
  const products = [
    {
      code: "PRD-001",
      name: "Banner 3x1",
      category: "Printing",
      stock: "120",
      unit: "Pcs",
      price: "Rp 75.000",
      status: "READY",
    },
    {
      code: "PRD-002",
      name: "Sticker Label",
      category: "Sticker",
      stock: "0",
      unit: "Pcs",
      price: "Rp 500",
      status: "OUT STOCK",
    },
    {
      code: "PRD-003",
      name: "Standing Banner",
      category: "Display",
      stock: "15",
      unit: "Pcs",
      price: "Rp 250.000",
      status: "READY",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Master Product
          </h1>

          <p className="text-slate-500 mt-2">
            Data master barang dan produk perusahaan.
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-lg">
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Unit</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.code} className="border-t">
                <td className="p-4">{product.code}</td>
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">{product.unit}</td>
                <td className="p-4">{product.price}</td>

                <td className="p-4">
                  <StatusBadge status={product.status} />
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