"use client";

import { useState } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowRoundBack } from "react-icons/io";

export default function RightHandSidebar({ isOpen, onClose, selectedHabit, setSelectedHabit }) {
  const [calendarDate, setCalendarDate] = useState(new Date());

  const handleClose = () => {
    // Don't reset selectedHabit here, let the parent handle it
    onClose();
  };

  /* ---------------- CURRENT MONTH CALENDAR ---------------- */
  const currentMonth = calendarDate.getMonth();
  const currentYear = calendarDate.getFullYear();

  const monthTitle = calendarDate.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  let startDay = firstDay.getDay(); // Sun=0
  startDay = startDay === 0 ? 6 : startDay - 1; // Mon=0

  const calendarDays = [];

  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }

  for (let i = 1; i <= lastDate; i++) {
    calendarDays.push(i);
  }

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  const rows = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    rows.push(calendarDays.slice(i, i + 7));
  }

  const completedDays = [2, 5, 9, 12];

  const goPrevMonth = () => {
    setCalendarDate(
      new Date(currentYear, currentMonth - 1, 1)
    );
  };

  const goNextMonth = () => {
    setCalendarDate(
      new Date(currentYear, currentMonth + 1, 1)
    );
  };

  // Remove the local selectedHabit state since we're receiving it as prop
  // const [selectedHabit, setSelectedHabit] = useState(null);

  return (
    <>
      {isOpen && (
        <div
          className="absolute inset-0 z-40 rounded-[15px] bg-[#252525] opacity-80"
          onClick={handleClose}
        />
      )}

      <div
        className={`absolute top-0 right-0 h-full z-50 flex items-start gap-3 transition-all duration-300 ${isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
          }`}
      >
        <button
          type="button"
          onClick={handleClose}
          className="mt-4 cursor-pointer text-black bg-white border border-[#E1E6ED] rounded-full w-10 h-10 flex items-center justify-center shadow-sm hover:bg-gray-50 z-50"
        >
          ✕
        </button>

        <div className="flex flex-col h-full w-[450px] bg-white shadow-lg rounded-r-[15px] overflow-hidden pt-[26px]">
          <div className="flex gap-1.5 ml-[25px] mb-[29px] items-center">
            <IoIosArrowRoundBack
              onClick={() => {
                if (setSelectedHabit) {
                  setSelectedHabit(null);
                }
              }}
              className="w-[33px] h-8 cursor-pointer"
            />

            <span className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
              {selectedHabit ? selectedHabit.title : "All Habits (6)"}
            </span>
          </div>

          {!selectedHabit ? (
            <div className="group flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-y-auto group-hover-scrollbar">
                <div className="flex flex-col gap-[15px] px-[15px] pb-4">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        if (setSelectedHabit) {
                          // Create a default habit object or use your data
                          setSelectedHabit({
                            id: index,
                            title: "Grocery shop 1× per week",
                            frequency: "Once a week",
                            frequencyShort: "Once a week",
                            color: "#1D57A0",
                            completionRate: 50,
                            perfectWeeks: 1,
                            weeksTracked: 5
                          });
                        }
                      }}
                      className="flex justify-between bg-[#F5F7FA] rounded-[12px] pl-5 pr-[22px] pt-[18px] pb-[23px] border-l-[12px] border-[#1D57A0] cursor-pointer"
                    >
                      <div className="flex flex-col gap-[5px]">
                        <p className="text-[#252525] text-[15px] font-normal leading-[110%] tracking-[-0.3px]">
                          Grocery shop 1× per week
                        </p>

                        <p className="text-[#1D57A0] text-[10px] font-normal leading-normal tracking-[-0.2px]">
                          Once a week
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <p className="text-[#252525] text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
                          50%
                        </p>

                        <p className="text-[#535359] text-[10px] font-normal leading-normal tracking-[-0.2px]">
                          Once a week
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-[17px] px-[15px]">
              <div 
                className="flex flex-col gap-5 rounded-[12px] pl-5 pr-[22px] pt-[18px] pb-[23px] cursor-pointer"
                style={{ 
                  backgroundColor: '#F5F7FA',
                  borderLeft: `12px solid ${selectedHabit.color || '#1D57A0'}` 
                }}
              >
                <div className="flex flex-col gap-[5px]">
                  <p className="text-[#252525] text-[15px] font-normal leading-[110%] tracking-[-0.3px]">
                    {selectedHabit.title}
                  </p>

                  <p 
                    className="text-[10px] font-normal leading-normal tracking-[-0.2px]"
                    style={{ color: selectedHabit.color || '#1D57A0' }}
                  >
                    {selectedHabit.frequency}
                  </p>
                </div>

                <div className="flex justify-between">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#252525] text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
                      {selectedHabit.completionRate}%
                    </p>

                    <p className="text-[#535359] text-[10px] font-normal leading-normal tracking-[-0.2px]">
                      Completion Rate
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#252525] text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
                      {selectedHabit.perfectWeeks}
                    </p>

                    <p className="text-[#535359] text-[10px] font-normal leading-normal tracking-[-0.2px]">
                      Total Perfect Weeks
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#252525] text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
                      {selectedHabit.weeksTracked}
                    </p>

                    <p className="text-[#535359] text-[10px] font-normal leading-normal tracking-[-0.2px]">
                      Weeks Tracked
                    </p>
                  </div>
                </div>
              </div>

              {/* CURRENT MONTH CALENDAR */}
              <div>
                <div className="flex justify-between items-center py-[15px] px-[12px]">
                  <span className="text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
                    {monthTitle}
                  </span>

                  <div className="flex gap-5 items-center mx-[27px]">
                    <IoChevronBackOutline
                      onClick={goPrevMonth}
                      className="w-6 h-6 cursor-pointer"
                    />

                    <IoIosArrowForward
                      onClick={goNextMonth}
                      className="w-6 h-6 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-[9px] mx-5">
                  <div className="grid grid-cols-7 gap-2.5 border-b border-[#E1E6ED] pb-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day, index) => (
                        <div
                          key={day}
                          className="flex justify-center px-3.5 py-1.5"
                        >
                          <span
                            className={`text-[10px] font-normal leading-normal tracking-[-0.2px] ${index === 6
                                ? "text-[#DA5747]"
                                : "text-[#252525]"
                              }`}
                          >
                            {day}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {rows.map((week, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-7 gap-2.5">
                        {week.map((num, i) => (
                          <div
                            key={i}
                            className={`h-[30px] flex items-center justify-center rounded-[25px] px-[7px] py-[5px] cursor-pointer ${num === null
                                ? ""
                                : completedDays.includes(num)
                                  ? "border"
                                  : "bg-[#E4F0FF]"
                              }`}
                            style={num !== null && completedDays.includes(num) ? 
                              { borderColor: selectedHabit.color || '#1D57A0' } : 
                              {}}
                          >
                            {num !== null && (
                              <span className="text-[#252525] text-[10px] font-normal leading-normal tracking-[-0.2px]">
                                {num}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}