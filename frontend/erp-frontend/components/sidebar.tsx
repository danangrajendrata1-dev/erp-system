"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  ClipboardList,
  Factory,
  Truck,
  FileText,
  Wallet,
  UserRound,
  Building2,
  LogOut,
  BarChart3,
  Settings,
  Bell,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const menus = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Production", href: "/production", icon: Factory },
    { title: "Sales Order", href: "/sales-orders", icon: FileText },
    { title: "Customers", href: "/customers", icon: Users },
    { title: "Suppliers", href: "/suppliers", icon: Building2 },
    { title: "Inventory / Bahan", href: "/inventory", icon: Package },
    { title: "Products", href: "/products", icon: Package },
    { title: "BKOrder", href: "/purchase-orders", icon: ShoppingCart },
    { title: "103", href: "/sales-103", icon: FileText },
    { title: "BKPt", href: "/bkpt", icon: FileText },
    { title: "Invoice 103", href: "/invoice-103", icon: FileText },
    { title: "Bahan Terpakai", href: "/material-usage", icon: ClipboardList },
    { title: "Hasil Produksi", href: "/production-results", icon: Factory },
    { title: "Pengiriman", href: "/delivery", icon: Truck },
    { title: "Invoice", href: "/invoices", icon: FileText },
    { title: "Finance / Kas", href: "/finance", icon: Wallet },
    { title: "Employees", href: "/employees", icon: UserRound },
    { title: "Attendance", href: "/attendance", icon: ClipboardList },
    { title: "Payroll", href: "/payroll", icon: UserRound },
    { title: "Reports", href: "/reports", icon: BarChart3 },
    { title: "Settings", href: "/settings", icon: Settings },
    { title: "Notifications", href: "/notifications", icon: Bell },
  ];

  return (
    <aside className="w-[260px] h-screen bg-black text-white p-5 fixed left-0 top-0 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-8">
        ERP SYSTEM
      </h1>

      <nav className="flex flex-col gap-3">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                isActive
                  ? "bg-white text-black"
                  : "hover:bg-white/10"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">
                {menu.title}
              </span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-white/10 mt-6"
        >
          <LogOut size={18} />
          <span className="text-sm">
            Logout
          </span>
        </button>
      </nav>
    </aside>
  );
}