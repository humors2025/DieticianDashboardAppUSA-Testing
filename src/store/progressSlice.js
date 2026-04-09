// progressSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchClientProfileDetails } from "@/services/authService";
import { cookieManager } from "../lib/cookies";

export const fetchProgressData = createAsyncThunk(
  "progress/fetchProgressData",
  async ({ profileId, range }, { rejectWithValue }) => {
    try {
      const dietitian = cookieManager.getJSON("dietician");
      const dietitianId = dietitian?.dietician_id;

      if (!dietitianId) {
        return rejectWithValue("Dietitian ID not found in cookies");
      }

      const response = await fetchClientProfileDetails(profileId, range, dietitianId);

      if (response?.status && response?.data) {
        // Return the full data structure including graphs
        return response.data;
      } else {
        return rejectWithValue(response?.message || "Failed to fetch data");
      }
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while fetching data");
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  selectedRange: "weekly",
};

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    setSelectedRange: (state, action) => {
      state.selectedRange = action.payload;
    },
    clearProgressData: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgressData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgressData.fulfilled, (state, action) => {
        state.loading = false;
        // Store the complete data structure
        state.data = {
          dietitian_id: action.payload?.dietitian_id || "",
          profile_id: action.payload?.profile_id || "",
          range: action.payload?.range || "",
          range_label: action.payload?.range_label || "",
          graphs: action.payload?.graphs || {}, // Store graphs object
        };
        state.error = null;
      })
      .addCase(fetchProgressData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch progress data";
      });
  },
});

export const { setSelectedRange, clearProgressData } = progressSlice.actions;
export default progressSlice.reducer;