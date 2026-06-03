// config/apiConfig.js

// Base URLs (different for local, staging, prod)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://humorstech.com";

// Centralized API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    // LOGIN: "/humors_app/app_final/dieticianapp/web/api/dietician_login.php",
    LOGIN: "/dietitian/api/web/role-login-jwt.php",
    SEND_OTP: "/humors_app/app_final/dieticianapp/web/api/send_diatitian_otp.php",
    RESET_PASSWORD: "/humors_app/app_final/dieticianapp/web/api/update_diatitian_password.php",
    DIETPLANSTATUS: "/dietitian/api/web/update_diet_plan_status.php",
    UPDATEPASSWORDSERVICE: "/dietitian/api/web/reset_password.php"
  },
  CLIENT: {
    CLIENTTABLE: "/dietitian/api/web/get_clients_with_diet_plan.php",
    CLIENTS_DASHBOARD: "/dietitian/api/web/get-clients-data-total-missed-test.php",
    CLIENTS_DASHBOARD_MASKED: "/dietitian/api/web/get-clients-data-total-missed-test-masked.php",
    TRAINERADMINCLIENTSLISTDIR: "/dietitian/api/web/trainer-admin-clients-list-dir.php",
  },
  CALENDER: {
    CALENDERTABLE: "/dietitian/api/web/get_calander_fill_data.php"
  },
  PROFILESCOREANALYSIS: {
    GRAPH: "/dietitian/api/web/get_score_trend1.php",
    SCORESINSIGHT: "/dietitian/api/web/get_latest_test_by_date.php"
  },
  PLAN: {
    PLANSUMMARYFORM: "/dietitian/api/web/insert_diet_plan_strategy.php",
    DIETPLAN: "/dietitian/api/web/update_diet_plan_json.php",
    DIETPLANJSON: "/dietitian/api/web/fetch_diet_json.php",
    DELETEDIETPLAN: "/dietitian/api/web/delete_diet_plan.php",
    UPDATEDIETFOOD: "/dietitian/api/web/trainer-update-weekly-food-json.php"
  },
  CLIENTPROFILE: {
    CLIENTPROFILEDATA: "/dietitian/api/web/get_client_data.php",
    CLIENTPROFILEDETAILS: "/dietitian/api/web/get-graph-all-seven-trends-graph.php",
    CLIENTINDIVIDUALPROFILE: "/dietitian/api/web/get-data-points-score-all-ranges-coach.php",
    CLIENTINDIVIDUALPROFILEMASKING: "/dietitian/api/web/get-data-points-score-all-ranges-coach-masking.php",
    CLIENTPROFILEDATESLIST: "/dietitian/api/web/get-profile-details-dates-taken.php",
    CLIENTWEEKLYDATES: "/dietitian/api/web/get-weekly-tab-list.php",
    GETCLIENTPROFILEDETAILS: "/dietitian/api/web/get_client_profile_details.php"

  },
  MEALANALYSIS: {
    WEEKLYANALYSISCOMPLETE: "/dietitian/api/web/weekly_analysis_complete.php",
    //  WEEKLYANALYSISCOMPLETE1:"/dietitian/api/web/weekly_analysis_complete1.php",
    WEEKLYANALYSISCOMPLETE1: "/dietitian/api/web/weekly_analysis_complete_lambda.php",
    CHECKWEEKLYANALYSIS: "/dietitian/api/web/check_weekly_analysis.php",
    ADDFOOD: "/dietitian/api/web/save_weekly_food_json.php",
    GETFOOD: "/dietitian/api/web/get_save_weekly_food_json.php"
  },
  DASHBOARD: {
    TABLECARDS: "/dietitian/api/web/test_statistic_by_dietitian.php",
    TESTANALYTICS: "/dietitian/api/web/get_test_analytics.php"
  },
  TESTINFO: {
    TESTREMAINING: "/dietitian/api/web/get_test_stat.php"
  },
  PLANHISTORY: {
    CLIENTLOG: "/dietitian/api/app/get_diet_plan_statistics.php"
  },
  SEARCH: {
    SEARCHCLIENT: "/dietitian/api/web/get-search-clients-details.php"
  },
  DIETANALYSIS: {
    DIETANALYSISPLAN: "/dietitian/api/web/get_weekly_food_json_suggestions_weeks.php",
    APPROVALPLAN: "/dietitian/api/web/food_json_suggestion_approve_plan.php"
  },
  MACROSANALYSIS: {
    GETMACROSUMMARY: "/dietitian/api/app/get_macro_summary_by_date.php"
  },
  HABITMONITORING: {
    GETHABITSDATA: "/dietitian/api/web/habits-tracking-users-choice1.php",
    GETHABITDETAIL: "/dietitian/api/web/get-client-selected-habit-detail.php"
  },
  LEVELUPDATE: {
    LEVEL: "/dietitian/api/web/level-type-update-change.php"
  },
  TRAINER: {
    TRAINERDIRECTION: "/dietitian/api/web/get_trainer_direction.php"
  },
  ADMINPANEL: {
    INVITETRAINERADMIN: "/dietitian/api/web/super-admin-invite-admin.php",
    SUPERADMINOVERVIEW: "/dietitian/api/web/super-admin-overview.php",
    TRAINERADMINLIST: "/dietitian/api/web/list-admin-trainer-users.php",
    LISTALLTRAINERSFORSUPERADMIN: "/dietitian/api/web/list-all-trainers-for-super-admin.php",
    SUPERADMINALLCLIENTSOVERVIEW: "/dietitian/api/web/super-admin-all-clients-overview.php",
    TRAINERCLIENTSOVERVIEWFORSUPERADMIN: "/dietitian/api/web/trainer-clients-overview-for-super-admin.php",
    REVOKETRAINERADMININVITE: "/dietitian/api/web/revoke-admin-invite.php",
    RESENDUSERINVITE: "/dietitian/api/web/resend-user-invite.php",
    REVOKEUSERINVITE: "/dietitian/api/web/revoke-user-invite.php",

    INVITETRAINER: "/dietitian/api/web/admin-invite-trainer.php",
    SUPERADMININVITETRAINER: "/dietitian/api/web/super-admin-invite-trainer.php",
    TRAINERLISTINVITES: "/dietitian/api/web/trainer-admin-overview.php",
    REVOKETRAINERCLIENTINVITE: "/dietitian/api/web/revoke-trainer-client-invite.php",
    TRAINERADMINTRAINERSUMMARY: "/dietitian/api/web/trainer-admin-trainers-summary.php",
    SUPERADMINTRAINERSUMMARY: "/dietitian/api/web/super-admin-trainers-summary.php",
    SUPERADMINREVOKETRAINER: "/dietitian/api/web/super-admin-revoke-trainers.php",
    SUPERADMINRESENDTRAINER: "/dietitian/api/web/super-admin-resend-trainers.php",
    SENDTRAINERCLIENTINVITE: "/dietitian/api/web/send_trainer_client_invite.php",
    REFERRALCLIENTLIST: "/dietitian/api/web/referral-client-list.php",
    REVOKECLIENTSUBSCRIPTIONINVITE: "/dietitian/api/web/revoke-client-subscription-invite.php",
    RESENDCLIENTSUBSCRIPTIONINVITE: "/dietitian/api/web/resend-client-subscription-invite.php",


    VALIDATEINVITETOKEN: "/dietitian/api/web/validate-invite-token.php",
    ACCEPTINVITE: "/dietitian/api/web/accept-invite.php",
    INVITEPREVIEW: "/dietitian/api/web/invite-preview.php",

    // Internal Next.js API routes (relative — not prefixed with API_BASE_URL)
    LISTUSERSINTERNAL: "/api/admin/list-users"
  }


};


