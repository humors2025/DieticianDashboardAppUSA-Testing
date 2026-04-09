
// services/authService.js

import { apiFetcher } from "../config/fetcher";
import { API_ENDPOINTS } from "../config/apiConfig";


export const loginService = async (email, password) => {
  return apiFetcher(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    body: JSON.stringify({
      identifier: email,
      password: password,
    }),
  });
};

export const sendOtpService = async (email) => {
  return apiFetcher(API_ENDPOINTS.AUTH.SEND_OTP, {
    method: "POST",
    body: JSON.stringify({
      email: email,
    }),
  });
};


export const updatePasswordService = async (dieticianId, password) => {
  return apiFetcher(API_ENDPOINTS.AUTH.UPDATEPASSWORDSERVICE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietician_id: dieticianId,
      password: password,
    }),
  });
};



export const resetPasswordService = async (email, password) => {
  return apiFetcher(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
    method: "POST",
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });
};


export const updateDietPlanStatusService = async (dieticianId) => {
  return apiFetcher(API_ENDPOINTS.AUTH.DIETPLANSTATUS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietitian_id: dieticianId,
    }),
  });
};


export const fetchClientsWithDietPlan = async (dieticianId) => {
  return apiFetcher(API_ENDPOINTS.CLIENT.CLIENTTABLE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietician_id: dieticianId,
    }),
  });
};





export const fetchScoreTrend = async (dieticianId, profileId, mode) => {
  return apiFetcher(API_ENDPOINTS.PROFILESCOREANALYSIS.GRAPH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietitian_id: dieticianId,
      profile_id: profileId,
      // dietitian_id: "RespyrD02",
      // profile_id: "profile3",
      //mode: mode.toLowerCase(), 
    }),
  });
};  



export const fetchScoresInsight = async (dieticianId, profileId, date) => {
  try {
    const response = await apiFetcher(API_ENDPOINTS.PROFILESCOREANALYSIS.SCORESINSIGHT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dietician_id: dieticianId,
        profile_id: profileId,
        date: date,
      }),
    });

    return response;
  } catch (error) {
    // If it's the "no data" error, return a special object instead of throwing
    if (error.message === "No test_data found for given inputs") {
      return { noData: true, message: error.message };
    }
    // Re-throw other errors
    throw error;
  }
};




export const submitPlanSummaryService = async (planData) => {
  return apiFetcher(API_ENDPOINTS.PLAN.PLANSUMMARYFORM, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(planData),
  });
};



export const fetchClientProfileData = async (dieticianId, profileId) => {
  return apiFetcher(API_ENDPOINTS.CLIENTPROFILE.CLIENTPROFILEDATA, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietician_id: dieticianId,
      profile_id: profileId,
    }),
  });
};




// export const fetchWeeklyAnalysisComplete = async (requestData) => {
//   return apiFetcher(API_ENDPOINTS.MEALANALYSIS.WEEKLYANALYSISCOMPLETE, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(requestData),
//   });
// };

export const checkWeeklyAnalysisService = async (dieticianId, profileId, startDate, endDate) => {
  return apiFetcher(API_ENDPOINTS.MEALANALYSIS.CHECKWEEKLYANALYSIS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietician_id: dieticianId,
      profile_id: profileId,
      start_date: startDate,
      end_date: endDate,
    }),
  });
};


export const saveWeeklyFoodJson = async (dietitian_id, profile_id, start_date, end_date, food_json) => {
  return apiFetcher(API_ENDPOINTS.MEALANALYSIS.ADDFOOD, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietitian_id: dietitian_id,
      profile_id: profile_id,
      start_date: start_date,
      end_date: end_date,
      food_json: food_json,
    }),
  });
};


// services/authService.js

export const fetchSavedWeeklyFoodJson = async (profileId, startDate, endDate, dieticianId = null) => {
  // Build query parameters
  const params = new URLSearchParams();
  params.append('profile_id', profileId);
  params.append('start_date', startDate);
  params.append('end_date', endDate);
  
  // Add dietitian_id if provided
  if (dieticianId) {
    params.append('dietician_id', dieticianId);
  }
  
  // Make GET request with query parameters
  const url = `${API_ENDPOINTS.MEALANALYSIS.GETFOOD}?${params.toString()}`;
  
  try {
    const response = await apiFetcher(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    return response;
  } catch (error) {
    // Check if it's the "no data found" error
    if (error.message?.includes("No data found") || 
        error.data?.message?.includes("No data found") ||
        error.message === "Weekly food data not found") {
      
      // Return a special response object instead of throwing
      return { 
        success: false, 
        noData: true, 
        message: "No data found for this week" 
      };
    }
    
    // Re-throw other errors
    throw error;
  }
};

  
export const fetchWeeklyAnalysisComplete1 = async (requestData) => {
  return apiFetcher(API_ENDPOINTS.MEALANALYSIS.WEEKLYANALYSISCOMPLETE1, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
      timeoutMs: 180000,
  });
};



export const fetchDashboardTableCards = async (dieticianId) => {
  return apiFetcher(API_ENDPOINTS.DASHBOARD.TABLECARDS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietician_id: dieticianId,
    }),
  });
};



export const fetchTestAnalytics = async (dieticianId, date = "") => {
  return apiFetcher(API_ENDPOINTS.DASHBOARD.TESTANALYTICS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietitian_id: dieticianId,
      date: date,
    }),
  });
};



export const fetchTestRemaining = async (dieticianId) => {
  return apiFetcher(API_ENDPOINTS.TESTINFO.TESTREMAINING, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietitian_id: dieticianId,
    }),
  });
};



export const fetchClientLog = async (dieticianId, clientId) => {
  return apiFetcher(API_ENDPOINTS.PLANHISTORY.CLIENTLOG, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietitian_id: dieticianId,
      client_id: clientId,
    }),
  });
};



export const updateDietPlanJsonService = async (login_id, profile_id, diet_plan_id, diet_json) => {
  return apiFetcher(API_ENDPOINTS.PLAN.DIETPLAN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login_id: login_id,
      profile_id: profile_id,
      diet_plan_id: diet_plan_id,
      diet_json: JSON.stringify(diet_json), 
    }),
  });
};



export const fetchDietPlanJsonService = async (login_id, profile_id, diet_plan_id) => {
  return apiFetcher(API_ENDPOINTS.PLAN.DIETPLANJSON, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login_id: login_id,
      profile_id: profile_id,
      diet_plan_id: diet_plan_id,
    }),
  });
};




export const deleteDietPlanService = async (dietPlanId, clientId, dietitianId) => {
  return apiFetcher(API_ENDPOINTS.PLAN.DELETEDIETPLAN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      diet_plan_id: String(dietPlanId),
      client_id: String(clientId),
      dietitian_id: String(dietitianId),
    }),
  });
};



export const fetchClientsDashboard = async (
  dieticianId,
  type = "all",
  page = 1,
  date
) => {
  return apiFetcher(API_ENDPOINTS.CLIENT.CLIENTS_DASHBOARD, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietician_id: dieticianId,
      type: type,
      page: page,
      date: date,  
    }),
  });
};


export const fetchCalendarData = async (dieticianId) => {
  return apiFetcher(API_ENDPOINTS.CALENDER.CALENDERTABLE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietician_id: dieticianId,
    }),
  });
};



export const fetchClientProfileDetails = async (profileId, range) => {
  // Add validation to ensure range is not undefined
  if (!range) {
    range = "weekly"; // fallback to weekly if undefined
  }
  
  const url = `${API_ENDPOINTS.CLIENTPROFILE.CLIENTPROFILEDETAILS}?profile_id=${profileId}&range=${range}`;
  
  return apiFetcher(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};



export const fetchClientIndividualProfile = async (profileId, date) => {
  return apiFetcher(API_ENDPOINTS.CLIENTPROFILE.CLIENTINDIVIDUALPROFILE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      profile_id: profileId,
      date: date,
    }),
  });
};



// Add to authService.js
export const fetchClientProfileDatesList = async (profileId) => {
  return apiFetcher(API_ENDPOINTS.CLIENTPROFILE.CLIENTPROFILEDATESLIST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      profile_id: profileId,
    }),
  });
};



export const searchClientsService = async (dieticianId, searchTerm) => {
  return apiFetcher(API_ENDPOINTS.SEARCH.SEARCHCLIENT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dietician_id: dieticianId,
      search: searchTerm,
    }),
  });
};



export const fetchDietAnalysisPlan = async (
  profileId,
  weekStartDate,
  weekEndDate
) => {
  return apiFetcher(API_ENDPOINTS.DIETANALYSIS.DIETANALYSISPLAN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      profile_id: profileId,
      week_start_date: weekStartDate,
      week_end_date: weekEndDate,
    }),
  });
};


export const fetchClientWeeklyDates = async (profileId) => {
  try {
    const response = await apiFetcher(API_ENDPOINTS.CLIENTPROFILE.CLIENTWEEKLYDATES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile_id: profileId,
      }),
    });
    
    return response;
  } catch (error) {
    // Check if it's the "no weekly data found" error
    if (error.message?.includes("No weekly data found") || 
        error.data?.message?.includes("No weekly data found")) {
      // Return a special response object instead of throwing
      return { 
        status: false, 
        message: error.message || "No weekly data found for last 3 months",
        profile_id: profileId
      };
    }
    // Re-throw other errors
    throw error;
  }
};




// // services/authService.js

// import { apiFetcher } from "../config/fetcher";
// import { API_ENDPOINTS } from "../config/apiConfig";


// export const loginService = async (email, password) => {
//   return apiFetcher(API_ENDPOINTS.AUTH.LOGIN, {
//     method: "POST",
//     body: JSON.stringify({
//       identifier: email,
//       password: password,
//     }),
//   });
// };

// export const sendOtpService = async (email) => {
//   return apiFetcher(API_ENDPOINTS.AUTH.SEND_OTP, {
//     method: "POST",
//     body: JSON.stringify({
//       email: email,
//     }),
//   });
// };

// export const resetPasswordService = async (email, password) => {
//   return apiFetcher(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
//     method: "POST",
//     body: JSON.stringify({
//       email: email,
//       password: password,
//     }),
//   });
// };


// export const updateDietPlanStatusService = async (dieticianId) => {
//   return apiFetcher(API_ENDPOINTS.AUTH.DIETPLANSTATUS, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       dietitian_id: dieticianId,
//     }),
//   });
// };


// export const fetchClientsWithDietPlan = async (dieticianId) => {
//   return apiFetcher(API_ENDPOINTS.CLIENT.CLIENTTABLE, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       dietician_id: dieticianId,
//     }),
//   });
// };





// export const fetchScoreTrend = async (dieticianId, profileId, mode) => {
//   return apiFetcher(API_ENDPOINTS.PROFILESCOREANALYSIS.GRAPH, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       dietitian_id: dieticianId,
//       profile_id: profileId,
//       // dietitian_id: "RespyrD02",
//       // profile_id: "profile3",
//       //mode: mode.toLowerCase(), 
//     }),
//   });
// };  



// export const fetchScoresInsight = async (dieticianId, profileId, date) => {
//   try {
//     const response = await apiFetcher(API_ENDPOINTS.PROFILESCOREANALYSIS.SCORESINSIGHT, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         dietician_id: dieticianId,
//         profile_id: profileId,
//         date: date,
//       }),
//     });

//     return response;
//   } catch (error) {
//     // If it's the "no data" error, return a special object instead of throwing
//     if (error.message === "No test_data found for given inputs") {
//       return { noData: true, message: error.message };
//     }
//     // Re-throw other errors
//     throw error;
//   }
// };




// export const submitPlanSummaryService = async (planData) => {
//   return apiFetcher(API_ENDPOINTS.PLAN.PLANSUMMARYFORM, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(planData),
//   });
// };



// export const fetchClientProfileData = async (dieticianId, profileId) => {
//   return apiFetcher(API_ENDPOINTS.CLIENTPROFILE.CLIENTPROFILEDATA, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       dietician_id: dieticianId,
//       profile_id: profileId,
//     }),
//   });
// };




// // export const fetchWeeklyAnalysisComplete = async (requestData) => {
// //   return apiFetcher(API_ENDPOINTS.MEALANALYSIS.WEEKLYANALYSISCOMPLETE, {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json",
// //     },
// //     body: JSON.stringify(requestData),
// //   });
// // };

// export const checkWeeklyAnalysisService = async (dieticianId, profileId, startDate, endDate) => {
//   return apiFetcher(API_ENDPOINTS.MEALANALYSIS.CHECKWEEKLYANALYSIS, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       dietician_id: dieticianId,
//       profile_id: profileId,
//       start_date: startDate,
//       end_date: endDate,
//     }),
//   });
// };


// export const fetchWeeklyAnalysisComplete1 = async (requestData) => {
//   return apiFetcher(API_ENDPOINTS.MEALANALYSIS.WEEKLYANALYSISCOMPLETE1, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(requestData),
//   });
// };



// export const fetchDashboardTableCards = async (dieticianId) => {
//   return apiFetcher(API_ENDPOINTS.DASHBOARD.TABLECARDS, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       dietician_id: dieticianId,
//     }),
//   });
// };



// export const fetchTestAnalytics = async (dieticianId, date = "") => {
//   return apiFetcher(API_ENDPOINTS.DASHBOARD.TESTANALYTICS, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       dietitian_id: dieticianId,
//       date: date,
//     }),
//   });
// };



// export const fetchTestRemaining = async (dieticianId) => {
//   return apiFetcher(API_ENDPOINTS.TESTINFO.TESTREMAINING, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       dietitian_id: dieticianId,
//     }),
//   });
// };



// export const fetchClientLog = async (dieticianId, clientId) => {
//   return apiFetcher(API_ENDPOINTS.PLANHISTORY.CLIENTLOG, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       dietitian_id: dieticianId,
//       client_id: clientId,
//     }),
//   });
// };



// export const updateDietPlanJsonService = async (login_id, profile_id, diet_plan_id, diet_json) => {
//   return apiFetcher(API_ENDPOINTS.PLAN.DIETPLAN, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       login_id: login_id,
//       profile_id: profile_id,
//       diet_plan_id: diet_plan_id,
//       diet_json: JSON.stringify(diet_json), 
//     }),
//   });
// };



// export const fetchDietPlanJsonService = async (login_id, profile_id, diet_plan_id) => {
//   return apiFetcher(API_ENDPOINTS.PLAN.DIETPLANJSON, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       login_id: login_id,
//       profile_id: profile_id,
//       diet_plan_id: diet_plan_id,
//     }),
//   });
// };




// export const deleteDietPlanService = async (dietPlanId, clientId, dietitianId) => {
//   return apiFetcher(API_ENDPOINTS.PLAN.DELETEDIETPLAN, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       diet_plan_id: String(dietPlanId),
//       client_id: String(clientId),
//       dietitian_id: String(dietitianId),
//     }),
//   });
// };
