// // store/slices/clientsSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import Cookies from "js-cookie";
// import { apiFetcher } from "../config/fetcher";
// import { API_ENDPOINTS } from "../config/apiConfig";

// /**
//  * Reads dietician_id from a cookie named "dietician".
//  * Accepts either a raw string (like "Respyrd01") or a JSON string that contains { dietician_id: "..." }.
//  */
// function getDieticianIdFromCookie() {
//   const raw = Cookies.get("dietician");
//   if (!raw) return null;

//   try {
//     // Try JSON first
//     const parsed = JSON.parse(raw);
//     if (parsed?.dietician_id) return parsed.dietician_id;
//     if (parsed?.dieticianId) return parsed.dieticianId;
//     if (parsed?.id) return parsed.id;
//   } catch (_) {
//     // Fallback: treat cookie value as the id itself
//     if (typeof raw === "string" && raw.trim()) return raw.trim();
//   }
//   return null;
// }

// /**
//  * Thunk: fetch clients for a dietician.
//  * Body required by API:
//  *   { "dietician_id": "Respyrd01" }
//  */
// export const fetchClientsForDietician = createAsyncThunk(
//   "clients/fetchForDietician",
//   async (_, { rejectWithValue }) => {
//     const dietician_id = getDieticianIdFromCookie();
//     if (!dietician_id) {
//       return rejectWithValue("Missing dietician cookie (dietician_id).");
//     }

//     try {
//       const data = await apiFetcher(API_ENDPOINTS.CLIENT.CLIENTTABLE, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ dietician_id }),
//       });

//       // Your API returns: { success, count, data: [...] }
//       if (data?.success !== true || !Array.isArray(data?.data)) {
//         return rejectWithValue("Unexpected API response shape.");
//       }

//       return {
//         list: data.data,
//         count: Number(data.count ?? data.data.length),
//       };
//     } catch (err) {
//       const message =
//         err?.message || err?.data?.error || "Failed to fetch clients.";
//       return rejectWithValue(message);
//     }
//   }
// );

// const clientsSlice = createSlice({
//   name: "clients",
//   initialState: {
//     list: [],
//     count: 0,
//     status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchClientsForDietician.pending, (state) => {
//         state.status = "loading";
//         state.error = null;
//       })
//       .addCase(fetchClientsForDietician.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.list = action.payload.list || [];
//         state.count = action.payload.count || 0;
//       })
//       .addCase(fetchClientsForDietician.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload || "Request failed";
//       });
//   },
// });

// export default clientsSlice.reducer;















"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchClientsWithDietPlan } from "@/services/authService";


export const getClientsForDietician = createAsyncThunk(
  "clients/getClientsForDietician",
  async ({ dieticianId }, { rejectWithValue }) => {
    try {
      const res = await fetchClientsWithDietPlan(dieticianId);
      // Expected shape:
      // { success: true, count: number, data: [...] }
      if (!res?.success) {
        return rejectWithValue(res?.error || "Failed to fetch clients");
      }
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const initialState = {
  status: "idle",       // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  success: false,
  count: 0,
  data: [],            // store the array as-is (simple)
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    // handy if you want to clear state on logout, etc.
    resetClients: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClientsForDietician.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getClientsForDietician.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.success = true;
        state.count = action.payload?.count ?? 0;
        state.data = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(getClientsForDietician.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { resetClients } = clientsSlice.actions;

// Selectors (simple & reusable)
export const selectClientsStatus = (s) => s.clients.status;
export const selectClientsError = (s) => s.clients.error;
export const selectClientsCount = (s) => s.clients.count;
export const selectClients = (s) => s.clients.data;

export default clientsSlice.reducer;