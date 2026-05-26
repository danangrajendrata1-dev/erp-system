"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Invoice103RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sales-103");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Mengarahkan ke halaman 103 / Buku Penjualan...
        </p>
      </div>
    </div>
  );
}