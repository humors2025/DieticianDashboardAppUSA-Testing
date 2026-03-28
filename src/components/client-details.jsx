"use client";
import { useState } from "react";
import Image from "next/image";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import TestAnalysis from "./test-analysis";
import DietAnalysis from "./diet-analysis";
import RightSidebar from "./RightSidebar";

export default function ClientDetails() {
    const [activeTab, setActiveTab] = useState("test");
    const [activeIndex, setActiveIndex] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const dateData = [
        { date: "04 Jul, 2025", score: "82%", status: "Optimal" },
        { date: "05 Jul, 2025", score: "78%", status: "Moderate" },
        { date: "06 Jul, 2025", score: "69%", status: "Focus" },
        { date: "07 Jul, 2025", score: "85%", status: "Optimal" },
        { date: "08 Jul, 2025", score: "80%", status: "Optimal" },
        { date: "09 Jul, 2025", score: "76%", status: "Moderate" },
        { date: "10 Jul, 2025", score: "90%", status: "Optimal" },
        { date: "11 Jul, 2025", score: "72%", status: "Focus" },
        { date: "12 Jul, 2025", score: "88%", status: "Optimal" },
        { date: "13 Jul, 2025", score: "79%", status: "Moderate" },
    ];

    const weekData = [
        { week: "Week 1", range: "04 Jul, 2025 - 12 Jul, 2025" },
        { week: "Week 2", range: "13 Jul, 2025 - 19 Jul, 2025" },
        { week: "Week 3", range: "20 Jul, 2025 - 26 Jul, 2025" },
        { week: "Week 4", range: "27 Jul, 2025 - 02 Aug, 2025" },
        { week: "Week 5", range: "03 Aug, 2025 - 09 Aug, 2025" },
    ];

    const ITEMS_TO_SHOW = 4;
    const currentData = activeTab === "test" ? dateData : weekData;

    const handleBack = () => {
        if (startIndex > 0) {
            const newStartIndex = startIndex - 1;
            setStartIndex(newStartIndex);

            if (!(activeIndex >= newStartIndex && activeIndex < newStartIndex + ITEMS_TO_SHOW)) {
                setActiveIndex(newStartIndex);
            }
        }
    };

    const handleForward = () => {
        if (startIndex + ITEMS_TO_SHOW < currentData.length) {
            const newStartIndex = startIndex + 1;
            setStartIndex(newStartIndex);

            if (!(activeIndex >= newStartIndex && activeIndex < newStartIndex + ITEMS_TO_SHOW)) {
                setActiveIndex(newStartIndex);
            }
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setActiveIndex(0);
        setStartIndex(0);
    };

    const visibleItems = currentData.slice(startIndex, startIndex + ITEMS_TO_SHOW);

    return (
        <>
            <div className="w-full relative h-[calc(88vh-24px)] overflow-hidden">
                {/* Overlay for blur effect - now positioned relative to parent */}
                {isSidebarOpen && (
                    <div 
                        className="absolute inset-0 bg-black/30  z-40 transition-all duration-300 rounded-[15px]"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
                
                <div
                    className={`
                        w-full bg-white px-[15px] pt-[23px] pb-5 rounded-[15px]
                        flex flex-col
                        h-[calc(88vh-24px)]
                        overflow-hidden
                        transition-all duration-300
                        relative
                        ${isSidebarOpen ? 'opacity-90' : 'opacity-100'}
                    `}
                >
                    {/* Header Section */}
                    <div className="flex justify-between items-center pb-[22px] border-b border-[#E1E6ED]">
                        <div className="flex gap-[15px]">
                            <div className="bg-[#F0F0F0] rounded-full p-2 w-12 h-12 flex items-center justify-center">
                                <Image
                                    src="/icons/hugeicons_user-circle-02.svg"
                                    alt="user"
                                    width={32}
                                    height={32}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3 items-center">
                                    <p className="text-[#252525] text-[20px] font-semibold">
                                        Sagar Hosur
                                    </p>

                                    <div className="flex items-center justify-center px-2.5 py-2 rounded-[5px] bg-[#E9F3FF] text-[#006FFF] text-[10px] font-semibold">
                                        Weight Loss
                                    </div>

                                    <p className="text-[#535359] text-[12px]">
                                        32 tests taken
                                    </p>
                                </div>

                                <div className="flex gap-1.5 items-center">
                                    <p className="text-[#535359] text-[12px]">
                                        28 years, Male
                                    </p>

                                    <div className="mx-1.5">
                                        <Image
                                            src="/icons/Ellipse 765.svg"
                                            width={3}
                                            height={3}
                                            alt="dot"
                                        />
                                    </div>

                                    <p className="text-[#535359] text-[12px]">
                                        Joined on Aug 2024
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-[30px]">
                            <Image
                                src="/icons/hugeicons_file-export.svg"
                                width={26}
                                height={26}
                                alt="export"
                                className="cursor-pointer"
                            />

                            <Image
                                src="/icons/right button.svg"
                                width={26}
                                height={26}
                                alt="right"
                                className="cursor-pointer"
                                onClick={() => setIsSidebarOpen(true)}
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex py-[11px] pl-[5px]">
                        <div className="flex bg-[#F5F7FA] rounded-[6px]">
                            <div
                                onClick={() => handleTabChange("test")}
                                className={`flex items-center rounded-[6px] py-[11px] px-[31px] cursor-pointer ${
                                    activeTab === "test" ? "bg-[#252525]" : "bg-[#F5F7FA]"
                                }`}
                            >
                                <p
                                    className={`text-[12px] font-semibold leading-[110%] tracking-[-0.24px] ${
                                        activeTab === "test" ? "text-white" : "text-[#535359]"
                                    }`}
                                >
                                    Test Analysis
                                </p>
                            </div>

                            <div
                                onClick={() => handleTabChange("diet")}
                                className={`flex items-center gap-2.5 rounded-[6px] py-[11px] px-[31px] cursor-pointer ${
                                    activeTab === "diet" ? "bg-[#252525]" : "bg-[#F5F7FA]"
                                }`}
                            >
                                <p
                                    className={`text-[12px] font-semibold leading-[110%] tracking-[-0.24px] ${
                                        activeTab === "diet" ? "text-white" : "text-[#535359]"
                                    }`}
                                >
                                    Diet Analysis
                                </p>

                                <Image
                                    src="/icons/hugeicons_information-circle1.svg"
                                    alt="info"
                                    width={20}
                                    height={20}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date / Week Section */}
                    <div className="flex items-center gap-[26px] border-t border-b border-[#E1E6ED] pl-[38px] py-[5px]">
                        <p className="text-[#535359] text-[15px] font-semibold whitespace-nowrap">
                            {activeTab === "test" ? "Select a date" : "Select a week"}
                        </p>

                        <div className="flex gap-3 items-center w-full">
                            <IoChevronBackOutline
                                onClick={handleBack}
                                className={`text-[#252525] w-6 h-6 cursor-pointer ${
                                    startIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            />

                            <div className="w-full flex gap-[5px] items-center overflow-x-auto no-scrollbar">
                                {visibleItems.map((item, index) => {
                                    const actualIndex = startIndex + index;

                                    return (
                                        <div
                                            key={actualIndex}
                                            onClick={() => setActiveIndex(actualIndex)}
                                            className={`flex flex-col gap-[5px] rounded-[8px] pl-[15px] pt-[15px] pr-[15px] pb-[15px] cursor-pointer min-w-[160px] ${
                                                activeIndex === actualIndex ? "bg-[#308BF9]" : ""
                                            }`}
                                        >
                                            {activeTab === "test" ? (
                                                <>
                                                    <p
                                                        className={`${
                                                            activeIndex === actualIndex
                                                                ? "text-white"
                                                                : "text-[#535359]"
                                                        } text-[12px] font-semibold`}
                                                    >
                                                        {item.date}
                                                    </p>

                                                    <div className="flex items-center">
                                                        <p
                                                            className={`${
                                                                activeIndex === actualIndex
                                                                    ? "text-white"
                                                                    : "text-[#535359]"
                                                            } text-[10px] font-normal leading-[126%] tracking-[-0.2px]`}
                                                        >
                                                            {item.score}
                                                        </p>

                                                        <div
                                                            className={`mx-2.5 border-r h-[13px] ${
                                                                activeIndex === actualIndex
                                                                    ? "border-white"
                                                                    : "border-[#A1A1A1]"
                                                            }`}
                                                        ></div>

                                                        <p
                                                            className={`${
                                                                activeIndex === actualIndex
                                                                    ? "text-white"
                                                                    : "text-[#535359]"
                                                            } text-[10px] font-normal leading-[126%] tracking-[-0.2px]`}
                                                        >
                                                            {item.status}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p
                                                        className={`${
                                                            activeIndex === actualIndex
                                                                ? "text-white"
                                                                : "text-[#535359]"
                                                        } text-[12px] font-semibold`}
                                                    >
                                                        {item.week}
                                                    </p>

                                                    <p
                                                        className={`${
                                                            activeIndex === actualIndex
                                                                ? "text-white"
                                                                : "text-[#535359]"
                                                        } text-[10px] font-normal leading-[126%] tracking-[-0.2px]`}
                                                    >
                                                        {item.range}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end">
                                <IoChevronForwardOutline
                                    onClick={handleForward}
                                    className={`text-[#252525] w-6 h-6 cursor-pointer ${
                                        startIndex + ITEMS_TO_SHOW >= currentData.length
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        className={`${
                            activeTab === "test" ? "flex-1 overflow-y-auto scroll-hide" : "hidden"
                        }`}
                    >
                        <TestAnalysis />
                    </div>

                    <div
                        className={`${
                            activeTab === "diet" ? "flex-1 overflow-y-auto scroll-hide" : "hidden"
                        }`}
                    >
                        <DietAnalysis />
                    </div>
                </div>

                <RightSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>
        </>
    );
}