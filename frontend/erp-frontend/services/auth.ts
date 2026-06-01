import api, { getToken } from "./api";

type LoginResponse = {
  access_token?: string;
  token_type?: string;
  user?: {
    id?: number;
    username?: string;
    email?: string;
    role?: string;
  } | null;
};

export function getStoredToken() {
  return getToken();
}

export function clearAuthStorage() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function unwrapResponse<T>(value: T | { data?: T } | null | undefined): T | null {
  if (!value) return null;

  if (typeof value === "object" && "data" in value && value.data) {
    return value.data as T;
  }

  return value as T;
}

export const loginUser = async (
  email: string,
  password: string
) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  console.log("LOGIN RESPONSE", response.data);

  return unwrapResponse<LoginResponse>(response.data);
};

export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
  });

  return unwrapResponse(response.data);
};
