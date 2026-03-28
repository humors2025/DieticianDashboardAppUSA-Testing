"use client";
import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";

import DigestiveBalanceTrends from "./digestive-balance-trends";
import FuelEnergyTrends from "./fuel-energy-trends";
import MetabolicRecoveryTrends from "./metabolic-recovery-trends";
import TrendPopUp from "./pop-folder/trend-popup";


export default function TrendBreakdown() {

    const [activeTab, setActiveTab] = useState("digestive");
      const [showPopup, setShowPopup] = useState(false);

    const renderComponent = () => {
        if (activeTab === "digestive") return <DigestiveBalanceTrends />;
        if (activeTab === "fuel") return <FuelEnergyTrends />;
        if (activeTab === "metabolic") return <MetabolicRecoveryTrends />;
    };

    return (
        <>
            <div className="w-[800px] border border-[#E1E6ED] rounded-[15px] px-5 pt-[18px] pb-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <p className="text-[#252525] text-[15px] font-semibold leading-normal tracking-[-0.3px]">
                        Trend Breakdown
                    </p>

                    <div 
                     onClick={() => setShowPopup(true)}
                    className="flex gap-[15px] items-center px-[11px] py-1 border border-[#E1E6ED] rounded-[4px] cursor-pointer">
                        <p className="text-[#308BF9] text-[12px] font-semibold leading-normal tracking-[-0.24px]">
                            See Detailed Analysis
                        </p>
                        <IoIosArrowForward className="text-[#308BF9] w-5 h-5" />
                    </div>
                </div>


                {/* Tabs */}
                <div className="flex w-full gap-[25px] mt-[18px] border-b border-[#E1E6ED]">

                    {/* Digestive */}
                    <button
                        onClick={() => setActiveTab("digestive")}
                        className={`flex gap-2 items-center pb-[13px] pl-[5px] cursor-pointer
                        ${activeTab === "digestive" ? "border-b-2 border-[#308BF9]" : ""}`}
                    >
                        <span
                            className={`text-[12px] font-semibold leading-[110%] tracking-[-0.24px]
                            ${activeTab === "digestive" ? "text-[#308BF9]" : "text-[#A1A1A1]"}`}
                        >
                            Digestive Balance Trend
                        </span>
                        <div className="w-[6px] h-[6px] rounded-full bg-[#3FAF58]" />
                    </button>


                    {/* Fuel */}
                    <button
                        onClick={() => setActiveTab("fuel")}
                        className={`flex gap-2 items-center pb-[13px] pl-[5px] cursor-pointer
                        ${activeTab === "fuel" ? "border-b-2 border-[#308BF9]" : ""}`}
                    >
                        <span
                            className={`text-[12px] font-semibold leading-[110%] tracking-[-0.24px]
                            ${activeTab === "fuel" ? "text-[#308BF9]" : "text-[#A1A1A1]"}`}
                        >
                            Fuel & Energy Trend
                        </span>
                        <div className="w-[6px] h-[6px] rounded-full bg-[#E48326]" />
                    </button>


                    {/* Metabolic */}
                    <button
                        onClick={() => setActiveTab("metabolic")}
                        className={`flex gap-2 items-center pb-[13px] pl-[5px] cursor-pointer
                        ${activeTab === "metabolic" ? "border-b-2 border-[#308BF9]" : ""}`}
                    >
                        <span
                            className={`text-[12px] font-semibold leading-[110%] tracking-[-0.24px]
                            ${activeTab === "metabolic" ? "text-[#308BF9]" : "text-[#A1A1A1]"}`}
                        >
                            Metabolic Recovery Trend
                        </span>
                        <div className="w-[6px] h-[6px] rounded-full bg-[#FFBF2D]" />
                    </button>

                </div>


                {/* Component Render */}
                <div className="mt-[18px]">
                    {renderComponent()}
                </div>

            </div>
             {showPopup && (
                <TrendPopUp closePopup={() => setShowPopup(false)} />
            )}
        </>
    );
}