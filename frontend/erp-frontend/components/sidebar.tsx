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
  Layers,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  // Daftar menu utama ERP. Href ini menentukan route yang dibuka saat menu diklik.
  const menus = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "BKOrder", href: "/bkorder", icon: ShoppingCart },
  { title: "103", href: "/sales-103", icon: FileText },
  { title: "BKPt", href: "/bkpt", icon: FileText },
  { title: "Bank 103", href: "/bank-103", icon: Wallet },
  { title: "Jenis Bahan", href: "/materials", icon: Layers },
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
