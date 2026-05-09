"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import EditDietPopup from "./pop-folder/edit-diet-popup";
import ApproveConfirmationPopup from "./pop-folder/approve-confirmation-popup";
import {
  selectDietAnalysisData,
  selectDietAnalysisError,
  selectDietAnalysisLoading,
} from "../store/dietAnalysisSlice";
import { approveDietPlanService } from "../services/authService";
import { cookieManager } from "../lib/cookies";

export default function DietPlan() {
  const [activeDay, setActiveDay] = useState(1);
  const [activeMeal, setActiveMeal] = useState("Breakfast");
  const [showPopup, setShowPopup] = useState(false);
  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const profileId = searchParams.get("profile_id");

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

    // Check status_value from API response to set approval state
    const statusValue = dietAnalysisData?.data?.status_value;
    setIsApproved(statusValue === 1);
    setShowPopup(false);
    setShowApprovePopup(false);
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

  const categoryIcons = {
    Meals: "/icons/hugeicons__dish-02.svg",
    Beverage: "/icons/hugeicons__tea.svg",
    "Fruits/vegetables": "/icons/hugeicons__vegetarian-food.svg",
    Snack: "/icons/hugeicons__french-fries-01.svg",
    Dessert: "/icons/hugeicons__cheese-cake-02.svg",
    Drink: "/icons/hugeicons_bubble-tea-02.svg",
  };

  const getMealIcon = (category) => {
    return categoryIcons[category] || "/icons/hugeicons__dish-02.svg";
  };

  const formatValue = (value, suffix = "") => {
    if (value === null || value === undefined || value === "") {
      return `0${suffix}`;
    }

    const num = Number(value);

    if (Number.isNaN(num)) {
      return `0${suffix}`;
    }

    return `${parseFloat(num.toFixed(2))}${suffix}`;
  };

  const handleApproveConfirm = async () => {
    try {
      setIsApproving(true);

      // Get dietician_id from cookies
      const dieticianCookie = cookieManager.getJSON("dietician");
      const dieticianId = dieticianCookie?.dietician_id;

      // Get id from dietAnalysisData
      const planId = dietAnalysisData?.data?.id;

      // Set status to 1 for approval
      if (!profileId || !dieticianId || !planId) {
        toast.error("Missing required data for approval");
        return;
      }

      const response = await approveDietPlanService(
        profileId,
        dieticianId,
        planId,
        1 // status: 1 for approved
      );

      if (response?.status === "success") {
        setShowApprovePopup(false);
        setShowPopup(false);
        
        // Update local state instead of reloading the page
        setIsApproved(true);
        
        toast.success("Diet plan approved successfully");
      } else {
        throw new Error(response?.message || "Failed to approve diet plan");
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(error.message || "Failed to approve diet plan");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <>
      <div
        id="diet-plan-container"
        className="w-full border border-[#E1E6ED] rounded-[15px] pt-[15px] pb-2.5 px-2.5 bg-white"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap px-2.5">
          <div className="flex flex-col gap-1">
            <p className="text-[#252525] py-[5px] text-[15px] xl:text-[17px] 2xl:text-[18px] font-semibold leading-normal tracking-[-0.3px]">
              Diet Plan
            </p>

            {selectedDayData?.day && (
              <p className="text-[#738298] text-[12px] xl:text-[13px] 2xl:text-[14px] font-medium leading-normal tracking-[-0.24px]">
                {days[activeDay - 1]?.dayCode?.toUpperCase()} -{" "}
                {selectedDayData.day}
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
                      className={`text-[12px] xl:text-[13px] 2xl:text-[14px] font-semibold leading-[110%] tracking-[-0.24px] ${
                        isActive ? "text-white" : "text-[#A1A1A1]"
                      }`}
                    >
                      {day.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="flex gap-[3px] mt-[15px]">
            <div className="flex flex-col gap-[15px] px-[15px] pt-[15px] pb-[54px] rounded-[15px] border-4 border-[#F5F7FA] min-w-[180px] xl:min-w-[200px] 2xl:min-w-[220px]">
              {meals.map((meal, index) => {
                const isActive = activeMeal === meal.name;

                return (
                  <div
                    key={meal.name}
                    onClick={() => setActiveMeal(meal.name)}
                    className={`flex flex-col gap-2.5 py-2.5 pl-[15px] pr-2.5 w-full cursor-pointer ${
                      isActive ? "bg-[#308BF9] rounded-[10px]" : ""
                    } ${
                      !isActive && index !== 0
                        ? "border-t border-[#E1E6ED]"
                        : ""
                    }`}
                  >
                    <p
                      className={`text-[12px] xl:text-[13px] 2xl:text-[14px] font-semibold leading-[110%] tracking-[-0.48px] ${
                        isActive ? "text-white" : "text-[#252525]"
                      }`}
                    >
                      {meal.name}
                    </p>

                    <p
                      className={`text-[10px] xl:text-[11px] 2xl:text-[12px] font-normal leading-normal tracking-[-0.2px] ${
                        isActive ? "text-white" : "text-[#252525]"
                      }`}
                    >
                      {meal.time}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-5 pb-[43px] pl-[15px] pr-2.5 border-4 border-[#F5F7FA] rounded-[15px] flex-1 h-[360px] xl:h-[400px] 2xl:h-[440px] overflow-y-auto scroll-hide">
              {dietAnalysisLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-[#738298] text-[13px] xl:text-[14px] 2xl:text-[15px] font-medium">
                    Loading diet plan...
                  </p>
                </div>
              ) : dietAnalysisError ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-[#E76F51] text-[13px] xl:text-[14px] 2xl:text-[15px] font-medium">
                    {dietAnalysisError}
                  </p>
                </div>
              ) : currentMealFoods.length > 0 ? (
                <div className="flex flex-col gap-10">
                  {currentMealFoods.map((food, index) => (
                    <div
                      key={`${food.food_name}-${index}`}
                      className="flex gap-[5px]"
                    >
                      <div className="flex my-[3px] items-start shrink-0">
                        <Image
                          src={getMealIcon(food.category)}
                          alt="food-icon"
                          width={24}
                          height={24}
                          className="xl:w-[28px] xl:h-[28px] 2xl:w-[30px] 2xl:h-[30px]"
                        />

                        <p className="px-[9px] pt-[3px] pb-0.5 text-[#252525] text-[15px] xl:text-[16px] 2xl:text-[18px] font-bold leading-[126%] tracking-[-0.3px]">
                          {index + 1}
                        </p>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col gap-2.5">
                          <div className="flex flex-col gap-1">
                            <p className="text-[#252525] text-[12px] xl:text-[14px] 2xl:text-[15px] font-semibold leading-[126%] tracking-[-0.24px]">
                              {food.food_name}
                            </p>

                            <div className="flex flex-wrap items-center gap-[5px]">
                              <p className="text-[#252525] text-[10px] xl:text-[11px] 2xl:text-[12px] font-normal leading-normal tracking-[-0.2px]">
                                {formatValue(food.calories, " kcal")}
                              </p>

                              {food.portion_with_metric && (
                                <p className="text-[#252525] text-[10px] xl:text-[11px] 2xl:text-[12px] font-normal leading-normal tracking-[-0.2px]">
                                  {food.portion_with_metric}
                                </p>
                              )}

                              <Image
                                src="/icons/hugeicons_information-circle0.svg"
                                alt="info-icon"
                                width={12}
                                height={12}
                                className="cursor-pointer xl:w-[14px] xl:h-[14px] 2xl:w-[16px] 2xl:h-[16px]"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            <div className="px-2.5 py-[5px] rounded-[5px] bg-[#2A9D8F1A]">
                              <p className="text-[#2A9D8F] text-[10px] xl:text-[11px] 2xl:text-[12px] font-semibold leading-[110%] tracking-[-0.2px]">
                                {formatValue(food.carbs_g, "g")} Carbs
                              </p>
                            </div>

                            <div className="px-2.5 py-[5px] rounded-[5px] bg-[#F4A2611A]">
                              <p className="text-[#F4A261] text-[10px] xl:text-[11px] 2xl:text-[12px] font-semibold leading-[110%] tracking-[-0.2px]">
                                {formatValue(food.protein_g, "g")} Protein
                              </p>
                            </div>

                            <div className="px-2.5 py-[5px] rounded-[5px] bg-[#3A86FF1A]">
                              <p className="text-[#3A86FF] text-[10px] xl:text-[11px] 2xl:text-[12px] font-semibold leading-[110%] tracking-[-0.2px]">
                                {formatValue(food.fat_g, "g")} Fat
                              </p>
                            </div>

                            <div className="px-2.5 py-[5px] rounded-[5px] bg-[#E76F511A]">
                              <p className="text-[#E76F51] text-[10px] xl:text-[11px] 2xl:text-[12px] font-semibold leading-[110%] tracking-[-0.2px]">
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
                  <p className="text-[#738298] text-[13px] xl:text-[14px] 2xl:text-[15px] font-medium">
                    No food data available
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2.5 justify-end mt-2">
            {!isApproved && (
              <p className="py-[11px] text-[#535359] text-[10px] xl:text-[11px] 2xl:text-[12px] font-normal leading-normal tracking-[-0.2px]">
                Auto-approved if not reviewed within 24 hours
              </p>
            )}

            <div className="flex gap-2.5">
              <div
                onClick={() => {
                  if (!isApproved && !isApproving) {
                    setShowApprovePopup(true);
                  }
                }}
                aria-disabled={isApproved || isApproving}
                className={[
                  "flex items-center gap-[5px] justify-center px-[11px] py-1 rounded-[4px]",
                  isApproved || isApproving
                    ? "bg-[#E1E6ED] cursor-not-allowed"
                    : "bg-[#308BF9] cursor-pointer",
                ].join(" ")}
              >
                <Image
                  src="/icons/hugeicons_tick-0236.svg"
                  alt="approve-icon"
                  width={20}
                  height={20}
                  className={`xl:w-[22px] xl:h-[22px] 2xl:w-[24px] 2xl:h-[24px] ${isApproved || isApproving ? "opacity-50 grayscale" : ""}`}
                />

                <span
                  className={[
                    "text-[12px] xl:text-[13px] 2xl:text-[14px] font-semibold leading-normal tracking-[-0.24px]",
                    isApproved || isApproving ? "text-[#738298]" : "text-white",
                  ].join(" ")}
                >
                  {isApproved ? "Approved" : isApproving ? "Approving..." : "Approve"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && !isApproved && (
        <EditDietPopup closePopup={() => setShowPopup(false)} />
      )}

      {showApprovePopup && !isApproved && (
        <ApproveConfirmationPopup
          onClose={() => {
            if (!isApproving) {
              setShowApprovePopup(false);
            }
          }}
          onConfirm={handleApproveConfirm}
          isLoading={isApproving}
        />
      )}
    </>
  );
}