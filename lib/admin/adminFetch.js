/**
 * Admin API Fetch Utility
 * 
 * Centralized fetch wrapper for admin API calls with automatic authentication handling.
 * Handles 401 errors by logging out and redirecting to login page.
 * 
 * @param {string} url - The API endpoint URL
 * @param {RequestInit} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} - Parsed JSON response
 * @throws {Error} - Throws error for non-2xx responses (except 401 which redirects)
 */
// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
     failedQueue.forEach(prom => {
          if (error) {
               prom.reject(error);
          } else {
               prom.resolve(token);
          }
     });
     failedQueue = [];
};

export async function adminFetch(url, options = {}) {
     // Prepare headers
     const headers = { ...options.headers };

     // Only set Content-Type to application/json if not already set and body is not FormData
     if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
          headers['Content-Type'] = 'application/json';
     }

     try {
          // Make the API request
          let response = await fetch(url, {
               ...options,
               credentials: 'include', // Ensure cookies are sent
               headers,
          });

          // Handle 401 Unauthorized - Session expired or invalid
          if (response.status === 401) {
               // Prevent infinite loops if the refresh endpoint itself returns 401
               if (url.includes('/api/auth/refresh')) {
                    throw new Error('Unauthorized - Redirecting to login');
               }

               if (!isRefreshing) {
                    isRefreshing = true;

                    try {
                         // Attempt to refresh the token
                         const refreshResponse = await fetch('/api/auth/refresh', {
                              method: 'POST',
                              credentials: 'include',
                         });

                         if (refreshResponse.ok) {
                              isRefreshing = false;
                              processQueue(null);

                              // Retry the original request
                              return adminFetch(url, options);
                         } else {
                              throw new Error('Refresh failed');
                         }
                    } catch (error) {
                         isRefreshing = false;
                         processQueue(error, null);
                         await handleUnauthorized();
                         throw new Error('Unauthorized - Redirecting to login');
                    }
               } else {
                    // If already refreshing, queue this request
                    return new Promise((resolve, reject) => {
                         failedQueue.push({ resolve, reject });
                    }).then(() => {
                         return adminFetch(url, options);
                    }).catch(err => {
                         throw err;
                    });
               }
          }

          // Parse JSON response
          const data = await response.json();

          // Handle non-2xx responses
          if (!response.ok) {
               throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
          }

          return data;
     } catch (error) {
          // If it's a network error or JSON parse error
          if (error.message === 'Unauthorized - Redirecting to login') {
               throw error; // Re-throw to prevent further processing
          }

          // Handle network errors
          if (error instanceof TypeError && error.message.includes('fetch')) {
               throw new Error('Network error - Please check your connection');
          }

          // Re-throw other errors
          throw error;
     }
}

/**
 * Handle unauthorized access (401 errors)
 * Calls logout API to clear server cookies and redirects to login
 */
async function handleUnauthorized() {
     try {
          // Call logout API to clear server-side session/cookies
          await fetch('/api/auth/logout', {
               method: 'POST',
               credentials: 'include',
          });
     } catch (error) {
          // Even if logout fails, we still redirect
          console.error('Logout API failed:', error);
     }

     // Clear any client-side storage if needed
     if (typeof window !== 'undefined') {
          // Redirect to login page
          window.location.href = '/admin';
     }
}

/**
 * Admin API Fetch with Toast notifications
 * 
 * Wrapper around adminFetch that automatically shows toast notifications
 * for loading, success, and error states.
 * 
 * @param {string} url - The API endpoint URL
 * @param {RequestInit} options - Fetch options
 * @param {Object} toastOptions - Toast configuration
 * @param {string} toastOptions.loading - Loading message
 * @param {string} toastOptions.success - Success message
 * @param {string} toastOptions.error - Error message prefix
 * @param {Function} toast - Toast function from react-hot-toast
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function adminFetchWithToast(url, options = {}, toastOptions = {}, toast) {
     const {
          loading = 'Processing...',
          success = 'Success!',
          error: errorPrefix = 'Error',
     } = toastOptions;

     const toastId = toast?.loading(loading);

     try {
          const data = await adminFetch(url, options);

          if (toast && toastId) {
               toast.success(success, { id: toastId });
          }

          return data;
     } catch (error) {
          if (toast && toastId && error.message !== 'Unauthorized - Redirecting to login') {
               toast.error(`${errorPrefix}: ${error.message}`, { id: toastId });
          }
          throw error;
     }
}
