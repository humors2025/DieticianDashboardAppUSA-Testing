"use client";

import { useState } from "react";
import Image from "next/image";
import EditRightSideBar from "./edit-rightsidebar";

export default function RightSidebar({ isOpen, onClose }) {
    const [isEditOpen, setIsEditOpen] = useState(false);


    // Handle closing the entire sidebar (both main and edit)
    const handleCloseAll = () => {
        setIsEditOpen(false); // Close edit sidebar first
        onClose(); // Then close main sidebar
    };

    return (
        <>
            <div
                className={`absolute top-0 right-0 h-full z-50 flex items-start gap-3 transition-all duration-300 ${
                    isOpen
                        ? "translate-x-0 opacity-100 pointer-events-auto"
                        : "translate-x-full opacity-0 pointer-events-none"
                }`}
            >
                {/* Outside Close Button - Now closes everything */}
                <button
                    type="button"
                    onClick={handleCloseAll}
                    className="mt-4 cursor-pointer text-black bg-white border border-[#E1E6ED] rounded-full w-10 h-10 flex items-center justify-center shadow-sm z-50"
                >
                    X
                </button>

                {/* Sidebar */}
                <div className="h-full bg-white rounded-r-[15px] border border-[#E1E6ED] shadow-sm overflow-hidden z-50">
                    <div className="h-full flex flex-col gap-4">
                        <div className="flex items-center justify-between pl-5 pt-[27px] pr-5">
                            <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                                Client Details
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto group-hover-scrollbar">
                            <div className="flex flex-col">
                                <div className="flex gap-5 rounded-[10px] py-7 pl-[15px] pr-14 mb-[30px] mx-[15px] bg-[#F5F7FA]">
                                    <div className="w-[80px] h-[80px] p-5 bg-white rounded-full">
                                        <Image
                                            src="/icons/hugeicons_user-circle-02.svg"
                                            alt="hugeicons_user-circle-02.svg"
                                            width={40}
                                            height={40}
                                            className="cursor-pointer rounded-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-[18px] py-1">
                                        <p className="text-[#252525] text-[20px] font-semibold leading-[110%] tracking-[-0.4px]">
                                            Sagar Hosur lorem
                                        </p>

                                        <div>
                                            <div className="flex gap-1.5 items-center">
                                                <p className="text-[#535359] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                                                    +1 3463743898 lorem
                                                </p>
                                                <Image
                                                    src="/icons/Ellipse 765.svg"
                                                    alt="Ellipse 765.svg"
                                                    width={3}
                                                    height={3}
                                                />
                                                <p className="text-[#535359] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                                                    sagarhoosur@gmail.com lorem
                                                </p>
                                            </div>

                                            <div className="flex gap-2.5 items-center">
                                                <p className="text-[#252525] text-[12px] font-semibold leading-[110%] tracking-[-0.24px]">
                                                    Reference ID lorem
                                                </p>

                                                <p className="text-[#535359] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                                                    58128376790 lorem
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                                        <div className="flex flex-col gap-[15px]">
                                            <p className="text-[#252525] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                                                Personal Info lorem
                                            </p>
                                            <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                                                Male, 28 years, 180 cm, 20kg lorem
                                            </p>
                                        </div>

                                        {/* <Image
                                            src="/icons/hugeicons_edit-0466.svg"
                                            alt="hugeicons_edit-0466.svg"
                                            width={24}
                                            height={24}
                                            className="cursor-pointer"
                                            onClick={() => setIsEditOpen(true)}
                                        /> */}
                                    </div>

                                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                                        <div className="flex flex-col gap-[15px]">
                                            <p className="text-[#252525] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                                                Performance Level
                                            </p>
                                            <div className="w-[68px] bg-[#E9F3FF] rounded-[5px] px-2.5 py-2">
                                                <p className="text-[#006FFF] text-[15px] font-semibold leading-[126%] tracking-[-0.3px] whitespace-nowrap">
                                                    LEVEL 1
                                                </p>
                                            </div>
                                        </div>

                                        <Image
                                            src="/icons/hugeicons_edit-0466.svg"
                                            alt="hugeicons_edit-0466.svg"
                                            width={24}
                                            height={24}
                                            className="cursor-pointer"
                                            onClick={() => setIsEditOpen(true)}
                                        />
                                    </div>

                                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                                        <div className="flex flex-col gap-[15px]">
                                            <p className="text-[#252525] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                                                Fitness Goal
                                            </p>
                                            <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                                                Weight loss
                                            </p>
                                        </div>

                                        {/* <Image
                                            src="/icons/hugeicons_edit-0466.svg"
                                            alt="hugeicons_edit-0466.svg"
                                            width={24}
                                            height={24}
                                            className="cursor-pointer"
                                            onClick={() => setIsEditOpen(true)}
                                        /> */}
                                    </div>

                                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                                        <div className="flex flex-col gap-[15px]">
                                            <p className="text-[#535359] text-[12px] font-normal leading-[110%] tracking-[-0.24px]">
                                                Activity Level
                                            </p>
                                            <div className="flex flex-col gap-2.5">
                                                <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                                                    Sedentary
                                                </p>
                                                <p className="text-[#252525] text-[12px] font-normal leading-[110%] tracking-[-0.24px] whitespace-nowrap">
                                                    Little to no exercise. Mostly sitting during the day.
                                                </p>
                                            </div>
                                        </div>

                                        {/* <Image
                                            src="/icons/hugeicons_edit-0466.svg"
                                            alt="hugeicons_edit-0466.svg"
                                            width={24}
                                            height={24}
                                            className="cursor-pointer"
                                            onClick={() => setIsEditOpen(true)}
                                        /> */}
                                    </div>

                                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                                        <div className="flex flex-col gap-[15px]">
                                            <p className="text-[#252525] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                                                Dietary Preferences
                                            </p>
                                            <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                                                No Dietary Preferences
                                            </p>
                                        </div>

                                        {/* <Image
                                            src="/icons/hugeicons_edit-0466.svg"
                                            alt="hugeicons_edit-0466.svg"
                                            width={24}
                                            height={24}
                                            className="cursor-pointer"
                                            onClick={() => setIsEditOpen(true)}
                                        /> */}
                                    </div>

                                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                                        <div className="flex flex-col gap-[15px]">
                                            <p className="text-[#252525] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                                                Cuisine Preferences
                                            </p>
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex gap-[5px]">
                                                    <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                                                        P1
                                                    </p>
                                                    <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                                                        Indian
                                                    </p>
                                                </div>

                                                <div className="border-r border-[#252525] h-[13px]"></div>

                                                <div className="flex gap-[5px]">
                                                    <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                                                        P2
                                                    </p>
                                                    <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                                                        American
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* <Image
                                            src="/icons/hugeicons_edit-0466.svg"
                                            alt="hugeicons_edit-0466.svg"
                                            width={24}
                                            height={24}
                                            className="cursor-pointer"
                                            onClick={() => setIsEditOpen(true)}
                                        /> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isEditOpen && (
                <div className="absolute top-0 right-0 z-[60] h-full w-[465px] bg-white rounded-r-[15px]">
                    <EditRightSideBar onClose={() => setIsEditOpen(false)} />
                </div>
            )}
        </>
    );
}