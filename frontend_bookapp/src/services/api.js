import axios from "axios";
import { logout } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "https://bookapp-production-3e11.up.railway.app",
});

// -----------------------------------------------------------
// REQUEST INTERCEPTOR (Attach correct token automatically)
// -----------------------------------------------------------
api.interceptors.request.use((config) => {
  const deliveryToken = localStorage.getItem("deliveryToken");
  const vendorToken = localStorage.getItem("vendorToken");
  const userToken = localStorage.getItem("accessToken");

  // DELIVERY AGENT TOKEN HAS FIRST PRIORITY
  if (deliveryToken) {
    config.headers.Authorization = `Bearer ${deliveryToken}`;
  }
  // VENDOR TOKEN SECOND PRIORITY
  else if (vendorToken) {
    config.headers.Authorization = `Bearer ${vendorToken}`;
  }
  // NORMAL USER TOKEN LAST PRIORITY
  else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

// -----------------------------------------------------------
// RESPONSE INTERCEPTOR (Handles user token refresh only)
// -----------------------------------------------------------
api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) return Promise.reject(error);

    const status = error.response.status;

    // -----------------------------------------------
    // Prevent infinite retry loop
    // -----------------------------------------------
    if (originalRequest._retry) {
      logout();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // -----------------------------------------------
    // If delivery token is expired/invalid (401 OR 403) †’ log out
    // -----------------------------------------------
    if (status === 401 || status === 403) {
      if (localStorage.getItem("deliveryToken")) {
        console.warn("▲ Delivery session invalid (401/403).");
        console.warn("Logging out.");

        localStorage.removeItem("deliveryToken");
        localStorage.removeItem("deliveryAgent");

        window.location.replace("/login");
        return Promise.reject(error);
      }

      if (localStorage.getItem("vendorToken")) {
        console.warn("▲ Vendor session invalid (401/403).");
        console.warn("Logging out.");

        localStorage.removeItem("vendorToken");
        localStorage.removeItem("vendorName");

        window.location.replace("/login");
        return Promise.reject(error);
      }

      // -----------------------------------------------
      // IF NORMAL USER †’ USE REFRESH TOKEN
      // -----------------------------------------------
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        window.location.replace("/login");
        return Promise.reject(error);
      }

      try {
        originalRequest._retry = true;

        const res = await axios.post(
          "https://bookapp-production-3e11.up.railway.app/user/refresh",
          { refreshToken }
        );

        const newToken = res.data.accessToken;

        // Save updated token
        localStorage.setItem("accessToken", newToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        logout();
        window.location.replace("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;


