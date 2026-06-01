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

  const handleSubmit = async () => {
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
    } catch (err) {
      console.error("AUTH ERROR:", err);
      setError("Login gagal. Silakan coba lagi.");
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
          disabled={loading}
          className="mt-4 text-sm text-blue-500"
        >
          {isLogin ? "Belum punya akun? Register" : "Sudah punya akun? Login"}
        </button>
      </div>
    </div>
  );
}
