"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";
import Image from "next/image";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function Progress() {
  const [selectedRange, setSelectedRange] = useState("One Week");
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const rangeData = {
    "One Week": {
      labels: ["05 Aug", "06 Aug", "07 Aug", "08 Aug", "09 Aug", "10 Aug", "11 Aug"],
      values: [35, 52, 52, 60, 60, 60, 72],
    },
    "One Month": {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [40, 58, 64, 70],
    },
    "All Time": {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      values: [28, 35, 42, 50, 55, 61, 67, 72],
    },
  };

  const { labels, values } = rangeData[selectedRange];

  const ranges = ["One Week", "One Month", "All Time"];

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

  const data = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: "Progress",
          data: values,
          borderColor: "#308BF9",
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) return "rgba(30,120,255,0.12)";

            const gradient = ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom
            );
            gradient.addColorStop(0, "rgba(30,120,255,0.25)");
            gradient.addColorStop(1, "rgba(30,120,255,0)");
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
  }, [labels, values]);

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
          min: 20,
          max: 80,
          ticks: {
            stepSize: 20,
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
  }, [values.length]);

  return (
    <div className="w-[410px] flex flex-col border border-[#E1E6ED] px-5 pt-[18px] pb-5 rounded-[15px] bg-white">
      <div className="flex justify-between items-center">
        <div className="flex gap-[5px] items-center">
          <p className="text-[#252525] text-[15px] font-semibold leading-normal tracking-[-0.3px] whitespace-nowrap">
            Progress
          </p>
        </div>

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

      <div className="flex flex-col gap-[5px] mt-3">
        <p className="text-[#252525] text-[25px] font-semibold leading-normal tracking-[-0.5px]">
          In Range
        </p>

        <div className="flex gap-5 items-center px-[15px] py-[5px] rounded-[5px] bg-[#E0E0E0] whitespace-nowrap w-fit">
          <div className="flex gap-[3px] items-center">
            <p className="text-[#535359] text-[10px] font-semibold leading-[110%] tracking-[-0.2px]">
              RECOMMENDED TREND RANGE
            </p>

            <Image
              src="/icons/hugeicons_information-circle-1.svg"
              alt="info"
              width={14}
              height={14}
            />
          </div>

          <p className="text-[#252525] text-[10px] font-semibold leading-[110%] tracking-[-0.2px]">
            60%-100%
          </p>
        </div>
      </div>

      <div className="mt-4 w-full h-[170px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}