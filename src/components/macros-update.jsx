"use client";

import Image from "next/image";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useRef, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { IoIosArrowForward } from "react-icons/io";
import {
  selectDietAnalysisData,
  selectDietAnalysisLoading,
  selectDietAnalysisError,
} from "../store/dietAnalysisSlice";
import CalculationPopup from "./pop-folder/calculation-popup";

ChartJS.register(ArcElement, Tooltip, Legend);

const oneEndRoundedPlugin = {
  id: "oneEndRounded",
  afterDatasetDraw(chart) {
    if (chart.config.type !== "doughnut" && chart.config.type !== "pie") {
      return;
    }

    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((arc) => {
      const { endAngle, innerRadius, outerRadius, x, y } = arc;

      const capRadius = (outerRadius - innerRadius) / 2;
      const midRadius = (outerRadius + innerRadius) / 2;

      const arcSpan = Math.abs(arc.endAngle - arc.startAngle);
      const minAngle = (2 * capRadius) / midRadius;
      if (arcSpan < minAngle * 0.5) return;

      const capX = x + midRadius * Math.cos(endAngle);
      const capY = y + midRadius * Math.sin(endAngle);

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, outerRadius, 0, Math.PI * 2, false);
      ctx.arc(x, y, innerRadius, Math.PI * 2, 0, true);
      ctx.clip();

      ctx.beginPath();
      ctx.arc(capX, capY, capRadius, 0, Math.PI * 2);
      ctx.fillStyle = arc.options.backgroundColor;
      ctx.fill();
      ctx.restore();
    });

    const { chartArea } = chart;
    const innerCircleRadius = (chartArea.width / 2) * 0.78;
    const outerCircleRadius = chartArea.width / 2;
    const lineWidth = 4;
    const borderColor = "#E1E6ED";

    ctx.save();
    ctx.beginPath();
    ctx.arc(
      chartArea.left + chartArea.width / 2,
      chartArea.top + chartArea.height / 2,
      innerCircleRadius,
      0,
      Math.PI * 2
    );
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(
      chartArea.left + chartArea.width / 2,
      chartArea.top + chartArea.height / 2,
      outerCircleRadius,
      0,
      Math.PI * 2
    );
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.restore();
  },
};

export default function MacrosUpdate() {
  const chartRef = useRef(null);
  const [labels, setLabels] = useState([]);
  const prevDataRef = useRef(null);
  const [showCalculationPopup, setShowCalculationPopup] = useState(false);

  const dietAnalysisData = useSelector(selectDietAnalysisData);
  const dietAnalysisLoading = useSelector(selectDietAnalysisLoading);
  const dietAnalysisError = useSelector(selectDietAnalysisError);

  useEffect(() => {
    ChartJS.register(oneEndRoundedPlugin);

    return () => {
      ChartJS.unregister(oneEndRoundedPlugin);
    };
  }, []);

  const weeklyData =
    dietAnalysisData?.data?.food_json?.weekly_json_data || {};

  const title = "Macros Update";
  const totalCalories = Number(weeklyData?.calories || 0);
  const description = weeklyData?.note || "";
  const unit = "Kcal";

  const macros = [
    {
      name: "Carbs",
      color: "#F4A261",
      grams: `${Number(weeklyData?.carbs_g || 0).toFixed(2)}g`,
      value: Number(weeklyData?.carbs_g || 0),
      icon: "/icons/hugeicons_arrow-down-020.svg",
      change: "0%",
    },
    {
      name: "Fats",
      color: "#3A86FF",
      grams: `${Number(weeklyData?.fat_g || 0).toFixed(2)}g`,
      value: Number(weeklyData?.fat_g || 0),
      icon: "/icons/hugeicons_arrow-down-0244.svg",
      change: "0%",
    },
    {
      name: "Protein",
      color: "#E76F51",
      grams: `${Number(weeklyData?.protein_g || 0).toFixed(2)}g`,
      value: Number(weeklyData?.protein_g || 0),
      icon: "/icons/hugeicons_arrow-down-0244.svg",
      change: "0%",
    },
    {
      name: "Fibre",
      color: "#2A9D8F",
      grams: `${Number(weeklyData?.fiber_g || 0).toFixed(2)}g`,
      value: Number(weeklyData?.fiber_g || 0),
      icon: "/icons/hugeicons_arrow-down-0244.svg",
      change: "0%",
    },
  ];

  const total = useMemo(() => {
    return macros.reduce((acc, item) => acc + item.value, 0);
  }, [
    weeklyData?.carbs_g,
    weeklyData?.fat_g,
    weeklyData?.protein_g,
    weeklyData?.fiber_g,
  ]);

  const dataInOrder = macros.map((macro) => macro.value);
  const colorsInOrder = macros.map((macro) => macro.color);

  const donutData = {
    datasets: [
      {
        data: dataInOrder,
        backgroundColor: colorsInOrder,
        borderWidth: 0,
        borderRadius: 0,
        spacing: 0,
        cutout: "78%",
        circumference: 360,
        rotation: -45,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  useEffect(() => {
    const currentDataString = JSON.stringify({
      carbs: weeklyData?.carbs_g,
      fat: weeklyData?.fat_g,
      protein: weeklyData?.protein_g,
      fiber: weeklyData?.fiber_g,
    });

    if (prevDataRef.current === currentDataString) {
      return;
    }

    prevDataRef.current = currentDataString;

    const timer = setTimeout(() => {
      const chart = chartRef.current;

      if (!chart || total <= 0) {
        setLabels([]);
        return;
      }

      const meta = chart.getDatasetMeta(0);

      if (!meta?.data?.length) {
        setLabels([]);
        return;
      }

      const nextLabels = meta.data.map((arc, index) => {
        const centerAngle = (arc.startAngle + arc.endAngle) / 2;
        const labelRadius = arc.outerRadius + 14;

        const x = arc.x + Math.cos(centerAngle) * labelRadius;
        const y = arc.y + Math.sin(centerAngle) * labelRadius;

        return {
          ...macros[index],
          percentage:
            total > 0 ? Math.round((macros[index].value / total) * 100) : 0,
          x,
          y,
        };
      });

      setLabels(nextLabels);
    }, 100);

    return () => clearTimeout(timer);
  }, [
    weeklyData?.carbs_g,
    weeklyData?.fat_g,
    weeklyData?.protein_g,
    weeklyData?.fiber_g,
    total,
  ]);

  const handleOpenCalculationPopup = () => {
    setShowCalculationPopup(true);
  };

  const handleCloseCalculationPopup = () => {
    setShowCalculationPopup(false);
  };

  const ViewCalculationButton = () => (
    <button
      type="button"
      onClick={handleOpenCalculationPopup}
      className="flex gap-[15px] items-center px-[11px] py-1 border border-[#E1E6ED] rounded-[4px] cursor-pointer"
    >
      <p className="text-[#308BF9] text-[12px] font-semibold leading-normal tracking-[-0.24px] whitespace-nowrap">
        View Calculation
      </p>
      <IoIosArrowForward className="text-[#308BF9] w-5 h-5" />
    </button>
  );

  if (dietAnalysisLoading) {
    return (
      <>
        <div
          id="macros-update-container"
          className="w-[356px] pt-5 pr-1 pb-5 bg-[#F5F7FA] rounded-[15px]"
        >
          <div className="flex items-center justify-between px-[18px] pr-[10px]">
            <p className="text-[#738298] text-[12px] font-semibold uppercase">
              {title}
            </p>

            <ViewCalculationButton />
          </div>

          <div className="flex justify-center items-center py-10">
            <p className="text-[#738298] text-[12px]">Loading...</p>
          </div>
        </div>

        {showCalculationPopup && (
          <CalculationPopup onClose={handleCloseCalculationPopup} />
        )}
      </>
    );
  }

  if (dietAnalysisError) {
    return (
      <>
        <div
          id="macros-update-container"
          className="w-[356px] pt-5 pr-1 pb-5 bg-[#F5F7FA] rounded-[15px]"
        >
          <div className="flex items-center justify-between px-[18px] pr-[10px]">
            <p className="text-[#738298] text-[12px] font-semibold uppercase">
              Macros Update
            </p>

            <ViewCalculationButton />
          </div>

          <div className="flex justify-center items-center py-10 px-4">
            <p className="text-red-500 text-[12px] text-center">
              {dietAnalysisError}
            </p>
          </div>
        </div>

        {showCalculationPopup && (
          <CalculationPopup onClose={handleCloseCalculationPopup} />
        )}
      </>
    );
  }

  return (
    <>
      <div
        id="macros-update-container"
        className="w-[356px] pt-5 pr-1 pb-5 bg-[#F5F7FA] rounded-[15px]"
      >
        <div className="flex items-center justify-between px-[18px] pr-[10px]">
          <p className="text-[#738298] text-[12px] font-semibold uppercase">
            {title}
          </p>

          <ViewCalculationButton />
        </div>

        <div className="flex justify-center items-center py-5">
          <div className="relative w-[200px] h-[200px]">
            <Doughnut ref={chartRef} data={donutData} options={donutOptions} />

            <div className="absolute inset-0 flex flex-col gap-[2px] items-center justify-center pointer-events-none">
              <p className="text-[#535359] text-[10px] font-semibold">
                Calories
              </p>
              <p className="text-[#252525] text-[40px]">
                {totalCalories.toFixed(2)}
              </p>
              <p className="text-[#535359] text-[10px]">{unit}</p>
            </div>

            {total > 0 &&
              labels.map((label, index) => (
                <div
                  key={index}
                  className="absolute min-w-[47px] h-[24px] px-2 rounded-full bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.12)] flex items-center justify-center"
                  style={{
                    left: `${label.x}px`,
                    top: `${label.y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <p className="text-[#252525] text-[12px] font-semibold">
                    {label.percentage}%
                  </p>
                </div>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex">
            {macros.map((macro, index) => (
              <div
                key={index}
                className="flex flex-col gap-2.5 w-[87px] items-center"
              >
                <div className="flex gap-[5px] items-center">
                  <div
                    className="w-[6px] h-[6px] rounded-full"
                    style={{ background: macro.color }}
                  ></div>
                  <p className="text-[#252525] text-[10px] font-semibold capitalize">
                    {macro.name}
                  </p>
                </div>

                <div className="flex flex-col justify-center">
                  <p className="text-[#252525] text-[15px] font-semibold">
                    {macro.grams}
                  </p>
                  <div className="flex items-center">
                    <Image
                      src={macro.icon}
                      alt="arrow"
                      width={20}
                      height={20}
                    />
                    <p className="text-[#252525] text-[10px] font-semibold py-[2.5px]">
                      {macro.change}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pl-[18px] pr-[10px]">
            <p className="text-[#738298] text-[12px] leading-[130%]">
              {description}
            </p>
          </div>
        </div>
      </div>

      {showCalculationPopup && (
        <CalculationPopup onClose={handleCloseCalculationPopup} />
      )}
    </>
  );
}




// "use client";
// import Image from "next/image";
// import { Doughnut } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { useEffect, useRef, useState, useMemo } from "react"; // Add useMemo

// ChartJS.register(ArcElement, Tooltip, Legend);

// // ✅ One-sided rounded cap with clipping fix
// const oneEndRoundedPlugin = {
//   id: "oneEndRounded",
//   afterDatasetDraw(chart) {
//     const { ctx } = chart;
//     const meta = chart.getDatasetMeta(0);

//     meta.data.forEach((arc) => {
//       const { startAngle, endAngle, innerRadius, outerRadius, x, y } = arc;

//       const capRadius = (outerRadius - innerRadius) / 2;
//       const midRadius = (outerRadius + innerRadius) / 2;

//       // ✅ Skip tiny arcs to prevent cap bleeding into neighbors
//       const arcSpan = Math.abs(endAngle - startAngle);
//       const minAngle = (2 * capRadius) / midRadius;
//       if (arcSpan < minAngle * 0.5) return;

//       const capX = x + midRadius * Math.cos(endAngle);
//       const capY = y + midRadius * Math.sin(endAngle);

//       // ✅ Clip to donut ring so cap never bleeds outside its segment
//       ctx.save();
//       ctx.beginPath();
//       ctx.arc(x, y, outerRadius, 0, Math.PI * 2, false);
//       ctx.arc(x, y, innerRadius, Math.PI * 2, 0, true);
//       ctx.clip();

//       ctx.beginPath();
//       ctx.arc(capX, capY, capRadius, 0, Math.PI * 2);
//       ctx.fillStyle = arc.options.backgroundColor;
//       ctx.fill();
//       ctx.restore();
//     });

//     // Add custom border for inner and outer circle
//     const { chartArea } = chart;
//     const innerCircleRadius = chartArea.width / 2 * 0.78;
//     const outerCircleRadius = chartArea.width / 2;
//     const lineWidth = 4;
//     const borderColor = '#E1E6ED';

//     // Draw the inner circle border
//     ctx.save();
//     ctx.beginPath();
//     ctx.arc(chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2, innerCircleRadius, 0, Math.PI * 2);
//     ctx.lineWidth = lineWidth;
//     ctx.strokeStyle = borderColor;
//     ctx.stroke();
//     ctx.restore();

//     // Draw the outer circle border
//     ctx.save();
//     ctx.beginPath();
//     ctx.arc(chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2, outerCircleRadius, 0, Math.PI * 2);
//     ctx.lineWidth = lineWidth;
//     ctx.strokeStyle = borderColor;
//     ctx.stroke();
//     ctx.restore();
//   },
// };

// export default function MacrosUpdate() {
//   const chartRef = useRef(null);
//   const [labelPositions, setLabelPositions] = useState([]);

//   // Register plugin only when this component mounts
//   useEffect(() => {
//     ChartJS.register(oneEndRoundedPlugin);
    
//     return () => {
//       ChartJS.unregister(oneEndRoundedPlugin);
//     };
//   }, []);

//   // Calories per gram for each macro
//   const CALORIES_PER_GRAM = {
//     Carbs: 4,
//     Fats: 9,
//     Protein: 4,
//     Fibre: 2,
//   };

//   // Helper function to extract numeric value from grams string
//   const extractGramsNumber = (gramsString) => {
//     return parseInt(gramsString.replace('g', ''));
//   };

//   // Base macros data without hardcoded values
//   const baseMacros = [
//     { 
//       name: "Carbs", 
//       color: "#F4A261", 
//       grams: "120g",
//       icon: "/icons/hugeicons_arrow-down-020.svg" 
//     },
//     { 
//       name: "Fats", 
//       color: "#3A86FF", 
//       grams: "150g",
//       icon: "/icons/hugeicons_arrow-down-0244.svg" 
//     },
//     { 
//       name: "Protein", 
//       color: "#E76F51", 
//       grams: "250g",
//       icon: "/icons/hugeicons_arrow-down-0244.svg" 
//     },
//     { 
//       name: "Fibre", 
//       color: "#2A9D8F", 
//       grams: "150g",
//       icon: "/icons/hugeicons_arrow-down-0244.svg" 
//     },
//   ];

//   // Calculate total calories - memoize this too
//   const totalCalories = useMemo(() => {
//     return baseMacros.reduce((total, macro) => {
//       const gramsNum = extractGramsNumber(macro.grams);
//       return total + (gramsNum * CALORIES_PER_GRAM[macro.name]);
//     }, 0);
//   }, [baseMacros]); // baseMacros is stable but if it changes, recalculate

//   // Calculate percentages based on calorie contribution and add value property
//   // MEMOIZE this to prevent recreating on every render
//   const macros = useMemo(() => {
//     return baseMacros.map(macro => {
//       const gramsNum = extractGramsNumber(macro.grams);
//       const macroCalories = gramsNum * CALORIES_PER_GRAM[macro.name];
//       const percentage = Math.round((macroCalories / totalCalories) * 100);
//       return {
//         ...macro,
//         value: percentage,
//       };
//     });
//   }, [baseMacros, totalCalories]); // Recalculate only when baseMacros or totalCalories change

//   // Fixed order for colors in Cartesian quadrants
//   const fixedOrderMacros = useMemo(() => ['Carbs', 'Fats', 'Protein', 'Fibre'], []);
  
//   // Get data and colors in fixed order for the chart
//   const getChartDataInFixedOrder = useMemo(() => {
//     const dataInOrder = fixedOrderMacros.map(macroName => {
//       const macro = macros.find(m => m.name === macroName);
//       return macro ? macro.value : 0;
//     });

//     const colorsInOrder = fixedOrderMacros.map(macroName => {
//       const macro = macros.find(m => m.name === macroName);
//       return macro ? macro.color : '#000000';
//     });

//     return { dataInOrder, colorsInOrder };
//   }, [macros, fixedOrderMacros]);

//   const { dataInOrder, colorsInOrder } = getChartDataInFixedOrder;

//   const donutData = useMemo(() => ({
//     datasets: [
//       {
//         data: dataInOrder,
//         backgroundColor: colorsInOrder,
//         borderWidth: 0,
//         borderRadius: 0,
//         spacing: 0,
//         cutout: "78%",
//         circumference: 360,
//         rotation: -45,
//       },
//     ],
//   }), [dataInOrder, colorsInOrder]);

//   const donutOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: true,
//     plugins: {
//       legend: { display: false },
//       tooltip: { enabled: true },
//     },
//   }), []);

//   const total = useMemo(() => macros.reduce((acc, m) => acc + m.value, 0), [macros]);

//   // Update label positions when chart is ready
//   useEffect(() => {
//     if (chartRef.current) {
//       const chart = chartRef.current;
//       const meta = chart.getDatasetMeta(0);
      
//       const positions = meta.data.map((arc, index) => {
//         const { startAngle, endAngle, innerRadius, outerRadius } = arc;
        
//         const centerAngle = (startAngle + endAngle) / 2;
//         const midRadius = (innerRadius + outerRadius) / 2;
//         const labelX = midRadius * Math.cos(centerAngle);
//         const labelY = midRadius * Math.sin(centerAngle);
        
//         const macroName = fixedOrderMacros[index];
//         const macro = macros.find(m => m.name === macroName);
        
//         return {
//           ...macro,
//           x: labelX,
//           y: labelY
//         };
//       });
      
//       setLabelPositions(positions);
//     }
//   }, [macros, fixedOrderMacros]); // Add fixedOrderMacros as dependency too

//   return (
//     <>
//       <div className="w-[356px] pt-5 pr-1 pb-5 bg-[#F5F7FA] rounded-[15px]">
//         <p className="pl-[18px] text-[#738298] text-[12px] font-semibold uppercase">
//           Macros Update
//         </p>

//         <div className="flex justify-center items-center py-5">
//           <div className="relative w-[200px] h-[200px]">
//             <Doughnut 
//               ref={chartRef}
//               data={donutData} 
//               options={donutOptions} 
//             />

//             <div className="absolute inset-0 flex flex-col gap-[2px] items-center justify-center pointer-events-none">
//               <p className="text-[#535359] text-[10px] font-semibold">Calories</p>
//               <p className="text-[#252525] text-[40px]">{totalCalories}</p>
//               <p className="text-[#535359] text-[10px]">Kcal</p>
//             </div>

//             {/* Percentage labels positioned at the center of each colored segment */}
//             {labelPositions.map((label, index) => (
//               <div
//                 key={index}
//                 className="absolute min-w-[47px] h-[24px] p-2 rounded-full bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.12)] flex items-center justify-center"
//                 style={{
//                   left: `calc(50% + ${label.x}px)`,
//                   top: `calc(50% + ${label.y}px)`,
//                   transform: "translate(-50%, -50%)",
//                 }}
//               >
//                 <p className="text-[#252525] text-[12px] font-semibold">{label.value}%</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* MACRO LEGEND */}
//         <div className="flex flex-col gap-2.5">
//           <div className="flex">
//             {macros.map((macro, index) => (
//               <div key={index} className="flex flex-col gap-2.5 w-[87px] items-center">
//                 <div className="flex gap-[5px] items-center">
//                   <div className="w-[6px] h-[6px] rounded-full" style={{ background: macro.color }}></div>
//                   <p className="text-[#252525] text-[10px] font-semibold capitalize">{macro.name}</p>
//                 </div>
//                 <div className="flex flex-col justify-center">
//                   <p className="text-[#252525] text-[15px] font-semibold">{macro.grams}</p>
//                   <div className="flex items-center">
//                     <Image src={macro.icon} alt="arrow" width={20} height={20} />
//                     <p className="text-[#252525] text-[10px] font-semibold py-[2.5px]">5%</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="pl-[18px]">
//             <p className="text-[#738298] text-[12px] leading-[130%]">
//               Digestive Comfort Day shifts calories away from higher-volume carbs; fat rises to maintain calories
//               with lower food volume and typically better comfort. Protein remains anchored for recovery and fiber is
//               capped to reduce gut load today.
//             </p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }