"use client";

import { useState } from "react";

/* ======================================================================
   STATIC DATA — baked into the component. No imports, no props needed.
   ====================================================================== */
const DIET_DATA = {
  week_range: "26 Apr, 2026 - 02 May, 2026",
  days: [
    {
      day_code: "d1",
      day: "Monday",
      breakfast: { foods: [
        { food_name: "Protein Breakfast Smoothie (No Sugar)", calories: 299, carbs_g: 23, protein_g: 27.6, fat_g: 9.2, fiber_g: 4.6, portion_with_metric: "250 ml (~1 medium glass)" },
        { food_name: "Salmon Bagel Sandwich", calories: 119.22, carbs_g: 15.11, protein_g: 5.7, fat_g: 4, fiber_g: 0.43, portion_with_metric: "47.5 g (~1/2 small bowl)" },
      ]},
      lunch: { foods: [
        { food_name: "Beef Chili", calories: 461.55, carbs_g: 74.4, protein_g: 20.07, fat_g: 9.99, fiber_g: 9.87, portion_with_metric: "131.5 g (~1/2 small bowl)" },
        { food_name: "Vegan Burrito", calories: 257.24, carbs_g: 27.53, protein_g: 13.72, fat_g: 10.25, fiber_g: 3.75, portion_with_metric: "120 g (~1/2 small bowl)" },
      ]},
      snacks: { foods: [
        { food_name: "Guava", calories: 80, carbs_g: 16.79, protein_g: 3.16, fat_g: 0.99, fiber_g: 5.93, portion_with_metric: "118.52 g (~1 small bowl)" },
        { food_name: "Egg and Zucchini Muffins", calories: 225, carbs_g: 15, protein_g: 12, fat_g: 13.5, fiber_g: 3, portion_with_metric: "60 g (~1 muffin)" },
      ]},
      dinner: { foods: [
        { food_name: "Cabbage Rolls", calories: 231, carbs_g: 30, protein_g: 12, fat_g: 7, fiber_g: 5, portion_with_metric: "150 g (~1 small bowl)" },
        { food_name: "Beef Tacos with Lettuce Wraps", calories: 375, carbs_g: 30, protein_g: 22.5, fat_g: 18, fiber_g: 4.5, portion_with_metric: "100 g (~1 taco)" },
      ]},
    },
    {
      day_code: "d2",
      day: "Tuesday",
      breakfast: { foods: [
        { food_name: "Beetroot Apple Smoothie (No Sugar)", calories: 96, carbs_g: 22, protein_g: 2, fat_g: 0.5, fiber_g: 3.5, portion_with_metric: "250 ml (~1 medium glass)" },
        { food_name: "Egg Omelette (Low Oil)", calories: 155, carbs_g: 2, protein_g: 11.5, fat_g: 11, fiber_g: 0.2, portion_with_metric: "110 g (~1 egg)" },
        { food_name: "Quiche with Spinach and Bacon", calories: 320, carbs_g: 30, protein_g: 12, fat_g: 18, fiber_g: 2, portion_with_metric: "120 g (~1 slice)" },
      ]},
      lunch: { foods: [
        { food_name: "Baked Sweet Potato", calories: 180, carbs_g: 41.33, protein_g: 3.33, fat_g: 0.27, fiber_g: 6, portion_with_metric: "200 g (~1 small bowl)" },
        { food_name: "Steak Fajitas with Bell Peppers", calories: 247.2, carbs_g: 21.6, protein_g: 13.56, fat_g: 11.76, fiber_g: 1.8, portion_with_metric: "120 g (~1/2 small bowl)" },
      ]},
      snacks: { foods: [
        { food_name: "Shrimp Cocktail", calories: 247.5, carbs_g: 19.8, protein_g: 33, fat_g: 3.04, fiber_g: 1, portion_with_metric: "125 g (~1/2 small bowl)" },
      ]},
      dinner: { foods: [
        { food_name: "Plain Oatmeal", calories: 227.5, carbs_g: 39, protein_g: 8.67, fat_g: 4.33, fiber_g: 6.5, portion_with_metric: "325 g (~1 large bowl)" },
        { food_name: "Grilled Chicken Breast with Quinoa Salad", calories: 310.5, carbs_g: 28.2, protein_g: 15, fat_g: 15.3, fiber_g: 5.9, portion_with_metric: "150 g (~1 small bowl)" },
      ]},
    },
    {
      day_code: "d3",
      day: "Wednesday",
      breakfast: { foods: [
        { food_name: "Carrot Ginger Juice (No Sugar)", calories: 80, carbs_g: 18.29, protein_g: 1.37, fat_g: 0.23, fiber_g: 2.51, portion_with_metric: "285.71 ml (~1 large glass)" },
        { food_name: "Scrambled Eggs (Low Oil)", calories: 160, carbs_g: 2, protein_g: 12, fat_g: 11.5, fiber_g: 0, portion_with_metric: "110 g (~1 egg)" },
        { food_name: "Vegan Frittata with Chickpeas", calories: 186.88, carbs_g: 18.82, protein_g: 12.15, fat_g: 7, fiber_g: 7.38, portion_with_metric: "100 g (~1 slice)" },
      ]},
      lunch: { foods: [
        { food_name: "Boiled Potato", calories: 196, carbs_g: 43.93, protein_g: 5.07, fat_g: 0.34, fiber_g: 3.72, portion_with_metric: "253.45 g (~1 medium bowl)" },
        { food_name: "Chicken Fajita Bowl", calories: 370.8, carbs_g: 32.4, protein_g: 20.34, fat_g: 17.64, fiber_g: 2.7, portion_with_metric: "180 g (~1 small bowl)" },
      ]},
      snacks: { foods: [
        { food_name: "Sriracha Shrimp", calories: 247.5, carbs_g: 19.8, protein_g: 33, fat_g: 3.04, fiber_g: 1, portion_with_metric: "125 g (~1/2 small bowl)" },
      ]},
      dinner: { foods: [
        { food_name: "Quinoa", calories: 204, carbs_g: 35.42, protein_g: 7.51, fat_g: 3.26, fiber_g: 4.25, portion_with_metric: "170 g (~1 small bowl)" },
        { food_name: "Black Bean Burger", calories: 113.4, carbs_g: 14.7, protein_g: 6.9, fat_g: 3, fiber_g: 4.72, portion_with_metric: "60 g (~1/2 small bowl)" },
        { food_name: "Pork Tenderloin with Vegetables", calories: 118.2, carbs_g: 4.8, protein_g: 11.25, fat_g: 6, fiber_g: 1.88, portion_with_metric: "75 g (~1/2 small bowl)" },
      ]},
    },
    {
      day_code: "d4",
      day: "Thursday",
      breakfast: { foods: [
        { food_name: "Boiled Egg", calories: 216, carbs_g: 1.81, protein_g: 18.9, fat_g: 14.4, fiber_g: 0, portion_with_metric: "90.5 g (~2 egg)" },
        { food_name: "Chicken Sausage and Quinoa Bowl", calories: 108.29, carbs_g: 18.52, protein_g: 4.48, fat_g: 1.81, fiber_g: 3.06, portion_with_metric: "92.5 g (~1/2 small bowl)" },
      ]},
      lunch: { foods: [
        { food_name: "Brown Rice", calories: 168, carbs_g: 35, protein_g: 3.8, fat_g: 1.3, fiber_g: 2.5, portion_with_metric: "150 g (~1 small bowl)" },
        { food_name: "Vegetable Lasagna", calories: 144.07, carbs_g: 14.95, protein_g: 7.58, fat_g: 6, fiber_g: 2.39, portion_with_metric: "112.5 g (~1/2 small bowl)" },
        { food_name: "Sushi Rolls with Tuna", calories: 250, carbs_g: 30, protein_g: 15, fat_g: 8, fiber_g: 2, portion_with_metric: "100 g (~1 roll)" },
      ]},
      snacks: { foods: [
        { food_name: "Guava", calories: 80, carbs_g: 16.79, protein_g: 3.16, fat_g: 0.99, fiber_g: 5.93, portion_with_metric: "118.52 g (~1 small bowl)" },
        { food_name: "Egg and Tomato Salad", calories: 120, carbs_g: 10, protein_g: 6.59, fat_g: 6, fiber_g: 2, portion_with_metric: "150 g (~1 small bowl)" },
        { food_name: "Peanut Butter on Celery Sticks", calories: 99, carbs_g: 5, protein_g: 4, fat_g: 7, fiber_g: 2, portion_with_metric: "20 g (~1 1/2 tbsp)" },
      ]},
      dinner: { foods: [
        { food_name: "Whole Grain Bread", calories: 214.5, carbs_g: 40.04, protein_g: 8.58, fat_g: 2.86, fiber_g: 5.72, portion_with_metric: "80.08 g (~1/2 small bowl)" },
        { food_name: "Grilled Mahi-Mahi with Brown Rice", calories: 228.8, carbs_g: 33.95, protein_g: 12, fat_g: 5, fiber_g: 2.32, portion_with_metric: "150 g (~1 piece)" },
        { food_name: "Stuffed Zucchini Boats with Turkey", calories: 105, carbs_g: 6, protein_g: 9, fat_g: 5, fiber_g: 2.02, portion_with_metric: "75 g (~1/2 small bowl)" },
      ]},
    },
    {
      day_code: "d5",
      day: "Friday",
      breakfast: { foods: [
        { food_name: "Protein Breakfast Smoothie (No Sugar)", calories: 351, carbs_g: 27, protein_g: 32.4, fat_g: 10.8, fiber_g: 5.4, portion_with_metric: "250 ml (~1 medium glass)" },
      ]},
      lunch: { foods: [
        { food_name: "Salmon with Quinoa Salad", calories: 413.7, carbs_g: 54, protein_g: 15, fat_g: 15.3, fiber_g: 8.85, portion_with_metric: "100 g (~1/2 small bowl)" },
      ]},
      snacks: { foods: [
        { food_name: "Orange", calories: 80, carbs_g: 18.89, protein_g: 1.56, fat_g: 0.22, fiber_g: 4, portion_with_metric: "166.67 g (~1 medium bowl)" },
        { food_name: "Mini Quiches", calories: 150, carbs_g: 10, protein_g: 6, fat_g: 9, fiber_g: 1, portion_with_metric: "50 g (~1 quiche)" },
      ]},
      dinner: { foods: [
        { food_name: "Whole Wheat Pasta", calories: 118.4, carbs_g: 24, protein_g: 4.8, fat_g: 0.8, fiber_g: 3.2, portion_with_metric: "80 g (~1/2 small bowl)" },
        { food_name: "Stuffed Zucchini Boats with Eggs", calories: 225.84, carbs_g: 12, protein_g: 12.96, fat_g: 14, fiber_g: 4.05, portion_with_metric: "150 g (~1 small bowl)" },
        { food_name: "Grilled Mahi Mahi with Quinoa", calories: 286.3, carbs_g: 37.6, protein_g: 22.5, fat_g: 5.1, fiber_g: 5.9, portion_with_metric: "150 g (~1 piece)" },
      ]},
    },
    {
      day_code: "d6",
      day: "Saturday",
      breakfast: { foods: [
        { food_name: "Unsweetened Berry Yogurt Smoothie", calories: 108, carbs_g: 16.2, protein_g: 6.3, fat_g: 2.7, fiber_g: 2.7, portion_with_metric: "225 ml (~1 medium glass)" },
        { food_name: "Greek Yogurt with Honey and Nuts", calories: 285, carbs_g: 28.5, protein_g: 27, fat_g: 7, fiber_g: 1, portion_with_metric: "122.5 g (~1/2 small bowl)" },
      ]},
      lunch: { foods: [
        { food_name: "Quinoa", calories: 126, carbs_g: 21.88, protein_g: 4.64, fat_g: 2.01, fiber_g: 2.62, portion_with_metric: "105 g (~1/2 small bowl)" },
        { food_name: "Spinach and Feta Wrap", calories: 350, carbs_g: 40, protein_g: 15, fat_g: 15, fiber_g: 5, portion_with_metric: "150 g (~1 small bowl)" },
        { food_name: "Baked Sweet Potato with Greek Yogurt", calories: 93, carbs_g: 14.25, protein_g: 6.75, fat_g: 1, fiber_g: 2.5, portion_with_metric: "100 g (~1/2 small bowl)" },
      ]},
      snacks: { foods: [
        { food_name: "Egg and Zucchini Fritters", calories: 254, carbs_g: 20, protein_g: 12, fat_g: 14, fiber_g: 4, portion_with_metric: "50 g (~1/2 small bowl)" },
        { food_name: "Nut and Seed Bars", calories: 80.65, carbs_g: 7.8, protein_g: 3.12, fat_g: 4.11, fiber_g: 1.56, portion_with_metric: "20.8 g (~1 1/2 tbsp)" },
      ]},
      dinner: { foods: [
        { food_name: "Chicken Fajitas with Bell Peppers", calories: 123.6, carbs_g: 10.8, protein_g: 6.78, fat_g: 5.88, fiber_g: 0.9, portion_with_metric: "60 g (~1/2 small bowl)" },
        { food_name: "Grilled Shrimp Skewers with Quinoa", calories: 561.3, carbs_g: 56.4, protein_g: 49.5, fat_g: 15.3, fiber_g: 8.85, portion_with_metric: "125 g (~1/2 small bowl)" },
      ]},
    },
    {
      day_code: "d7",
      day: "Sunday",
      breakfast: { foods: [
        { food_name: "Unsweetened Banana Oats Smoothie", calories: 140, carbs_g: 26, protein_g: 5, fat_g: 3, fiber_g: 3.5, portion_with_metric: "250 ml (~1 medium glass)" },
        { food_name: "Egg Omelette (Low Oil)", calories: 155, carbs_g: 2, protein_g: 11.5, fat_g: 11, fiber_g: 0.2, portion_with_metric: "110 g (~1 egg)" },
        { food_name: "Grilled Chicken and Avocado Toast", calories: 210.98, carbs_g: 30, protein_g: 6, fat_g: 7.44, fiber_g: 5, portion_with_metric: "70 g (~1 slice)" },
      ]},
      lunch: { foods: [
        { food_name: "Whole Grain Bread", calories: 214.5, carbs_g: 40.04, protein_g: 8.58, fat_g: 2.86, fiber_g: 5.72, portion_with_metric: "80.08 g (~1/2 small bowl)" },
        { food_name: "Stuffed Bell Peppers with Rice and Eggs", calories: 300, carbs_g: 40, protein_g: 12, fat_g: 10, fiber_g: 5, portion_with_metric: "200 g (~1 small bowl)" },
        { food_name: "Egg and Quinoa Bowl", calories: 327, carbs_g: 42.3, protein_g: 16.5, fat_g: 10.2, fiber_g: 5.9, portion_with_metric: "250 g (~1 medium bowl)" },
      ]},
      snacks: { foods: [
        { food_name: "Pear", calories: 86, carbs_g: 23, protein_g: 0.6, fat_g: 0.2, fiber_g: 4.8, portion_with_metric: "150 g (~1 small bowl)" },
        { food_name: "Egg Drop Soup", calories: 120, carbs_g: 10, protein_g: 8, fat_g: 5, fiber_g: 1, portion_with_metric: "240 g (~1 medium bowl)" },
      ]},
      dinner: { foods: [
        { food_name: "Baked Sweet Potato", calories: 80, carbs_g: 18.37, protein_g: 1.48, fat_g: 0.12, fiber_g: 2.67, portion_with_metric: "88.89 g (~1/2 small bowl)" },
        { food_name: "Chicken Tacos", calories: 185.22, carbs_g: 19.3, protein_g: 13.03, fat_g: 6.22, fiber_g: 1.18, portion_with_metric: "98 g (~1 taco)" },
        { food_name: "Vegetable Curry with Chickpeas", calories: 128.92, carbs_g: 12, protein_g: 6, fat_g: 6.32, fiber_g: 3.19, portion_with_metric: "120 g (~1/2 small bowl)" },
      ]},
    },
  ],
};

const TABS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch",     label: "Lunch" },
  { key: "snacks",    label: "Evening Snacks" },
  { key: "dinner",    label: "Dinner" },
];

/* ======================================================================
   COMPONENT
   ====================================================================== */
export default function DietPlanLargeSize() {
  const [activeTab, setActiveTab] = useState("breakfast");
  const days = DIET_DATA.days;

  return (
    <div className="w-full p-4 md:p-6 lg:p-8">
      <div className="w-full pt-[15px] pl-3 pr-2.5 pb-[15px] rounded-3xl border border-rose-100 bg-[#FFFFFF] shadow-sm overflow-hidden">

        {/* Header: Title + Tabs inline */}
        <div className="flex items-center gap-6  md:px-8 lg:px-10 py-4 md:py-5">
          <h2 className="text-[15px] md:text-lg lg:text-xl font-semibold text-[#252525] leading-normal tracking-[-0.3px] flex-shrink-0">
            Diet Plan
          </h2>

        <div className="flex-1 flex justify-start">
  <div className="inline-flex items-center gap-1 border border-[#E1E6ED] bg-white p-1 rounded-[10px] overflow-x-auto">
    {TABS.map((t) => {
      const isActive = activeTab === t.key;
      return (
        <button
          key={t.key}
          onClick={() => setActiveTab(t.key)}
          className={[
            "whitespace-nowrap rounded-[8px] px-5 md:px-6 lg:px-8 py-2 lg:py-2.5 text-sm lg:text-[15px] font-medium transition-all duration-200 cursor-pointer",
            isActive
              ? "bg-[#308BF9] text-white text-[12px] font-semibold leading-[110%] tracking-[-0.48px]"
              : "text-[#252525] text-[12px] font-semibold leading-[110%] tracking-[-0.48px]",
          ].join(" ")}
        >
          {t.label}
        </button>
      );
    })}
  </div>
</div>
        </div>

        {/* Day header — single rounded pill containing all 7 days */}
        <div className="px-3 md:px-4 lg:px-6 pb-2">
          <div className="grid grid-cols-7 rounded-[10px] border border-[#E1E6ED] overflow-hidden">
           {days.map((d, idx) => (
  <div
    key={d.day_code}
    className={[
      "px-3 py-2.5 lg:py-3 text-center text-sm lg:text-[15px] font-medium text-slate-500",
      idx !== days.length - 1 ? "border-r border-[#E1E6ED]" : "",
    ].join(" ")}
  >
    Day {idx + 1}
  </div>
))}
          </div>
        </div>

        {/* Meals grid with vertical separator stripes */}
        <div className="relative">
          {/* Vertical separator lines that span the full content area */}
          <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
            {days.map((d, idx) => (
              <div
                key={`sep-${d.day_code}`}
                className={idx !== days.length - 1 ? "border-[#E1E6ED]" : ""}
              />
            ))}
          </div>

          {/* Actual content */}
<div className="relative grid grid-cols-7">
  {days.map((day, idx) => {
    const foods = day[activeTab]?.foods ?? [];
    return (
      <div
        key={`${day.day_code}-${activeTab}`}
        className={[
          "px-3 md:px-4 lg:px-5 xl:px-6 py-5 lg:py-6 min-h-[220px]",
          "divide-y divide-[#E1E6ED]",
          idx !== days.length - 1 ? "border-r border-[#E1E6ED]" : "",
        ].join(" ")}
      >
        {foods.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No items</p>
        ) : (
          foods.map((food, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0">
              <FoodCard food={food} />
            </div>
          ))
        )}
      </div>
    );
  })}
</div>
        </div>
      </div>
    </div>
  );
}

/* Food card — name, portion, then 4 macro pills (numeric values only) */
function FoodCard({ food }) {
  const macros = [
    { label: `${Math.round(food.calories)}`, classes: "bg-red-50 text-red-500" },
    { label: `${food.carbs_g}g`,              classes: "bg-[#2A9D8F1A] text-[#2A9D8F]" },
    { label: `${food.protein_g}g`,            classes: "bg-[#F4A2611A] text-[#F4A261]" },
    { label: `${food.fat_g}g`,                classes: "bg-[#3A86FF1A] text-[#3A86FF]" },
  ];

  return (
    <div>
      <h3 className="text-xs lg:text-[15px] font-semibold text-[#252525] leading-[126%] tracking-[0.24px]">
        {food.food_name}
      </h3>
      <p className="text-[10px] lg:text-[13px] text-[#252525] mt-1 leading-normal tracking-[0.2px]">
        {food.portion_with_metric}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {macros.map((m, idx) => (
          <span
            key={idx}
            className={[
              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] lg:text-xs font-medium",
              m.classes,
            ].join(" ")}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}