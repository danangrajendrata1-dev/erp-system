"use client";

import {
  FileText,
  Package,
  Truck,
  Wallet,
  Factory,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const cards = [
    { title: "Sales Order", value: "24", icon: FileText },
    { title: "Customers", value: "120", icon: Users },
    { title: "Inventory / Bahan", value: "85", icon: Package },
    { title: "Invoice", value: "12", icon: FileText },
    { title: "Pengiriman", value: "8", icon: Truck },
    { title: "Kas Masuk", value: "Rp 25.000.000", icon: Wallet },
    { title: "Produksi Aktif", value: "18", icon: Factory },
  ];

  const flows = [
    "Sales Order",
    "Purchase Order",
    "Material Usage",
    "Production",
    "Delivery",
    "Invoice",
    "Finance",
    "Payroll",
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        ERP Dashboard
      </h1>

      <p className="text-slate-500 mt-2 mb-6">
        Ringkasan aktivitas perusahaan
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    {card.title}
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    {card.value}
                  </h2>
                </div>

                <div className="bg-slate-100 p-3 rounded-xl">
                  <Icon size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          ERP Business Flow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {flows.map((step, index) => (
            <div
              key={step}
              className="border rounded-xl p-4 bg-slate-50"
            >
              <p className="text-sm text-slate-400">
                Step {index + 1}
              </p>

              <h3 className="font-semibold mt-1">
                {step}
              </h3>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-2">
            Aktivitas Hari Ini
          </h2>

          <p className="text-slate-500">
            Nanti bagian ini akan menampilkan order masuk, invoice terbaru,
            bahan terpakai, dan pengiriman hari ini.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-2">
            Status Produksi
          </h2>

          <p className="text-slate-500">
            Nanti bagian ini akan menampilkan progress produksi dari setiap
            sales order.
          </p>
        </div>
      </div>
    </div>
  );
}
