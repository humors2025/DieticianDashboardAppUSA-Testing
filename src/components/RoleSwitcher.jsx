"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cookieManager } from "@/lib/cookies";
import { getCurrentUser, ROLES } from "@/lib/user";
import { fetchTrainerAdminListService } from "@/services/authService";

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.TRAINER_ADMIN]: "Trainer Admin",
  [ROLES.TRAINER]: "Trainer",
};

const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: "#252525",
  [ROLES.TRAINER_ADMIN]: "#308BF9",
  [ROLES.TRAINER]: "#2EAF6A",
};

const ROLE_HOME = {
  [ROLES.SUPER_ADMIN]: "/super-admin/overview",
  [ROLES.TRAINER_ADMIN]: "/trainer-admin/overview",
  [ROLES.TRAINER]: "/trainer/dashboard",
};

function getOriginalUser() {
  return cookieManager.getJSON("original_user");
}

function saveOriginalUser(user) {
  cookieManager.set("original_user", JSON.stringify(user));
}

function clearOriginalUser() {
  cookieManager.remove("original_user");
}

export function isSwitchedView() {
  return !!getOriginalUser();
}

export function getOriginalRole() {
  return getOriginalUser()?.role || null;
}

export default function RoleSwitcher({ currentRole }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [downstreamUsers, setDownstreamUsers] = useState([]);
  const [hasClients, setHasClients] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  const originalUser = getOriginalUser();
  const isSwitched = !!originalUser;
  const currentUser = getCurrentUser();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDownstream = async () => {
    if (downstreamUsers.length > 0 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetchTrainerAdminListService();
      const users = [];

      if (currentRole === ROLES.SUPER_ADMIN) {
        const trainerAdmins = res?.existing || [];
        for (const ta of trainerAdmins) {
          users.push({
            id: ta.user_id || ta.email,
            role: ROLES.TRAINER_ADMIN,
            name: ta.name || `${ta.first_name || ""} ${ta.last_name || ""}`.trim(),
            email: ta.email,
            partner_code: ta.partner_code,
            section: "Trainer Admins",
          });
        }
      }

      setDownstreamUsers(users);

      const partnerCode = currentUser?.partner_code;
      if (partnerCode) {
        try {
          const clientRes = await fetch("/api/admin/trainer-clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dietician_id: partnerCode, page: 1 }),
          });
          const clientData = await clientRes.json();
          setHasClients((clientData?.clients || []).length > 0);
        } catch {
          setHasClients(false);
        }
      }
    } catch (err) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening && !isSwitched) {
      fetchDownstream();
    }
  };

  const switchToUser = (target) => {
    if (!isSwitched) {
      saveOriginalUser(currentUser);
    }

    const switchedUser = {
      user_id: target.id,
      role: target.role,
      first_name: (target.name || "").split(" ")[0] || "",
      last_name: (target.name || "").split(" ").slice(1).join(" ") || "",
      email: target.email,
      partner_code: target.partner_code,
      parent_user_id: currentUser?.user_id || null,
      is_reset_password: 1,
    };

    cookieManager.set("user", JSON.stringify(switchedUser));
    cookieManager.set(
      "dietician",
      JSON.stringify({
        dietician_id: target.partner_code || target.id,
        name: target.name,
        email: target.email,
        role: target.role,
        is_reset_password: 1,
      })
    );

    setIsOpen(false);
    router.push(ROLE_HOME[target.role] || "/trainer/dashboard");
    setTimeout(() => router.refresh(), 50);
  };

  const switchToMyView = (targetRole) => {
    if (!isSwitched) {
      saveOriginalUser(currentUser);
    }

    const viewUser = {
      ...currentUser,
      role: targetRole,
    };

    cookieManager.set("user", JSON.stringify(viewUser));
    cookieManager.set(
      "dietician",
      JSON.stringify({
        dietician_id: currentUser.partner_code || currentUser.user_id,
        name: `${currentUser.first_name} ${currentUser.last_name}`.trim(),
        email: currentUser.email,
        role: targetRole,
        is_reset_password: currentUser.is_reset_password,
      })
    );

    setIsOpen(false);
    router.push(ROLE_HOME[targetRole] || "/trainer/dashboard");
    setTimeout(() => router.refresh(), 50);
  };

  const switchBack = () => {
    cookieManager.set("user", JSON.stringify(originalUser));
    cookieManager.set(
      "dietician",
      JSON.stringify({
        dietician_id: originalUser.partner_code || originalUser.user_id,
        name: `${originalUser.first_name} ${originalUser.last_name}`.trim(),
        email: originalUser.email,
        role: originalUser.role,
        is_reset_password: originalUser.is_reset_password,
      })
    );
    clearOriginalUser();

    setIsOpen(false);
    setDownstreamUsers([]);
    router.push(ROLE_HOME[originalUser.role] || "/");
    setTimeout(() => router.refresh(), 50);
  };

  const sections = downstreamUsers.reduce((acc, u) => {
    (acc[u.section] ||= []).push(u);
    return acc;
  }, {});

  const switchLabel = isSwitched
    ? `Viewing as ${currentUser?.first_name || "User"}`
    : "Switch view";

  const badgeColor = isSwitched ? "#E97F0F" : "#A1A1A1";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`flex items-center gap-1.5 cursor-pointer rounded-[15px] px-[16px] py-[12px] bg-white ${
          isSwitched ? "border border-[#E97F0F]/30" : ""
        }`}
        title={switchLabel}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isSwitched ? "#E97F0F" : "#A1A1A1"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 3h5v5" />
          <path d="M8 21H3v-5" />
          <path d="M21 3l-9 9" />
          <path d="M3 21l9-9" />
        </svg>
        <span
          className="font-semibold text-[12px]"
          style={{ color: isSwitched ? "#E97F0F" : "#A1A1A1" }}
        >
          {isSwitched ? `Viewing as ${currentUser?.first_name || "User"}` : "Switch"}
        </span>
        {isSwitched && (
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: "#E97F0F" }}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-[280px] bg-white rounded-[12px] shadow-2xl border border-[#E1E6ED] p-2 z-50 max-h-[400px] overflow-y-auto">
          <div className="text-[#A1A1A1] text-[10px] uppercase tracking-wide font-semibold px-2 pt-1 pb-2">
            Switch view
          </div>

          {isSwitched && (
            <button
              onClick={switchBack}
              className="w-full flex items-center gap-2 px-2 py-2.5 rounded-[8px] hover:bg-[#FFF4E0] text-left mb-1 border border-[#E97F0F]/20 bg-[#FFF9F0]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E97F0F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              <span className="text-[#E97F0F] text-[12px] font-semibold flex-1">
                Back to {ROLE_LABELS[originalUser.role] || "Admin"}
              </span>
            </button>
          )}

          {!isSwitched && (
            <>
              {(currentRole === ROLES.SUPER_ADMIN || (currentRole === ROLES.TRAINER_ADMIN && hasClients)) && (
                <div className="mb-2">
                  <div className="text-[#252525] text-[10px] font-bold uppercase tracking-wide px-2 py-1">
                    My Views
                  </div>
                  {currentRole === ROLES.SUPER_ADMIN && (
                    <button
                      onClick={() => switchToMyView(ROLES.TRAINER_ADMIN)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-[8px] hover:bg-[#F5F7FA] text-left"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ROLE_COLORS[ROLES.TRAINER_ADMIN] }}
                      />
                      <span className="text-[#252525] text-[12px] font-semibold flex-1">
                        My Trainer Admin View
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => switchToMyView(ROLES.TRAINER)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-[8px] hover:bg-[#F5F7FA] text-left"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ROLE_COLORS[ROLES.TRAINER] }}
                    />
                    <span className="text-[#252525] text-[12px] font-semibold flex-1">
                      My Trainer View
                    </span>
                  </button>
                </div>
              )}

              {loading && (
                <div className="px-2 py-3 text-[#A1A1A1] text-[11px]">
                  Loading downstream users...
                </div>
              )}

              {error && (
                <div className="px-2 py-2 text-[#B5363A] text-[11px]">
                  {error}
                </div>
              )}

              {Object.entries(sections).map(([section, users]) => (
                <div key={section} className="mb-2 last:mb-0">
                  <div className="text-[#252525] text-[10px] font-bold uppercase tracking-wide px-2 py-1">
                    {section}
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => switchToUser(u)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-[8px] hover:bg-[#F5F7FA] text-left"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ROLE_COLORS[u.role] || "#A1A1A1" }}
                      />
                      <span className="text-[#252525] text-[12px] font-semibold flex-1">
                        {u.name || u.email}
                      </span>
                      {u.partner_code && (
                        <span className="text-[#A1A1A1] text-[10px] font-mono">
                          {u.partner_code}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}

            </>
          )}
        </div>
      )}
    </div>
  );
}
