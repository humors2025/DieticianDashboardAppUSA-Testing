// progressSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchClientProfileDetails } from "@/services/authService";

// Async thunk for fetching progress data
export const fetchProgressData = createAsyncThunk(
  "progress/fetchProgressData",
  async ({ profileId, range }, { rejectWithValue }) => {
    try {
      const response = await fetchClientProfileDetails(profileId, range);
      
      if (response?.status && response?.data) {
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
        // FIXED: Normalize the data structure to handle both formats
        // This ensures that data.graphs always exists regardless of API response structure
        state.data = {
          graphs: action.payload?.graphs || action.payload?.data?.graphs || [],
          recommended_trend_range: action.payload?.recommended_trend_range || 
                                    action.payload?.data?.recommended_trend_range || 
                                    null,
          // Preserve original data if needed for debugging
          _original: action.payload
        };
        state.error = null;
      })
      .addCase(fetchProgressData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedRange, clearProgressData } = progressSlice.actions;
export default progressSlice.reducer;