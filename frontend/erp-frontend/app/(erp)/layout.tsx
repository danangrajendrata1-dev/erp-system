"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/sidebar";
import TopNavbar from "@/components/top-navbar";
import Footer from "@/components/footer";
import { getStoredToken } from "@/services/auth";

export default function ErpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      router.replace("/");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Memuat dashboard...
      </div>
    );
  }

  return (
    <div>
      <Sidebar />

      <main className="ml-[260px] min-h-screen bg-slate-100 bg-[linear-gradient(180deg,#eef6ff_0%,#f8fafc_280px,#f1f5f9_100%)]">
        <TopNavbar />

        {children}

        <Footer />
      </main>
    </div>
  );
}
