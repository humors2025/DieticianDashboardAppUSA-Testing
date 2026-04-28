"use client"
import { useState } from "react";
import Image from "next/image";
import RightHandSidebar from "./right-hand-sidebar";

export default function HabitsMonitoring() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Add state for selected habit
    const [selectedHabit, setSelectedHabit] = useState(null);

    const handleOpenSidebar = () => {
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedHabit(null); // Reset selected habit when closing
    };

    // Define your habits data
    const habits = [
        {
            id: 1,
            title: "Hit daily protein goal",
            frequency: "Everyday",
            frequencyShort: "Everyday",
            color: "#91850E",
            bgColor: "bg-[#FCF8CF]",
            borderColor: "border-[#91850E]",
            textColor: "text-[#91850E]",
            completionRate: 76,
            perfectWeeks: 2,
            weeksTracked: 4
        },
        {
            id: 2,
            title: "Stop eating after 9 PM",
            frequency: "Everyday",
            frequencyShort: "Everyday",
            color: "#078C21",
            bgColor: "bg-[#CAE8D0]",
            borderColor: "border-[#078C21]",
            textColor: "text-[#078C21]",
            completionRate: 76,
            perfectWeeks: 1,
            weeksTracked: 3
        },
        {
            id: 3,
            title: "No screens 30 min before bed",
            frequency: "Everyday",
            frequencyShort: "Everyday",
            color: "#179C9C",
            bgColor: "bg-[#E1F3F3]",
            borderColor: "border-[#179C9C]",
            textColor: "text-[#179C9C]",
            completionRate: 76,
            perfectWeeks: 3,
            weeksTracked: 5
        },
        {
            id: 4,
            title: "Cardio 3×/week",
            frequency: "Thrice a week",
            frequencyShort: "Thrice a week",
            color: "#B42525",
            bgColor: "bg-[#FFEDED]",
            borderColor: "border-[#B42525]",
            textColor: "text-[#B42525]",
            completionRate: 76,
            perfectWeeks: 1,
            weeksTracked: 4
        },
        {
            id: 5,
            title: "Grocery shop 1× per week",
            frequency: "Once a week",
            frequencyShort: "Once a week",
            color: "#1D57A0",
            bgColor: "bg-[#E4F0FF]",
            borderColor: "border-[#1D57A0]",
            textColor: "text-[#1D57A0]",
            completionRate: 76,
            perfectWeeks: 2,
            weeksTracked: 5
        }
    ];

    const handleHabitClick = (habit) => {
        setSelectedHabit(habit);
        setIsSidebarOpen(true);
    };

    return (
        <>
            <div className="relative border rounded-[15px] px-3 pt-5 pb-[15px] overflow-hidden">
                <div className="flex flex-col gap-[30px]">
                    <div className="flex justify-between items-center pl-2">
                        <p className="text-[#252525] text-[15px] font-semibold leading-normal tracking-[-0.3px]">Habit Monitoring (6)</p>
                        <div className="flex gap-[15px] border rounded-[4px] items-center px-[11px] py-1">
                            <p className="text-[#535359] text-[12px] font-normal leading-[110%] tracking-[-0.24px]">Weekly (3 Jul - 8 Jul)</p>
                            <Image
                                src="/icons/right button23.svg"
                                alt="Frame 427320805.svg"
                                width={20}
                                height={20}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[15px]">
                        <div className="flex gap-[15px]">
                            {/* Habit 1 */}
                            <div className={`w-[297px] group flex flex-col gap-[15px] pt-5 pr-5 pl-[15px] pb-[13px] ${habits[0].bgColor} rounded-[15px]`}>
                                <div className="flex flex-col gap-[27px]">
                                    <div className="flex flex-col gap-[5px]">
                                        <p className="text-[#252525] text-[15px] font-normal leading-[110%] tracking-[-0.3px]">{habits[0].title}</p>
                                        <p className={`${habits[0].textColor} text-[10px] font-normal leading-normal tracking-[-0.2px]`}>{habits[0].frequency}</p>
                                    </div>
                                    <div className="flex gap-[5px]">
                                        <div className="w-[14px] h-[14px] rounded-full bg-[#91850E]" />
                                        <div className="w-[14px] h-[14px] rounded-full bg-[#91850E]" />
                                        <div className="w-[14px] h-[14px] rounded-full bg-[#91850E]" />
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                    </div>
                                </div>
                                <div className="flex gap-[109px]">
                                    <div className="flex flex-col gap-5">
                                        <p className="text-[#535359] text-[10px] font-semibold leading-[110%] tracking-[-0.2px] uppercase whitespace-nowrap">Weekly Completion Rate</p>
                                        <div>
                                            <p className="text-[#252525]">
                                                <span className="text-[40px] font-normal leading-normal tracking-[-0.8px]">{habits[0].completionRate}</span>
                                                <span className="text-center text-[10px] font-normal leading-[110%] tracking-[-0.2px] capitalize">%</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div 
                                        className="w-[32px] h-[32px] flex justify-end self-end items-end pb-[7px]"
                                        onClick={() => handleHabitClick(habits[0])}
                                    >
                                        <Image
                                            src="/icons/right button0356.svg"
                                            alt="right button0356.svg"
                                            width={32}
                                            height={32}
                                            className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 pb-[7px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Habit 2 */}
                            <div className={`group flex flex-col gap-[15px] pt-5 pr-5 pl-[15px] pb-[13px] ${habits[1].bgColor} rounded-[15px]`}>
                                <div className="flex flex-col gap-[27px]">
                                    <div className="flex flex-col gap-[5px]">
                                        <p className="text-[#252525] text-[15px] font-normal leading-[110%] tracking-[-0.3px]">{habits[1].title}</p>
                                        <p className={`${habits[1].textColor} text-[10px] font-normal leading-normal tracking-[-0.2px]`}>{habits[1].frequency}</p>
                                    </div>
                                    <div className="flex gap-[5px]">
                                        <div className="w-[14px] h-[14px] rounded-full bg-[#078C21]" />
                                        <div className="w-[14px] h-[14px] border border-[#078C21] rounded-full" />
                                        <div className="w-[14px] h-[14px] rounded-full bg-[#078C21]" />
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                    </div>
                                </div>
                                <div className="flex gap-[109px]">
                                    <div className="flex flex-col gap-5">
                                        <p className="text-[#535359] text-[10px] font-semibold leading-[110%] tracking-[-0.2px] uppercase whitespace-nowrap">Weekly Completion Rate</p>
                                        <div>
                                            <p className="text-[#252525]">
                                                <span className="text-[40px] font-normal leading-normal tracking-[-0.8px]">{habits[1].completionRate}</span>
                                                <span className="text-center text-[10px] font-normal leading-[110%] tracking-[-0.2px] capitalize">%</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div 
                                        className="w-[32px] h-[32px] flex justify-end self-end items-end pb-[7px]"
                                        onClick={() => handleHabitClick(habits[1])}
                                    >
                                        <Image
                                            src="/icons/right button0356.svg"
                                            alt="right button0356.svg"
                                            width={32}
                                            height={32}
                                            className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 pb-[7px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-[15px]">
                            <div className="flex gap-[15px]">
                                {/* Habit 3 */}
                                <div className={`group flex flex-col gap-[15px] pt-5 pr-5 pb-[13px] pl-[15px] ${habits[2].bgColor} rounded-[15px]`}>
                                    <div className="flex flex-col gap-[27px]">
                                        <div className="flex flex-col gap-[5px]">
                                            <p className="text-[#252525] text-[15px] font-normal leading-[110%] tracking-[-0.3px]">{habits[2].title}</p>
                                            <p className={`${habits[2].textColor} text-[10px] font-normal leading-normal tracking-[-0.2px]`}>{habits[2].frequency}</p>
                                        </div>
                                        <div className="flex gap-[5px]">
                                            <div className="w-[14px] h-[14px] rounded-full bg-[#179C9C]" />
                                            <div className="w-[14px] h-[14px] border border-[#179C9C] rounded-full" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-[#179C9C]" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="flex flex-col gap-5">
                                            <p className="text-[#535359] text-[10px] font-semibold leading-[110%] tracking-[-0.2px] uppercase whitespace-nowrap">Weekly Completion Rate</p>
                                            <div>
                                                <p className="text-[#252525]">
                                                    <span className="text-[40px] font-normal leading-normal tracking-[-0.8px]">{habits[2].completionRate}</span>
                                                    <span className="text-center text-[10px] font-normal leading-[110%] tracking-[-0.2px] capitalize">%</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div 
                                            className="w-[32px] h-[32px] flex justify-end self-end items-end pb-[7px]"
                                            onClick={() => handleHabitClick(habits[2])}
                                        >
                                            <Image
                                                src="/icons/right button0356.svg"
                                                alt="right button0356.svg"
                                                width={32}
                                                height={32}
                                                className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 pb-[7px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Habit 4 */}
                                <div className={`group flex flex-col gap-[15px] pt-5 pr-5 pb-[13px] pl-[15px] ${habits[3].bgColor} rounded-[15px]`}>
                                    <div className="flex flex-col gap-[27px]">
                                        <div className="flex flex-col gap-[5px]">
                                            <p className="text-[#252525] text-[15px] font-normal leading-[110%] tracking-[-0.3px]">{habits[3].title}</p>
                                            <p className={`${habits[3].textColor} text-[10px] font-normal leading-normal tracking-[-0.2px]`}>{habits[3].frequency}</p>
                                        </div>
                                        <div className="flex gap-[5px]">
                                            <div className="w-[14px] h-[14px] rounded-full bg-[#B42525]" />
                                            <div className="w-[14px] h-[14px] border border-[#B42525] rounded-full" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-[#B42525]" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="flex flex-col gap-5">
                                            <p className="text-[#535359] text-[10px] font-semibold leading-[110%] tracking-[-0.2px] uppercase whitespace-nowrap">Weekly Completion Rate</p>
                                            <div>
                                                <p className="text-[#252525]">
                                                    <span className="text-[40px] font-normal leading-normal tracking-[-0.8px]">{habits[3].completionRate}</span>
                                                    <span className="text-center text-[10px] font-normal leading-[110%] tracking-[-0.2px] capitalize">%</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div 
                                            className="w-[32px] h-[32px] flex justify-end self-end items-end pb-[7px]"
                                            onClick={() => handleHabitClick(habits[3])}
                                        >
                                            <Image
                                                src="/icons/right button0356.svg"
                                                alt="right button0356.svg"
                                                width={32}
                                                height={32}
                                                className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 pb-[7px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Habit 5 */}
                                <div className={`group flex flex-col gap-[15px] pt-5 pr-5 pl-[15px] pb-[13px] ${habits[4].bgColor} rounded-[15px]`}>
                                    <div className="flex flex-col gap-[27px]">
                                        <div className="flex flex-col gap-[5px]">
                                            <p className="text-[#252525] text-[15px] font-normal leading-[110%] tracking-[-0.3px]">{habits[4].title}</p>
                                            <p className={`${habits[4].textColor} text-[10px] font-normal leading-normal tracking-[-0.2px]`}>{habits[4].frequency}</p>
                                        </div>
                                        <div className="flex gap-[5px]">
                                            <div className="w-[14px] h-[14px] rounded-full bg-[#1D57A0]" />
                                            <div className="w-[14px] h-[14px] border border-[#1D57A0] rounded-full" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-[#1D57A0]" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="flex flex-col gap-5">
                                            <p className="text-[#535359] text-[10px] font-semibold leading-[110%] tracking-[-0.2px] uppercase whitespace-nowrap">Weekly Completion Rate</p>
                                            <div>
                                                <p className="text-[#252525]">
                                                    <span className="text-[40px] font-normal leading-normal tracking-[-0.8px]">{habits[4].completionRate}</span>
                                                    <span className="text-center text-[10px] font-normal leading-[110%] tracking-[-0.2px] capitalize">%</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div 
                                            className="w-[32px] h-[32px] flex justify-end self-end items-end pb-[7px]"
                                            onClick={() => handleHabitClick(habits[4])}
                                        >
                                            <Image
                                                src="/icons/right button0356.svg"
                                                alt="right button0356.svg"
                                                width={32}
                                                height={32}
                                                className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 pb-[7px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-end gap-[15px] cursor-pointer pr-3"
                                onClick={handleOpenSidebar}
                            >
                                <Image
                                    src="/icons/Frame 38345.svg"
                                    alt="Frame 38345.svg"
                                    width={33}
                                    height={32}
                                    className="border rounded-full border-[#252525]"
                                />
                                <span className="text-[#252525] text-[15px] font-normal leading-[110%] tracking-[-0.3px] whitespace-nowrap">View All</span>
                            </div>
                        </div>
                    </div>
                </div>

                <RightHandSidebar
                    isOpen={isSidebarOpen}
                    onClose={handleCloseSidebar}
                    selectedHabit={selectedHabit}
                    setSelectedHabit={setSelectedHabit}
                />
            </div>
        </>
    )
}