"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

function ProgressCard({ color = "#308BF9" }) {
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
                    borderColor: color,
                    borderWidth: 3,
                    tension: 0.35,
                    fill: true,
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;

                        if (!chartArea) return "rgba(48,139,249,0.12)";

                        const gradient = ctx.createLinearGradient(
                            0,
                            chartArea.top,
                            0,
                            chartArea.bottom
                        );
                        gradient.addColorStop(0, "rgba(48,139,249,0.25)");
                        gradient.addColorStop(1, "rgba(48,139,249,0)");
                        return gradient;
                    },
                    pointRadius: (ctx) => (ctx.dataIndex === values.length - 1 ? 6 : 0),
                    pointHoverRadius: 6,
                    pointBackgroundColor: color,
                    pointBorderColor: color,
                    pointBorderWidth: 0,
                },
            ],
        };
    }, [labels, values, color]);

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
    }, []);

    return (
        <div className="flex flex-col gap-4 pt-1">
            <div className="flex justify-end items-center">
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
                            className={`text-[#A1A1A1] w-[15px] h-[15px] transition-transform duration-200 ${openDropdown ? "rotate-180" : ""
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
                                    className={`w-full text-left px-3 py-2 text-[12px] leading-[110%] tracking-[-0.24px] transition-colors cursor-pointer ${selectedRange === item
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
                <Line data={data} options={options} />
            </div>
        </div>
    );
}

export default function TrendPopUp({ closePopup }) {
    const [activeTab, setActiveTab] = useState("fat");

    const tabs = [
        {
            id: "fat",
            title: "Fat-use Pattern Trend",
            status: "Optimal",
            statusColor: "#3FAF58",
            cardTitle: "Fat-use Pattern Trend",
            value: 88,
            change: "5%",
            description:
                "This commonly indicates a higher fermentation response to meal composition/portion size. Reducing trigger foods and keeping meals simple is the usual first step.",
            chartColor: "#308BF9",
            highlightText: "Fat-use pattern is high (>30).",
        },
        {
            id: "digestive",
            title: "Digestive Activity Trend",
            status: "Moderate",
            statusColor: "#FFBF2D",
            cardTitle: "Digestive Activity Trend",
            value: 74,
            change: "3%",
            description:
                "This usually reflects how efficiently your digestive system is responding over time. Small meal adjustments and consistent eating timing can help improve this trend.",
            chartColor: "#308BF9",
            highlightText: "Digestive activity is moderate (20-30).",
        },
        {
            id: "energy",
            title: "Energy Source Trend",
            status: "Focus",
            statusColor: "#E48326",
            cardTitle: "Energy Source Trend",
            value: 61,
            change: "2%",
            description:
                "This may indicate inconsistent fuel utilization through the day. Balancing meals and improving meal timing may help create a more stable energy pattern.",
            chartColor: "#308BF9",
            highlightText: "Energy source trend needs attention (<20).",
        },
    ];

    const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];
    const totalSegments = 55;

    const renderTrendCard = ({
        title,
        status,
        statusColor,
        value,
        change = "5%",
        description,
        showProgress = false,
        chartColor,
        highlightText,
    }) => {
        const filledSegments = Math.round((value / 100) * totalSegments);

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
                        <span className="absolute left-[23.95%] -translate-x-1/2 text-[8px] font-normal text-[#535359] leading-[110%] tracking-[-0.16px]">
                            60
                        </span>
                        <span className="absolute left-[48.5%] -translate-x-1/2 text-[8px] font-normal text-[#535359] leading-[110%] tracking-[-0.16px]">
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
                                {value}
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

                {showProgress && <ProgressCard color={chartColor} />}
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
            onClick={closePopup}
        >
            <div
                className="bg-white rounded-[12px] shadow-lg relative"
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

                    <div className="flex gap-10 pt-5">
                        <div>
                            {tabs.map((tab, index) => {
                                const isActive = activeTab === tab.id;

                                return (
                                    <div
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex flex-col gap-1.5 pt-2.5 px-2.5 pb-5 cursor-pointer  ${isActive
                                                ? "bg-[#F0F6FD] rounded-[10px] "
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

                        <div className="flex gap-5">
                            <div className="w-[410px]">
                                {renderTrendCard({
                                    title: activeTabData.cardTitle,
                                    status: activeTabData.status,
                                    statusColor: activeTabData.statusColor,
                                    value: activeTabData.value,
                                    change: activeTabData.change,
                                    description: activeTabData.description,
                                    showProgress: true,
                                    chartColor: activeTabData.chartColor,
                                    highlightText: activeTabData.highlightText,
                                })}
                            </div>

                            <div className="w-[410px]">
                                {renderTrendCard({
                                    title: activeTabData.cardTitle,
                                    status: activeTabData.status,
                                    statusColor: activeTabData.statusColor,
                                    value: activeTabData.value,
                                    change: activeTabData.change,
                                    description: activeTabData.description,
                                    showProgress: true,
                                    chartColor: activeTabData.chartColor,
                                    highlightText: activeTabData.highlightText,
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}