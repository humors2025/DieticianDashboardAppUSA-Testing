"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import EditDietPopup from "./pop-folder/edit-diet-popup";
import {
  selectDietAnalysisData,
  selectDietAnalysisError,
  selectDietAnalysisLoading,
} from "../store/dietAnalysisSlice";

export default function DietPlan() {
  const [activeDay, setActiveDay] = useState(1);
  const [activeMeal, setActiveMeal] = useState("Breakfast");
  const [showPopup, setShowPopup] = useState(false);

  const dietAnalysisData = useSelector(selectDietAnalysisData);
  const dietAnalysisLoading = useSelector(selectDietAnalysisLoading);
  const dietAnalysisError = useSelector(selectDietAnalysisError);

  const weeklyPlanData = dietAnalysisData?.data?.food_json || {
    days: [],
    weekly_json_data: {},
  };

  const planDays = weeklyPlanData?.days || [];

  const meals = [
    { name: "Breakfast", time: "08:00-09:00AM", key: "breakfast" },
    { name: "Lunch", time: "12:30-01:30PM", key: "lunch" },
    { name: "Snacks", time: "04:00-05:00PM", key: "snacks" },
    { name: "Dinner", time: "08:00-09:00PM", key: "dinner" },
  ];

  const days = useMemo(() => {
    return planDays.map((dayItem, index) => ({
      label: `D${index + 1}`,
      dayCode: dayItem?.day_code || `d${index + 1}`,
      dayName: dayItem?.day || "",
      data: dayItem,
    }));
  }, [planDays]);

  useEffect(() => {
    if (days.length > 0 && activeDay > days.length) {
      setActiveDay(1);
    }
  }, [days, activeDay]);

  useEffect(() => {
    setActiveDay(1);
    setActiveMeal("Breakfast");
  }, [dietAnalysisData]);

  const selectedDayData = days[activeDay - 1]?.data || null;

  const mealKeyMap = {
    Breakfast: "breakfast",
    Lunch: "lunch",
    Snacks: "snacks",
    Dinner: "dinner",
  };

  const currentMealKey = mealKeyMap[activeMeal];
  const currentMealFoods = selectedDayData?.[currentMealKey]?.foods || [];

  const getMealIcon = (mealName) => {
    if (mealName === "Breakfast" || mealName === "Snacks") {
      return "/icons/hugeicons_bubble-tea-02.svg";
    }
    return "/icons/hugeicons_plant-045.svg";
  };

  const formatValue = (value, suffix = "") => {
    if (value === null || value === undefined || value === "") return `0${suffix}`;
    const num = Number(value);
    if (Number.isNaN(num)) return `0${suffix}`;
    return `${parseFloat(num.toFixed(2))}${suffix}`;
  };

  const getMetricOnly = (portion) => {
    if (!portion) return "";
    const match = portion.match(/\(([^|]+)/);
    return match?.[1]?.trim() || "";
  };

  return (
    <>
      <div className="w-full border border-[#E1E6ED] rounded-[15px] pt-[15px] pb-2.5 px-2.5 bg-white">
        <div className="flex items-center justify-between gap-4 flex-wrap px-2.5">
          <div className="flex flex-col gap-1">
            <p className="text-[#252525] py-[5px] text-[15px] font-semibold leading-normal tracking-[-0.3px]">
              Diet Plan
            </p>

            {selectedDayData?.day && (
              <p className="text-[#738298] text-[12px] font-medium leading-normal tracking-[-0.24px]">
                {days[activeDay - 1]?.dayCode?.toUpperCase()} - {selectedDayData.day}
              </p>
            )}
          </div>

          <div className="flex items-center gap-[26px] flex-wrap">
            <div className="border border-[#E1E6ED] rounded-[10px] flex overflow-hidden">
              {days.map((day, index) => {
                const dayNumber = index + 1;
                const isActive = activeDay === dayNumber;

                return (
                  <div
                    key={day.dayCode}
                    onClick={() => setActiveDay(dayNumber)}
                    className={`px-4 py-2.5 cursor-pointer ${
                      isActive ? "bg-[#308BF9]" : "bg-white"
                    }`}
                  >
                    <p
                      className={`text-[12px] font-semibold leading-[110%] tracking-[-0.24px] ${
                        isActive ? "text-white" : "text-[#A1A1A1]"
                      }`}
                    >
                      {day.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* <Image
              src="/icons/hugeicons_edit-040.svg"
              alt="edit"
              width={24}
              height={24}
              className="cursor-pointer shrink-0"
              onClick={() => setShowPopup(true)}
            /> */}
          </div>
        </div>

        <div className="flex gap-[3px] mt-[15px]">
          <div className="flex flex-col gap-[15px] px-[15px] pt-[15px] pb-[54px] rounded-[15px] border-4 border-[#F5F7FA] min-w-[180px]">
            {meals.map((meal, index) => {
              const isActive = activeMeal === meal.name;

              return (
                <div
                  key={meal.name}
                  onClick={() => setActiveMeal(meal.name)}
                  className={`flex flex-col gap-2.5 py-2.5 pl-[15px] pr-2.5 w-full cursor-pointer ${
                    isActive ? "bg-[#308BF9] rounded-[10px]" : ""
                  } ${!isActive && index !== 0 ? "border-t border-[#E1E6ED]" : ""}`}
                >
                  <p
                    className={`text-[12px] font-semibold leading-[110%] tracking-[-0.48px] ${
                      isActive ? "text-white" : "text-[#252525]"
                    }`}
                  >
                    {meal.name}
                  </p>

                  <p
                    className={`text-[10px] font-normal leading-normal tracking-[-0.2px] ${
                      isActive ? "text-white" : "text-[#252525]"
                    }`}
                  >
                    {meal.time}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="pt-5 pb-[43px] pl-[15px] pr-2.5 border-4 border-[#F5F7FA] rounded-[15px] flex-1 h-[360px] overflow-y-auto scroll-hide">
            {dietAnalysisLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-[#738298] text-[13px] font-medium">
                  Loading diet plan...
                </p>
              </div>
            ) : dietAnalysisError ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-[#E76F51] text-[13px] font-medium">
                  {dietAnalysisError}
                </p>
              </div>
            ) : currentMealFoods.length > 0 ? (
              <div className="flex flex-col gap-5">
                {currentMealFoods.map((food, index) => (
                  <div key={`${food.food_name}-${index}`} className="flex gap-[5px]">
                    <div className="flex my-[3px] items-start shrink-0">
                      <Image
                        src={getMealIcon(activeMeal)}
                        alt="food-icon"
                        width={24}
                        height={24}
                      />
                      <p className="px-[9px] pt-[3px] pb-0.5 text-[#252525] text-[15px] font-bold leading-[126%] tracking-[-0.3px]">
                        {index + 1}
                      </p>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col gap-1">
                          <p className="text-[#252525] text-[12px] font-semibold leading-[126%] tracking-[-0.24px]">
                            {food.food_name}
                          </p>

                          <div className="flex flex-wrap items-center gap-[5px]">
                            <p className="text-[#252525] text-[10px] font-normal leading-normal tracking-[-0.2px]">
                              {formatValue(food.calories, " kcal")}
                            </p>

                            {food.portion_with_metric && (
                              <p className="text-[#252525] text-[10px] font-normal leading-normal tracking-[-0.2px]">
                                {getMetricOnly(food.portion_with_metric)}
                              </p>
                            )}

                            <Image
                              src="/icons/hugeicons_information-circle0.svg"
                              alt="hugeicons_information-circle0.svg"
                              width={12}
                              height={12}
                              className="cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <div className="px-2.5 py-[5px] rounded-[5px] bg-[#2A9D8F1A]">
                            <p className="text-[#2A9D8F] text-[10px] font-semibold leading-[110%] tracking-[-0.2px]">
                              {formatValue(food.carbs_g, "g")} Carbs
                            </p>
                          </div>

                          <div className="px-2.5 py-[5px] rounded-[5px] bg-[#F4A2611A]">
                            <p className="text-[#F4A261] text-[10px] font-semibold leading-[110%] tracking-[-0.2px]">
                              {formatValue(food.protein_g, "g")} Protein
                            </p>
                          </div>

                          <div className="px-2.5 py-[5px] rounded-[5px] bg-[#3A86FF1A]">
                            <p className="text-[#3A86FF] text-[10px] font-semibold leading-[110%] tracking-[-0.2px]">
                              {formatValue(food.fat_g, "g")} Fat
                            </p>
                          </div>

                          <div className="px-2.5 py-[5px] rounded-[5px] bg-[#E76F511A]">
                            <p className="text-[#E76F51] text-[10px] font-semibold leading-[110%] tracking-[-0.2px]">
                              {formatValue(food.fiber_g, "g")} Fiber
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[#738298] text-[13px] font-medium">
                  No food data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPopup && <EditDietPopup closePopup={() => setShowPopup(false)} />}
    </>
  );
}