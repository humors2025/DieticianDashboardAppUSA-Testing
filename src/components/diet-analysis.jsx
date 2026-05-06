"use client";

 import DietPlan from "./diet-plan";
import MacrosUpdate from "./macros-update";
import DietPlanLargeSize from "./dietplanlargesize";

export default function DietAnalysis() {

    return (
        <>

            <div className="flex gap-5 mt-[17px] mx-[5px]">
                <MacrosUpdate />
                 <DietPlan /> 
                {/* <DietPlanLargeSize/> */}
            </div>
        </>
    )
}