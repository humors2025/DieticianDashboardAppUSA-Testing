import Image from "next/image";

export default function EditRightSideBar({ onClose }) {
    return (
        <div className="flex flex-col h-full  pt-[18px]">
            <div className="flex gap-4 items-center pl-3">
                <Image
                    src="/icons/Frame 383.svg"
                    alt="Close button"
                    width={32}
                    height={32}
                    onClick={onClose}
                    className="cursor-pointer"
                />

                <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                    Performance level
                </p>
            </div>

            <div className="flex flex-col justify-between flex-1 pt-4">
                <div className="flex flex-col">
                    <div className="px-5 py-2">
                        <div className="flex justify-between items-center">
                            <div className="px-2.5 py-2 bg-[#E9F3FF] rounded-[5px]">
                                <p className="text-[#006FFF] text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
                                    LEVEL 1
                                </p>
                            </div>

                            <input
                                type="radio"
                                name="performanceLevel"
                                value="LEVEL 1"
                                className="w-[25px] h-[25px] cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="px-5 py-2">
                        <div className="flex justify-between items-center">
                            <div className="px-2.5 py-2 bg-[#FFFAF0] rounded-[5px]">
                                <p className="text-[#F6AD0B] text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
                                    LEVEL 2
                                </p>
                            </div>

                            <input
                                type="radio"
                                name="performanceLevel"
                                value="LEVEL 2"
                                className="w-[25px] h-[25px] cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="px-5 py-2">
                        <div className="flex justify-between items-center">
                            <div className="px-2.5 py-2 bg-[#EAFFEF] rounded-[5px]">
                                <p className="text-[#3FAF58] text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
                                    LEVEL 3
                                </p>
                            </div>

                            <input
                                type="radio"
                                name="performanceLevel"
                                value="LEVEL 3"
                                className="w-[25px] h-[25px] cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end py-[30px]  border-t border-[#E1E6ED]">
                    <div className="px-[31px] py-[11px] mr-6 rounded-[6px] bg-[#308BF9] cursor-pointer">
                        <p className="text-[#FFFFFF] text-[12px] font-semibold leading-[110%] tracking-[-0.24px]">
                            Update
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}