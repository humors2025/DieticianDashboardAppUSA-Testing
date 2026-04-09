// "use client";

// import { useMemo, useState, useEffect, useRef } from "react";
// import { useSelector } from "react-redux";
// import { IoIosArrowDown } from "react-icons/io";
// import {
//   selectClientIndividualProfileData,
//   selectClientIndividualProfileStatus,
//   selectClientIndividualProfileError,
// } from "../../store/clientIndividualProfileSlice";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Filler,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Line } from "react-chartjs-2";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Filler,
//   Tooltip,
//   Legend
// );

// function getZoneColor(zone) {
//   const normalizedZone = String(zone || "").toLowerCase();

//   if (normalizedZone === "optimal") return "#3FAF58";
//   if (normalizedZone === "moderate") return "#FFBF2D";
//   if (normalizedZone === "focus") return "#E48326";

//   return "#308BF9";
// }

// function ProgressCard({ color = "#308BF9" }) {
//   const [selectedRange, setSelectedRange] = useState("One Week");
//   const [openDropdown, setOpenDropdown] = useState(false);
//   const dropdownRef = useRef(null);

//   const rangeData = {
//     "One Week": {
//       labels: ["05 Aug", "06 Aug", "07 Aug", "08 Aug", "09 Aug", "10 Aug", "11 Aug"],
//       values: [35, 52, 52, 60, 60, 60, 72],
//     },
//     "One Month": {
//       labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
//       values: [40, 58, 64, 70],
//     },
//     "All Time": {
//       labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
//       values: [28, 35, 42, 50, 55, 61, 67, 72],
//     },
//   };

//   const { labels, values } = rangeData[selectedRange];
//   const ranges = ["One Week", "One Month", "All Time"];

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setOpenDropdown(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const data = useMemo(() => {
//     return {
//       labels,
//       datasets: [
//         {
//           label: "Progress",
//           data: values,
//           borderColor: color,
//           borderWidth: 3,
//           tension: 0.35,
//           fill: true,
//           backgroundColor: (context) => {
//             const chart = context.chart;
//             const { ctx, chartArea } = chart;

//             if (!chartArea) return "rgba(48,139,249,0.12)";

//             const hexToRgba = (hex, alpha) => {
//               const sanitized = hex.replace("#", "");
//               const bigint = parseInt(sanitized, 16);
//               const r = (bigint >> 16) & 255;
//               const g = (bigint >> 8) & 255;
//               const b = bigint & 255;
//               return `rgba(${r}, ${g}, ${b}, ${alpha})`;
//             };

//             const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
//             gradient.addColorStop(0, hexToRgba(color, 0.25));
//             gradient.addColorStop(1, hexToRgba(color, 0));
//             return gradient;
//           },
//           pointRadius: (ctx) => (ctx.dataIndex === values.length - 1 ? 6 : 0),
//           pointHoverRadius: 6,
//           pointBackgroundColor: color,
//           pointBorderColor: color,
//           pointBorderWidth: 0,
//         },
//       ],
//     };
//   }, [labels, values, color]);

//   const options = useMemo(() => {
//     return {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: { display: false },
//         tooltip: {
//           enabled: true,
//           displayColors: false,
//           backgroundColor: "rgba(0,0,0,0.75)",
//           padding: 10,
//           titleFont: { size: 12, weight: "600" },
//           bodyFont: { size: 12, weight: "500" },
//           callbacks: {
//             label: (ctx) => ` ${ctx.parsed.y}%`,
//           },
//         },
//       },
//       scales: {
//         x: {
//           grid: {
//             display: true,
//             borderDash: [4, 4],
//             drawBorder: false,
//             color: "#E1E6ED",
//           },
//           ticks: {
//             color: "#8A8A8F",
//             font: { size: 11, weight: "500" },
//             maxRotation: 0,
//             autoSkip: true,
//           },
//         },
//         y: {
//           min: 0,
//           max: 100,
//           ticks: {
//             stepSize: 20,
//             color: "#8A8A8F",
//             font: { size: 11, weight: "500" },
//           },
//           grid: {
//             display: true,
//             borderDash: [4, 4],
//             drawBorder: false,
//             color: "#E1E6ED",
//           },
//         },
//       },
//       elements: {
//         line: {
//           capBezierPoints: true,
//         },
//       },
//     };
//   }, []);

//   return (
//     <div className="flex flex-col gap-4 pt-1">
//       <div className="flex justify-end items-center">
//         <div className="relative" ref={dropdownRef}>
//           <button
//             type="button"
//             onClick={() => setOpenDropdown((prev) => !prev)}
//             className="flex gap-[15px] px-[11px] py-1 border border-[#E1E6ED] rounded-[4px] items-center bg-white cursor-pointer"
//           >
//             <p className="text-[#535359] text-[12px] font-normal leading-[110%] tracking-[-0.24px] whitespace-nowrap">
//               {selectedRange}
//             </p>
//             <IoIosArrowDown
//               className={`text-[#A1A1A1] w-[15px] h-[15px] transition-transform duration-200 ${
//                 openDropdown ? "rotate-180" : ""
//               }`}
//             />
//           </button>

//           {openDropdown && (
//             <div className="absolute right-0 top-full mt-1 min-w-full bg-white border border-[#E1E6ED] rounded-[6px] shadow-md z-20 overflow-hidden">
//               {ranges.map((item) => (
//                 <button
//                   key={item}
//                   type="button"
//                   onClick={() => {
//                     setSelectedRange(item);
//                     setOpenDropdown(false);
//                   }}
//                   className={`w-full text-left px-3 py-2 text-[12px] leading-[110%] tracking-[-0.24px] transition-colors cursor-pointer ${
//                     selectedRange === item
//                       ? "bg-[#F5F7FA] text-[#252525] font-medium"
//                       : "text-[#535359] hover:bg-[#F5F7FA]"
//                   }`}
//                 >
//                   {item}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="w-full h-[170px]">
//         <Line data={data} options={options} />
//       </div>
//     </div>
//   );
// }

// function TrendCard({
//   title,
//   status,
//   statusColor,
//   value,
//   change = "5%",
//   description,
//   showProgress = false,
//   chartColor,
//   highlightText,
// }) {
//   const totalSegments = 55;
//   const safeValue = Number(value) || 0;
//   const filledSegments = Math.round((safeValue / 100) * totalSegments);

//   return (
//     <div className="w-full flex flex-col gap-[28px] border border-[#E1E6ED] px-5 pt-[18px] pb-5 rounded-[15px] bg-white">
//       <div className="flex justify-between items-center gap-3">
//         <div className="flex gap-[5px] items-center min-w-0">
//           <p className="text-[#252525] text-[15px] font-semibold leading-normal tracking-[-0.3px] whitespace-nowrap">
//             {title}
//           </p>
//         </div>

//         <div
//           className="px-[25px] py-1.5 rounded-[24px] shrink-0"
//           style={{ backgroundColor: statusColor }}
//         >
//           <p className="text-white text-[12px] font-semibold leading-normal tracking-[-0.24px]">
//             {status}
//           </p>
//         </div>
//       </div>

//       <div className="flex flex-col">
//         <div className="relative h-4 mb-[6px] w-full">
//           <span className="absolute left-0 text-[8px] font-normal text-[#535359] leading-[110%] tracking-[-0.16px]">
//             0
//           </span>
//           <span className="absolute left-[23.95%] -translate-x-1/2 text-[8px] font-normal text-[#535359] leading-[110%] tracking-[-0.16px]">
//             60
//           </span>
//           <span className="absolute left-[48.5%] -translate-x-1/2 text-[8px] font-normal text-[#535359] leading-[110%] tracking-[-0.16px]">
//             80
//           </span>
//           <span className="absolute right-0 text-[8px] font-normal text-[#535359] leading-[110%] tracking-[-0.16px]">
//             100
//           </span>
//         </div>

//         <div className="flex items-center gap-[3px] w-full">
//           {Array.from({ length: totalSegments }).map((_, i) => (
//             <div
//               key={`${title}-${i}`}
//               className="flex-1 h-[40px]"
//               style={{
//                 backgroundColor: i < filledSegments ? statusColor : "#E1E6ED",
//               }}
//             />
//           ))}
//         </div>

//         <div className="flex items-end justify-between gap-4 flex-wrap mt-[25px]">
//           <div className="flex items-baseline gap-[4px]">
//             <p className="text-[#252525] text-[72px] font-normal leading-none tracking-[-1.44px]">
//               {safeValue}
//             </p>
//             <p className="text-[#252525] text-[20px] font-semibold leading-none tracking-[-0.4px]">
//               %
//             </p>
//           </div>

//           <div className="flex gap-[5px] items-center pb-2">
//             <p className="text-[#252525] text-[10px] font-semibold leading-normal tracking-[-0.2px]">
//               {change}
//             </p>
//             <p className="text-[#252525] text-[10px] font-normal leading-normal tracking-[-0.2px]">
//               than last week
//             </p>
//           </div>
//         </div>
//       </div>

//       <div>
//         <p className="text-[#738298] text-[12px] font-normal leading-[130%]">
//           <b className="font-semibold">{highlightText} </b>
//           {description}
//         </p>
//       </div>

//       {showProgress && <ProgressCard color={chartColor} />}
//     </div>
//   );
// }

// export default function TrendPopUp({ closePopup }) {
//   const [activeTab, setActiveTab] = useState("digestive_balance_trend");

//   const clientIndividualProfile = useSelector(selectClientIndividualProfileData);
//   const clientIndividualProfileStatus = useSelector(selectClientIndividualProfileStatus);
//   const clientIndividualProfileError = useSelector(selectClientIndividualProfileError);

//   console.log("clientIndividualProfile :-", clientIndividualProfile);

//   const trendBreakdown = clientIndividualProfile?.data?.trend_breakdown || {};

//   const tabs = [
//     {
//       id: "digestive_balance_trend",
//       title:
//         trendBreakdown?.digestive_balance_trend?.tab_title || "Digestive Balance Trend",
//       status:
//         trendBreakdown?.digestive_balance_trend?.items?.[0]?.zone || "Optimal",
//       statusColor: getZoneColor(
//         trendBreakdown?.digestive_balance_trend?.items?.[0]?.zone || "Optimal"
//       ),
//       cards:
//         trendBreakdown?.digestive_balance_trend?.items?.map((item, index) => ({
//           id: `digestive_balance_trend-${index}`,
//           title: item?.title || "NA",
//           status: item?.zone || "NA",
//           statusColor: getZoneColor(item?.zone),
//           value: item?.score ?? 0,
//           change: "5%",
//           description: item?.short_text || "",
//           chartColor: getZoneColor(item?.zone),
//           highlightText: item?.interpretation || "",
//         })) || [],
//     },
//     {
//       id: "fuel_and_energy_trend",
//       title: trendBreakdown?.fuel_and_energy_trend?.tab_title || "Fuel & Energy Trend",
//       status: trendBreakdown?.fuel_and_energy_trend?.items?.[0]?.zone || "Focus",
//       statusColor: getZoneColor(
//         trendBreakdown?.fuel_and_energy_trend?.items?.[0]?.zone || "Focus"
//       ),
//       cards:
//         trendBreakdown?.fuel_and_energy_trend?.items?.map((item, index) => ({
//           id: `fuel_and_energy_trend-${index}`,
//           title: item?.title || "NA",
//           status: item?.zone || "NA",
//           statusColor: getZoneColor(item?.zone),
//           value: item?.score ?? 0,
//           change: "5%",
//           description: item?.short_text || "",
//           chartColor: getZoneColor(item?.zone),
//           highlightText: item?.interpretation || "",
//         })) || [],
//     },
//     {
//       id: "metabolic_recovery_trend",
//       title:
//         trendBreakdown?.metabolic_recovery_trend?.tab_title || "Metabolic Recovery Trend",
//       status:
//         trendBreakdown?.metabolic_recovery_trend?.items?.[0]?.zone || "Moderate",
//       statusColor: getZoneColor(
//         trendBreakdown?.metabolic_recovery_trend?.items?.[0]?.zone || "Moderate"
//       ),
//       cards:
//         trendBreakdown?.metabolic_recovery_trend?.items?.map((item, index) => ({
//           id: `metabolic_recovery_trend-${index}`,
//           title: item?.title || "NA",
//           status: item?.zone || "NA",
//           statusColor: getZoneColor(item?.zone),
//           value: item?.score ?? 0,
//           change: "5%",
//           description: item?.short_text || "",
//           chartColor: getZoneColor(item?.zone),
//           highlightText: item?.interpretation || "",
//         })) || [],
//     },
//   ];

//   const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];

//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
//       onClick={closePopup}
//     >
//       <div
//         className="bg-white rounded-[12px] shadow-lg relative"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button
//           onClick={closePopup}
//           className="absolute top-5 right-5 text-[18px] font-bold text-[#252525] z-10 cursor-pointer"
//         >
//           ✕
//         </button>

//         <div className="px-[15px] py-6">
//           <div className="pl-2.5 pb-[25px] border-b border-[#E1E6ED]">
//             <p className="text-[#252525] text-[25px] font-semibold leading-normal tracking-[-1px]">
//               Trend Breakdown
//             </p>
//           </div>

//           {clientIndividualProfileStatus === "loading" && (
//             <p className="pt-5 text-[14px] text-[#738298]">Loading...</p>
//           )}

//           {clientIndividualProfileStatus === "failed" && (
//             <p className="pt-5 text-[14px] text-red-500">
//               {clientIndividualProfileError || "Failed to load data"}
//             </p>
//           )}

//           {clientIndividualProfileStatus !== "loading" &&
//             clientIndividualProfileStatus !== "failed" && (
//               <div className="flex gap-10 pt-5">
//                 <div>
//                   {tabs.map((tab, index) => {
//                     const isActive = activeTab === tab.id;

//                     return (
//                       <div
//                         key={tab.id}
//                         onClick={() => setActiveTab(tab.id)}
//                         className={`flex flex-col gap-1.5 pt-2.5 px-2.5 pb-5 cursor-pointer ${
//                           isActive
//                             ? "bg-[#F0F6FD] rounded-[10px]"
//                             : index !== tabs.length - 1
//                             ? "border-b border-[#D9D9D9]"
//                             : ""
//                         }`}
//                       >
//                         <p className="text-[#252525] text-[15px] font-semibold leading-[126%] tracking-[-0.3px] whitespace-nowrap">
//                           {tab.title}
//                         </p>
//                         <p
//                           className="text-[12px] font-semibold leading-[126%] tracking-[-0.24px]"
//                           style={{ color: tab.statusColor }}
//                         >
//                           {tab.status}
//                         </p>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 <div className="flex gap-5">
//                   {activeTabData?.cards?.map((card) => (
//                     <div key={card.id} className="w-[410px]">
//                       <TrendCard
//                         title={card.title}
//                         status={card.status}
//                         statusColor={card.statusColor}
//                         value={card.value}
//                         change={card.change}
//                         description={card.description}
//                         showProgress={true}
//                         chartColor={card.chartColor}
//                         highlightText={card.highlightText}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//         </div>
//       </div>
//     </div>
//   );
// }













"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IoIosArrowDown } from "react-icons/io";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { fetchProgressData } from "../../store/progressSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function getZoneColor(zone) {
  const normalizedZone = String(zone || "").toLowerCase();

  if (normalizedZone === "optimal") return "#3FAF58";
  if (normalizedZone === "moderate") return "#FFBF2D";
  if (normalizedZone === "focus") return "#E48326";

  return "#308BF9";
}

function getGraphKeyByTitle(title) {
  const normalizedTitle = String(title || "").trim().toLowerCase();

  const graphKeyMap = {
    "nutrient utilization trend": "nutrient_utilization_trend",
    "nutrient utilization": "nutrient_utilization_trend",
    "digestive activity trend": "digestive_activity_trend",
    "digestive activity": "digestive_activity_trend",
    "fuel utilization trend": "fuel_utilization_trend",
    "fuel utilization": "fuel_utilization_trend",
    "energy source trend": "energy_source_trend",
    "energy source": "energy_source_trend",
    "metabolic load trend": "metabolic_load_trend",
    "metabolic load": "metabolic_load_trend",
    "recovery activity trend": "recovery_activity_trend",
    "recovery activity": "recovery_activity_trend",
    "overall fat loss score": "overall_fat_loss_score",
  };

  return graphKeyMap[normalizedTitle] || "";
}

function ProgressCard({
  color = "#308BF9",
  graphKey,
  profileId,
  recommendedRange,
}) {
  const dispatch = useDispatch();
  const [selectedRange, setSelectedRange] = useState("One Week");
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const progressState = useSelector((state) => state.progress || {});
  const progressSliceData = progressState?.data || null;
  const progressLoading = progressState?.loading || false;
  const progressError = progressState?.error || null;

  const ranges = ["One Week", "One Month", "All Time"];

  const rangeToApiMap = {
    "One Week": "weekly",
    "One Month": "monthly",
    "All Time": "all_time",
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!profileId) return;

    const apiRange = rangeToApiMap[selectedRange] || "weekly";

    dispatch(
      fetchProgressData({
        profileId,
        range: apiRange,
      })
    );
  }, [dispatch, profileId, selectedRange]);

  // Get graph data from the graphs object
  const graphItem = useMemo(() => {
    if (!progressSliceData?.graphs) return null;
    
    // graphs is an object, not an array
    const graphs = progressSliceData.graphs;
    
    // Get the specific graph by key
    const graphData = graphs[graphKey];
    
    if (!graphData) return null;
    
    // Transform the data to the format expected by the chart
    return {
      title: graphData.title,
      data: graphData.graph_points || [],
      recommended_trend_range: graphData.recommended_trend_range,
      total_points: graphData.total_points,
    };
  }, [progressSliceData, graphKey]);

  const labels = useMemo(() => {
    return graphItem?.data?.map((item) => item.label) || [];
  }, [graphItem]);

  const values = useMemo(() => {
    return graphItem?.data?.map((item) => Number(item.value) || 0) || [];
  }, [graphItem]);

  const data = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: graphItem?.title || "Progress",
          data: values,
          borderColor: "#308BF9",
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) return "rgba(48,139,249,0.3)";

            // Create gradient: #30ADF9 at top to transparent at bottom with 0.3 opacity
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(48, 173, 249, 0.3)");
            gradient.addColorStop(1, "rgba(48, 139, 249, 0)");
            return gradient;
          },
          pointRadius: (ctx) => (ctx.dataIndex === values.length - 1 ? 6 : 0),
          pointHoverRadius: 6,
          pointBackgroundColor: "#308BF9",
          pointBorderColor: "#308BF9",
          pointBorderWidth: 0,
        },
      ],
    };
  }, [labels, values, graphItem]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          displayColors: false,
          backgroundColor: "rgba(0,0,0,0.75)",
          padding: 10,
          titleFont: { size: 12, weight: "600" },
          bodyFont: { size: 12, weight: "500" },
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y}%`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: true,
            borderDash: [4, 4],
            drawBorder: false,
            color: "#E1E6ED",
          },
          ticks: {
            color: "#8A8A8F",
            font: { size: 11, weight: "500" },
            maxRotation: 0,
            autoSkip: true,
          },
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            callback: function (value) {
              return value;
            },
            color: "#8A8A8F",
            font: { size: 11, weight: "500" },
          },
          grid: {
            display: true,
            borderDash: [4, 4],
            drawBorder: false,
            color: "#E1E6ED",
          },
        },
      },
      elements: {
        line: {
          capBezierPoints: true,
        },
      },
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 pt-1">
      <div className="flex justify-between items-center">
        {recommendedRange?.label ? (
          <p className="text-[#738298] text-[12px] font-normal leading-[110%] tracking-[-0.24px]">
            {/* Recommended: {recommendedRange.label} */}
          </p>
        ) : (
          <div />
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => !prev)}
            className="flex gap-[15px] px-[11px] py-1 border border-[#E1E6ED] rounded-[4px] items-center bg-white cursor-pointer"
          >
            <p className="text-[#535359] text-[12px] font-normal leading-[110%] tracking-[-0.24px] whitespace-nowrap">
              {selectedRange}
            </p>
            <IoIosArrowDown
              className={`text-[#A1A1A1] w-[15px] h-[15px] transition-transform duration-200 ${
                openDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDropdown && (
            <div className="absolute right-0 top-full mt-1 min-w-full bg-white border border-[#E1E6ED] rounded-[6px] shadow-md z-20 overflow-hidden">
              {ranges.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSelectedRange(item);
                    setOpenDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[12px] leading-[110%] tracking-[-0.24px] transition-colors cursor-pointer ${
                    selectedRange === item
                      ? "bg-[#F5F7FA] text-[#252525] font-medium"
                      : "text-[#535359] hover:bg-[#F5F7FA]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-[170px]">
        {progressLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-[#738298] text-[12px] font-normal leading-[110%] tracking-[-0.24px]">
              Loading graph...
            </p>
          </div>
        ) : progressError ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-red-500 text-[12px] font-normal leading-[110%] tracking-[-0.24px]">
              {progressError}
            </p>
          </div>
        ) : labels.length > 0 && values.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-[#738298] text-[12px] font-normal leading-[110%] tracking-[-0.24px]">
              No graph data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


function TrendCard({
  title,
  status,
  statusColor,
  value,
  change = "5%",
  description,
  showProgress = false,
  chartColor,
  highlightText,
  graphKey,
  profileId,
  recommendedRange,
}) {
  const totalSegments = 55;
  const roundedValue = Math.round(Number(value) || 0);
  const filledSegments = Math.round((roundedValue / 100) * totalSegments);

  return (
    <div className="w-full flex flex-col gap-[28px] border border-[#E1E6ED] px-5 pt-[18px] pb-5 rounded-[15px] bg-white">
      <div className="flex justify-between items-center gap-3">
        <div className="flex gap-[5px] items-center min-w-0">
          <p className="text-[#252525] text-[15px] font-semibold leading-normal tracking-[-0.3px] whitespace-nowrap">
            {title}
          </p>
        </div>

        <div
          className="px-[25px] py-1.5 rounded-[24px] shrink-0"
          style={{ backgroundColor: statusColor }}
        >
          <p className="text-white text-[12px] font-semibold leading-normal tracking-[-0.24px]">
            {status}
          </p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="relative h-4 mb-[6px] w-full">
          <span className="absolute left-0 text-[8px] font-normal text-[#535359] leading-[110%] tracking-[-0.16px]">
            0
          </span>
          <span className="absolute left-[60%] -translate-x-1/2 text-[8px] font-normal text-[#535359] leading-[110%] tracking-[-0.16px]">
            60
          </span>
          <span className="absolute left-[80%] -translate-x-1/2 text-[8px] font-normal text-[#535359] leading-[110%] tracking-[-0.16px]">
            80
          </span>
          <span className="absolute right-0 text-[8px] font-normal text-[#535359] leading-[110%] tracking-[-0.16px]">
            100
          </span>
        </div>

        <div className="flex items-center gap-[3px] w-full">
          {Array.from({ length: totalSegments }).map((_, i) => (
            <div
              key={`${title}-${i}`}
              className="flex-1 h-[40px]"
              style={{
                backgroundColor: i < filledSegments ? statusColor : "#E1E6ED",
              }}
            />
          ))}
        </div>

        <div className="flex items-end justify-between gap-4 flex-wrap mt-[25px]">
          <div className="flex items-baseline gap-[4px]">
            <p className="text-[#252525] text-[72px] font-normal leading-none tracking-[-1.44px]">
              {roundedValue}
            </p>
            <p className="text-[#252525] text-[20px] font-semibold leading-none tracking-[-0.4px]">
              %
            </p>
          </div>

          <div className="flex gap-[5px] items-center pb-2">
            <p className="text-[#252525] text-[10px] font-semibold leading-normal tracking-[-0.2px]">
              {change}
            </p>
            <p className="text-[#252525] text-[10px] font-normal leading-normal tracking-[-0.2px]">
              than last week
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[#738298] text-[12px] font-normal leading-[130%]">
          <b className="font-semibold">{highlightText} </b>
          {description}
        </p>
      </div>

      {showProgress && (
        <ProgressCard
          color={chartColor}
          graphKey={graphKey}
          profileId={profileId}
          recommendedRange={recommendedRange}
        />
      )}
    </div>
  );
}

export default function TrendPopUp({ closePopup, profileId }) {
  const [activeTab, setActiveTab] = useState("digestive_balance_trend");

  const clientIndividualProfile = useSelector((state) => state.clientIndividualProfile?.data);
  const clientIndividualProfileStatus = useSelector(
    (state) => state.clientIndividualProfile?.status
  );
  const clientIndividualProfileError = useSelector(
    (state) => state.clientIndividualProfile?.error
  );

  const trendBreakdown = clientIndividualProfile?.data?.trend_breakdown || {};

  const recommendedRange = useSelector((state) => {
    const progressData = state.progress?.data;
    return (
      progressData?.recommended_trend_range ||
      progressData?.data?.recommended_trend_range ||
      null
    );
  });

  const tabs = [
    {
      id: "digestive_balance_trend",
      title:
        trendBreakdown?.digestive_balance_trend?.tab_title ||
        "Digestive Balance Trend",
      status:
        trendBreakdown?.digestive_balance_trend?.items?.[0]?.zone || "Optimal",
      statusColor: getZoneColor(
        trendBreakdown?.digestive_balance_trend?.items?.[0]?.zone || "Optimal"
      ),
      cards:
        trendBreakdown?.digestive_balance_trend?.items?.map((item, index) => ({
          id: `digestive_balance_trend-${index}`,
          title: item?.title || "NA",
          status: item?.zone || "NA",
          statusColor: getZoneColor(item?.zone),
          value: item?.score ?? 0,
          change: "5%",
          description: item?.short_text || "",
          chartColor: getZoneColor(item?.zone),
          highlightText: item?.interpretation || "",
          graphKey: getGraphKeyByTitle(item?.title),
        })) || [],
    },
    {
      id: "fuel_and_energy_trend",
      title:
        trendBreakdown?.fuel_and_energy_trend?.tab_title ||
        "Fuel & Energy Trend",
      status:
        trendBreakdown?.fuel_and_energy_trend?.items?.[0]?.zone || "Focus",
      statusColor: getZoneColor(
        trendBreakdown?.fuel_and_energy_trend?.items?.[0]?.zone || "Focus"
      ),
      cards:
        trendBreakdown?.fuel_and_energy_trend?.items?.map((item, index) => ({
          id: `fuel_and_energy_trend-${index}`,
          title: item?.title || "NA",
          status: item?.zone || "NA",
          statusColor: getZoneColor(item?.zone),
          value: item?.score ?? 0,
          change: "5%",
          description: item?.short_text || "",
          chartColor: getZoneColor(item?.zone),
          highlightText: item?.interpretation || "",
          graphKey: getGraphKeyByTitle(item?.title),
        })) || [],
    },
    {
      id: "metabolic_recovery_trend",
      title:
        trendBreakdown?.metabolic_recovery_trend?.tab_title ||
        "Metabolic Recovery Trend",
      status:
        trendBreakdown?.metabolic_recovery_trend?.items?.[0]?.zone ||
        "Moderate",
      statusColor: getZoneColor(
        trendBreakdown?.metabolic_recovery_trend?.items?.[0]?.zone ||
          "Moderate"
      ),
      cards:
        trendBreakdown?.metabolic_recovery_trend?.items?.map((item, index) => ({
          id: `metabolic_recovery_trend-${index}`,
          title: item?.title || "NA",
          status: item?.zone || "NA",
          statusColor: getZoneColor(item?.zone),
          value: item?.score ?? 0,
          change: "5%",
          description: item?.short_text || "",
          chartColor: getZoneColor(item?.zone),
          highlightText: item?.interpretation || "",
          graphKey: getGraphKeyByTitle(item?.title),
        })) || [],
    },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
      onClick={closePopup}
    >
      <div
        className="bg-white rounded-[12px] shadow-lg relative max-w-[90vw] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closePopup}
          className="absolute top-5 right-5 text-[18px] font-bold text-[#252525] z-10 cursor-pointer"
        >
          ✕
        </button>

        <div className="px-[15px] py-6">
          <div className="pl-2.5 pb-[25px] border-b border-[#E1E6ED]">
            <p className="text-[#252525] text-[25px] font-semibold leading-normal tracking-[-1px]">
              Trend Breakdown
            </p>
          </div>

          {clientIndividualProfileStatus === "loading" && (
            <p className="pt-5 text-[14px] text-[#738298]">Loading...</p>
          )}

          {clientIndividualProfileStatus === "failed" && (
            <p className="pt-5 text-[14px] text-red-500">
              {clientIndividualProfileError || "Failed to load data"}
            </p>
          )}

          {clientIndividualProfileStatus !== "loading" &&
            clientIndividualProfileStatus !== "failed" && (
              <div className="flex gap-10 pt-5">
                <div>
                  {tabs.map((tab, index) => {
                    const isActive = activeTab === tab.id;

                    return (
                      <div
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col gap-1.5 pt-2.5 px-2.5 pb-5 cursor-pointer ${
                          isActive
                            ? "bg-[#F0F6FD] rounded-[10px]"
                            : index !== tabs.length - 1
                            ? "border-b border-[#D9D9D9]"
                            : ""
                        }`}
                      >
                        <p className="text-[#252525] text-[15px] font-semibold leading-[126%] tracking-[-0.3px] whitespace-nowrap">
                          {tab.title}
                        </p>
                        <p
                          className="text-[12px] font-semibold leading-[126%] tracking-[-0.24px]"
                          style={{ color: tab.statusColor }}
                        >
                          {tab.status}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-5 overflow-x-auto">
                  {activeTabData?.cards?.map((card) => (
                    <div key={card.id} className="w-[410px] shrink-0">
                      <TrendCard
                        title={card.title}
                        status={card.status}
                        statusColor={card.statusColor}
                        value={card.value}
                        change={card.change}
                        description={card.description}
                        showProgress={true}
                        chartColor={card.chartColor}
                        highlightText={card.highlightText}
                        graphKey={card.graphKey}
                        profileId={profileId}
                        recommendedRange={recommendedRange}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}