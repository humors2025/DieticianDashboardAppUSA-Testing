

// "use client";
// import React, { useMemo, useState, useEffect } from "react";
// import { IoChevronBackSharp } from "react-icons/io5";
// import { IoIosArrowForward } from "react-icons/io";
// import TestEvaluation from "./test-evaluation";
// import Trends from "./trends";
// import FoodEvaluation from "./food-evaluation";
// import MealLogged from "./meal-logged";
// import { useSelector } from "react-redux";
// import Image from "next/image";
// import NoPlans from "./no-plans";
// import WeightTracker from "./weight-tracker";
// import NoTestData from "./no-test-data";

// // Utility function to pad single digit numbers with leading zero
// function pad2(n) {
//   return n.toString().padStart(2, "0");
// }

// // Utility function to set time to start of day (00:00:00)
// function startOfDay(d) {
//   const x = new Date(d);
//   x.setHours(0, 0, 0, 0);
//   return x;
// }

// // Utility function to add/subtract days from a date
// function addDays(d, n) {
//   const x = new Date(d);
//   x.setDate(x.getDate() + n);
//   return x;
// }

// // Array of weekday abbreviations
// const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// export const ResultEvaluation = () => {
//   // Get client data from Redux store
//   const clientData = useSelector((state) => state.clientProfile.data);
//     const scoresInsight = useSelector((state) => state.scoresInsight?.data);
//   console.log("scoresInsight43:-", scoresInsight);
//   const isLoading = useSelector((state) => state.clientProfile.loading);

//    const hasInsight =
//     scoresInsight && Object.keys(scoresInsight).length > 0;
//     console.log("hasInsight48:-", hasInsight);

//   // Get today's date at start of day for comparisons (needed for hooks)
//   const today = startOfDay(new Date());
//   const VISIBLE_COUNT = 16;

//   // Compute plan data with safe defaults for when clientData is null/undefined
//   const hasActivePlan =
//     clientData?.plans_summary?.active &&
//     clientData.plans_summary.active.length > 0;

//   const hasNotStartedPlan =
//     clientData?.plans_summary?.not_started &&
//     clientData.plans_summary.not_started.length > 0;

//   const hasCompletedPlan =
//     clientData?.plans_summary?.completed &&
//     clientData.plans_summary.completed.length > 0;

//   // Get plan data based on priority: active > not_started > completed
//   const activePlan = hasActivePlan ? clientData?.plans_summary?.active[0] : null;
//   const notStartedPlan = hasNotStartedPlan ? clientData?.plans_summary?.not_started[0] : null;
//   const completedPlan = hasCompletedPlan ? clientData?.plans_summary?.completed[0] : null;

//  const isCompletedAndFinished = completedPlan && completedPlan.status === "finished" && completedPlan.plan_status === "completed";




//   // Determine which plan to use (priority order - active plans take precedence)
//   const currentPlan = activePlan || notStartedPlan || completedPlan;

//   // Extract plan start and end dates from the current plan
//   const planStartDate = currentPlan ? startOfDay(new Date(currentPlan.plan_start_date)) : null;
//   const planEndDate = currentPlan ? startOfDay(new Date(currentPlan.plan_end_date)) : null;

//   // Function to determine initial selected date (with safe defaults)
//   const getInitialSelectedDate = () => {
//     if (!planStartDate || !planEndDate) return today;

//     // If today is before plan start, select plan start date
//     if (today < planStartDate) return planStartDate;
//     // If today is after plan end, select plan end date
//     if (today > planEndDate) return planEndDate;

//     // Default to today if within plan range
//     return today;
//   };

//   // Function to determine initial window start for calendar (with safe defaults)
//   const getInitialWindowStart = () => {
//     if (!planStartDate || !planEndDate) return today;

//     // If today is before plan start, start from plan start
//     if (today < planStartDate) return planStartDate;
//     // If today is after plan end, show the last possible window
//     if (today > planEndDate) return addDays(planEndDate, 1 - VISIBLE_COUNT);

//     // Try to center today in the middle of the visible window
//     const middleStart = addDays(today, -Math.floor(VISIBLE_COUNT / 2));

//     // Adjust if middle start is before plan start
//     if (middleStart < planStartDate) return planStartDate;

//     // Check if the window would extend beyond plan end
//     const lastPossible = addDays(middleStart, VISIBLE_COUNT - 1);
//     if (lastPossible > planEndDate) {
//       return addDays(planEndDate, 1 - VISIBLE_COUNT);
//     }

//     return middleStart;
//   };

//   // =========================================================================
//   // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
//   // =========================================================================
//   // State for currently selected date in the calendar
//   const [selectedDate, setSelectedDate] = useState(() => getInitialSelectedDate());
//   console.log("selectedDate119:-", selectedDate);

//   // State for the starting date of the visible calendar window
//   const [windowStart, setWindowStart] = useState(() => getInitialWindowStart());



//   // Update windowStart and selectedDate when plan dates become available
//   useEffect(() => {
//     if (!planStartDate || !planEndDate) return;

//     // Recalculate initial window start based on actual plan dates
//     const newWindowStart = getInitialWindowStart();
//     const newSelectedDate = getInitialSelectedDate();

//     // Only update if they're different to avoid unnecessary re-renders
//     const currentWindowStartTime = startOfDay(windowStart).getTime();
//     const newWindowStartTime = startOfDay(newWindowStart).getTime();
//     const currentSelectedTime = startOfDay(selectedDate).getTime();
//     const newSelectedTime = startOfDay(newSelectedDate).getTime();

//     if (currentWindowStartTime !== newWindowStartTime) {
//       setWindowStart(newWindowStart);
//     }
//     if (currentSelectedTime !== newSelectedTime) {
//       setSelectedDate(newSelectedDate);
//     }
//   }, [planStartDate?.getTime(), planEndDate?.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Memoized array of dates for the visible calendar window
//   const dates = useMemo(() => {
//     return Array.from({ length: VISIBLE_COUNT }, (_, i) => {
//       const d = startOfDay(addDays(windowStart, i));
//       return {
//         date: d,
//         day: pad2(d.getDate()), // Padded day (01, 02, etc.)
//         week: WEEK[d.getDay()], // Weekday abbreviation
//       };
//     });
//   }, [windowStart]);

//   // =========================================================================
//   // LOADING STATE - Check after all hooks are called
//   // =========================================================================
//   if (isLoading || !clientData) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="text-center py-10">
//           <p className="text-[#535359] text-[18px]">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Check specific plan status for conditional rendering
//   const isPlanNotStarted = hasNotStartedPlan && !hasActivePlan;
//   const isPlanCompleted = hasCompletedPlan && !hasActivePlan && !hasNotStartedPlan;

//   // Navigation constraints - check if we can go previous/next
//   const canGoPrev = planStartDate && startOfDay(windowStart).getTime() > planStartDate.getTime();
//   const canGoNext = planEndDate && startOfDay(addDays(windowStart, VISIBLE_COUNT - 1)).getTime() < planEndDate.getTime();

//   // Handler for previous navigation (must be defined before conditional returns)
//   const handlePrevClick = () => {
//     if (!canGoPrev || !planStartDate) return;
//     const newWindowStart = addDays(windowStart, -VISIBLE_COUNT);
//     // Ensure we don't go before plan start date
//     setWindowStart(newWindowStart < planStartDate ? planStartDate : newWindowStart);
//   };

//   // Handler for next navigation (must be defined before conditional returns)
//   const handleNextClick = () => {
//     if (!canGoNext || !planEndDate) return;
//     const newWindowStart = addDays(windowStart, VISIBLE_COUNT);
//     const lastDateInNewWindow = addDays(newWindowStart, VISIBLE_COUNT - 1);

//     // Adjust if new window would extend beyond plan end
//     if (lastDateInNewWindow > planEndDate) {
//       const adjustedWindowStart = addDays(planEndDate, 1 - VISIBLE_COUNT);
//       setWindowStart(adjustedWindowStart);
//     } else {
//       setWindowStart(newWindowStart);
//     }
//   };

//   // Utility function to format dates for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//     if (!hasActivePlan && !hasNotStartedPlan && !hasCompletedPlan) {
//     return <NoPlans />;
//   }

// if (isCompletedAndFinished) {
//     return <NoPlans />;
//   }

//   // =========================================================================
//   // NO PLANS STATE - No active, not_started, or completed plans
//   // =========================================================================
//   if (!hasActivePlan && !hasNotStartedPlan && !hasCompletedPlan) {
//     return <NoPlans />;
//   }

//   // =========================================================================
//   // NO DATES AVAILABLE STATE - Plan exists but dates are missing/invalid
//   // =========================================================================
//   // if (!planStartDate || !planEndDate) {



//   //   return (
//   //     <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">

//   //       <div className="my-[20px] border border-[#E1E6ED]"></div>
//   //       <div className="text-center py-10">
//   //         <p className="text-[#535359] text-[18px]">Loading</p>
//   //       </div>
//   //     </div>
//   //   );
//   // }

//   // =========================================================================
//   // NOT STARTED PLAN STATE - Show "Will Start" message
//   // =========================================================================
//   if (isPlanNotStarted) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="flex justify-start ml-[15px]">
//           <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//             Result Evaluation
//           </p>
//         </div>
//         <div className="my-[20px] border border-[#E1E6ED]"></div>
//         <div className="text-center py-10">
//           <div className="flex flex-col items-center justify-center">
//             {/* Main message */}
//             <p className="text-[#535359] text-[18px] font-semibold mb-2">
//               Plan Will Start On
//             </p>
//             {/* Formatted start date */}
//             <p className="text-[#308BF9] text-[20px] font-bold">
//               {formatDate(currentPlan.plan_start_date)}
//             </p>
//             {/* Additional information */}
//             <p className="text-[#535359] text-[14px] mt-4">
//               Your result evaluation will be available once your plan begins.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // =========================================================================
//   // COMPLETED PLAN STATE - Show completion message with historical data access
//   // =========================================================================
//   if (isPlanCompleted) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="flex justify-start ml-[15px]">
//           <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//             Result Evaluation
//           </p>
//         </div>
//         <div className="my-[20px] border border-[#E1E6ED]"></div>

//         {/* Completion Message Section */}
//         <div className="text-center py-10">
//           <div className="flex flex-col items-center justify-center">
//             {/* Main completion message */}
//             <p className="text-[#535359] text-[18px] font-semibold mb-2">
//               Plan Has Been Completed
//             </p>
//             {/* Date range display */}
//             <div className="flex items-center gap-2 mb-4">
//               <p className="text-[#308BF9] text-[16px] font-bold">
//                 {formatDate(currentPlan.plan_start_date)}
//               </p>
//               <span className="text-[#535359]">to</span>
//               <p className="text-[#308BF9] text-[16px] font-bold">
//                 {formatDate(currentPlan.plan_end_date)}
//               </p>
//             </div>
//             {/* Additional information */}
//             <p className="text-[#535359] text-[14px] mt-2">
//               This plan has been completed. You can view your historical data below.
//             </p>
//           </div>
//         </div>

//         {/* Historical Data Section - Allow access to completed plan data */}
//         <div className="flex flex-col gap-[20px]">
//           <div className="ml-4">
//             <span className="text-[#535359] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
//               Select a date from completed plan
//             </span>
//           </div>

//           {/* ----------------- DATE ROW FOR COMPLETED PLAN ----------------- */}
//           <div className="flex items-center justify-between">
//             {/* Previous arrow */}
//             <IoChevronBackSharp
//               className={[
//                 "w-[52px] h-[52px] py-[13px] pl-2.5",
//                 canGoPrev ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//               ].join(" ")}
//               onClick={handlePrevClick}
//               title={canGoPrev ? "Previous" : "Beginning of plan period"}
//               aria-disabled={!canGoPrev}
//             />

//             {/* Date boxes */}
//             {dates.map((item, idx) => {
//               const itemDate = startOfDay(item.date);
//               const isSelected = itemDate.getTime() === startOfDay(selectedDate).getTime();
//               const isInPlanRange = itemDate >= planStartDate && itemDate <= planEndDate;

//               // Only show dates within the completed plan range
//               if (!isInPlanRange) return null;

//               return (
//                 <div
//                   key={idx}
//                   onClick={() => setSelectedDate(item.date)}
//                   title={`Select ${item.date.toDateString()}`}
//                   className={[
//                     "flex flex-col px-[7px] py-2 gap-1 rounded-[12px] select-none cursor-pointer",
//                     isSelected ? "bg-[#308BF9] text-white" : "text-[#535359]",
//                   ].join(" ")}
//                 >
//                   <span className="text-center text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
//                     {item.day}
//                   </span>
//                   <span className="text-center text-[10px] font-normal leading-normal tracking-[-0.2px]">
//                     {item.week}
//                   </span>
//                 </div>
//               );
//             })}

//             {/* Next arrow */}
//             <IoIosArrowForward
//               className={[
//                 "w-[52px] h-[52px] py-[13px] pl-2.5",
//                 canGoNext ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//               ].join(" ")}
//               onClick={handleNextClick}
//               title={canGoNext ? "Next" : "End of plan period"}
//               aria-disabled={!canGoNext}
//             />
//           </div>

//           <div className="my-[20px] border border-[#E1E6ED]"></div>
//           {/* Test evaluation component */}

//            {hasInsight ? <TestEvaluation/> : <NoTestData/>}

//         </div>

//         {/* Additional evaluation components for historical data */}
//         {hasInsight &&(
//         <div className="flex flex-col gap-[50px]">
//           <Trends selectedDate={selectedDate} />
//           <FoodEvaluation />
//           <MealLogged />
//         </div>
//         )}
//       </div>
//     );
//   }

//   // =========================================================================
//   // ACTIVE PLAN STATE - Normal functionality for currently active plans
//   // =========================================================================

//   // Handler for date selection
//   const handleDateClick = (date) => {
//     // Only allow selection of dates within plan range
//     if (date < planStartDate || date > planEndDate) return;
//     setSelectedDate(startOfDay(date));
//   };

//   // Filter dates to only show those within the plan range
//   const visibleDates = dates.filter((item) => {
//     const itemDate = startOfDay(item.date);
//     return itemDate >= planStartDate && itemDate <= planEndDate;
//   });

//   return (
//     <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//       {/* Header Section */}
//       <div className="flex justify-start ml-[15px]">
//         <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//           Result Evaluation
//         </p>
//       </div>

//       <div className="my-[20px] border border-[#E1E6ED]"></div>

//       {/* Date Selection Section */}
//       <div className="flex flex-col gap-[20px]">
//         <div className="ml-4">
//           <span className="text-[#535359] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
//             Select a date
//           </span>
//         </div>

//         {/* ----------------- DATE ROW ----------------- */}
//         <div className="flex items-center justify-between">
//           {/* Previous arrow */}
//           <IoChevronBackSharp
//             className={[
//               "w-[52px] h-[52px] py-[13px] pl-2.5",
//               canGoPrev ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//             ].join(" ")}
//             onClick={handlePrevClick}
//             title={canGoPrev ? "Previous" : "Beginning of plan period"}
//             aria-disabled={!canGoPrev}
//           />

//           {/* Date boxes */}
//           {visibleDates.map((item, idx) => {
//             const isToday = startOfDay(item.date).getTime() === today.getTime();
//             const isSelected = startOfDay(item.date).getTime() === startOfDay(selectedDate).getTime();
//             console.log("isSelected444:-", isSelected);
//             const isFutureDate = item.date > today;
//             const isSelectable = !isFutureDate && item.date >= planStartDate && item.date <= planEndDate;

//             return (
//               <div
//                 key={idx}
//                 onClick={() => isSelectable && setSelectedDate(item.date)}
//                 title={
//                   isFutureDate
//                     ? "Future dates are not selectable"
//                     : `Select ${item.date.toDateString()}`
//                 }
//                 className={[
//                   "flex flex-col px-[7px] py-2 gap-1 rounded-[12px] select-none",
//                   isSelectable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
//                   isSelected ? "bg-[#308BF9] text-white" : "text-[#535359]",
//                 ].join(" ")}
//               >
//                 {/* Day number */}
//                 <span className="text-center text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
//                   {item.day}
//                 </span>
//                 {/* Weekday abbreviation */}
//                 <span className="text-center text-[10px] font-normal leading-normal tracking-[-0.2px]">
//                   {item.week}
//                 </span>

//                 {/* Today indicator (blue dot) */}
//                 {isToday && !isSelected && (
//                   <span className="mx-auto mt-[2px] w-[4px] h-[4px] rounded-full bg-[#308BF9]" />
//                 )}
//               </div>
//             );
//           })}

//           {/* Next arrow */}
//           <IoIosArrowForward
//             className={[
//               "w-[52px] h-[52px] py-[13px] pl-2.5",
//               canGoNext ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//             ].join(" ")}
//             onClick={handleNextClick}
//             title={canGoNext ? "Next" : "End of plan period"}
//             aria-disabled={!canGoNext}
//           />
//         </div>

//         <div className="my-[20px] border border-[#E1E6ED]"></div>
//         {/* Test evaluation component */}
//         <TestEvaluation />
//       </div>

//       {/* Additional evaluation components */}
//       <div className="flex flex-col gap-[50px]">
//         <Trends selectedDate={selectedDate} />
//          {/* <WeightTracker/>  */}
//         <FoodEvaluation />
//         <MealLogged />
//       </div>
//     </div>
//   );
// };







// "use client";
// import React, { useMemo, useState, useEffect } from "react";
// import { IoChevronBackSharp } from "react-icons/io5";
// import { IoIosArrowForward } from "react-icons/io";
// import TestEvaluation from "./test-evaluation";
// import Trends from "./trends";
// import FoodEvaluation from "./food-evaluation";
// import MealLogged from "./meal-logged";
// import { useSelector } from "react-redux";
// import Image from "next/image";
// import NoPlans from "./no-plans";
// import WeightTracker from "./weight-tracker";
// import NoTestData from "./no-test-data";
// import ClientReminder from "./client-reminder";

// // Utility function to pad single digit numbers with leading zero
// function pad2(n) {
//   return n.toString().padStart(2, "0");
// }

// // Utility function to set time to start of day (00:00:00)
// function startOfDay(d) {
//   const x = new Date(d);
//   x.setHours(0, 0, 0, 0);
//   return x;
// }

// // Utility function to add/subtract days from a date
// function addDays(d, n) {
//   const x = new Date(d);
//   x.setDate(x.getDate() + n);
//   return x;
// }

// // Array of weekday abbreviations
// const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// export const ResultEvaluation = () => {
//   // Get client data from Redux store
//   const clientData = useSelector((state) => state.clientProfile.data);
//   const scoresInsight = useSelector((state) => state.scoresInsight?.data);
//   console.log("scoresInsight43:-", scoresInsight);
//   const isLoading = useSelector((state) => state.clientProfile.loading);

//   const hasInsight =
//     scoresInsight && Object.keys(scoresInsight).length > 0;
//   console.log("hasInsight48:-", hasInsight);

//   // Get today's date at start of day for comparisons (needed for hooks)
//   const today = startOfDay(new Date());
//   const VISIBLE_COUNT = 16;

//   // Compute plan data with safe defaults for when clientData is null/undefined
//   const hasActivePlan =
//     clientData?.plans_summary?.active &&
//     clientData.plans_summary.active.length > 0;

//   const hasNotStartedPlan =
//     clientData?.plans_summary?.not_started &&
//     clientData.plans_summary.not_started.length > 0;

//   const hasCompletedPlan =
//     clientData?.plans_summary?.completed &&
//     clientData.plans_summary.completed.length > 0;

//   // Get plan data based on priority: active > not_started > completed
//   const activePlan = hasActivePlan ? clientData?.plans_summary?.active[0] : null;
//   const notStartedPlan = hasNotStartedPlan ? clientData?.plans_summary?.not_started[0] : null;
//   const completedPlan = hasCompletedPlan ? clientData?.plans_summary?.completed[0] : null;

//   const isCompletedAndFinished =
//     completedPlan &&
//     completedPlan.status === "finished" &&
//     completedPlan.plan_status === "completed";

//   // Determine which plan to use (priority order - active plans take precedence)
//   const currentPlan = activePlan || notStartedPlan || completedPlan;

//   // Extract plan start and end dates from the current plan
//   const planStartDate = currentPlan
//     ? startOfDay(new Date(currentPlan.plan_start_date))
//     : null;
//   const planEndDate = currentPlan
//     ? startOfDay(new Date(currentPlan.plan_end_date))
//     : null;

//   // Function to determine initial selected date (with safe defaults)
//   const getInitialSelectedDate = () => {
//     if (!planStartDate || !planEndDate) return today;

//     // If today is before plan start, select plan start date
//     if (today < planStartDate) return planStartDate;
//     // If today is after plan end, select plan end date
//     if (today > planEndDate) return planEndDate;

//     // Default to today if within plan range
//     return today;
//   };

//   // Function to determine initial window start for calendar (with safe defaults)
//   const getInitialWindowStart = () => {
//     if (!planStartDate || !planEndDate) return today;

//     // If today is before plan start, start from plan start
//     if (today < planStartDate) return planStartDate;
//     // If today is after plan end, show the last possible window
//     if (today > planEndDate) return addDays(planEndDate, 1 - VISIBLE_COUNT);

//     // Try to center today in the middle of the visible window
//     const middleStart = addDays(today, -Math.floor(VISIBLE_COUNT / 2));

//     // Adjust if middle start is before plan start
//     if (middleStart < planStartDate) return planStartDate;

//     // Check if the window would extend beyond plan end
//     const lastPossible = addDays(middleStart, VISIBLE_COUNT - 1);
//     if (lastPossible > planEndDate) {
//       return addDays(planEndDate, 1 - VISIBLE_COUNT);
//     }

//     return middleStart;
//   };

//   // =========================================================================
//   // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
//   // =========================================================================
//   // State for currently selected date in the calendar
//   const [selectedDate, setSelectedDate] = useState(() =>
//     getInitialSelectedDate()
//   );

//   // State for the starting date of the visible calendar window
//   const [windowStart, setWindowStart] = useState(() =>
//     getInitialWindowStart()
//   );

//   // Update windowStart and selectedDate when plan dates become available
//   useEffect(() => {
//     if (!planStartDate || !planEndDate) return;

//     // Recalculate initial window start based on actual plan dates
//     const newWindowStart = getInitialWindowStart();
//     const newSelectedDate = getInitialSelectedDate();

//     // Only update if they're different to avoid unnecessary re-renders
//     const currentWindowStartTime = startOfDay(windowStart).getTime();
//     const newWindowStartTime = startOfDay(newWindowStart).getTime();
//     const currentSelectedTime = startOfDay(selectedDate).getTime();
//     const newSelectedTime = startOfDay(newSelectedDate).getTime();

//     if (currentWindowStartTime !== newWindowStartTime) {
//       setWindowStart(newWindowStart);
//     }
//     if (currentSelectedTime !== newSelectedTime) {
//       setSelectedDate(newSelectedDate);
//     }
//   }, [planStartDate?.getTime(), planEndDate?.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Memoized array of dates for the visible calendar window
//   const dates = useMemo(() => {
//     return Array.from({ length: VISIBLE_COUNT }, (_, i) => {
//       const d = startOfDay(addDays(windowStart, i));
//       return {
//         date: d,
//         day: pad2(d.getDate()), // Padded day (01, 02, etc.)
//         week: WEEK[d.getDay()], // Weekday abbreviation
//       };
//     });
//   }, [windowStart]);

//   // =========================================================================
//   // LOADING STATE - Check after all hooks are called
//   // =========================================================================
//   if (isLoading || !clientData) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="text-center py-10">
//           <p className="text-[#535359] text-[18px]">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Check specific plan status for conditional rendering
//   const isPlanNotStarted = hasNotStartedPlan && !hasActivePlan;
//   const isPlanCompleted = hasCompletedPlan && !hasActivePlan && !hasNotStartedPlan;

//   // Navigation constraints - check if we can go previous/next
//   const canGoPrev =
//     planStartDate &&
//     startOfDay(windowStart).getTime() > planStartDate.getTime();
//   const canGoNext =
//     planEndDate &&
//     startOfDay(addDays(windowStart, VISIBLE_COUNT - 1)).getTime() <
//     planEndDate.getTime();

//   // Handler for previous navigation (must be defined before conditional returns)
//   const handlePrevClick = () => {
//     if (!canGoPrev || !planStartDate) return;
//     const newWindowStart = addDays(windowStart, -VISIBLE_COUNT);
//     // Ensure we don't go before plan start date
//     setWindowStart(newWindowStart < planStartDate ? planStartDate : newWindowStart);
//   };

//   // Handler for next navigation (must be defined before conditional returns)
//   const handleNextClick = () => {
//     if (!canGoNext || !planEndDate) return;
//     const newWindowStart = addDays(windowStart, VISIBLE_COUNT);
//     const lastDateInNewWindow = addDays(newWindowStart, VISIBLE_COUNT - 1);

//     // Adjust if new window would extend beyond plan end
//     if (lastDateInNewWindow > planEndDate) {
//       const adjustedWindowStart = addDays(planEndDate, 1 - VISIBLE_COUNT);
//       setWindowStart(adjustedWindowStart);
//     } else {
//       setWindowStart(newWindowStart);
//     }
//   };

//   // Utility function to format dates for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   if (!hasActivePlan && !hasNotStartedPlan && !hasCompletedPlan) {
//     return <NoPlans />;
//   }

//   if (isCompletedAndFinished) {
//     return <NoPlans />;
//   }

//   // =========================================================================
//   // NO PLANS STATE - No active, not_started, or completed plans
//   // =========================================================================
//   if (!hasActivePlan && !hasNotStartedPlan && !hasCompletedPlan) {
//     return <NoPlans />;
//   }

//   // =========================================================================
//   // NOT STARTED PLAN STATE - Show "Will Start" message
//   // =========================================================================
//   if (isPlanNotStarted) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="flex justify-start ml-[15px]">
//           <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//             Result Evaluation
//           </p>
//         </div>
//         <div className="my-[20px] border border-[#E1E6ED]"></div>
//         <div className="text-center py-10">
//           <div className="flex flex-col items-center justify-center">
//             {/* Main message */}
//             <p className="text-[#535359] text-[18px] font-semibold mb-2">
//               Plan Will Start On
//             </p>
//             {/* Formatted start date */}
//             <p className="text-[#308BF9] text-[20px] font-bold">
//               {formatDate(currentPlan.plan_start_date)}
//             </p>
//             {/* Additional information */}
//             <p className="text-[#535359] text-[14px] mt-4">
//               Your result evaluation will be available once your plan begins.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // =========================================================================
//   // COMPLETED PLAN STATE - Show completion message with historical data access
//   // =========================================================================
//   if (isPlanCompleted) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="flex justify-start ml-[15px]">
//           <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//             Result Evaluation
//           </p>
//         </div>
//         <div className="my-[20px] border border-[#E1E6ED]"></div>

//         {/* Completion Message Section */}
//         <div className="text-center py-10">
//           <div className="flex flex-col items-center justify-center">
//             {/* Main completion message */}
//             <p className="text-[#535359] text-[18px] font-semibold mb-2">
//               Plan Has Been Completed
//             </p>
//             {/* Date range display */}
//             <div className="flex items-center gap-2 mb-4">
//               <p className="text-[#308BF9] text-[16px] font-bold">
//                 {formatDate(currentPlan.plan_start_date)}
//               </p>
//               <span className="text-[#535359]">to</span>
//               <p className="text-[#308BF9] text-[16px] font-bold">
//                 {formatDate(currentPlan.plan_end_date)}
//               </p>
//             </div>
//             {/* Additional information */}
//             <p className="text-[#535359] text-[14px] mt-2">
//               This plan has been completed. You can view your historical data below.
//             </p>
//           </div>
//         </div>

//         {/* Historical Data Section - Allow access to completed plan data */}
//         <div className="flex flex-col gap-[20px]">
//           <div className="ml-4">
//             <span className="text-[#535359] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
//               Select a date from completed plan
//             </span>
//           </div>

//           {/* ----------------- DATE ROW FOR COMPLETED PLAN ----------------- */}
//           <div className="flex items-center justify-between">
//             {/* Previous arrow */}
//             <IoChevronBackSharp
//               className={[
//                 "w-[52px] h-[52px] py-[13px] pl-2.5",
//                 canGoPrev ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//               ].join(" ")}
//               onClick={handlePrevClick}
//               title={canGoPrev ? "Previous" : "Beginning of plan period"}
//               aria-disabled={!canGoPrev}
//             />

//             {/* Date boxes */}
//             {dates.map((item, idx) => {
//               const itemDate = startOfDay(item.date);
//               const isSelected =
//                 itemDate.getTime() === startOfDay(selectedDate).getTime();
//               const isInPlanRange =
//                 itemDate >= planStartDate && itemDate <= planEndDate;

//               // Only show dates within the completed plan range
//               if (!isInPlanRange) return null;

//               return (
//                 <div
//                   key={idx}
//                   onClick={() => setSelectedDate(item.date)}
//                   title={`Select ${item.date.toDateString()}`}
//                   className={[
//                     "flex flex-col px-[7px] py-2 gap-1 rounded-[12px] select-none cursor-pointer",
//                     isSelected ? "bg-[#308BF9] text-white" : "text-[#535359]",
//                   ].join(" ")}
//                 >
//                   <span className="text-center text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
//                     {item.day}
//                   </span>
//                   <span className="text-center text-[10px] font-normal leading-normal tracking-[-0.2px]">
//                     {item.week}
//                   </span>
//                 </div>
//               );
//             })}

//             {/* Next arrow */}
//             <IoIosArrowForward
//               className={[
//                 "w-[52px] h-[52px] py-[13px] pl-2.5",
//                 canGoNext ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//               ].join(" ")}
//               onClick={handleNextClick}
//               title={canGoNext ? "Next" : "End of plan period"}
//               aria-disabled={!canGoNext}
//             />
//           </div>

//           <div className="my-[20px] border border-[#E1E6ED]"></div>
//           {/* Test evaluation component */}
//           <TestEvaluation />
//         </div>

//         {/* Additional evaluation components for historical data */}

//         <div className="flex flex-col gap-[50px]">
//           <Trends selectedDate={selectedDate} />
//           <FoodEvaluation />
//           <MealLogged />
//         </div>

//       </div>
//     );
//   }

//   // =========================================================================
//   // ACTIVE PLAN STATE - Normal functionality for currently active plans
//   // =========================================================================

//   // Handler for date selection
//   const handleDateClick = (date) => {
//     // Only allow selection of dates within plan range
//     if (date < planStartDate || date > planEndDate) return;
//     setSelectedDate(startOfDay(date));
//   };

//   // Filter dates to only show those within the plan range
//   const visibleDates = dates.filter((item) => {
//     const itemDate = startOfDay(item.date);
//     return itemDate >= planStartDate && itemDate <= planEndDate;
//   });

//   return (
//     <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//       {/* Header Section */}
//       <div className="flex justify-start ml-[15px]">
//         <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//           Result Evaluation
//         </p>
//       </div>

//       <div className="my-[20px] border border-[#E1E6ED]"></div>

//       {/* Date Selection Section */}
//       <div className="flex flex-col gap-[20px]">
//         <div className="ml-4">
//           <span className="text-[#535359] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
//             Select a date
//           </span>
//         </div>

//         {/* ----------------- DATE ROW ----------------- */}
//         <div className="flex items-center justify-between">
//           {/* Previous arrow */}
//           <IoChevronBackSharp
//             className={[
//               "w-[52px] h-[52px] py-[13px] pl-2.5",
//               canGoPrev ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//             ].join(" ")}
//             onClick={handlePrevClick}
//             title={canGoPrev ? "Previous" : "Beginning of plan period"}
//             aria-disabled={!canGoPrev}
//           />

//           {/* Date boxes */}
//           {visibleDates.map((item, idx) => {
//             const isToday =
//               startOfDay(item.date).getTime() === today.getTime();
//             const isSelected =
//               startOfDay(item.date).getTime() ===
//               startOfDay(selectedDate).getTime();
//             const isFutureDate = item.date > today;
//             const isSelectable =
//               !isFutureDate &&
//               item.date >= planStartDate &&
//               item.date <= planEndDate;

//             return (
//               <div
//                 key={idx}
//                 onClick={() => isSelectable && setSelectedDate(item.date)}
//                 title={
//                   isFutureDate
//                     ? "Future dates are not selectable"
//                     : `Select ${item.date.toDateString()}`
//                 }
//                 className={[
//                   "flex flex-col px-[7px] py-2 gap-1 rounded-[12px] select-none",
//                   isSelectable
//                     ? "cursor-pointer"
//                     : "cursor-not-allowed opacity-50",
//                   isSelected ? "bg-[#308BF9] text-white" : "text-[#535359]",
//                 ].join(" ")}
//               >
//                 {/* Day number */}
//                 <span className="text-center text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
//                   {item.day}
//                 </span>
//                 {/* Weekday abbreviation */}
//                 <span className="text-center text-[10px] font-normal leading-normal tracking-[-0.2px]">
//                   {item.week}
//                 </span>

//                 {/* Today indicator (blue dot) */}
//                 {isToday && !isSelected && (
//                   <span className="mx-auto mt-[2px] w-[4px] h-[4px] rounded-full bg-[#308BF9]" />
//                 )}
//               </div>
//             );
//           })}

//           {/* Next arrow */}
//           <IoIosArrowForward
//             className={[
//               "w-[52px] h-[52px] py-[13px] pl-2.5",
//               canGoNext ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//             ].join(" ")}
//             onClick={handleNextClick}
//             title={canGoNext ? "Next" : "End of plan period"}
//             aria-disabled={!canGoNext}
//           />
//         </div>

//         <div className="my-[20px] border border-[#E1E6ED]"></div>

//         {/* If insight present → show TestEvaluation, else show ClientReminder */}
//      <TestEvaluation /> 
//       </div>

//       {/* Additional evaluation components */}

//       <div className="flex flex-col gap-[50px]">

//       <Trends selectedDate={selectedDate} />
//       {/* <WeightTracker/>  */}
//       <FoodEvaluation />


//     {/* <ClientReminder /> */}
//     <MealLogged />

// </div>
//     </div>
//   );
// };


















// "use client";
// import React, { useMemo, useState, useEffect } from "react";
// import { IoChevronBackSharp } from "react-icons/io5";
// import { IoIosArrowForward } from "react-icons/io";
// import TestEvaluation from "./test-evaluation";
// import Trends from "./trends";
// import FoodEvaluation from "./food-evaluation";
// import MealLogged from "./meal-logged";
// import { useSelector } from "react-redux";
// import Image from "next/image";
// import NoPlans from "./no-plans";
// import WeightTracker from "./weight-tracker";
// import NoTestData from "./no-test-data";
// import ClientReminder from "./client-reminder";
// import { fetchScoresInsight } from "../services/authService"; // 🔹 ADDED
// import Cookies from "js-cookie";
// import { useSearchParams } from "next/navigation";

// // Utility function to pad single digit numbers with leading zero
// function pad2(n) {
//   return n.toString().padStart(2, "0");
// }

// // Utility function to set time to start of day (00:00:00)
// function startOfDay(d) {
//   const x = new Date(d);
//   x.setHours(0, 0, 0, 0);
//   return x;
// }

// // Utility function to add/subtract days from a date
// function addDays(d, n) {
//   const x = new Date(d);
//   x.setDate(x.getDate() + n);
//   return x;
// }

// // 🔹 Utility to format date for API (YYYY-MM-DD)
// function formatDateForApi(date) {
//   if (!date) return "";
//   const d = new Date(date);
//   const year = d.getFullYear();
//   const month = pad2(d.getMonth() + 1);
//   const day = pad2(d.getDate());
//   return `${year}-${month}-${day}`;
// }

// // Array of weekday abbreviations
// const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// export const ResultEvaluation = () => {
//   // Get client data from Redux store
//   const clientData = useSelector((state) => state.clientProfile.data);
//   const scoresInsight = useSelector((state) => state.scoresInsight?.data);
//   const isLoading = useSelector((state) => state.clientProfile.loading);

//   const searchParams = useSearchParams();
//   const profileIdFromUrl = searchParams.get("profile_id");

//   const hasInsight =
//     scoresInsight && Object.keys(scoresInsight).length > 0;

//   // Get today's date at start of day for comparisons (needed for hooks)
//   const today = startOfDay(new Date());
//   const VISIBLE_COUNT = 16;

//   // Compute plan data with safe defaults for when clientData is null/undefined
//   const hasActivePlan =
//     clientData?.plans_summary?.active &&
//     clientData.plans_summary.active.length > 0;

//   const hasNotStartedPlan =
//     clientData?.plans_summary?.not_started &&
//     clientData.plans_summary.not_started.length > 0;

//   const hasCompletedPlan =
//     clientData?.plans_summary?.completed &&
//     clientData.plans_summary.completed.length > 0;

//   // Get plan data based on priority: active > not_started > completed
//   const activePlan = hasActivePlan ? clientData?.plans_summary?.active[0] : null;
//   const notStartedPlan = hasNotStartedPlan ? clientData?.plans_summary?.not_started[0] : null;
//   const completedPlan = hasCompletedPlan ? clientData?.plans_summary?.completed[0] : null;

//   const isCompletedAndFinished =
//     completedPlan &&
//     completedPlan.status === "finished" &&
//     completedPlan.plan_status === "completed";

//   // Determine which plan to use (priority order - active plans take precedence)
//   const currentPlan = activePlan || notStartedPlan || completedPlan;

//   // Extract plan start and end dates from the current plan
//   const planStartDate = currentPlan
//     ? startOfDay(new Date(currentPlan.plan_start_date))
//     : null;
//   const planEndDate = currentPlan
//     ? startOfDay(new Date(currentPlan.plan_end_date))
//     : null;

//   // Function to determine initial selected date (with safe defaults)
//   const getInitialSelectedDate = () => {
//     if (!planStartDate || !planEndDate) return today;

//     // If today is before plan start, select plan start date
//     if (today < planStartDate) return planStartDate;
//     // If today is after plan end, select plan end date
//     if (today > planEndDate) return planEndDate;

//     // Default to today if within plan range
//     return today;
//   };

//   // Function to determine initial window start for calendar (with safe defaults)
//   const getInitialWindowStart = () => {
//     if (!planStartDate || !planEndDate) return today;

//     // If today is before plan start, start from plan start
//     if (today < planStartDate) return planStartDate;
//     // If today is after plan end, show the last possible window
//     if (today > planEndDate) return addDays(planEndDate, 1 - VISIBLE_COUNT);

//     // Try to center today in the middle of the visible window
//     const middleStart = addDays(today, -Math.floor(VISIBLE_COUNT / 2));

//     // Adjust if middle start is before plan start
//     if (middleStart < planStartDate) return planStartDate;

//     // Check if the window would extend beyond plan end
//     const lastPossible = addDays(middleStart, VISIBLE_COUNT - 1);
//     if (lastPossible > planEndDate) {
//       return addDays(planEndDate, 1 - VISIBLE_COUNT);
//     }

//     return middleStart;
//   };

//   // =========================================================================
//   // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
//   // =========================================================================
//   // State for currently selected date in the calendar
//   const [selectedDate, setSelectedDate] = useState(() =>
//     getInitialSelectedDate()
//   );

//   // State for the starting date of the visible calendar window
//   const [windowStart, setWindowStart] = useState(() =>
//     getInitialWindowStart()
//   );

//   // 🔹 Local state to store fetchScoresInsight response
//   const [scoresInsightResponse, setScoresInsightResponse] = useState(null);
//   console.log("scoresInsightResponse1216:-", scoresInsightResponse);

//   const [isInsightLoading, setIsInsightLoading] = useState(false); // ⬅️ NEW
//   console.log("scoresInsightResponse1216:-", scoresInsightResponse);

//   const isNoInsightData =
//     scoresInsightResponse && scoresInsightResponse.noData === true;


//   useEffect(() => {
//     // 🔹 Get dietician_id from cookie "dietician"
//     const dieticianCookie = Cookies.get("dietician");
//     let dieticianId = null;

//     if (dieticianCookie) {
//       try {
//         const parsed = JSON.parse(dieticianCookie);
//         dieticianId = parsed.dietician_id; // e.g. "RespyrD01"
//       } catch (e) {
//         console.error("Invalid dietician cookie:", e);
//       }
//     }

//     const profileId = profileIdFromUrl;

//     // If anything missing, don't call API
//     if (!dieticianId || !profileId || !selectedDate) {
//       setScoresInsightResponse(null);
//       setIsInsightLoading(false);
//       return;
//     }

//     const apiDate = formatDateForApi(selectedDate);

//     setIsInsightLoading(true); // ⬅️ start loading

//     fetchScoresInsight(dieticianId, profileId, apiDate)
//       .then((res) => {
//         setScoresInsightResponse(res);
//         console.log("fetchScoresInsight response:", res);
//       })
//       .catch((err) => {
//         console.error("Error in fetchScoresInsight:", err);
//         setScoresInsightResponse(null);
//       })
//       .finally(() => {
//         setIsInsightLoading(false); // ⬅️ stop loading
//       });
//   }, [profileIdFromUrl, selectedDate]);



//   // Update windowStart and selectedDate when plan dates become available
//   useEffect(() => {
//     if (!planStartDate || !planEndDate) return;

//     // Recalculate initial window start based on actual plan dates
//     const newWindowStart = getInitialWindowStart();
//     const newSelectedDate = getInitialSelectedDate();

//     // Only update if they're different to avoid unnecessary re-renders
//     const currentWindowStartTime = startOfDay(windowStart).getTime();
//     const newWindowStartTime = startOfDay(newWindowStart).getTime();
//     const currentSelectedTime = startOfDay(selectedDate).getTime();
//     const newSelectedTime = startOfDay(newSelectedDate).getTime();

//     if (currentWindowStartTime !== newWindowStartTime) {
//       setWindowStart(newWindowStart);
//     }
//     if (currentSelectedTime !== newSelectedTime) {
//       setSelectedDate(newSelectedDate);
//     }
//   }, [planStartDate?.getTime(), planEndDate?.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Memoized array of dates for the visible calendar window
//   const dates = useMemo(() => {
//     return Array.from({ length: VISIBLE_COUNT }, (_, i) => {
//       const d = startOfDay(addDays(windowStart, i));
//       return {
//         date: d,
//         day: pad2(d.getDate()), // Padded day (01, 02, etc.)
//         week: WEEK[d.getDay()], // Weekday abbreviation
//       };
//     });
//   }, [windowStart]);

//   // =========================================================================
//   // LOADING STATE - Check after all hooks are called
//   // =========================================================================
//   if (isLoading || !clientData) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="text-center py-10">
//           <p className="text-[#535359] text-[18px]">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Check specific plan status for conditional rendering
//   const isPlanNotStarted = hasNotStartedPlan && !hasActivePlan;
//   const isPlanCompleted = hasCompletedPlan && !hasActivePlan && !hasNotStartedPlan;

//   // Navigation constraints - check if we can go previous/next
//   const canGoPrev =
//     planStartDate &&
//     startOfDay(windowStart).getTime() > planStartDate.getTime();
//   const canGoNext =
//     planEndDate &&
//     startOfDay(addDays(windowStart, VISIBLE_COUNT - 1)).getTime() <
//     planEndDate.getTime();

//   // Handler for previous navigation (must be defined before conditional returns)
//   const handlePrevClick = () => {
//     if (!canGoPrev || !planStartDate) return;
//     const newWindowStart = addDays(windowStart, -VISIBLE_COUNT);
//     // Ensure we don't go before plan start date
//     setWindowStart(newWindowStart < planStartDate ? planStartDate : newWindowStart);
//   };

//   // Handler for next navigation (must be defined before conditional returns)
//   const handleNextClick = () => {
//     if (!canGoNext || !planEndDate) return;
//     const newWindowStart = addDays(windowStart, VISIBLE_COUNT);
//     const lastDateInNewWindow = addDays(newWindowStart, VISIBLE_COUNT - 1);

//     // Adjust if new window would extend beyond plan end
//     if (lastDateInNewWindow > planEndDate) {
//       const adjustedWindowStart = addDays(planEndDate, 1 - VISIBLE_COUNT);
//       setWindowStart(adjustedWindowStart);
//     } else {
//       setWindowStart(newWindowStart);
//     }
//   };

//   // Utility function to format dates for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   // if (!hasActivePlan && !hasNotStartedPlan && !hasCompletedPlan) {
//   //   return <NoPlans />;
//   // }

//   // if (isCompletedAndFinished) {
//   //   return <NoPlans />;
//   // }

//   // =========================================================================
//   // NO PLANS STATE - No active, not_started, or completed plans
//   // =========================================================================
//   // if (!hasActivePlan && !hasNotStartedPlan && !hasCompletedPlan) {
//   //   return <NoPlans />;
//   // }

//   // =========================================================================
//   // NOT STARTED PLAN STATE - Show "Will Start" message
//   // =========================================================================
//   if (isPlanNotStarted) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="flex justify-start ml-[15px]">
//           <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//             Result Evaluation
//           </p>
//         </div>
//         <div className="my-[20px] border border-[#E1E6ED]"></div>
//         <div className="text-center py-10">
//           <div className="flex flex-col items-center justify-center">
//             {/* Main message */}
//             <p className="text-[#535359] text-[18px] font-semibold mb-2">
//               Plan Will Start On
//             </p>
//             {/* Formatted start date */}
//             <p className="text-[#308BF9] text-[20px] font-bold">
//               {formatDate(currentPlan.plan_start_date)}
//             </p>
//             {/* Additional information */}
//             <p className="text-[#535359] text-[14px] mt-4">
//               Your result evaluation will be available once your plan begins.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // =========================================================================
//   // COMPLETED PLAN STATE - Show completion message with historical data access
//   // =========================================================================
//   if (isPlanCompleted) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="flex justify-start ml-[15px]">
//           <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//             Result Evaluation
//           </p>
//         </div>
//         <div className="my-[20px] border border-[#E1E6ED]"></div>

//         {/* Completion Message Section */}
//         <div className="text-center py-10">
//           <div className="flex flex-col items-center justify-center">
//             {/* Main completion message */}
//             <p className="text-[#535359] text-[18px] font-semibold mb-2">
//               Plan Has Been Completed
//             </p>
//             {/* Date range display */}
//             <div className="flex items-center gap-2 mb-4">
//               <p className="text-[#308BF9] text-[16px] font-bold">
//                 {formatDate(currentPlan.plan_start_date)}
//               </p>
//               <span className="text-[#535359]">to</span>
//               <p className="text-[#308BF9] text-[16px] font-bold">
//                 {formatDate(currentPlan.plan_end_date)}
//               </p>
//             </div>
//             {/* Additional information */}
//             <p className="text-[#535359] text-[14px] mt-2">
//               This plan has been completed. You can view your historical data below.
//             </p>
//           </div>
//         </div>

//         {/* Historical Data Section - Allow access to completed plan data */}
//         <div className="flex flex-col gap-[20px]">
//           <div className="ml-4">
//             <span className="text-[#535359] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
//               Select a date from completed plan
//             </span>
//           </div>

//           {/* ----------------- DATE ROW FOR COMPLETED PLAN ----------------- */}
//           <div className="flex items-center justify-between">
//             {/* Previous arrow */}
//             <IoChevronBackSharp
//               className={[
//                 "w-[52px] h-[52px] py-[13px] pl-2.5",
//                 canGoPrev ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//               ].join(" ")}
//               onClick={handlePrevClick}
//               title={canGoPrev ? "Previous" : "Beginning of plan period"}
//               aria-disabled={!canGoPrev}
//             />

//             {/* Date boxes */}
//             {dates.map((item, idx) => {
//               const itemDate = startOfDay(item.date);
//               const isSelected =
//                 itemDate.getTime() === startOfDay(selectedDate).getTime();
//               const isInPlanRange =
//                 itemDate >= planStartDate && itemDate <= planEndDate;

//               // Only show dates within the completed plan range
//               if (!isInPlanRange) return null;

//               return (
//                 <div
//                   key={idx}
//                   onClick={() => setSelectedDate(item.date)}
//                   title={`Select ${item.date.toDateString()}`}
//                   className={[
//                     "flex flex-col px-[7px] py-2 gap-1 rounded-[12px] select-none cursor-pointer",
//                     isSelected ? "bg-[#308BF9] text-white" : "text-[#535359]",
//                   ].join(" ")}
//                 >
//                   <span className="text-center text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
//                     {item.day}
//                   </span>
//                   <span className="text-center text-[10px] font-normal leading-normal tracking-[-0.2px]">
//                     {item.week}
//                   </span>
//                 </div>
//               );
//             })}

//             {/* Next arrow */}
//             <IoIosArrowForward
//               className={[
//                 "w-[52px] h-[52px] py-[13px] pl-2.5",
//                 canGoNext ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//               ].join(" ")}
//               onClick={handleNextClick}
//               title={canGoNext ? "Next" : "End of plan period"}
//               aria-disabled={!canGoNext}
//             />
//           </div>

//           <div className="my-[20px] border border-[#E1E6ED]"></div>
//           {/* Test evaluation component */}
//           {/* {isInsightLoading && (
//             <div className="w-full py-6 text-center">
//               <p className="text-[#535359] text-[16px]">Loading test data...</p>
//             </div>
//           )} */}

//           {/* 🔹 When not loading, either show ClientReminder (noData) or TestEvaluation */}
//           {!isInsightLoading && (
//             isNoInsightData ? (
//               <ClientReminder selectedDate={selectedDate} isInsightLoading={isInsightLoading}/>
//             ) : (
//               <TestEvaluation />
//             )

//           )}
//         </div>

//         {/* Additional evaluation components for historical data */}

//         <div className="flex flex-col gap-[50px]">
//           {/* 🔹 Show Trends + FoodEvaluation only when we have data and not loading */}
//           {!isInsightLoading && !isNoInsightData && (
//             <>
//               <Trends selectedDate={selectedDate} />
//               <FoodEvaluation />
//             </>
//           )}

//           {/* MealLogged can always be visible */}
//           <MealLogged />
//         </div>


//       </div>
//     );
//   }

//   // =========================================================================
//   // ACTIVE PLAN STATE - Normal functionality for currently active plans
//   // =========================================================================

//   // Handler for date selection
//   const handleDateClick = (date) => {
//     // Only allow selection of dates within plan range
//     if (date < planStartDate || date > planEndDate) return;
//     setSelectedDate(startOfDay(date));
//   };

//   // Filter dates to only show those within the plan range
//   const visibleDates = dates.filter((item) => {
//     const itemDate = startOfDay(item.date);
//     return itemDate >= planStartDate && itemDate <= planEndDate;
//   });

//   return (
//     <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//       {/* Header Section */}
//       <div className="flex justify-start ml-[15px]">
//         <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//           Result Evaluation
//         </p>
//       </div>

//       <div className="my-[20px] border border-[#E1E6ED]"></div>

//       {/* Date Selection Section */}
//       <div className="flex flex-col gap-[20px]">
//         <div className="ml-4">
//           <span className="text-[#535359] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
//             Select a date
//           </span>
//         </div>

//         {/* ----------------- DATE ROW ----------------- */}
//         <div className="flex items-center justify-between">
//           {/* Previous arrow */}
//           <IoChevronBackSharp
//             className={[
//               "w-[52px] h-[52px] py-[13px] pl-2.5",
//               canGoPrev ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//             ].join(" ")}
//             onClick={handlePrevClick}
//             title={canGoPrev ? "Previous" : "Beginning of plan period"}
//             aria-disabled={!canGoPrev}
//           />

//           {/* Date boxes */}
//           {visibleDates.map((item, idx) => {
//             const isToday =
//               startOfDay(item.date).getTime() === today.getTime();
//             const isSelected =
//               startOfDay(item.date).getTime() ===
//               startOfDay(selectedDate).getTime();
//             const isFutureDate = item.date > today;
//             const isSelectable =
//               !isFutureDate &&
//               item.date >= planStartDate &&
//               item.date <= planEndDate;

//             return (
//               <div
//                 key={idx}
//                 onClick={() => isSelectable && setSelectedDate(item.date)}
//                 title={
//                   isFutureDate
//                     ? "Future dates are not selectable"
//                     : `Select ${item.date.toDateString()}`
//                 }
//                 className={[
//                   "flex flex-col px-[7px] py-2 gap-1 rounded-[12px] select-none",
//                   isSelectable
//                     ? "cursor-pointer"
//                     : "cursor-not-allowed opacity-50",
//                   isSelected ? "bg-[#308BF9] text-white" : "text-[#535359]",
//                 ].join(" ")}
//               >
//                 {/* Day number */}
//                 <span className="text-center text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
//                   {item.day}
//                 </span>
//                 {/* Weekday abbreviation */}
//                 <span className="text-center text-[10px] font-normal leading-normal tracking-[-0.2px]">
//                   {item.week}
//                 </span>

//                 {/* Today indicator (blue dot) */}
//                 {isToday && !isSelected && (
//                   <span className="mx-auto mt-[2px] w-[4px] h-[4px] rounded-full bg-[#308BF9]" />
//                 )}
//               </div>
//             );
//           })}

//           {/* Next arrow */}
//           <IoIosArrowForward
//             className={[
//               "w-[52px] h-[52px] py-[13px] pl-2.5",
//               canGoNext ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//             ].join(" ")}
//             onClick={handleNextClick}
//             title={canGoNext ? "Next" : "End of plan period"}
//             aria-disabled={!canGoNext}
//           />
//         </div>

//         <div className="my-[20px] border border-[#E1E6ED]"></div>

//         {/* If insight present → show TestEvaluation, else show ClientReminder */}
//         {isInsightLoading && (
//           <div className="w-full py-6 text-center">
//             <p className="text-[#535359] text-[16px]">Loading test data...</p>
//           </div>
//         )}

//         {/* 🔹 When not loading, either show ClientReminder (noData) or TestEvaluation */}
//         {!isInsightLoading && (
//           isNoInsightData ? (
//             <ClientReminder selectedDate={selectedDate} isInsightLoading={isInsightLoading}/>
//           ) : (
//             <TestEvaluation />
//           )

//         )}
//       </div>

//       {/* Additional evaluation components */}



//       <div className="flex flex-col gap-[50px]">
//         {/* Show Trends + FoodEvaluation only when we have data */}



//         <div className="flex flex-col gap-[50px]">
//           {!isInsightLoading && !isNoInsightData && (
//             <>
//               <Trends selectedDate={selectedDate} />
//               {/* <WeightTracker/>  */}
//               <FoodEvaluation />
//             </>
//           )}
//           <MealLogged />
//         </div>


//       </div>

//     </div>
//   );
// };
















// "use client";
// import React, { useMemo, useState, useEffect } from "react";
// import { IoChevronBackSharp } from "react-icons/io5";
// import { IoIosArrowForward } from "react-icons/io";
// import TestEvaluation from "./test-evaluation";
// import Trends from "./trends";
// import FoodEvaluation from "./food-evaluation";
// import MealLogged from "./meal-logged";
// import { useSelector } from "react-redux";
// import Image from "next/image";
// import NoPlans from "./no-plans";
// import WeightTracker from "./weight-tracker";
// import NoTestData from "./no-test-data";
// import ClientReminder from "./client-reminder";
// import { fetchScoresInsight } from "../services/authService"; // 🔹 ADDED
// import Cookies from "js-cookie";
// import { useSearchParams } from "next/navigation";

// // Utility function to pad single digit numbers with leading zero
// function pad2(n) {
//   return n.toString().padStart(2, "0");
// }

// // Utility function to set time to start of day (00:00:00)
// function startOfDay(d) {
//   const x = new Date(d);
//   x.setHours(0, 0, 0, 0);
//   return x;
// }

// // Utility function to add/subtract days from a date
// function addDays(d, n) {
//   const x = new Date(d);
//   x.setDate(x.getDate() + n);
//   return x;
// }

// // 🔹 Utility to format date for API (YYYY-MM-DD)
// function formatDateForApi(date) {
//   if (!date) return "";
//   const d = new Date(date);
//   const year = d.getFullYear();
//   const month = pad2(d.getMonth() + 1);
//   const day = pad2(d.getDate());
//   return `${year}-${month}-${day}`;
// }

// // Array of weekday abbreviations
// const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// export const ResultEvaluation = () => {
//   // Get client data from Redux store
//   const clientData = useSelector((state) => state.clientProfile.data);
//   console.log("clientData1773:-", clientData);
//   const scoresInsight = useSelector((state) => state.scoresInsight?.data);
//   const isLoading = useSelector((state) => state.clientProfile.loading);

//   const searchParams = useSearchParams();
//   const profileIdFromUrl = searchParams.get("profile_id");

//   const hasInsight = scoresInsight && Object.keys(scoresInsight).length > 0;

//   // Get today's date at start of day for comparisons (needed for hooks)
//   const today = startOfDay(new Date());
//   const VISIBLE_COUNT = 16;

//   // Compute plan data with safe defaults for when clientData is null/undefined
//   const hasActivePlan =
//     clientData?.plans_summary?.active &&
//     clientData.plans_summary.active.length > 0;

//   const hasNotStartedPlan =
//     clientData?.plans_summary?.not_started &&
//     clientData.plans_summary.not_started.length > 0;

//   const hasCompletedPlan =
//     clientData?.plans_summary?.completed &&
//     clientData.plans_summary.completed.length > 0;

//   // ✅ NO PLAN CASE
//   const isNoPlan = !hasActivePlan && !hasNotStartedPlan && !hasCompletedPlan;

//   // Get plan data based on priority: active > not_started > completed
//   const activePlan = hasActivePlan ? clientData?.plans_summary?.active[0] : null;
//   const notStartedPlan = hasNotStartedPlan
//     ? clientData?.plans_summary?.not_started[0]
//     : null;
//   const completedPlan = hasCompletedPlan
//     ? clientData?.plans_summary?.completed[0]
//     : null;

//   const isCompletedAndFinished =
//     completedPlan &&
//     completedPlan.status === "finished" &&
//     completedPlan.plan_status === "completed";

//   // Determine which plan to use (priority order - active plans take precedence)
//   const currentPlan = activePlan || notStartedPlan || completedPlan;

//   // Extract plan start and end dates from the current plan
//   const planStartDate = currentPlan
//     ? startOfDay(new Date(currentPlan.plan_start_date))
//     : null;
//   const planEndDate = currentPlan
//     ? startOfDay(new Date(currentPlan.plan_end_date))
//     : null;

//   // Function to determine initial selected date (with safe defaults)
//   const getInitialSelectedDate = () => {
//     // ✅ No Plan: default to today
//     if (!planStartDate || !planEndDate) return today;

//     // If today is before plan start, select plan start date
//     if (today < planStartDate) return planStartDate;
//     // If today is after plan end, select plan end date
//     if (today > planEndDate) return planEndDate;

//     // Default to today if within plan range
//     return today;
//   };

//   // Function to determine initial window start for calendar (with safe defaults)
//   const getInitialWindowStart = () => {
//     // ✅ No Plan: show last 16 days ending today
//     if (!planStartDate || !planEndDate) return addDays(today, 1 - VISIBLE_COUNT);

//     // If today is before plan start, start from plan start
//     if (today < planStartDate) return planStartDate;
//     // If today is after plan end, show the last possible window
//     if (today > planEndDate) return addDays(planEndDate, 1 - VISIBLE_COUNT);

//     // Try to center today in the middle of the visible window
//     const middleStart = addDays(today, -Math.floor(VISIBLE_COUNT / 2));

//     // Adjust if middle start is before plan start
//     if (middleStart < planStartDate) return planStartDate;

//     // Check if the window would extend beyond plan end
//     const lastPossible = addDays(middleStart, VISIBLE_COUNT - 1);
//     if (lastPossible > planEndDate) {
//       return addDays(planEndDate, 1 - VISIBLE_COUNT);
//     }

//     return middleStart;
//   };

//   // =========================================================================
//   // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
//   // =========================================================================
//   // State for currently selected date in the calendar
//   const [selectedDate, setSelectedDate] = useState(() => getInitialSelectedDate());

//   // State for the starting date of the visible calendar window
//   const [windowStart, setWindowStart] = useState(() => getInitialWindowStart());

//   // 🔹 Local state to store fetchScoresInsight response
//   const [scoresInsightResponse, setScoresInsightResponse] = useState(null);
//   console.log("scoresInsightResponse1216:-", scoresInsightResponse);

//   const [isInsightLoading, setIsInsightLoading] = useState(false); // ⬅️ NEW
//   console.log("scoresInsightResponse1216:-", scoresInsightResponse);

//   const isNoInsightData =
//     scoresInsightResponse && scoresInsightResponse.noData === true;

//   useEffect(() => {
//     // 🔹 Get dietician_id from cookie "dietician"
//     const dieticianCookie = Cookies.get("dietician");
//     let dieticianId = null;

//     if (dieticianCookie) {
//       try {
//         const parsed = JSON.parse(dieticianCookie);
//         dieticianId = parsed.dietician_id; // e.g. "RespyrD01"
//       } catch (e) {
//         console.error("Invalid dietician cookie:", e);
//       }
//     }

//     const profileId = profileIdFromUrl;

//     // If anything missing, don't call API
//     if (!dieticianId || !profileId || !selectedDate) {
//       setScoresInsightResponse(null);
//       setIsInsightLoading(false);
//       return;
//     }

//     const apiDate = formatDateForApi(selectedDate);

//     setIsInsightLoading(true); // ⬅️ start loading

//     fetchScoresInsight(dieticianId, profileId, apiDate)
//       .then((res) => {
//         setScoresInsightResponse(res);
//         console.log("fetchScoresInsight response:", res);
//       })
//       .catch((err) => {
//         console.error("Error in fetchScoresInsight:", err);
//         setScoresInsightResponse(null);
//       })
//       .finally(() => {
//         setIsInsightLoading(false); // ⬅️ stop loading
//       });
//   }, [profileIdFromUrl, selectedDate]);

//   // Update windowStart and selectedDate when plan dates become available
//   useEffect(() => {
//     if (!planStartDate || !planEndDate) return;

//     // Recalculate initial window start based on actual plan dates
//     const newWindowStart = getInitialWindowStart();
//     const newSelectedDate = getInitialSelectedDate();

//     // Only update if they're different to avoid unnecessary re-renders
//     const currentWindowStartTime = startOfDay(windowStart).getTime();
//     const newWindowStartTime = startOfDay(newWindowStart).getTime();
//     const currentSelectedTime = startOfDay(selectedDate).getTime();
//     const newSelectedTime = startOfDay(newSelectedDate).getTime();

//     if (currentWindowStartTime !== newWindowStartTime) {
//       setWindowStart(newWindowStart);
//     }
//     if (currentSelectedTime !== newSelectedTime) {
//       setSelectedDate(newSelectedDate);
//     }
//   }, [planStartDate?.getTime(), planEndDate?.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Memoized array of dates for the visible calendar window
//   const dates = useMemo(() => {
//     return Array.from({ length: VISIBLE_COUNT }, (_, i) => {
//       const d = startOfDay(addDays(windowStart, i));
//       return {
//         date: d,
//         day: pad2(d.getDate()), // Padded day (01, 02, etc.)
//         week: WEEK[d.getDay()], // Weekday abbreviation
//       };
//     });
//   }, [windowStart]);

//   // =========================================================================
//   // LOADING STATE - Check after all hooks are called
//   // =========================================================================
//   if (isLoading || !clientData) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="text-center py-10">
//           <p className="text-[#535359] text-[18px]">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Check specific plan status for conditional rendering
//   const isPlanNotStarted = hasNotStartedPlan && !hasActivePlan;
//   const isPlanCompleted = hasCompletedPlan && !hasActivePlan && !hasNotStartedPlan;

//   // Navigation constraints - check if we can go previous/next
//   const canGoPrev =
//     planStartDate &&
//     startOfDay(windowStart).getTime() > planStartDate.getTime();

//   const canGoNext =
//     planEndDate &&
//     startOfDay(addDays(windowStart, VISIBLE_COUNT - 1)).getTime() <
//       planEndDate.getTime();

//   // ✅ Final navigation for NoPlan
//   const canGoPrevFinal = isNoPlan ? true : canGoPrev;
//   // const canGoNextFinal = isNoPlan ? false : canGoNext;
//   const canGoNextFinal = isNoPlan
//   ? startOfDay(addDays(windowStart, VISIBLE_COUNT - 1)) < today
//   : canGoNext;


//   // Handler for previous navigation (must be defined before conditional returns)
//   const handlePrevClick = () => {
//     if (isNoPlan) {
//       setWindowStart(addDays(windowStart, -VISIBLE_COUNT));
//       return;
//     }

//     if (!canGoPrev || !planStartDate) return;
//     const newWindowStart = addDays(windowStart, -VISIBLE_COUNT);
//     // Ensure we don't go before plan start date
//     setWindowStart(newWindowStart < planStartDate ? planStartDate : newWindowStart);
//   };

//   // Handler for next navigation (must be defined before conditional returns)
//   const handleNextClick = () => {
//   if (isNoPlan) {
//     const newWindowStart = addDays(windowStart, VISIBLE_COUNT);
//     const lastDateInNewWindow = addDays(newWindowStart, VISIBLE_COUNT - 1);

//     // ❌ Don't allow future dates
//     if (lastDateInNewWindow > today) {
//       setWindowStart(addDays(today, 1 - VISIBLE_COUNT));
//     } else {
//       setWindowStart(newWindowStart);
//     }
//     return;
//   }

//   if (!canGoNext || !planEndDate) return;

//   const newWindowStart = addDays(windowStart, VISIBLE_COUNT);
//   const lastDateInNewWindow = addDays(newWindowStart, VISIBLE_COUNT - 1);

//   if (lastDateInNewWindow > planEndDate) {
//     setWindowStart(addDays(planEndDate, 1 - VISIBLE_COUNT));
//   } else {
//     setWindowStart(newWindowStart);
//   }
// };


//   // Utility function to format dates for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   // =========================================================================
//   // NOT STARTED PLAN STATE - Show "Will Start" message
//   // =========================================================================
//   if (isPlanNotStarted) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="flex justify-start ml-[15px]">
//           <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//             Result Evaluation
//           </p>
//         </div>
//         <div className="my-[20px] border border-[#E1E6ED]"></div>
//         <div className="text-center py-10">
//           <div className="flex flex-col items-center justify-center">
//             {/* Main message */}
//             <p className="text-[#535359] text-[18px] font-semibold mb-2">
//               Plan Will Start On
//             </p>
//             {/* Formatted start date */}
//             <p className="text-[#308BF9] text-[20px] font-bold">
//               {formatDate(currentPlan.plan_start_date)}
//             </p>
//             {/* Additional information */}
//             <p className="text-[#535359] text-[14px] mt-4">
//               Your result evaluation will be available once your plan begins.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // =========================================================================
//   // COMPLETED PLAN STATE - Show completion message with historical data access
//   // =========================================================================
//   if (isPlanCompleted) {
//     return (
//       <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//         <div className="flex justify-start ml-[15px]">
//           <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//             Result Evaluation
//           </p>
//         </div>
//         <div className="my-[20px] border border-[#E1E6ED]"></div>

//         {/* Completion Message Section */}
//         <div className="text-center py-10">
//           <div className="flex flex-col items-center justify-center">
//             {/* Main completion message */}
//             <p className="text-[#535359] text-[18px] font-semibold mb-2">
//               Plan Has Been Completed
//             </p>
//             {/* Date range display */}
//             <div className="flex items-center gap-2 mb-4">
//               <p className="text-[#308BF9] text-[16px] font-bold">
//                 {formatDate(currentPlan.plan_start_date)}
//               </p>
//               <span className="text-[#535359]">to</span>
//               <p className="text-[#308BF9] text-[16px] font-bold">
//                 {formatDate(currentPlan.plan_end_date)}
//               </p>
//             </div>
//             {/* Additional information */}
//             <p className="text-[#535359] text-[14px] mt-2">
//               This plan has been completed. You can view your historical data below.
//             </p>
//           </div>
//         </div>

//         {/* Historical Data Section - Allow access to completed plan data */}
//         <div className="flex flex-col gap-[20px]">
//           <div className="ml-4">
//             <span className="text-[#535359] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
//               Select a date from completed plan
//             </span>
//           </div>

//           {/* ----------------- DATE ROW FOR COMPLETED PLAN ----------------- */}
//           <div className="flex items-center justify-between">
//             {/* Previous arrow */}
//             <IoChevronBackSharp
//               className={[
//                 "w-[52px] h-[52px] py-[13px] pl-2.5",
//                 canGoPrev ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//               ].join(" ")}
//               onClick={handlePrevClick}
//               title={canGoPrev ? "Previous" : "Beginning of plan period"}
//               aria-disabled={!canGoPrev}
//             />

//             {/* Date boxes */}
//             {dates.map((item, idx) => {
//               const itemDate = startOfDay(item.date);
//               const isSelected =
//                 itemDate.getTime() === startOfDay(selectedDate).getTime();
//               const isInPlanRange =
//                 itemDate >= planStartDate && itemDate <= planEndDate;

//               // Only show dates within the completed plan range
//               if (!isInPlanRange) return null;

//               return (
//                 <div
//                   key={idx}
//                   onClick={() => setSelectedDate(item.date)}
//                   title={`Select ${item.date.toDateString()}`}
//                   className={[
//                     "flex flex-col px-[7px] py-2 gap-1 rounded-[12px] select-none cursor-pointer",
//                     isSelected ? "bg-[#308BF9] text-white" : "text-[#535359]",
//                   ].join(" ")}
//                 >
//                   <span className="text-center text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
//                     {item.day}
//                   </span>
//                   <span className="text-center text-[10px] font-normal leading-normal tracking-[-0.2px]">
//                     {item.week}
//                   </span>
//                 </div>
//               );
//             })}

//             {/* Next arrow */}
//             <IoIosArrowForward
//               className={[
//                 "w-[52px] h-[52px] py-[13px] pl-2.5",
//                 canGoNext ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//               ].join(" ")}
//               onClick={handleNextClick}
//               title={canGoNext ? "Next" : "End of plan period"}
//               aria-disabled={!canGoNext}
//             />
//           </div>

//           <div className="my-[20px] border border-[#E1E6ED]"></div>

//           {/* 🔹 When not loading, either show ClientReminder (noData) or TestEvaluation */}
//           {!isInsightLoading &&
//             (isNoInsightData ? (
//               <ClientReminder
//                 selectedDate={selectedDate}
//                 isInsightLoading={isInsightLoading}
//               />
//             ) : (
//               <TestEvaluation />
//             ))}
//         </div>

//         {/* Additional evaluation components for historical data */}
//         <div className="flex flex-col gap-[50px]">
//           {/* 🔹 Show Trends + FoodEvaluation only when we have data and not loading */}
//           {!isInsightLoading && !isNoInsightData && (
//             <>
//               <Trends selectedDate={selectedDate} />
//               <FoodEvaluation />
//             </>
//           )}

//           {/* MealLogged can always be visible */}
//           <MealLogged />
//         </div>
//       </div>
//     );
//   }

//   // =========================================================================
//   // ACTIVE PLAN STATE + ✅ NO PLAN STATE (uses same UI)
//   // =========================================================================

//   // Handler for date selection
//   const handleDateClick = (date) => {
//     if (isNoPlan) {
//       if (date > today) return;
//       setSelectedDate(startOfDay(date));
//       return;
//     }

//     // Only allow selection of dates within plan range
//     if (date < planStartDate || date > planEndDate) return;
//     setSelectedDate(startOfDay(date));
//   };

//   // ✅ visibleDates: if NoPlan show up to today, else show within plan range
//   const visibleDates = isNoPlan
//     ? dates.filter((item) => startOfDay(item.date) <= today)
//     : dates.filter((item) => {
//         const itemDate = startOfDay(item.date);
//         return itemDate >= planStartDate && itemDate <= planEndDate;
//       });

//   return (
//     <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
//       {/* Header Section */}
//       <div className="flex justify-start ml-[15px]">
//         <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">
//           Result Evaluation
//         </p>
//       </div>

//       <div className="my-[20px] border border-[#E1E6ED]"></div>

//       {/* Date Selection Section */}
//       <div className="flex flex-col gap-[20px]">
//         <div className="ml-4">
//           <span className="text-[#535359] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
//             Select a date
//           </span>
//         </div>

//         {/* ----------------- DATE ROW ----------------- */}
//         <div className="flex items-center justify-between">
//           {/* Previous arrow */}
//           <IoChevronBackSharp
//             className={[
//               "w-[52px] h-[52px] py-[13px] pl-2.5",
//               canGoPrevFinal ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//             ].join(" ")}
//             onClick={handlePrevClick}
//             title={canGoPrevFinal ? "Previous" : "Beginning of plan period"}
//             aria-disabled={!canGoPrevFinal}
//           />

//           {/* Date boxes */}
//           {visibleDates.map((item, idx) => {
//             const isToday =
//               startOfDay(item.date).getTime() === today.getTime();
//             const isSelected =
//               startOfDay(item.date).getTime() ===
//               startOfDay(selectedDate).getTime();
//             const isFutureDate = item.date > today;

//             const isSelectable = isNoPlan
//               ? !isFutureDate
//               : !isFutureDate &&
//                 item.date >= planStartDate &&
//                 item.date <= planEndDate;

//             return (
//               <div
//                 key={idx}
//                 onClick={() => isSelectable && setSelectedDate(item.date)}
//                 title={
//                   isFutureDate
//                     ? "Future dates are not selectable"
//                     : `Select ${item.date.toDateString()}`
//                 }
//                 className={[
//                   "flex flex-col px-[7px] py-2 gap-1 rounded-[12px] select-none",
//                   isSelectable
//                     ? "cursor-pointer"
//                     : "cursor-not-allowed opacity-50",
//                   isSelected ? "bg-[#308BF9] text-white" : "text-[#535359]",
//                 ].join(" ")}
//               >
//                 {/* Day number */}
//                 <span className="text-center text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
//                   {item.day}
//                 </span>
//                 {/* Weekday abbreviation */}
//                 <span className="text-center text-[10px] font-normal leading-normal tracking-[-0.2px]">
//                   {item.week}
//                 </span>

//                 {/* Today indicator (blue dot) */}
//                 {isToday && !isSelected && (
//                   <span className="mx-auto mt-[2px] w-[4px] h-[4px] rounded-full bg-[#308BF9]" />
//                 )}
//               </div>
//             );
//           })}

//           {/* Next arrow */}
//           <IoIosArrowForward
//             className={[
//               "w-[52px] h-[52px] py-[13px] pl-2.5",
//               canGoNextFinal ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
//             ].join(" ")}
//             onClick={handleNextClick}
//             title={canGoNextFinal ? "Next" : "End of plan period"}
//             aria-disabled={!canGoNextFinal}
//           />
//         </div>

//         <div className="my-[20px] border border-[#E1E6ED]"></div>

//         {/* If insight present → show TestEvaluation, else show ClientReminder */}
//         {isInsightLoading && (
//           <div className="w-full py-6 text-center">
//             <p className="text-[#535359] text-[16px]">Loading test data...</p>
//           </div>
//         )}

//         {/* 🔹 When not loading, either show ClientReminder (noData) or TestEvaluation */}
//         {!isInsightLoading &&
//           (isNoInsightData ? (
//             <ClientReminder
//               selectedDate={selectedDate}
//               isInsightLoading={isInsightLoading}
//             />
//           ) : (
//             <TestEvaluation />
//           ))}
//       </div>

//       {/* Additional evaluation components */}
//       <div className="flex flex-col gap-[50px]">
//         <div className="flex flex-col gap-[50px]">
//           {!isInsightLoading && !isNoInsightData && (
//             <>
//               <Trends selectedDate={selectedDate} />
//             {/* <WeightTracker/>  */}
//               <FoodEvaluation />
//             </>
//           )}
//           <MealLogged />
//         </div>
//       </div>
//     </div>
//   );
// };











"use client";
import React, { useMemo, useState, useEffect } from "react";
import { IoChevronBackSharp } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import TestEvaluation from "./test-evaluation";
import Trends from "./trends";
import FoodEvaluation from "./food-evaluation";
import MealLogged from "./meal-logged";
import { useSelector } from "react-redux";
import Image from "next/image";
import NoPlans from "./no-plans";
import WeightTracker from "./weight-tracker";
import NoTestData from "./no-test-data";
import ClientReminder from "./client-reminder";
import { fetchScoresInsight } from "../services/authService";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";

// Utility function to pad single digit numbers
function pad2(n) {
  return n.toString().padStart(2, "0");
}

// Utility function to set time to start of day
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Utility function to add/subtract days
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// Format date for API
function formatDateForApi(date) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const ResultEvaluation = () => {
  const clientData = useSelector((state) => state.clientProfile.data);
  const scoresInsight = useSelector((state) => state.scoresInsight?.data);
  console.log("scoresInsight2424:-", scoresInsight);
  const isLoading = useSelector((state) => state.clientProfile.loading);

  const searchParams = useSearchParams();
  const profileIdFromUrl = searchParams.get("profile_id");

  const today = startOfDay(new Date());
  const VISIBLE_COUNT = 16;

  // 🔹 Extract Join Date from dttm (e.g., "2025-11-27")
  const joinDate = useMemo(() => {
    if (clientData?.dttm) {
      return startOfDay(new Date(clientData.dttm.split(" ")[0]));
    }
    return today;
  }, [clientData?.dttm, today]);

  // Plan Data Logic
  const hasActivePlan = clientData?.plans_summary?.active?.length > 0;
  const hasNotStartedPlan = clientData?.plans_summary?.not_started?.length > 0;
  const hasCompletedPlan = clientData?.plans_summary?.completed?.length > 0;
  const isNoPlan = !hasActivePlan && !hasNotStartedPlan && !hasCompletedPlan;

  const currentPlan = hasActivePlan 
    ? clientData?.plans_summary?.active[0] 
    : hasNotStartedPlan 
    ? clientData?.plans_summary?.not_started[0] 
    : clientData?.plans_summary?.completed[0];

  const planStartDate = currentPlan ? startOfDay(new Date(currentPlan.plan_start_date)) : null;
  // const planEndDate = currentPlan ? startOfDay(new Date(currentPlan.plan_end_date)) : null;
  // console.log("planEndDate2456:-", planEndDate);

  const planEndDate = null;

  // 🔹 Logic to Center Today in the 16-day window

  const getInitialWindowStart = () => {
    // Center Today (offset by ~7 days)
    const middleOffset = Math.floor(VISIBLE_COUNT / 2);
    let idealStart = addDays(today, -middleOffset);

    // Floor the window at the joinDate
    if (idealStart < joinDate) return joinDate;

    // If there is an end date (completed plan), don't overflow past it
    if (planEndDate && today > planEndDate) {
        return addDays(planEndDate, 1 - VISIBLE_COUNT);
    }

    return idealStart;
  };




  const getInitialSelectedDate = () => {
    if (planEndDate && today > planEndDate) return planEndDate;
    if (planStartDate && today < planStartDate) return planStartDate;
    return today;
  };

  const [selectedDate, setSelectedDate] = useState(() => getInitialSelectedDate());
  const [windowStart, setWindowStart] = useState(() => getInitialWindowStart());
  const [scoresInsightResponse, setScoresInsightResponse] = useState(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  const isNoInsightData = scoresInsightResponse?.noData === true;

  // Sync state if clientData loads late
  useEffect(() => {
    if (clientData) {
      setWindowStart(getInitialWindowStart());
      setSelectedDate(getInitialSelectedDate());
    }
  }, [clientData]);

  // API Fetch Effect
  useEffect(() => {
    const dieticianCookie = Cookies.get("dietician");
    let dieticianId = null;
    if (dieticianCookie) {
      try {
        dieticianId = JSON.parse(dieticianCookie).dietician_id;
      } catch (e) { console.error(e); }
    }

    if (!dieticianId || !profileIdFromUrl || !selectedDate) return;

    setIsInsightLoading(true);
    fetchScoresInsight(dieticianId, profileIdFromUrl, formatDateForApi(selectedDate))
      .then((res) => setScoresInsightResponse(res))
      .catch((err) => {
        console.error(err);
        setScoresInsightResponse(null);
      })
      .finally(() => setIsInsightLoading(false));
  }, [profileIdFromUrl, selectedDate]);

  // Calendar dates generation
  const dates = useMemo(() => {
    return Array.from({ length: VISIBLE_COUNT }, (_, i) => {
      const d = startOfDay(addDays(windowStart, i));
      return { date: d, day: pad2(d.getDate()), week: WEEK[d.getDay()] };
    });
  }, [windowStart]);

  // Navigation Logic
  const canGoPrevFinal = startOfDay(windowStart) > joinDate;
  const canGoNextFinal = startOfDay(addDays(windowStart, VISIBLE_COUNT - 1)) < (planEndDate || today);

  const handlePrevClick = () => {
    if (!canGoPrevFinal) return;
    const nextStart = addDays(windowStart, -VISIBLE_COUNT);
    setWindowStart(nextStart < joinDate ? joinDate : nextStart);
  };

  const handleNextClick = () => {
    if (!canGoNextFinal) return;
    const nextStart = addDays(windowStart, VISIBLE_COUNT);
    const limit = planEndDate || today;
    if (addDays(nextStart, VISIBLE_COUNT - 1) > limit) {
      setWindowStart(addDays(limit, 1 - VISIBLE_COUNT));
    } else {
      setWindowStart(nextStart);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  if (isLoading || !clientData) {
    return (
      <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
        <div className="text-center py-10"><p className="text-[#535359] text-[18px]">Loading...</p></div>
      </div>
    );
  }

  // Common Date Row Component to maintain UI consistency
  const RenderDateRow = () => (
    <div className="flex items-center justify-between">
      <IoChevronBackSharp
        className={["w-[52px] h-[52px] py-[13px] pl-2.5", canGoPrevFinal ? "cursor-pointer" : "opacity-40 cursor-not-allowed"].join(" ")}
        onClick={handlePrevClick}
      />
      {dates.map((item, idx) => {
        const isSelected = startOfDay(item.date).getTime() === startOfDay(selectedDate).getTime();
        const isToday = startOfDay(item.date).getTime() === today.getTime();
        const isFuture = item.date > today;
        const isBeforeJoin = item.date < joinDate;
        const isSelectable = !isFuture && !isBeforeJoin;

        return (
          <div
            key={idx}
            onClick={() => isSelectable && setSelectedDate(item.date)}
            className={[
              "flex flex-col px-[7px] py-2 gap-1 rounded-[12px] select-none",
              isSelectable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
              isSelected ? "bg-[#308BF9] text-white" : "text-[#535359]",
            ].join(" ")}
          >
            <span className="text-center text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">{item.day}</span>
            <span className="text-center text-[10px] font-normal leading-normal tracking-[-0.2px]">{item.week}</span>
            {isToday && !isSelected && <span className="mx-auto mt-[2px] w-[4px] h-[4px] rounded-full bg-[#308BF9]" />}
          </div>
        );
      })}
      <IoIosArrowForward
        className={["w-[52px] h-[52px] py-[13px] pl-2.5", canGoNextFinal ? "cursor-pointer" : "opacity-40 cursor-not-allowed"].join(" ")}
        onClick={handleNextClick}
      />
    </div>
  );

  // View: Plan Not Started
  if (hasNotStartedPlan && !hasActivePlan) {
    return (
      <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
        <div className="flex justify-start ml-[15px]"><p className="text-[#252525] text-[25px] font-semibold">Result Evaluation</p></div>
        <div className="my-[20px] border border-[#E1E6ED]"></div>
        <div className="text-center py-10">
          <p className="text-[#535359] text-[18px] font-semibold">Plan Will Start On</p>
          <p className="text-[#308BF9] text-[20px] font-bold">{formatDate(currentPlan.plan_start_date)}</p>
        </div>
      </div>
    );
  }

  // View: Active / Completed / No Plan
  return (
    <div className="w-full bg-white px-[15px] py-[30px] rounded-[15px]">
      <div className="flex justify-start ml-[15px]">
        <p className="text-[#252525] text-center text-[25px] font-semibold leading-normal tracking-[-1px]">Result Evaluation</p>
      </div>
      <div className="my-[20px] border border-[#E1E6ED]"></div>

      <div className="flex flex-col gap-[20px]">
        <div className="ml-4">
          <span className="text-[#535359] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">Select a date</span>
        </div>

        <RenderDateRow />

        <div className="my-[20px] border border-[#E1E6ED]"></div>

        {isInsightLoading ? (
          <div className="w-full py-6 text-center"><p className="text-[#535359] text-[16px]">Loading test data...</p></div>
        ) : isNoInsightData ? (
          <ClientReminder selectedDate={selectedDate} isInsightLoading={isInsightLoading} />
        ) : (
          <TestEvaluation />
        )}
      </div>

      <div className="flex flex-col gap-[50px]">
        {!isInsightLoading && !isNoInsightData && (
          <>
            <Trends selectedDate={selectedDate} />
            {/* <FoodEvaluation /> */}
          </>
        )}
        <MealLogged />
      </div>
    </div>
  );
};