"use client";

// Dev-only floating role switcher. Visible only when NODE_ENV=development.
// Sets a synthetic `user` cookie + `access_token` and navigates to the role's
// home, so you can preview /super-admin, /trainer-admin, /trainer without
// needing the backend to ship role-aware login.
//
// Multiple identities per role let you test cross-cutting data visibility
// (e.g., Evan should NOT see Derek's trainers).
//
// Removed automatically in production builds (NODE_ENV check).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cookieManager } from "@/lib/cookies";

const IDENTITIES = [
  {
    id: "demo-super",
    role: "super_admin",
    label: "Super Admin",
    section: "Super Admin",
    home: "/super-admin/overview",
    firstName: "Demo",
    lastName: "SuperAdmin",
    partnerCode: null,
    parentUserId: null,
    color: "#252525",
  },
  {
    id: "ta-evan",
    role: "trainer_admin",
    label: "Evan Gaudet",
    section: "Trainer Admin",
    home: "/trainer-admin/overview",
    firstName: "Evan",
    lastName: "Gaudet",
    partnerCode: "EVAN2026",
    parentUserId: "demo-super",
    color: "#308BF9",
  },
  {
    id: "ta-derek",
    role: "trainer_admin",
    label: "Derek Lopez",
    section: "Trainer Admin",
    home: "/trainer-admin/overview",
    firstName: "Derek",
    lastName: "Lopez",
    partnerCode: "DEREK2026",
    parentUserId: "demo-super",
    color: "#308BF9",
  },
   {
    id: "ta-sagar",
    role: "trainer_admin",
    label: "Sagar Hosur",
    section: "Trainer Admin",
    home: "/trainer-admin/overview",
    firstName: "Sagar",
    lastName: "Hosur",
    partnerCode: "SAGAR2026",
    parentUserId: "demo-super",
    color: "#308BF9",
  },
  {
    id: "t-001",
    role: "trainer",
    label: "Marcus Hill (Evan's)",
    section: "Trainer",
    home: "/trainer/dashboard",
    firstName: "Marcus",
    lastName: "Hill",
    partnerCode: "MARCUS01",
    parentUserId: "ta-evan",
    color: "#2EAF6A",
  },
  {
    id: "t-005",
    role: "trainer",
    label: "Kai Nakamura (Derek's)",
    section: "Trainer",
    home: "/trainer/dashboard",
    firstName: "Kai",
    lastName: "Nakamura",
    partnerCode: "KAI01",
    parentUserId: "ta-derek",
    color: "#2EAF6A",
  },
];

export default function DevRoleSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  const switchTo = (identity) => {
    const user = {
      user_id: identity.id,
      role: identity.role,
      first_name: identity.firstName,
      last_name: identity.lastName,
      email: `${identity.firstName.toLowerCase()}@demo.respyr.ai`,
      partner_code: identity.partnerCode,
      parent_user_id: identity.parentUserId,
      is_reset_password: 1,
    };
    cookieManager.set("access_token", "demo-token");
    cookieManager.set("user", JSON.stringify(user));
    cookieManager.set(
      "dietician",
      JSON.stringify({
        dietician_id: identity.partnerCode || identity.id,
        name: `${identity.firstName} ${identity.lastName}`,
        email: user.email,
        is_reset_password: 1,
      })
    );
    setIsOpen(false);
    router.push(identity.home);
    setTimeout(() => router.refresh(), 50);
  };

  // Group identities by section for the dropdown.
  const sections = IDENTITIES.reduce((acc, ident) => {
    (acc[ident.section] ||= []).push(ident);
    return acc;
  }, {});

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999]"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {isOpen && (
        <div className="mb-2 bg-white rounded-[12px] shadow-2xl border border-[#E1E6ED] p-2 w-[260px] max-h-[400px] overflow-y-auto">
          <div className="text-[#A1A1A1] text-[10px] uppercase tracking-wide font-semibold px-2 pt-1 pb-2">
            Switch identity (dev only)
          </div>
          {Object.entries(sections).map(([section, idents]) => (
            <div key={section} className="mb-2 last:mb-0">
              <div className="text-[#252525] text-[10px] font-bold uppercase tracking-wide px-2 py-1">
                {section}
              </div>
              {idents.map((r) => (
                <button
                  key={r.id}
                  onClick={() => switchTo(r)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-[8px] hover:bg-[#F5F7FA] text-left"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: r.color }}
                    aria-hidden
                  />
                  <span className="text-[#252525] text-[12px] font-semibold flex-1">
                    {r.label}
                  </span>
                  {r.partnerCode && (
                    <span className="text-[#A1A1A1] text-[10px] font-mono">
                      {r.partnerCode}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="bg-[#252525] text-white text-[11px] font-semibold rounded-full px-4 py-2 shadow-lg hover:bg-[#404040]"
      >
        {isOpen ? "Close" : "Switch role"}
      </button>
    </div>
  );
}
