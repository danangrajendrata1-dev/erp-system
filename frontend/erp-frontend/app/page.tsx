"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getStoredToken, loginUser, registerUser } from "@/services/auth";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredToken();

    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  function getLoginErrorMessage(error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401) {
        return "Email atau password salah.";
      }

      if (!error.response) {
        return "Tidak dapat terhubung ke server. Silakan coba lagi.";
      }
    }

    return "Login gagal. Silakan coba lagi.";
  }

  async function handleSubmit() {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      if (isLogin) {
        let response;

        try {
          response = await loginUser(email, password);
        } catch (error) {
          console.error("LOGIN REQUEST ERROR", error);
          setError(getLoginErrorMessage(error));
          return;
        }

        console.log("LOGIN RESPONSE PARSED", response);

        if (!response?.access_token) {
          console.error("LOGIN TOKEN MISSING", response);
          setError("Login gagal. Silakan coba lagi.");
          return;
        }

        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user ?? null));
        window.dispatchEvent(new Event("storage"));

        try {
          router.replace("/dashboard");
        } catch (error) {
          console.error("LOGIN REDIRECT ERROR", error);
          setError("Login gagal. Silakan coba lagi.");
        }
        return;
      }

      await registerUser(username, email, password);
      alert("Register berhasil. Silakan login.");
      setIsLogin(true);
    } catch (error) {
      console.error("AUTH ERROR:", error);
      setError("Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 bg-[linear-gradient(180deg,#eef6ff_0%,#f8fafc_280px,#f1f5f9_100%)]">
      <div className="flex min-h-screen w-full overflow-hidden bg-white/95 backdrop-blur">
        <section className="relative hidden w-[48%] overflow-hidden bg-slate-950 px-12 py-12 text-white md:flex md:flex-col md:justify-between lg:px-16 lg:py-14">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))]" />
          <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_62%)]" />
          <div className="absolute -left-16 top-20 h-48 w-48 rounded-full border border-white/10 bg-white/5 blur-2xl" />
          <div className="absolute bottom-10 right-8 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-sky-400/15 px-3 py-2 text-sm font-bold tracking-[0.22em] text-sky-100">
                ERP
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight text-white">
                  ERP SYSTEM
                </p>
                <p className="text-sm text-slate-300">
                  Sistem Operasional Perusahaan
                </p>
              </div>
            </div>

            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/90">
              Secure Access Portal
            </p>

            <h1 className="max-w-md text-4xl font-bold leading-tight text-white">
              {isLogin
                ? "Kelola operasional order, penjualan, piutang, dan bank dalam satu sistem."
                : "Siapkan akun tim untuk mulai memakai sistem ERP dengan alur yang rapi."}
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
              {isLogin
                ? "Tampilan dibuat tenang, rapi, dan mudah dipakai untuk kebutuhan ERP perusahaan kecil hingga menengah."
                : "Pendaftaran akun tetap sederhana agar onboarding tim internal lebih cepat dan mudah dikendalikan."}
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Workflow
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  BKOrder, Sales 103, Invoice 103, BKPt, dan Bank 103 dalam satu alur kerja.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Monitoring
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Tampilan yang rapi untuk memantau transaksi harian dan data operasional.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-5 text-xs text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span>ERP Internal System</span>
              <span>Secure Access</span>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-col justify-center bg-transparent px-5 py-8 sm:px-8 md:w-[52%] md:px-12 md:py-10 lg:px-16">
          <div className="mb-6 rounded-[28px] border border-slate-200/70 bg-slate-900 p-6 text-white shadow-lg md:hidden">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-sky-400/15 px-3 py-2 text-sm font-bold tracking-[0.18em] text-sky-100">
                ERP
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">Arianto ERP</p>
                <p className="text-sm text-slate-300">
                  Sistem Operasional Perusahaan
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              {isLogin
                ? "Masuk ke sistem untuk mengelola order, invoice, piutang, dan alur ERP harian."
                : "Buat akun internal baru untuk mulai memakai sistem ERP dengan akses yang lebih teratur."}
            </p>
          </div>

          <div className="mx-auto w-full max-w-xl rounded-[28px] border border-slate-200/80 bg-white px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:px-8 sm:py-8">
            <div className="mb-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-500">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                disabled={loading}
                className={`rounded-full px-4 py-2 transition ${
                  isLogin
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                disabled={loading}
                className={`rounded-full px-4 py-2 transition ${
                  !isLogin
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Register
              </button>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {isLogin ? "Selamat Datang Kembali" : "Buat Akun Baru"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isLogin
                ? "Masukkan email dan password untuk mengakses sistem ERP."
                : "Lengkapi data akun untuk masuk ke sistem ERP."}
            </p>
            

            <div className="mt-8 space-y-5">
              {!isLogin && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Masukkan username"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Password
                  </label>
                  {isLogin && (
                    <span className="text-xs font-medium text-sky-700">
                      Akses internal perusahaan
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading
                  ? "Memproses..."
                  : isLogin
                    ? "Masuk ke Sistem"
                    : "Daftarkan Akun"}
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-slate-500">
              <span>
                {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                disabled={loading}
                className="font-semibold text-sky-700 transition hover:text-sky-800 disabled:text-slate-400"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </div>

            <div className="mt-8 text-center text-xs text-slate-400">
              <p>Dilindungi dengan sesi login terenkripsi.</p>
              <p className="mt-1">ERP SYSTEM 2026</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
