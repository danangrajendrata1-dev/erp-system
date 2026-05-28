"use client";

import { useState } from "react";
import { loginUser, registerUser } from "@/services/auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      if (isLogin) {
        const response = await loginUser(email, password);

        if (!response?.access_token) {
          setError("Login gagal. Token tidak diterima dari server.");
          return;
        }

        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user ?? null));

        window.location.href = "/dashboard";
        return;
      }

      await registerUser(username, email, password);

      alert("Register berhasil. Silakan login.");
      setIsLogin(true);
    } catch (err) {
      console.error("AUTH ERROR:", err);
      setError("Proses gagal. Cek email/password atau backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[360px]">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "ERP Login" : "ERP Register"}
        </h1>

        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            className="w-full border p-3 rounded-lg mb-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-black p-3 text-white transition disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {loading ? "Memproses..." : isLogin ? "Login" : "Register"}
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-blue-500"
        >
          {isLogin ? "Belum punya akun? Register" : "Sudah punya akun? Login"}
        </button>
      </div>
    </div>
  );
}
