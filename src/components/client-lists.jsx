"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { UserProfile } from "./user-profile";
import { fetchClientsDashboard } from "../services/authService";
import { cookieManager } from "../lib/cookies";

export default function ClientLists() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileIdFromUrl = searchParams.get("profile_id");

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [clientsData, setClientsData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isSearching = search.trim().length >= 3;

  const displayedClients = useMemo(() => {
    if (isSearching) {
      return searchResults || [];
    }
    return clientsData?.clients || [];
  }, [isSearching, searchResults, clientsData]);

  const displayCount = useMemo(() => {
    if (isSearching) {
      return searchResults?.length || 0;
    }
    return clientsData?.summary?.all_total || 0;
  }, [isSearching, searchResults, clientsData]);

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
            return res;
          }

          return {
            ...res,
            clients: [...(prev.clients || []), ...(res.clients || [])],
          };
        });

        if (pageNumber >= res?.pagination?.total_pages) {
          setHasMore(false);
        } else {
          setHasMore(true);
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

  useEffect(() => {
    const sourceList = displayedClients;

    if (sourceList?.length && profileIdFromUrl) {
      const index = sourceList.findIndex(
        (client) => client.profile_id === profileIdFromUrl
      );

      if (index !== -1) {
        setActiveIndex(index);
      } else if (activeIndex === null && sourceList.length > 0) {
        setActiveIndex(0);
      }
    } else if (sourceList?.length && activeIndex === null) {
      setActiveIndex(0);
    } else if (!sourceList?.length) {
      setActiveIndex(null);
    }
  }, [displayedClients, profileIdFromUrl]);

  useEffect(() => {
    setActiveIndex(null);
  }, [search]);

  const handleClientClick = (index, profileId) => {
    setActiveIndex(index);
    router.push(`/partners/clients-profile?profile_id=${profileId}`);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const getZoneColor = (zone) => {
    if (zone === "Optimal") return "#3FAF58";
    if (zone === "Moderate") return "#FFBF2D";
    if (zone === "Focus") return "#E48326";
    return "#535359";
  };

  const formatLastLoggedDate = (lastLoggedDate) => {
    if (!lastLoggedDate) return "No test yet";

    const parsedDate = new Date(lastLoggedDate.replace(" ", "T"));

    if (isNaN(parsedDate.getTime())) return "No test yet";

    const now = new Date();
    const diffMs = now - parsedDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMs < 24 * 60 * 60 * 1000) {
      if (diffMinutes < 1) {
        return "Last tested just now";
      }

      if (diffMinutes < 60) {
        return `Last tested ${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
      }

      return `Last tested ${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
    }

    return parsedDate.toLocaleDateString("en-GB");
  };

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
               onClick={() => router.push('/dashboard')}
            />
            <p className="text-[#252525] text-[12px] font-semibold leading-[126%] tracking-[-0.24px]">
              Go to Dashboard
            </p>
          </div>

          <p className="pl-5 text-[#252525] text-[25px] font-semibold leading-normal tracking-[-1px]">
            Clients ({displayCount})
          </p>
        </div>

        <UserProfile
          showOnlySearch={true}
          searchQuery={search}
          onSearchChange={setSearch}
          onSearchResults={handleSearchResults}
        />

        <div className="flex gap-2.5 ml-[15px] my-[15px]">
          <div className="bg-[#252525] rounded-[20px] py-[11px] px-[30px] cursor-pointer">
            <p className="text-[#FFFFFF] text-[12px] font-normal leading-normal tracking-[-0.24px] whitespace-nowrap">
              All ({displayCount})
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E1E6ED] rounded-[20px] py-[11px] px-[30px] cursor-pointer">
            <p className="text-[#A1A1A1] text-[12px] font-normal leading-normal tracking-[-0.24px]">
              L1
            </p>
          </div>

            <div className="bg-[#FFFFFF] border border-[#E1E6ED] rounded-[20px] py-[11px] px-[30px] cursor-pointer">
            <p className="text-[#A1A1A1] text-[12px] font-normal leading-normal tracking-[-0.24px]">
              L2
            </p>
          </div>

            <div className="bg-[#FFFFFF] border border-[#E1E6ED] rounded-[20px] py-[11px] px-[30px] cursor-pointer">
            <p className="text-[#A1A1A1] text-[12px] font-normal leading-normal tracking-[-0.24px]">
              L3
            </p>
          </div>
        </div>

        <div
          className="max-h-[500px] overflow-y-auto custom-scrollbar"
          onScroll={(e) => {
            if (isSearching) return;

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
          {displayedClients?.length > 0 ? (
            displayedClients.map((client, index) => (
              <div
                key={client.profile_id}
                onClick={() => handleClientClick(index, client.profile_id)}
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
                        {client.metabolism_score
                          ? `${Math.round(client.metabolism_score)}%`
                          : "--"}
                      </p>

                      <div className="mx-2.5 border-r-2 border-[#D9D9D9]"></div>

                      <p
                        className="text-[12px] font-semibold"
                        style={{ color: getZoneColor(client.zone) }}
                      >
                        {client.zone || "--"}
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
                        {formatLastLoggedDate(client.last_logged_date)}
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
                      {client.fitness_goal_display || "--"}
                    </p>
                  </div>

                  <p className="text-[#535359] text-[10px]">
                    {client.test_taken_count ?? 0} tests taken
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-[#535359] text-[14px] font-medium">
              {isSearching ? "No clients found" : "No clients available"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}