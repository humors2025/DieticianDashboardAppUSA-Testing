
import { configureStore } from "@reduxjs/toolkit";
import clientsReducer from "./clientSlice";
import pdfReducer  from "./pdfSlice";
import extractedDataReducer from "./extractedDataSlice";
import clientProfileReducer from "./clientProfileSlice";
import scoresInsightReducer from "./scoresInsightSlice";
import extractionReducer from './extractionSlice';
import dateReducer from "./dateSlice";
import clientsDashboardReducer from "./clientsDashboardSlice";

export const store = configureStore({
  reducer: {
    clients: clientsReducer,
      clients: clientsDashboardReducer,
      pdf: pdfReducer,
      extractedData: extractedDataReducer,
       clientProfile: clientProfileReducer,
       scoresInsight: scoresInsightReducer,
      extraction: extractionReducer,
      date: dateReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['pdf/setUploadedFile'],
        ignoredPaths: ['pdf.uploadedFile'],
      },
    }),

});

