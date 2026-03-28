// config/fetcher.js
import { API_BASE_URL } from "./apiConfig";

export async function apiFetcher(endpoint, options = {}) {
  const { timeoutMs, ...fetchOptions } = options;

  const controller = timeoutMs ? new AbortController() : null;
  const timeoutId = timeoutMs
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller?.signal,
      headers: {
        ...(fetchOptions.headers || {}),
      },
    });

    const data = await res.json();

    const apiSaysFail = data?.ok === false || data?.success === false;

    if (!res.ok || apiSaysFail) {
      const errorMessage =
        data?.error || data?.message || `Request failed with status ${res.status}`;

      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      error.isApiError = true;
      throw error;
    }

    return data;
  } catch (error) {
    // AbortError => timeout by us
    if (error?.name === "AbortError") {
      const e = new Error(`Request timed out after ${timeoutMs} ms`);
      e.status = 408;
      e.isApiError = true;
      throw e;
    }

    if (!error.isApiError) {
      console.error("API Fetch Error:", error);
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}





// // config/fetcher.js
// import { API_BASE_URL } from "./apiConfig";

// export async function apiFetcher(endpoint, options = {}) {
//   try {
//     const res = await fetch(`${API_BASE_URL}${endpoint}`, {
//       ...options,
//       headers: {
//         ...(options.headers || {}),
//       },
//     });

//     const data = await res.json();

//     const apiSaysFail =
//       data?.ok === false || data?.success === false; // ✅ handle both styles

//     if (!res.ok || apiSaysFail) {
//       const errorMessage =
//         data?.error ||
//         data?.message ||
//         `Request failed with status ${res.status}`;

//       const error = new Error(errorMessage);
//       error.status = res.status;
//       error.data = data;
//       error.isApiError = true;
//       throw error;
//     }

//     return data;
//   } catch (error) {
//     if (!error.isApiError) {
//       console.error("API Fetch Error:", error);
//     }
//     throw error;
//   }
// }






