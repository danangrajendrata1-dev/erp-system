"use client";

import { useParams } from "next/navigation";

import Invoice103DetailContent from "@/app/(erp)/invoice-103/invoice-103-detail-content";

export default function LegacyInvoice103DetailPage() {
  const params = useParams();
  const noInvoice = decodeURIComponent(String(params.no_invoice ?? ""));

  return <Invoice103DetailContent noInvoice={noInvoice} />;
}
