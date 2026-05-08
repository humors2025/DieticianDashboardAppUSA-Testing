"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  selectDietAnalysisData,
  selectDietAnalysisError,
  selectDietAnalysisLoading,
} from "../store/dietAnalysisSlice";
import ApproveConfirmationPopup from "./pop-folder/approve-confirmation-popup";
import { approveDietPlanService } from "../services/authService";
import { cookieManager } from "../lib/cookies";

const TABS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Evening Snacks" },
  { key: "dinner", label: "Dinner" },
];

export default function DietPlanLargeSize() {
  const [activeTab, setActiveTab] = useState("breakfast");
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

  const days = useMemo(() => {
    return weeklyPlanData?.days || [];
  }, [weeklyPlanData]);

  useEffect(() => {
    setActiveTab("breakfast");

    // Check status_value from API response to set approval state
    const statusValue = dietAnalysisData?.data?.status_value;
    setIsApproved(statusValue === 1);
    setShowApprovePopup(false);
  }, [dietAnalysisData]);

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
        
        toast.success("Diet plan approved successfully");
        
        // Reload the page after a short delay to show the success toast
        setTimeout(() => {
          router.refresh(); // This refreshes the current route
          window.location.reload(); // This does a full page reload
        }, 300);
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
    <div className="w-full min-w-0 flex-1">
      <div className="w-full min-w-0 pt-[15px] px-3 pb-[15px] rounded-[15px] border border-[#E1E6ED] bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap px-2.5 py-4">
          <div className="flex flex-col gap-1 shrink-0">
            <h2 className="text-[#252525] text-[15px] font-semibold leading-normal tracking-[-0.3px]">
              Diet Plan
            </h2>

            {dietAnalysisData?.data?.week_range && (
              <p className="text-[#738298] text-[12px] font-medium leading-normal tracking-[-0.24px]">
                {dietAnalysisData.data.week_range}
              </p>
            )}
          </div>

          <div className="min-w-0 overflow-x-auto scroll-hide">
            <div className="inline-flex items-center gap-1 border border-[#E1E6ED] bg-white p-1 rounded-[10px]">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={[
                      "whitespace-nowrap rounded-[8px] px-5 py-2 transition-all duration-200 cursor-pointer",
                      "text-[12px] font-semibold leading-[110%] tracking-[-0.48px]",
                      isActive
                        ? "bg-[#308BF9] text-white"
                        : "bg-white text-[#252525]",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {dietAnalysisLoading ? (
          <EmptyState text="Loading diet plan..." />
        ) : dietAnalysisError ? (
          <EmptyState text={dietAnalysisError} error />
        ) : days.length === 0 ? (
          <EmptyState text="No food data available" />
        ) : (
          <>
            {/* Day Header */}
            <div className="px-2.5 pb-2">
              <div className="grid grid-cols-7 rounded-[10px] border border-[#E1E6ED] overflow-hidden">
                {days.map((day, index) => (
                  <div
                    key={day.day_code || index}
                    className={[
                      "min-w-0 px-2 py-2.5 text-center",
                      "text-[#738298] text-[12px] font-semibold leading-normal",
                      index !== days.length - 1
                        ? "border-r border-[#E1E6ED]"
                        : "",
                    ].join(" ")}
                  >
                    Day {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Meals Grid */}
            <div className="w-full min-w-0 overflow-hidden">
              <div className="grid grid-cols-7 min-w-0">
                {days.map((day, index) => {
                  const foods = day?.[activeTab]?.foods || [];

                  return (
                    <div
                      key={`${day.day_code || index}-${activeTab}`}
                      className={[
                        "min-w-0 px-2 xl:px-3 py-4 min-h-[220px]",
                        "divide-y divide-[#E1E6ED]",
                        index !== days.length - 1
                          ? "border-r border-[#E1E6ED]"
                          : "",
                      ].join(" ")}
                    >
                      <p className="text-[#738298] text-[11px] font-semibold mb-3 truncate">
                        {day?.day || ""}
                      </p>

                      {foods.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">
                          No items
                        </p>
                      ) : (
                        foods.map((food, foodIndex) => (
                          <div
                            key={`${food.food_name || "food"}-${foodIndex}`}
                            className="py-3 first:pt-0 last:pb-0 min-w-0"
                          >
                            <FoodCard food={food} />
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2.5 justify-end mt-2">
        {!isApproved && (
          <p className="py-[11px] text-[#535359] text-[10px] font-normal leading-normal tracking-[-0.2px]">
            Auto-approved if not reviewed within 24 hours
          </p>
        )}

        <div className="flex gap-2.5">
          {/* Edit Button */}
          {/* <div
            onClick={() => {
              if (!isApproved) {
                // Later edit popup open logic here
                console.log("Edit clicked");
              }
            }}
            aria-disabled={isApproved}
            className={[
              "flex items-center gap-[5px] px-[11px] py-1 border rounded-[4px]",
              isApproved
                ? "border-[#E1E6ED] bg-[#F5F7FA] cursor-not-allowed opacity-60"
                : "border-[#E1E6ED] bg-white cursor-pointer",
            ].join(" ")}
          >
            <Image
              src="/icons/hugeicons_edit-04.svg"
              alt="edit-icon"
              width={20}
              height={20}
              className={isApproved ? "opacity-50 grayscale" : ""}
            />

            <span
              className={[
                "text-[12px] font-semibold leading-normal tracking-[-0.24px]",
                isApproved ? "text-[#A1A1A1]" : "text-[#308BF9]",
              ].join(" ")}
            >
              Edit
            </span>
          </div> */}

          {/* Approve / Approved Button */}
          <div
            onClick={() => {
              if (!isApproved) {
                setShowApprovePopup(true);
              }
            }}
            aria-disabled={isApproved}
            className={[
              "flex items-center gap-[5px] justify-center px-[11px] py-1 rounded-[4px]",
              isApproved
                ? "bg-[#E1E6ED] cursor-not-allowed"
                : "bg-[#308BF9] cursor-pointer",
            ].join(" ")}
          >
            <Image
              src="/icons/hugeicons_tick-0236.svg"
              alt="approve-icon"
              width={20}
              height={20}
              className={isApproved ? "opacity-50 grayscale" : ""}
            />

            <span
              className={[
                "text-[12px] font-semibold leading-normal tracking-[-0.24px]",
                isApproved ? "text-[#738298]" : "text-white",
              ].join(" ")}
            >
              {isApproved ? "Approved" : "Approve"}
            </span>
          </div>
        </div>
      </div>

      {showApprovePopup && !isApproved && (
        <ApproveConfirmationPopup
          onClose={() => setShowApprovePopup(false)}
          onConfirm={handleApproveConfirm}
          isLoading={isApproving}
        />
      )}
    </div>
  );
}

function EmptyState({ text, error = false }) {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <p
        className={[
          "text-[13px] font-medium",
          error ? "text-[#E76F51]" : "text-[#738298]",
        ].join(" ")}
      >
        {text}
      </p>
    </div>
  );
}

function FoodCard({ food }) {
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

  const macros = [
    {
      label: `${formatValue(food.calories)}`,
      classes: "bg-red-50 text-red-500",
    },
    {
      label: `${formatValue(food.carbs_g, "g")}`,
      classes: "bg-[#2A9D8F1A] text-[#2A9D8F]",
    },
    {
      label: `${formatValue(food.protein_g, "g")}`,
      classes: "bg-[#F4A2611A] text-[#F4A261]",
    },
    {
      label: `${formatValue(food.fat_g, "g")}`,
      classes: "bg-[#3A86FF1A] text-[#3A86FF]",
    },
  ];

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <h3 className="text-[#252525] text-[11px] xl:text-[12px] font-semibold leading-[126%] tracking-[-0.22px] break-words">
        {food.food_name || "Unnamed food"}
      </h3>

      {food.portion_with_metric && (
        <p className="text-[#252525] text-[10px] mt-1 leading-normal tracking-[-0.2px] break-words">
          {food.portion_with_metric}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-1">
        {macros.map((macro, index) => (
          <span
            key={index}
            className={[
              "inline-flex items-center justify-center rounded-[5px]",
              "px-1.5 py-[4px]",
              "text-[9px] xl:text-[10px] font-semibold leading-[110%]",
              "whitespace-nowrap",
              macro.classes,
            ].join(" ")}
            title={macro.label}
          >
            {macro.label}
          </span>
        ))}
      </div>
    </div>
  );
}