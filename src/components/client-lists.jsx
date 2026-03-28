"use client";
import { useState, useEffect  } from "react";
import Image from "next/image";
import { UserProfile } from "./user-profile";
import { fetchClientsDashboard } from "../services/authService";
import { cookieManager } from "../lib/cookies";

export default function ClientLists() {
  // 👇 First client active by default
  const [activeIndex, setActiveIndex] = useState(0);
  const [clientsData, setClientsData] = useState(null);
  const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);


const loadClients = async (pageNumber = 1) => {
  try {
    if (loading) return;

    setLoading(true);

    const dietician = cookieManager.getJSON("dietician");
    const dieticianId = dietician?.dietician_id;

    if (!dieticianId) return;

    const today = new Date().toISOString().split("T")[0];

    const res = await fetchClientsDashboard(
      dieticianId,
      "all",
      pageNumber,
      today
    );

    if (res?.status) {
      setClientsData((prev) => {
        if (!prev || pageNumber === 1) {
          return res; // first load
        }

        return {
          ...res,
          clients: [...(prev.clients || []), ...(res.clients || [])],
        };
      });

      // check if more pages exist
      if (pageNumber >= res.pagination.total_pages) {
        setHasMore(false);
      }
    }
  } catch (err) {
    console.error("Error fetching clients:", err);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  loadClients(1);
}, []);


  // const clients = [
  //   {
  //     name: "Sagar Hosur",
  //     score: "82%",
  //     status: "Optimal",
  //     lastTested: "Last tested 23 mins ago",
  //     goal: "Weight Loss",
  //     goalBg: "#E9F3FF",
  //     goalText: "#006FFF",
  //     tests: "32 tests taken",
  //   },
  //   {
  //     name: "Emily Blunt",
  //     score: "82%",
  //     status: "Optimal",
  //     lastTested: "Last tested 23 mins ago",
  //     goal: "Muscle Gain",
  //     goalBg: "#FFFAF0",
  //     goalText: "#F6AD0B",
  //     tests: "32 tests taken",
  //   },
  //   {
  //     name: "Poornesh",
  //     score: "82%",
  //     status: "Optimal",
  //     lastTested: "Last tested 23 mins ago",
  //     goal: "Weight Gain",
  //     goalBg: "#EAFFEF",
  //     goalText: "#3FAF58",
  //     tests: "32 tests taken",
  //   },
  //   {
  //     name: "Manorajan",
  //     score: "82%",
  //     status: "Optimal",
  //     lastTested: "Last tested 23 mins ago",
  //     goal: "Weight Gain",
  //     goalBg: "#EAFFEF",
  //     goalText: "#3FAF58",
  //     tests: "32 tests taken",
  //   },
  //   {
  //     name: "Respyr",
  //     score: "92%",
  //     status: "Optimal",
  //     lastTested: "Last tested 23 mins ago",
  //     goal: "Weight Gain",
  //     goalBg: "#EAFFEF",
  //     goalText: "#3FAF58",
  //     tests: "32 tests taken",
  //   },
  //   {
  //     name: "Respyr Humors",
  //     score: "82%",
  //     status: "Optimal",
  //     lastTested: "Last tested 23 mins ago",
  //     goal: "Weight Loss",
  //     goalBg: "#E9F3FF",
  //     goalText: "#006FFF",
  //     tests: "32 tests taken",
  //   },
  // ];

  return (
    <>
      <div className="bg-white rounded-[15px] px-[5px]">
        <div className="flex flex-col gap-6 mb-[22px]">
          <div className="flex gap-1.5 items-center pt-[22px] pl-[15px]">
            <Image
              src="/icons/Frame 383.svg"
              alt="Frame 383"
              width={32}
              height={32}
              className="cursor-pointer"
            />
            <p className="text-[#252525] text-[12px] font-semibold leading-[126%] tracking-[-0.24px]">
              Go to Dashboard
            </p>
          </div>

          <p className="pl-5 text-[#252525] text-[25px] font-semibold leading-normal tracking-[-1px]">
            Clients ({clientsData?.summary?.all_total})
          </p>
        </div>

        <UserProfile showOnlySearch={true} />

        <div className="flex gap-2.5 ml-[15px] my-[15px]">
          <div className="bg-[#252525] rounded-[20px] py-[11px] px-[30px] cursor-pointer">
            <p className="text-[#FFFFFF] text-[12px] font-normal leading-normal tracking-[-0.24px]">
              All ({clientsData?.summary?.all_total})
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E1E6ED] rounded-[20px] py-[11px] px-[30px] cursor-pointer">
            <p className="text-[#A1A1A1] text-[12px] font-normal leading-normal tracking-[-0.24px]">
              Weight Loss
            </p>
          </div>
        </div>

        {/* 👇 Scrollable Clients List */}
        <div 
        className="max-h-[500px] overflow-y-auto custom-scrollbar"
         onScroll={(e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (
      scrollTop + clientHeight >= scrollHeight - 20 &&
      !loading &&
      hasMore
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadClients(nextPage);
    }
  }}
        >
          {clientsData?.clients?.map((client, index) => (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className="flex flex-col gap-2.5 pl-5 py-[15px] pr-[15px] border-b border-[#E1E6ED] cursor-pointer"
              style={{
                backgroundColor:
                  activeIndex === index ? "#F0F6FD" : "#FFFFFF",
              }}
            >
              <div className="flex gap-1.5 items-center">
                <div>
                  <Image
                    src={client.p_image || "/icons/Ellipse 668.svg"}
                    width={40}
                    height={40}
                    alt="Ellipse 668.svg"
                    className="w-10 h-10 rounded-full"
                  />
                </div>

                <div>
                  <p className="text-[#252525] text-[15px] font-semibold leading-[126%] tracking-[-0.3px]">
                    {client.client_name}
                  </p>

                  <div className="flex items-center">
                    <p className="text-[#535359] text-[12px] font-semibold">
                     {client.metabolism_score ? `${Math.round(client.metabolism_score)}%` : "--"}
                    </p>

                    <div className="mx-2.5 border-r-2 border-[#D9D9D9]"></div>

                    <p className="text-[#3FAF58] text-[12px] font-semibold">
                     Optimal hardcoded
                    </p>

                    <div className="mx-1.5">
                      <Image
                        src="/icons/Ellipse 765.svg"
                        width={3}
                        height={3}
                        alt="Ellipse 765.svg"
                      />
                    </div>

                    <p className="text-[#535359] text-[10px] whitespace-nowrap">
                        {client.last_logged || "No test yet"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div
                  className="px-2.5 py-2 rounded-[5px]"
                  style={{ backgroundColor: client.goalBg }}
                >
                  <p
                    className="text-[10px] font-semibold"
                    style={{ color: client.goalText }}
                  >
                   Weight Loss hardcoded
                  </p>
                </div>

                <p className="text-[#535359] text-[10px]">
               32 tests taken hardcoded
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}