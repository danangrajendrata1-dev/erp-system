"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/services/auth";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setError("");

      if (isLogin) {
        const response = await loginUser(email, password);

        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));

        router.push("/dashboard");
      } else {
        await registerUser(username, email, password);

        alert("Register berhasil. Silakan login.");
        setIsLogin(true);
      }
    } catch {
      setError("Proses gagal. Cek email/password atau backend.");
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
          className="w-full bg-black text-white p-3 rounded-lg"
        >
          {isLogin ? "Login" : "Register"}
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