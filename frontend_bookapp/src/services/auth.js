import api from "./api";
import { jwtDecode } from "jwt-decode";
import axios from "axios";


export async function login(input, password) {
  const res = await axios.post("https://bookapp-production-3e11.up.railway.app/user/login", { input, password });

  const data = res.data;
  console.log("LOGIN RESPONSE:", res.data);

  // IMPORTANT: Clear all other tokens first to prevent conflicts
  localStorage.removeItem("deliveryToken");
  localStorage.removeItem("deliveryAgent");
  localStorage.removeItem("vendorToken");
  localStorage.removeItem("vendorName");

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);

  // save only useful user info
  localStorage.setItem("user", JSON.stringify({
    id: data.user.id,
    username: data.user.username,
    email: data.user.email,
    phone: data.user.phone,
    role: data.user.role,
    address: data.user.address,
  }));

  return data;
}

export async function updateProfile(userId, data) {
  const res = await api.put(`/user/${userId}/profile`, data);
  return res.data;
}


export function logout() {
  // Clear user tokens
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // Clear delivery agent tokens
  localStorage.removeItem("deliveryToken");
  localStorage.removeItem("deliveryAgent");

  // Clear vendor tokens
  localStorage.removeItem("vendorToken");
  localStorage.removeItem("vendorName");
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");
  if (!user) return null;
  return JSON.parse(user);
}

export function isTokenExpired(token) {
  if (!token) return true;
  const decoded = jwtDecode(token);
  return decoded.exp * 1000 < Date.now();
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return logout();

  try {
    const res = await axios.post("https://bookapp-production-3e11.up.railway.app/user/refresh", {
      refreshToken
    });

    const newToken = res.data.accessToken;

    localStorage.setItem("accessToken", newToken);
    return newToken;

  } catch (err) {
    logout();
    window.location.href = "/login";
  }
}

