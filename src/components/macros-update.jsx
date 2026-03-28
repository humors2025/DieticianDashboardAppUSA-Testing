"use client";
import Image from "next/image";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

// ✅ One-sided rounded cap with clipping fix - Now only runs on doughnut charts
const oneEndRoundedPlugin = {
  id: "oneEndRounded",
  afterDatasetDraw(chart) {
    // ✅ Only run for doughnut/pie charts, not for line/bar charts
    if (chart.config.type !== 'doughnut' && chart.config.type !== 'pie') {
      return;
    }

    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((arc) => {
      const { startAngle, endAngle, innerRadius, outerRadius, x, y } = arc;

      const capRadius = (outerRadius - innerRadius) / 2;
      const midRadius = (outerRadius + innerRadius) / 2;

      // ✅ Skip tiny arcs to prevent cap bleeding into neighbors
      const arcSpan = Math.abs(endAngle - startAngle);
      const minAngle = (2 * capRadius) / midRadius;
      if (arcSpan < minAngle * 0.5) return;

      const capX = x + midRadius * Math.cos(endAngle);
      const capY = y + midRadius * Math.sin(endAngle);

      // ✅ Clip to donut ring so cap never bleeds outside its segment
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

    // Add custom border for inner and outer circle
    const { chartArea } = chart;
    const innerCircleRadius = chartArea.width / 2 * 0.78;  // Adjust this for inner radius
    const outerCircleRadius = chartArea.width / 2;         // Adjust this for outer radius
    const lineWidth = 4;  // Set the border width
    const borderColor = '#E1E6ED';  // Set the border color

    // Draw the inner circle border
    ctx.save();
    ctx.beginPath();
    ctx.arc(chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2, innerCircleRadius, 0, Math.PI * 2);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.restore();

    // Draw the outer circle border
    ctx.save();
    ctx.beginPath();
    ctx.arc(chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2, outerCircleRadius, 0, Math.PI * 2);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.restore();
  },
};

export default function MacrosUpdate() {
  // Register plugin only when this component mounts
  useEffect(() => {
    // Register the plugin
    ChartJS.register(oneEndRoundedPlugin);
    
    // Cleanup: unregister the plugin when component unmounts
    return () => {
      ChartJS.unregister(oneEndRoundedPlugin);
    };
  }, []);

  // Calories per gram for each macro
  const CALORIES_PER_GRAM = {
    Carbs: 4,
    Fats: 9,
    Protein: 4,
    Fibre: 2,
  };

  // Helper function to extract numeric value from grams string
  const extractGramsNumber = (gramsString) => {
    return parseInt(gramsString.replace('g', ''));
  };

  // Base macros data without hardcoded values
  const baseMacros = [
    { 
      name: "Carbs", 
      color: "#F4A261", 
      grams: "120g",
      icon: "/icons/hugeicons_arrow-down-020.svg" 
    },
    { 
      name: "Fats", 
      color: "#3A86FF", 
      grams: "150g",
      icon: "/icons/hugeicons_arrow-down-0244.svg" 
    },
    { 
      name: "Protein", 
      color: "#E76F51", 
      grams: "250g",
      icon: "/icons/hugeicons_arrow-down-0244.svg" 
    },
    { 
      name: "Fibre", 
      color: "#2A9D8F", 
      grams: "150g",
      icon: "/icons/hugeicons_arrow-down-0244.svg" 
    },
  ];

  // Calculate total calories
  const totalCalories = baseMacros.reduce((total, macro) => {
    const gramsNum = extractGramsNumber(macro.grams);
    return total + (gramsNum * CALORIES_PER_GRAM[macro.name]);
  }, 0);

  // Calculate percentages based on calorie contribution and add value property
  const macros = baseMacros.map(macro => {
    const gramsNum = extractGramsNumber(macro.grams);
    const macroCalories = gramsNum * CALORIES_PER_GRAM[macro.name];
    const percentage = Math.round((macroCalories / totalCalories) * 100);
    return {
      ...macro,
      value: percentage, // Dynamically calculated percentage
    };
  });

  // Fixed order for colors in Cartesian quadrants
  const fixedOrderMacros = ['Carbs', 'Fats', 'Protein', 'Fibre'];
  
  // Get data and colors in fixed order for the chart
  const getChartDataInFixedOrder = () => {
    const dataInOrder = fixedOrderMacros.map(macroName => {
      const macro = macros.find(m => m.name === macroName);
      return macro ? macro.value : 0;
    });

    const colorsInOrder = fixedOrderMacros.map(macroName => {
      const macro = macros.find(m => m.name === macroName);
      return macro ? macro.color : '#000000';
    });

    return { dataInOrder, colorsInOrder };
  };

  const { dataInOrder, colorsInOrder } = getChartDataInFixedOrder();

  const donutData = {
    datasets: [
      {
        data: dataInOrder, // [15, 43, 32, 10] in fixed order
        backgroundColor: colorsInOrder, // Colors in fixed order: [#F4A261, #3A86FF, #E76F51, #2A9D8F]
        borderWidth: 0,
        borderRadius: 0,
        spacing: 0,
        cutout: "78%",
        circumference: 360,
        rotation: -45, // -45° positions first segment (Carbs) in top-right quadrant
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

  const total = macros.reduce((acc, m) => acc + m.value, 0);

  // Updated label positioning function with fixed order - positions labels at the center of each arc
 const getLabelPositions = () => {
  let cumulative = 0;
  const rotation = (-45 * Math.PI) / 180; // Match the chart rotation
  const outerRadius = 100;
  const innerRadius = 78;
  const radius = (outerRadius + innerRadius) / 2; // This places labels in the center of the ring

  // Use fixed order for labels to match chart
  const orderedMacros = fixedOrderMacros.map(name => 
    macros.find(m => m.name === name)
  );

  return orderedMacros.map((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const centerAngle = cumulative + sliceAngle / 2 + rotation; // Center of the segment

    // Calculate position at the center of the arc (midpoint of the ring)
    const x = radius * Math.cos(centerAngle);
    const y = radius * Math.sin(centerAngle);

    cumulative += sliceAngle;

    return { ...item, x, y };
  });
};

  const labels = getLabelPositions();
  console.log("labels222:-", labels);

  return (
    <>
      <div className="w-[356px] pt-5 pr-1 pb-5 bg-[#F5F7FA] rounded-[15px]">
        <p className="pl-[18px] text-[#738298] text-[12px] font-semibold uppercase">
          Macros Update
        </p>

        <div className="flex justify-center items-center py-5">
          <div className="relative w-[200px] h-[200px]">
            <Doughnut data={donutData} options={donutOptions} />

            <div className="absolute inset-0 flex flex-col gap-[2px] items-center justify-center pointer-events-none">
              <p className="text-[#535359] text-[10px] font-semibold">Calories</p>
              <p className="text-[#252525] text-[40px]">{totalCalories}</p>
              <p className="text-[#535359] text-[10px]">Kcal</p>
            </div>

            {/* Percentage labels positioned at the center of each colored segment */}
            {labels.map((label, index) => (
              <div
                key={index}
                className="absolute min-w-[47px] h-[24px] p-2 rounded-full bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.12)] flex items-center justify-center"
                style={{
                  left: `calc(50% + ${label.x}px)`,
                  top: `calc(50% + ${label.y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <p className="text-[#252525] text-[12px] font-semibold">{label.value}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* MACRO LEGEND */}
        <div className="flex flex-col gap-2.5">
          <div className="flex">
            {macros.map((macro, index) => (
              <div key={index} className="flex flex-col gap-2.5 w-[87px] items-center">
                <div className="flex gap-[5px] items-center">
                  <div className="w-[6px] h-[6px] rounded-full" style={{ background: macro.color }}></div>
                  <p className="text-[#252525] text-[10px] font-semibold capitalize">{macro.name}</p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#252525] text-[15px] font-semibold">{macro.grams}</p>
                  <div className="flex items-center">
                    <Image src={macro.icon} alt="arrow" width={20} height={20} />
                    <p className="text-[#252525] text-[10px] font-semibold py-[2.5px]">5%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pl-[18px]">
            <p className="text-[#738298] text-[12px] leading-[130%]">
              Digestive Comfort Day shifts calories away from higher-volume carbs; fat rises to maintain calories
              with lower food volume and typically better comfort. Protein remains anchored for recovery and fiber is
              capped to reduce gut load today.
            </p>
          </div>
        </div>
      </div>
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