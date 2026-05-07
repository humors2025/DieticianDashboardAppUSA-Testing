"use client";

// Local persistence for demo-mode admin actions — suspensions and audit log
// entries. Stored in localStorage so they survive page navigations (the
// synthetic data in demo-data.js is a frozen module and can't be mutated cleanly).
//
// When backend ships, replace these helpers with real API calls. The shape of
// each entry mirrors the eventual DB rows (see migrations/ for the schemas).

const SUSPENSIONS_KEY = "respyr_demo_suspensions";
const AUDIT_KEY = "respyr_demo_audit_log";

const isClient = () => typeof window !== "undefined";

function readJSON(key, fallback) {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (!isClient()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Suspensions ----------

export function getSuspensions() {
  return readJSON(SUSPENSIONS_KEY, {});
}

export function isSuspended(userId) {
  return Boolean(getSuspensions()[userId]);
}

export function getSuspension(userId) {
  return getSuspensions()[userId] || null;
}

export function suspendUser({ userId, actorUserId, actorName, reason, targetName }) {
  const suspensions = getSuspensions();
  suspensions[userId] = {
    suspended_at: new Date().toISOString(),
    suspended_by: actorUserId,
    reason,
  };
  writeJSON(SUSPENSIONS_KEY, suspensions);
  appendAuditLog({
    actor_user_id: actorUserId,
    actor_name: actorName,
    action: "user.suspended",
    target_user_id: userId,
    target_name: targetName,
    reason,
  });
}

export function reinstateUser({ userId, actorUserId, actorName, reason, targetName }) {
  const suspensions = getSuspensions();
  delete suspensions[userId];
  writeJSON(SUSPENSIONS_KEY, suspensions);
  appendAuditLog({
    actor_user_id: actorUserId,
    actor_name: actorName,
    action: "user.reinstated",
    target_user_id: userId,
    target_name: targetName,
    reason,
  });
}

// ---------- Audit log ----------

export function getAuditLog() {
  return readJSON(AUDIT_KEY, []);
}

export function appendAuditLog(entry) {
  const log = getAuditLog();
  log.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  });
  writeJSON(AUDIT_KEY, log);
}

export function clearDemoState() {
  if (!isClient()) return;
  localStorage.removeItem(SUSPENSIONS_KEY);
  localStorage.removeItem(AUDIT_KEY);
}
