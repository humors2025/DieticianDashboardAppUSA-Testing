// User resolution and role helpers.
//
// The auth model is migrating from a single `dietician` cookie to a `user`
// cookie carrying role + hierarchy info (per HIERARCHY_AND_ONBOARDING_SPEC.md
// Phase 0). During the transition this module is the single source of truth
// for "who is the current user" — it reads the new cookie when present and
// falls back to translating the old `dietician` cookie when not.
//
// Existing code (Header, etc.) that reads the `dietician` cookie directly
// keeps working because login response writers always set BOTH cookies until
// the migration is complete.

import { cookieManager } from "@/lib/cookies";

export const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  TRAINER_ADMIN: "trainer_admin",
  TRAINER: "trainer",
  CLIENT: "client",
});

// Resolve the current user from cookies. Returns a normalized shape OR null
// if no auth cookie is set. Prefers the new `user` cookie; falls back to
// translating the legacy `dietician` cookie so this works during migration.
export function getCurrentUser() {
  const fromNew = cookieManager.getJSON("user");
  if (fromNew && typeof fromNew === "object") {
    return normalizeUser(fromNew);
  }

  const legacy = cookieManager.getJSON("dietician");
  if (legacy && typeof legacy === "object") {
    return translateLegacyDietician(legacy);
  }

  return null;
}

export function getCurrentRole() {
  return getCurrentUser()?.role || null;
}

export function hasRole(role) {
  return getCurrentRole() === role;
}

// Persist the login response into cookies. Writes BOTH the new `user` cookie
// and the legacy `dietician` cookie so existing code that reads the legacy
// shape continues working until Phase 1 cleanup. Also sets `access_token`.
export function persistLoginResponse(res) {
  if (!res) return;

  if (res.access_token) {
    cookieManager.set("access_token", res.access_token);
  }

  // New shape — backend has migrated.
  if (res.user && typeof res.user === "object") {
    const user = normalizeUser(res.user);
    cookieManager.set("user", JSON.stringify(user));
    // Mirror to the legacy cookie for backward compatibility with code
    // that still reads `dietician` (Header, etc.). Removed in Phase 1.
    cookieManager.set("dietician", JSON.stringify(legacyShapeFromUser(user)));
    return;
  }

  // Legacy shape — backend hasn't migrated yet.
  if (res.dietician && typeof res.dietician === "object") {
    cookieManager.set("dietician", JSON.stringify(res.dietician));
    // Also write the new shape (translated) so role-aware code can rely on it.
    const translated = translateLegacyDietician(res.dietician);
    cookieManager.set("user", JSON.stringify(translated));
  }
}

// Pick the route a logged-in user should land on based on their role.
// During Phase 0 the trainer-admin and client trees don't exist yet, so
// roles fall back to the existing dashboard (with toast handling on the
// caller side). Phase 1 swaps these for /trainer/overview etc.
export function landingPathForUser(user) {
  if (!user) return "/";

  switch (user.role) {
    case ROLES.SUPER_ADMIN:
      return "/super-admin/overview";
    case ROLES.TRAINER_ADMIN:
      return "/trainer-admin/overview";
    case ROLES.TRAINER:
      return "/trainer/dashboard";
    case ROLES.CLIENT:
      // Clients don't use this dashboard; the mobile app is their surface.
      return "/";
    default:
      // Unknown role — fail safe to login.
      return "/";
  }
}

// ---------- Internal helpers ----------

function normalizeUser(raw) {
  return {
    user_id: raw.user_id ?? raw.id ?? null,
    role: raw.role ?? ROLES.TRAINER,
    first_name: raw.first_name ?? "",
    last_name: raw.last_name ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? null,
    partner_code: raw.partner_code ?? raw.dietician_id ?? null,
    parent_user_id: raw.parent_user_id ?? null,
    is_reset_password: raw.is_reset_password ?? null,
    email_verified_at: raw.email_verified_at ?? null,
  };
}

// Legacy `dietician` cookie → normalized user shape. Defaults role to trainer
// because the legacy backend has no role concept; super admins and trainer
// admins only exist post-migration.
function translateLegacyDietician(d) {
  const fullName = (d.name || "").trim();
  const parts = fullName.split(/\s+/);
  const first_name = parts[0] || "";
  const last_name = parts.slice(1).join(" ") || "";

  return {
    user_id: d.dietician_id ?? null,
    role: ROLES.TRAINER,
    first_name,
    last_name,
    email: d.email ?? "",
    phone: d.phone ?? null,
    partner_code: d.dietician_id ?? null,
    parent_user_id: null,
    is_reset_password: d.is_reset_password ?? null,
    email_verified_at: null,
  };
}

// Normalized user → legacy `dietician` shape. Used to mirror the new cookie
// back to the legacy one for backward compat with Header etc.
function legacyShapeFromUser(user) {
  return {
    dietician_id: user.partner_code ?? user.user_id ?? "",
    name: [user.first_name, user.last_name].filter(Boolean).join(" "),
    email: user.email,
    is_reset_password: user.is_reset_password,
  };
}
