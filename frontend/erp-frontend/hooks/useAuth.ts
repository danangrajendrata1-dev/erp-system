"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { getStoredToken } from "@/services/auth";

export default function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      router.replace("/");
    }
  }, [router]);
}
