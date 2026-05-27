"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  Factory,
  FileArchive,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  ScrollText,
  Settings,
  ShoppingCart,
  Truck,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

type MenuItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Transaksi",
    items: [
      { title: "BKOrder", href: "/bkorder", icon: ShoppingCart },
      { title: "Sales 103", href: "/sales-103", icon: FileText },
      { title: "Invoice 103", href: "/invoice-103", icon: ReceiptText },
      { title: "Sales Order", href: "/sales-orders", icon: ClipboardList },
      { title: "Invoice Umum", href: "/invoices", icon: ScrollText },
      { title: "Delivery", href: "/delivery", icon: Truck },
    ],
  },
  {
    title: "Finance",
    items: [
      { title: "BKPt", href: "/bkpt", icon: FileArchive },
      { title: "Bank 103", href: "/bank-103", icon: Wallet },
      { title: "Finance", href: "/finance", icon: BarChart3 },
    ],
  },
  {
    title: "Produksi",
    items: [
      { title: "Production", href: "/production", icon: Factory },
      {
        title: "Production Results",
        href: "/production-results",
        icon: Boxes,
      },
      { title: "Material Usage", href: "/material-usage", icon: Package },
      { title: "Inventory", href: "/inventory", icon: Boxes },
    ],
  },
  {
    title: "Master Data",
    items: [
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Suppliers", href: "/suppliers", icon: Building2 },
      { title: "Materials", href: "/materials", icon: Package },
      { title: "Products", href: "/products", icon: Boxes },
      { title: "Employees", href: "/employees", icon: UserRound },
    ],
  },
  {
    title: "Operasional",
    items: [
      { title: "Attendance", href: "/attendance", icon: ClipboardList },
      { title: "Payroll", href: "/payroll", icon: Wallet },
      { title: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    title: "Reports",
    items: [
      { title: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

function isMenuActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <aside className="sidebar fixed left-0 top-0 z-30 flex h-screen w-[260px] flex-col border-r border-slate-200 bg-slate-50 text-slate-700 shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          ERP Client
        </p>
        <h1 className="mt-1 text-xl font-bold text-slate-950">
          ERP System
        </h1>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isMenuActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
