import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchDietAnalysisPlan } from "../services/authService";
import { cookieManager } from "../lib/cookies";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

export const getDietAnalysisPlan = createAsyncThunk(
  "dietAnalysis/getDietAnalysisPlan",
  async ({ profileId, weekStartDate, weekEndDate }, { rejectWithValue }) => {
    try {
      const dietitianData = cookieManager.getJSON('dietician');
      const dietitianId = dietitianData?.dietician_id || null;

      const response = await fetchDietAnalysisPlan(
        profileId,
        weekStartDate,
        weekEndDate,
        dietitianId  
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch diet analysis plan"
      );
    }
  }
);

const dietAnalysisSlice = createSlice({
  name: "dietAnalysis",
  initialState,
  reducers: {
    clearDietAnalysis(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDietAnalysisPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDietAnalysisPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getDietAnalysisPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch diet analysis plan";
      });
  },
});

export const { clearDietAnalysis } = dietAnalysisSlice.actions;

export const selectDietAnalysisData = (state) => state.dietAnalysis.data;
export const selectDietAnalysisLoading = (state) => state.dietAnalysis.loading;
export const selectDietAnalysisError = (state) => state.dietAnalysis.error;

export default dietAnalysisSlice.reducer;