"use client";

import { useParams } from "next/navigation";

import Invoice103DetailContent from "@/app/(erp)/invoice-103/invoice-103-detail-content";

export default function Invoice103DetailByPeriodPage() {
  const params = useParams();
  const year = Number(params.year);
  const month = Number(params.month);
  const noInvoice = decodeURIComponent(String(params.no_invoice ?? ""));

  return (
    <Invoice103DetailContent
      noInvoice={noInvoice}
      year={Number.isFinite(year) ? year : null}
      month={Number.isFinite(month) ? month : null}
    />
  );
}
