"use client";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

const RANGES = ["1W", "1M", "3M", "All"];

const MOCK_ENTRIES = [
  { date: "Jul 8", weight: 72.5, delta: -0.3 },
  { date: "Jul 5", weight: 72.8, delta: -0.5 },
  { date: "Jul 1", weight: 73.3, delta: -0.4 },
  { date: "Jun 28", weight: 73.7, delta: 0.2 },
  { date: "Jun 25", weight: 73.5, delta: -0.7 },
  { date: "Jun 22", weight: 74.2, delta: -0.6 },
  { date: "Jun 18", weight: 74.8, delta: -0.4 },
  { date: "Jun 14", weight: 75.4, delta: -0.6 },
];

const MOCK_CHART = {
  labels: ["Jun 10", "Jun 14", "Jun 18", "Jun 22", "Jun 25", "Jun 28", "Jul 1", "Jul 5", "Jul 8"],
  weights: [76.0, 75.4, 74.8, 74.2, 73.5, 73.7, 73.3, 72.8, 72.5],
};

const ScaleIcon = ({ size = 14, color = "#308BF9" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v17" />
    <path d="M5 6l7-3 7 3" />
    <path d="M5 6c0 0-2 4 0 6s2-6 0-6z" />
    <path d="M19 6c0 0 2 4 0 6s-2-6 0-6z" />
    <path d="M8 20h8" />
  </svg>
);

export default function WeightTrackingTab({ profileData }) {
  const [range, setRange] = useState("1M");

  const currentWeight = profileData?.current_weight ?? 72.5;
  const startingWeight = profileData?.starting_weight ?? 76.0;
  const goalWeight = profileData?.goal_weight ?? 68.0;
  const totalLoss = startingWeight - currentWeight;
  const totalGoal = startingWeight - goalWeight;
  const progress = totalGoal > 0 ? Math.round((totalLoss / totalGoal) * 100) : 0;
  const remaining = (currentWeight - goalWeight).toFixed(1);
  const weeklyChange = profileData?.weekly_change ?? -0.4;

  const chartData = {
    labels: MOCK_CHART.labels,
    datasets: [
      {
        label: "Weight",
        data: MOCK_CHART.weights,
        borderColor: "#308BF9",
        backgroundColor: "rgba(48,139,249,0.06)",
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: "#308BF9",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
      {
        label: "Goal",
        data: Array(MOCK_CHART.labels.length).fill(goalWeight),
        borderColor: "rgba(48,139,249,0.25)",
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 4, bottom: 0 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#252525",
        titleColor: "#fff",
        bodyColor: "#fff",
        titleFont: { family: "Poppins, sans-serif", weight: "600", size: 12 },
        bodyFont: { family: "Poppins, sans-serif", size: 12 },
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} kg`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#A1A1A1",
          font: { family: "Poppins, sans-serif", size: 10, weight: "400" },
          maxRotation: 0,
        },
      },
      y: {
        min: 66,
        max: 78,
        grid: { color: "#F0F0F0", lineWidth: 0.8 },
        border: { display: false },
        ticks: {
          color: "#A1A1A1",
          font: { family: "Poppins, sans-serif", size: 10, weight: "400" },
          callback: (v) => `${v}`,
          stepSize: 2,
        },
      },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
  };

  const statTiles = [
    {
      label: "Current weight",
      value: currentWeight,
      unit: "kg",
      accent: null,
      sub: (
        <div className="flex items-center gap-1 mt-2">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <polyline points="7 7 17 17" />
            <polyline points="17 7 17 17 7 17" />
          </svg>
          <span className="text-[#16a34a] text-[10px] font-semibold tracking-[-0.2px]">
            {Math.abs(weeklyChange)} kg/week
          </span>
        </div>
      ),
      highlight: true,
    },
    {
      label: "Starting",
      value: startingWeight.toFixed(1),
      unit: "kg",
      sub: <p className="text-[#A1A1A1] text-[10px] font-semibold tracking-[-0.2px] mt-2">Jul 1, 2026</p>,
    },
    {
      label: "Goal",
      value: goalWeight.toFixed(1),
      unit: "kg",
      sub: <p className="text-[#A1A1A1] text-[10px] font-semibold tracking-[-0.2px] mt-2">{remaining} kg to go</p>,
    },
    {
      label: "Progress",
      value: progress,
      unit: "%",
      sub: (
        <div className="mt-3 h-[6px] bg-white rounded-[10px] overflow-hidden" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)" }}>
          <div
            className="h-full rounded-[10px] transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #308BF9, #60a5fa)",
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 mt-[16px] mb-[20px] mx-[5px]">
      {/* Stat tiles */}
      <div className="grid grid-cols-4 gap-3">
        {statTiles.map((tile) => (
          <div
            key={tile.label}
            className={`rounded-[12px] p-4 transition-all duration-200 cursor-default group ${
              tile.highlight
                ? "bg-[#EFF6FF] border border-[#308BF9]/15 hover:border-[#308BF9]/30"
                : "bg-[#F5F7FA] border border-transparent hover:border-[#E1E6ED]"
            }`}
          >
            <p className="text-[#A1A1A1] text-[10px] font-semibold leading-[110%] tracking-[-0.2px] uppercase mb-2">
              {tile.label}
            </p>
            <p className="text-[#252525] text-[24px] font-semibold tracking-[-1.2px] leading-none">
              {tile.value}
              <span className="text-[#535359] text-[13px] font-semibold tracking-[-0.26px] ml-1">
                {tile.unit}
              </span>
            </p>
            {tile.sub}
          </div>
        ))}
      </div>

      {/* Chart + Recent entries side by side */}
      <div className="flex gap-4" style={{ height: "320px" }}>
        {/* Chart */}
        <div className="flex-[3] border border-[#E1E6ED] rounded-[12px] p-5 min-w-0 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#252525] text-[16px] font-semibold leading-[110%] tracking-[-0.64px]">
              Weight trend
            </p>
            <div className="flex gap-1 bg-[#F5F7FA] rounded-[40px] p-[3px]">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-[4px] rounded-[40px] text-[11px] font-semibold tracking-[-0.22px] transition-all duration-200 ${
                    range === r
                      ? "bg-[#308BF9] text-white shadow-sm"
                      : "text-[#535359] hover:text-[#252525] hover:bg-[#e8eaed]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="flex gap-5 mt-2 pt-2 border-t border-[#F0F0F0]">
            <span className="flex items-center gap-1.5 text-[#535359] text-[11px] tracking-[-0.22px]">
              <span className="w-3.5 h-[2.5px] rounded-sm bg-[#308BF9]" />
              Actual
            </span>
            <span className="flex items-center gap-1.5 text-[#535359] text-[11px] tracking-[-0.22px]">
              <span className="w-3.5 h-0 rounded-sm" style={{ borderTop: "1.5px dashed rgba(48,139,249,0.4)" }} />
              Goal ({goalWeight} kg)
            </span>
          </div>
        </div>

        {/* Recent entries */}
        <div className="flex-[2] flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[#252525] text-[16px] font-semibold leading-[110%] tracking-[-0.64px]">
              Recent entries
            </p>
            <span className="text-[#A1A1A1] text-[11px] font-semibold tracking-[-0.22px]">
              {MOCK_ENTRIES.length}
            </span>
          </div>

          <div className="border border-[#E1E6ED] rounded-[12px] overflow-hidden flex-1 overflow-y-auto">
            {MOCK_ENTRIES.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center px-4 py-[10px] hover:bg-[#F9FAFB] transition-colors ${
                  i < MOCK_ENTRIES.length - 1 ? "border-b border-[#F0F0F0]" : ""
                }`}
              >
                <span className="flex-1 text-[#535359] text-[12px] tracking-[-0.24px] whitespace-nowrap">
                  {entry.date}
                </span>
                <span className="text-[#252525] text-[12px] font-semibold tracking-[-0.24px] mr-3">
                  {entry.weight}
                  <span className="text-[#A1A1A1] font-normal ml-0.5">kg</span>
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-[-0.2px] flex items-center gap-[2px] px-[6px] py-[2px] rounded-[8px] ${
                    entry.delta < 0
                      ? "text-[#16a34a] bg-[#f0fdf4]"
                      : "text-[#dc2626] bg-[#fef2f2]"
                  }`}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    {entry.delta < 0 ? (
                      <>
                        <polyline points="7 7 17 17" />
                        <polyline points="17 7 17 17 7 17" />
                      </>
                    ) : (
                      <>
                        <polyline points="17 17 7 7" />
                        <polyline points="7 17 7 7 17 7" />
                      </>
                    )}
                  </svg>
                  {Math.abs(entry.delta)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info note — inline subtle */}
      <div className="flex items-center gap-2 px-1">
        <svg className="flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A1A1A1" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p className="text-[#A1A1A1] text-[11px] tracking-[-0.22px]">
          Weight data syncs from the client&apos;s Respyr app. Focus on weekly averages over individual weigh-ins.
        </p>
      </div>
    </div>
  );
}
