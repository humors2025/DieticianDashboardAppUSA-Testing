



// "use client";

// import { useState, useMemo } from "react";
// import ClientTable from "./clientTable";
// import { useSelector } from "react-redux";
// import { selectClients } from "../store/clientSlice";
// import { useRouter } from "next/navigation";
// import { UserProfile } from "./user-profile";

// export default function ClientsSection() {
//   const clients = useSelector(selectClients);
//   const router = useRouter();

//   // 🔹 Active tab state (default = All)
//   const [activeTab, setActiveTab] = useState("all");

//   // ✅ Search state
//   const [search, setSearch] = useState("");

//   const handleViewAllClients = () => {
//     router.push("/client");
//   };

//   // 🔹 Filter clients based on tab + search
//   const filteredClients = useMemo(() => {
//     if (!clients) return [];

//     let result = [...clients];

//     if (activeTab === "tested") {
//       result = result.filter((client) => client.status === "tested");
//     }

//     if (activeTab === "missed") {
//       result = result.filter((client) => client.status === "missed");
//     }

//     // ✅ Search filter (change `name` key if your api uses different field)
//     if (search.trim()) {
//       const q = search.trim().toLowerCase();
//       result = result.filter((client) =>
//         (client.name || "").toLowerCase().includes(q)
//       );
//     }

//     return result;
//   }, [clients, activeTab, search]);

//   // 🔹 Counts
//   const allCount = clients?.length || 0;
//   const testedCount = clients?.filter((c) => c.status === "tested").length || 0;
//   const missedCount = clients?.filter((c) => c.status === "missed").length || 0;

//   const tabClass = (tabName) =>
//     `px-[30px] py-[11px] rounded-[20px] cursor-pointer transition-all duration-200 ${
//       activeTab === tabName ? "bg-[#252525]" : "border border-[#E1E6ED]"
//     }`;

//   const textClass = (tabName) =>
//     `text-[12px] font-normal leading-normal tracking-[-0.24px] ${
//       activeTab === tabName ? "text-white" : "text-[#A1A1A1]"
//     }`;

//   return (
//     <div className="flex flex-col gap-7">
//       <div className="flex flex-col gap-[15px]  border-[#E1E6ED] rounded-[10px]">

//       {/* 🔹 Tabs + Search */}
//  <div className="flex items-center justify-between w-full">


//   <div className="flex gap-2.5">
//     <div className={tabClass("all")} onClick={() => setActiveTab("all")}>
//       <p className={textClass("all")}>All ({allCount})</p>
//     </div>

//     <div
//       className={tabClass("tested")}
//       onClick={() => setActiveTab("tested")}
//     >
//       <p className={textClass("tested")}>Tested ({testedCount})</p>
//     </div>

//     <div
//       className={tabClass("missed")}
//       onClick={() => setActiveTab("missed")}
//     >
//       <p className={textClass("missed")}>Missed ({missedCount})</p>
//     </div>
//   </div>


//   <div className="w-[300px]">
//     <UserProfile
//       showOnlySearch={true}
//       searchQuery={search}
//       onSearchChange={setSearch}
//     />
//   </div>

// </div> 

//         {/* 🔹 Table */}
//         <ClientTable
//           showUserProfile={false}
//           showDailyStatusHeader={false}
//           clients={filteredClients}
//           activeTab={activeTab}
//         />
//       </div>
//     </div>
//   );
// }







"use client";

import { useState, useEffect } from "react";
import ClientTable from "./clientTable";
import { UserProfile } from "./user-profile";
import { fetchClientsDashboard } from "../services/authService";
import { cookieManager } from "../lib/cookies";
import { useSelector, useDispatch  } from "react-redux";
import { setSummary } from "../store/clientsDashboardSlice";

export default function ClientsSection() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [clients, setClients] = useState([]);
  // const [summary, setSummary] = useState({
  //   all_total: 0,
  //   tested_total: 0,
  //   missed_total: 0,
  // });

  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);

  // cache storage
  const [cache, setCache] = useState({});

  // const selectedDate = new Date().toISOString().split("T")[0];
  // console.log("selectedDate153:-", selectedDate);

    const summary = useSelector((state) => state.clients.summary);

  const selectedDate = useSelector((state) => state.date.selectedDate);
    const dispatch = useDispatch();

  const formattedDate = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;



  useEffect(() => {
    loadClients();
  }, [activeTab, page, formattedDate]);

  const loadClients = async () => {
    const cacheKey = `${activeTab}-${page}-${formattedDate}`;

    try {
      // ✅ CHECK CACHE FIRST
      if (cache[cacheKey]) {
       
        setClients(cache[cacheKey]);
        return;
      }

      // ✅ only show loader if not cached
      setLoading(true);

      const dietician = cookieManager.getJSON("dietician");
      const dieticianId = dietician?.dietician_id;

      if (!dieticianId) {
        console.error("Dietician ID not found");
        return;
      }

      const res = await fetchClientsDashboard(
        dieticianId,
        activeTab,
        page,
        formattedDate
      );

      const fetchedClients = res.clients || [];
   

      setClients(fetchedClients);
      // setSummary(res.summary || {});
       dispatch(setSummary(res.summary || {}));

      // ✅ STORE IN CACHE
      setCache((prev) => ({
        ...prev,
        [cacheKey]: fetchedClients,
      }));
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (tabName) =>
    `px-[30px] py-[11px] rounded-[20px] cursor-pointer transition-all duration-200 whitespace-nowrap ${activeTab === tabName ? "bg-[#252525]" : "border border-[#E1E6ED]"
    }`;

  const textClass = (tabName) =>
    `text-[12px] font-normal tracking-[-0.24px] whitespace-nowrap ${activeTab === tabName ? "text-white" : "text-[#A1A1A1]"
    }`;

  const changeTab = (tab) => {
    setActiveTab(tab);
    setPage(1);

    // ✅ clear cache when tab changes
    setCache({});
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-[15px] border-[#E1E6ED] rounded-[10px]">

        {/* Tabs + Search */}
        <div className="flex items-center justify-between w-full">

          <div className="flex gap-2.5">

            <div
              className={tabClass("all")}
              onClick={() => changeTab("all")}
            >
              <p className={textClass("all")}>
                All ({summary.all_total})
              </p>
            </div>

            <div
              className={tabClass("tested")}
              onClick={() => changeTab("tested")}
            >
              <p className={textClass("tested")}>
                Tested ({summary.tested_total})
              </p>
            </div>

            <div
              className={tabClass("missed")}
              onClick={() => changeTab("missed")}
            >
              <p className={textClass("missed")}>
                Missed ({summary.missed_total})
              </p>
            </div>

          </div>

          <div className="">
            <UserProfile
              showOnlySearch={true}
              searchQuery={search}
              onSearchChange={setSearch}
            />
          </div>

        </div>

        {/* ✅ TABLE WITH OVERLAY LOADER (NO BLINK) */}
        <div className="relative min-h-[200px]">

          <ClientTable
            clients={clients}
            search={search}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          )}

        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 py-5 flex-wrap">

          {/* Previous */}
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`px-3 py-1 border rounded ${page === 1
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer"
              }`}
          >
            Prev
          </button>

          {/* Page Numbers */}
          {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-3 py-1 text-[14px] border rounded ${page === num
                  ? "bg-[#252525] text-white cursor-pointer"
                  : "text-[#535359] cursor-pointer"
                }`}
            >
              {num}
            </button>
          ))}

          {/* Next */}
          <button
            disabled={clients.length < 10}
            onClick={() => setPage((p) => p + 1)}
            className={`px-3 py-1 border rounded ${clients.length < 10
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer"
              }`}
          >
            Next
          </button>

        </div>

      </div>
    </div>
  );
}