// "use client";
// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { cookieManager } from '../lib/cookies';
// import { toast } from 'sonner';
// import NotificationModal from './modal/notification-modal';

// const MonoIcon = ({ src, size = 20, color = "#A1A1A1", alt = "" }) => (
//   <span
//     role="img"
//     aria-label={alt}
//     style={{
//       width: size,
//       height: size,
//       display: "inline-block",
//       backgroundColor: color,
//       WebkitMaskImage: `url(${src})`,
//       maskImage: `url(${src})`,
//       WebkitMaskRepeat: "no-repeat",
//       maskRepeat: "no-repeat",
//       WebkitMaskSize: "contain",
//       maskSize: "contain",
//       WebkitMaskPosition: "center",
//       maskPosition: "center",
//     }}
//   />
// );

// export default function Header() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [active, setActive] = useState(pathname);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Update active state when route changes
//   useEffect(() => {
//     setActive(pathname);
//   }, [pathname]);

//   const menu = [
//     { name: "Dashboard", icon: "/icons/hugeicons_home-05.svg", path: "/dashboard" },
//     { name: "Client", icon: "/icons/hugeicons_user-group.png", path: "/client" },
//     { name: "Messages", icon: "/icons/hugeicons_message-02.svg", path: "/messages" },
//     { name: "Settings", icon: "/icons/hugeicons_settings-03.svg", path: "/settings" },
//   ];

//   const clientRelatedPaths = ["/client", "/planhistory", "/profile"];


//   const handleLogout = () => {
//     try {
//       cookieManager.clearAuth();
//       localStorage.clear()
//       setIsDropdownOpen(false);

//       // Redirect to login page
//       router.push('/');

//     } catch (error) {
//       console.error("Error during logout:", error);
//     }
//   };


//   const handleMenuClick = (menuItem, e) => {
//     if (menuItem.name === "Messages" 
//       // || menuItem.name === "Settings"
//     ) {
//       e.preventDefault();
//       toast.info("Coming Soon");
//       return false;
//     }

//     setActive(menuItem.path);
//     return true;
//   };


//   const handleNotificationClick = () => {
//     toast.info("Coming Soon");
//   };

//   // const openModal = () => setIsModalOpen(true);
//   // const closeModal = () => setIsModalOpen(false);


//   return (
//     <>
//       <div className="flex justify-between bg-[#F5F7FA] p-4">
//         <div className="flex">
//           <Link href="/dashboard">
//             <div className="flex flex-col items-center">
//               <img src="/icons/logorespyr.png" alt="logo" width={50} height={50} />
//               <p className="text-[#252525] text-[12px] font-normal">Beta 1.0</p>
//             </div>
//           </Link>

//         </div>

//         <div className="flex gap-[15px]">
//           {menu.map((m) => {
//             const isActive =
//               m.name === "Client"
//                 ? clientRelatedPaths.includes(pathname)
//                 : active === m.path;

//             const color = isActive ? "#308BF9" : "#A1A1A1";
//             return (
//               <Link href={m.path} key={m.name} onClick={() => setActive(m.path)}>
//                 <button
//                   className="flex items-center gap-1.5 cursor-pointer rounded-[15px] px-[20px] py-[15px] bg-white"
//                   onClick={(e) => handleMenuClick(m, e)}
//                 >
//                   <MonoIcon src={m.icon} color={color} alt={m.name} />
//                   <span
//                     className={`font-semibold text-[12px]`}
//                     style={{ color }}
//                   >
//                     {m.name}
//                   </span>
//                 </button>
//               </Link>
//             );
//           })}
//         </div>

//         <div className="flex items-center gap-5">
//           <div
//             className="flex items-center cursor-pointer rounded-[15px] p-[13px] bg-white"
//             onClick={handleNotificationClick}
//           //onClick={openModal}
//           >
//             <MonoIcon src="/icons/hugeicons_notification-01.svg" color="#A1A1A1" alt="notification" />
//           </div>

//           {/* <Link
//           href="/loginuser"
//           className="flex items-center cursor-pointer rounded-[15px] p-[13px] bg-white"
//           aria-label="User"
//         >
//           <MonoIcon src="/icons/hugeicons_user.svg" color="#A1A1A1" size={20} alt="user" />
//         </Link> */}

//           <div className="flex items-center gap-5">


//             {/* User Dropdown */}
//             <div
//               className="relative"
//               onMouseEnter={() => setIsDropdownOpen(true)}
//               onMouseLeave={() => setIsDropdownOpen(false)}
//             >
//               <div className="flex items-center cursor-pointer rounded-[15px] p-[13px] bg-white">
//                 <MonoIcon src="/icons/hugeicons_user.svg" color="#A1A1A1" size={20} alt="user" />
//               </div>

//               {/* Dropdown Menu */}
//               {isDropdownOpen && (
//                 <div className="absolute right-0 top-full  w-48 bg-white rounded-[15px] shadow-lg p-1.5 z-50">
//                   {/* <Link 
//                 href="/profile" 
//                 className="flex items-center px-4 py-3 text-sm text-[#A1A1A1] hover:bg-gray-100 transition-colors"
//                 onClick={() => setIsDropdownOpen(false)}
//               >
                
//                 <span className="ml-3 cursor-pointer">Profile</span>
//               </Link> */}

//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center cursor-pointer w-full px-4  py-3 text-sm text-[#A1A1A1] hover:bg-gray-100 transition-colors"
//                   >

//                     <span className="ml-3 cursor-pointer">Logout</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//      {/* <NotificationModal
//     open={isModalOpen}
//     onClose={closeModal}
//           />   */}
//     </>
//   );
// }




















"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cookieManager } from "../lib/cookies";
import { toast } from "sonner";
import NotificationModal from "./modal/notification-modal";

const MonoIcon = ({ src, size = 20, color = "#A1A1A1", alt = "" }) => (
  <span
    role="img"
    aria-label={alt}
    style={{
      width: size,
      height: size,
      display: "inline-block",
      backgroundColor: color,
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskSize: "contain",
      maskSize: "contain",
      WebkitMaskPosition: "center",
      maskPosition: "center",
    }}
  />
);

// ✅ SAFE cookie reader
function getCookieValue(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return match.split(`${name}=`)[1] ?? null;
}

// ✅ Safe dietician cookie parser
function readDieticianFromCookie() {
  try {
    const raw = getCookieValue("dietician");
    if (!raw) return null;

    const decoded = decodeURIComponent(raw);

    // avoid crash if truncated / invalid JSON
    if (!decoded.startsWith("{") || !decoded.endsWith("}")) {
      console.error("Invalid dietician cookie (not full JSON):", decoded);
      return null;
    }

    return JSON.parse(decoded);
  } catch (e) {
    console.error("Failed to parse dietician cookie:", e);
    return null;
  }
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

const hideHeaderPaths = [
    "/updatepassword",
    "/partners/updatepassword",
  ];

  if (hideHeaderPaths.includes(pathname)) {
    return null;
  }


  const [active, setActive] = useState(pathname);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dietician, setDietician] = useState(null);

  useEffect(() => {
    setActive(pathname);
  }, [pathname]);

  useEffect(() => {
    const d = readDieticianFromCookie();
    setDietician(d);
  }, []);

  const menu = [
    { name: "Dashboard", icon: "/icons/hugeicons_home-05.svg", path: "/dashboard" },
    // { name: "Client", icon: "/icons/hugeicons_user-group.png", path: "/client" },
    // { name: "Messages", icon: "/icons/hugeicons_message-02.svg", path: "/messages" },
    { name: "Settings", icon: "/icons/hugeicons_settings-03.svg", path: "/settings" },
  ];

  const clientRelatedPaths = ["/client", "/planhistory", "/profile"];
  const partnerClientRelatedPaths = ["/partners/client", "/partners/planhistory", "/partners/profile"];

  // const isPartnerUser = dietician?.dietician_id === "RespyrD01";
  const dieticianId = dietician?.dietician_id || "";
const isPartnerUser = dieticianId !== "" && dieticianId !== "Qua";

  // ✅ central mapping for partner routes
  const partnerRouteMap = {
    Dashboard: "/partners/dashboard",
    // Client: "/partners/client",
    // Messages: "/partners/messages",
    Settings: "/partners/settings",
  };

  // ✅ decide final path for any menu item
  const getFinalPath = (menuItem) => {
    if (!isPartnerUser) return menuItem.path;
    return partnerRouteMap[menuItem.name] || menuItem.path;
  };

  const handleLogout = () => {
    try {
      cookieManager.clearAuth();
      localStorage.clear();
      setIsDropdownOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleMenuClick = (menuItem, e) => {
    // ✅ for these 4, we route based on cookie (no "coming soon")
    if (
      menuItem.name === "Dashboard" ||
      menuItem.name === "Client" ||
      // menuItem.name === "Messages" ||
      menuItem.name === "Settings"
    ) {
      e.preventDefault();
      const target = getFinalPath(menuItem);
      setActive(target);
      router.push(target);
      return false;
    }

    setActive(menuItem.path);
    return true;
  };

  const handleNotificationClick = () => {
    toast.info("Coming Soon");
  };



  return (
    <>
      <div className="flex justify-between bg-[#F5F7FA] p-4">
      <div className="flex">
  <Link href={isPartnerUser ? partnerRouteMap.Dashboard : "/dashboard"}>
    <div className="flex flex-col items-center">
      <img src="/icons/logorespyr.png" alt="logo" width={50} height={50} />
      <p className="text-[#252525] text-[12px] font-normal">Beta 1.0</p>
    </div>
  </Link>
</div>


        <div className="flex gap-[15px]">
          {menu.map((m) => {
            const href = getFinalPath(m);

            // ✅ active highlight handling for both normal and partners
            const isActive =
              m.name === "Client"
                ? clientRelatedPaths.includes(pathname) || partnerClientRelatedPaths.includes(pathname)
                : pathname === m.path || pathname === partnerRouteMap[m.name] || active === href;

            const color = isActive ? "#308BF9" : "#A1A1A1";

            return (
              <Link href={href} key={m.name}>
                <button
                  className="flex items-center gap-1.5 cursor-pointer rounded-[15px] px-[20px] py-[15px] bg-white"
                  onClick={(e) => handleMenuClick(m, e)}
                >
                  <MonoIcon src={m.icon} color={color} alt={m.name} />
                  <span className="font-semibold text-[12px]" style={{ color }}>
                    {m.name}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-5">
          <div
            className="flex items-center cursor-pointer rounded-[15px] p-[13px] bg-white"
            onClick={handleNotificationClick}
          >
            <MonoIcon src="/icons/hugeicons_notification-01.svg" color="#A1A1A1" alt="notification" />
          </div>

          <div className="flex items-center gap-5">
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="flex items-center cursor-pointer rounded-[15px] p-[13px] bg-white">
                <MonoIcon src="/icons/hugeicons_user.svg" color="#A1A1A1" size={20} alt="user" />
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full w-48 bg-white rounded-[15px] shadow-lg p-1.5 z-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center cursor-pointer w-full px-4 py-3 text-sm text-[#A1A1A1] hover:bg-gray-100 transition-colors"
                  >
                    <span className="ml-3 cursor-pointer">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <NotificationModal open={isModalOpen} onClose={closeModal} /> */}
    </>
  );
}
