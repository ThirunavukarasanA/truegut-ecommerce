let refreshPromise = null;

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
     const controller = new AbortController();
     const id = setTimeout(() => controller.abort(), timeoutMs);

     try {
          return await fetch(url, { ...options, signal: controller.signal });
     } finally {
          clearTimeout(id);
     }
}

/**
 * Safely parse response (JSON, text, or empty)
 */
async function parseResponse(response) {
     if (response.status === 204) return null;

     const contentType = response.headers.get("content-type") || "";

     if (contentType.includes("application/json")) {
          return await response.json();
     }

     const text = await response.text();
     return text || null;
}

/**
 * Refresh session (single shared promise)
 */
async function refreshSession() {
     if (!refreshPromise) {
          refreshPromise = (async () => {
               const res = await fetch("/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
               });

               if (!res.ok) {
                    throw new Error("Session refresh failed");
               }

               return true;
          })().finally(() => {
               refreshPromise = null;
          });
     }

     return refreshPromise;
}

/**
 * Handle forced logout + redirect
 */
async function handleUnauthorized() {
     try {
          await fetch("/api/auth/logout", {
               method: "POST",
               credentials: "include",
          });
     } catch (err) {
          console.error("Logout failed:", err);
     }

     if (typeof window !== "undefined") {
          window.location.href = "/admin";
     }
}

/**
 * Admin API Fetch Utility
 */
export async function adminFetch(url, options = {}, config = {}) {
     const {
          timeout = 30000,
          retryOnUnauthorized = true,
     } = config;

     const headers = { ...(options.headers || {}) };

     // Only set JSON content-type if not FormData
     if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
          headers["Content-Type"] = "application/json";
     }

     const finalOptions = {
          ...options,
          headers,
          credentials: "include",
     };

     let response;

     try {
          response = await fetchWithTimeout(url, finalOptions, timeout);
     } catch (err) {
          if (err.name === "AbortError") {
               throw new Error("Request timed out");
          }
          throw new Error("Network error - Please check your connection");
     }

     const data = await parseResponse(response);

     // ---------- Handle 401 Unauthorized ----------
     if (response.status === 401) {
          const message =
               (data && (data.error || data.message)) || "Unauthorized";

          // If refresh endpoint itself failed OR already retried -> force logout
          if (url.includes("/api/auth/refresh") || !retryOnUnauthorized) {
               await handleUnauthorized();
               throw new Error(message); // e.g. "User not found", "Unauthorized"
          }

          // Try refresh once
          try {
               await refreshSession();
               return adminFetch(url, options, {
                    ...config,
                    retryOnUnauthorized: false,
               });
          } catch (err) {
               await handleUnauthorized();
               throw new Error(message);
          }
     }

     // ---------- Handle 403 Forbidden ----------
     if (response.status === 403) {
          const message =
               (data && (data.error || data.message)) || "Forbidden";
          throw new Error(message);
     }

     // ---------- Handle 404 Not Found ----------
     if (response.status === 404) {
          const message =
               (data && (data.error || data.message)) || "Not found";
          throw new Error(message);
     }

     // ---------- Other non-OK responses ----------
     if (!response.ok) {
          const message =
               (data && (data.error || data.message)) ||
               `HTTP ${response.status}: ${response.statusText}`;
          throw new Error(message);
     }

     return data;
}

/**
 * Admin API Fetch with Toast notifications
 */
export async function adminFetchWithToast(
     url,
     options = {},
     toastOptions = {},
     toast
) {
     const {
          loading = "Processing...",
          success = "Success!",
          error: errorPrefix = "Error",
     } = toastOptions;

     const toastId = toast?.loading(loading);

     try {
          const data = await adminFetch(url, options);

          if (toast && toastId) {
               toast.success(success, { id: toastId });
          }

          return data;
     } catch (error) {
          if (toast && toastId) {
               toast.error(`${errorPrefix}: ${error.message}`, { id: toastId });
          }
          throw error;
     }
}

