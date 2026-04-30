"use client";


import FatUsePatternTrend from "./Fat-use-pattern-Trend";
import Progress from "./progress";
import TrendBreakdown from "./trend-breakdown";
import TrainerNote from "./trainer-note";

export default function TestAnalysis() {
    return (
        <>


             <div className="group flex flex-col gap-5 mt-[17px] mb-[22px] mx-[5px] overflow-y-auto group-hover-scrollbar h-full">
            <div className="flex gap-5">
                <FatUsePatternTrend />
                <TrendBreakdown />
            </div>

            <div className="flex gap-5">
                <Progress />
                <TrainerNote />
            </div>
        </div>
        </>
    )
}