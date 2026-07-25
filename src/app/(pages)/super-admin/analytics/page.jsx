"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  fetchTrainerAdminListService,
  fetchDownstreamUsersService,
  fetchSuperAdminAllClientsOverviewService,
  fetchClientProfileDatesList,
} from "@/services/authService";

const TIMEZONES = { "America/Chicago": "Houston, TX", "Asia/Kolkata": "India (IST)" };
const DEFAULT_TZ = "America/Chicago";
const ACTIVE_THRESHOLD = 60;
const EXECUTIVE_TAS = ["Derek", "Evan"];
const BLUE = "#308BF9";

function tzNow(tz) { return new Date(new Date().toLocaleString("en-US", { timeZone: tz })); }
function fmtDate(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function fmtRange(r) { if (!r) return ""; return `${fmtDate(r.start)} – ${fmtDate(r.end)}`; }
function daysBetween(a, b) {
  const da = new Date(a), db = new Date(b);
  if (isNaN(da) || isNaN(db)) return 0;
  return Math.max(0, Math.round((new Date(da.getFullYear(), da.getMonth(), da.getDate()) - new Date(db.getFullYear(), db.getMonth(), db.getDate())) / -86400000));
}

const COHORTS = [90, 70, 50, 25, 10];
function getCohort(pct) { for (const t of COHORTS) if (pct >= t) return `${t}%+`; return "<10%"; }
function goalColor(g) { if (!g) return "#94A3B8"; const l = g.toLowerCase(); if (l.includes("fat")) return "#F59E0B"; if (l.includes("loss")) return "#EF4444"; if (l.includes("gain") || l.includes("muscle")) return "#10B981"; return BLUE; }
function goalLabel(g) { if (!g) return "—"; const l = g.toLowerCase(); if (l.includes("fat")) return "Fat Loss"; if (l.includes("weight")) return "Weight Loss"; if (l.includes("muscle") || l.includes("gain")) return "Muscle Gain"; return g; }

function isMaskedMatch(m, r) {
  if (!m || !r) return false;
  const mp = m.toLowerCase().split("@"), rp = r.toLowerCase().split("@");
  if (mp.length !== 2 || rp.length !== 2 || mp[1] !== rp[1]) return false;
  if (mp[0].length < 2 || rp[0].length < 2) return false;
  return mp[0][0] === rp[0][0] && mp[0][1] === rp[0][1] && mp[0].slice(-1) === rp[0].slice(-1);
}
function isMaskedNameMatch(m, r) {
  if (!m || !r) return false;
  const mw = m.toLowerCase().trim().split(/\s+/), rw = r.toLowerCase().trim().split(/\s+/);
  if (!mw.length || mw.length !== rw.length) return false;
  return mw.every((w, i) => w.length >= 2 && rw[i].length >= 2 && w[0] === rw[i][0] && w[1] === rw[i][1] && w.slice(-1) === rw[i].slice(-1));
}
function isSelfTest(client, trainers) {
  const ce = (client.email || "").toLowerCase().trim(), cn = (client.name || "").trim();
  return trainers.some(t => { const te = (t.email || "").toLowerCase().trim(), tn = (t.name || "").trim(); return ce === te || isMaskedMatch(ce, te) || isMaskedNameMatch(cn, tn); });
}

function getPeriodRange(p, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (p === "yesterday") { const y = new Date(today); y.setDate(y.getDate() - 1); return { start: y, end: y }; }
  if (p === "today") return { start: today, end: today };
  if (p === "week") { const d = today.getDay(), m = new Date(today); m.setDate(today.getDate() - ((d + 6) % 7)); return { start: m, end: today }; }
  if (p === "last_week") { const d = today.getDay(), m = new Date(today); m.setDate(today.getDate() - ((d + 6) % 7)); const ps = new Date(m); ps.setDate(m.getDate() - 1); const pm = new Date(ps); pm.setDate(ps.getDate() - 6); return { start: pm, end: ps }; }
  if (p === "month") return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
  if (p === "last_month") return { start: new Date(today.getFullYear(), today.getMonth() - 1, 1), end: new Date(today.getFullYear(), today.getMonth(), 0) };
  return null;
}
function getPrevRange(p, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (p === "yesterday") { const d = new Date(today); d.setDate(d.getDate() - 2); return { start: d, end: d }; }
  if (p === "today") { const y = new Date(today); y.setDate(y.getDate() - 1); return { start: y, end: y }; }
  if (p === "week") { const d = today.getDay(), m = new Date(today); m.setDate(today.getDate() - ((d + 6) % 7)); const ps = new Date(m); ps.setDate(m.getDate() - 1); const pm = new Date(ps); pm.setDate(ps.getDate() - 6); return { start: pm, end: ps }; }
  if (p === "month") return { start: new Date(today.getFullYear(), today.getMonth() - 1, 1), end: new Date(today.getFullYear(), today.getMonth(), 0) };
  return null;
}
function inRange(ds, r) { if (!r) return true; if (!ds) return false; const d = new Date(ds); if (isNaN(d)) return false; const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return day >= r.start && day <= r.end; }
function prevLbl(p, now) { if (p === "yesterday") return "day before"; if (p === "today") return "yesterday"; if (p === "week") return "last week"; if (p === "month") return new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString("en-US", { month: "short" }); return null; }

function periodMetrics(clients, trainers, rdm, range) {
  const nT = !range ? trainers.length : trainers.filter(t => inRange(t.created_at, range)).length;
  const nC = !range ? clients.length : clients.filter(c => inRange(c.onboardedDate, range)).length;
  let reads = 0, readers = 0;
  clients.forEach(c => { const d = rdm[c.profile_id] || []; const n = !range ? d.length : d.filter(x => inRange(x.date, range)).length; reads += n; if (n > 0) readers++; });
  return { newTrainers: nT, newClients: nC, reads, readers, adoption: clients.length > 0 ? Math.round((readers / clients.length) * 100) : 0 };
}

function Ico({ type, color = BLUE }) {
  const bg = color + "12";
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {type === "person" && <><circle cx="12" cy="8" r="4"/><path d="M5 21v-1a7 7 0 0114 0v1"/></>}
        {type === "people" && <><circle cx="9" cy="7" r="3.5"/><path d="M2 21v-1a5 5 0 0110 0v1"/><circle cx="18" cy="9" r="3"/><path d="M22 21v-1a4 4 0 00-3-3.87"/></>}
        {type === "person-add" && <><circle cx="10" cy="7" r="3.5"/><path d="M3 21v-1a5 5 0 0110 0"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></>}
        {type === "trend" && <><polyline points="22 12 18 8 14 12 10 8 2 16"/></>}
      </svg>
    </div>
  );
}

function Donut({ pct, size = 120, thickness = 10, color = BLUE, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="rounded-full flex items-center justify-center" style={{ width: size, height: size, background: `conic-gradient(${color} 0% ${pct}%, #F1F5F9 ${pct}% 100%)` }}>
        <div className="rounded-full bg-white flex items-center justify-center" style={{ width: size - thickness * 2, height: size - thickness * 2 }}>
          <span className="font-extrabold text-[#0F172A]" style={{ fontSize: size * 0.25 }}>{pct}%</span>
        </div>
      </div>
      {label && <span className="text-[12px] text-[#94A3B8]">{label}</span>}
    </div>
  );
}

function AccTable({ rows, cols }) {
  const [sort, setSort] = useState({ key: null, asc: true });
  const sorted = sort.key ? [...rows].sort((a, b) => {
    const av = typeof cols.find(c => c.key === sort.key)?.val === "function" ? cols.find(c => c.key === sort.key).val(a) : a[sort.key];
    const bv = typeof cols.find(c => c.key === sort.key)?.val === "function" ? cols.find(c => c.key === sort.key).val(b) : b[sort.key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
    return sort.asc ? cmp : -cmp;
  }) : rows;
  const toggle = (key) => setSort(s => s.key === key ? { key, asc: !s.asc } : { key, asc: true });
  const arrow = (key) => sort.key !== key ? "↕" : sort.asc ? "↑" : "↓";
  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="text-[10px] text-[#94A3B8] uppercase tracking-wider border-b border-[#F1F5F9]">
          {cols.map(c => (
            <th key={c.key} className={`pb-1.5 font-semibold cursor-pointer select-none hover:text-[#6B7280] ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"}`}
              onClick={() => toggle(c.key)}>
              {c.label} <span className="text-[9px]">{arrow(c.key)}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((r, i) => (
          <tr key={i} className="border-b border-[#F8FAFC]">
            {cols.map(c => (
              <td key={c.key} className={`py-1.5 ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""} ${c.className || "text-[#0F172A]"}`}>
                {c.render ? c.render(r) : (typeof c.val === "function" ? c.val(r) : r[c.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function pctChange(cur, prev) {
  if (prev === 0 && cur === 0) return { val: 0, label: "0%" };
  if (prev === 0) return { val: 100, label: "100%" };
  const v = Math.round(((cur - prev) / prev) * 100);
  return { val: v, label: `${Math.abs(v)}%` };
}

export default function AnalyticsDashboard() {
  const [taList, setTaList] = useState([]);
  const [trainersMap, setTrainersMap] = useState({});
  const [allClients, setAllClients] = useState([]);
  const [readingDatesMap, setReadingDatesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState("Connecting...");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("today");
  const [compare, setCompare] = useState(true);
  const [timezone, setTimezone] = useState(DEFAULT_TZ);
  const [clock, setClock] = useState("");
  const [openAcc, setOpenAcc] = useState(new Set());
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customRange, setCustomRange] = useState(null);
  const [calMonth, setCalMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const customRef = useRef(null);
  const [calSelecting, setCalSelecting] = useState(null);
  const [matchPeriod, setMatchPeriod] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (customRef.current && !customRef.current.contains(e.target)) setShowCustomPicker(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleString("en-US", { timeZone: timezone, weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [timezone]);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      setLoadingPhase("Fetching Trainer Admins...");
      const taRes = await fetchTrainerAdminListService();
      const tas = (taRes?.existing || []).filter(t => EXECUTIVE_TAS.some(n => (t.name || "").toLowerCase().includes(n.toLowerCase())));
      setTaList(tas);
      setLoadingPhase("Fetching trainer networks...");
      const tMap = {};
      await Promise.all(tas.map(async ta => { try { const r = await fetchDownstreamUsersService(ta.user_id); tMap[ta.user_id] = { trainers: r?.network?.trainers || [] }; } catch { tMap[ta.user_id] = { trainers: [] }; } }));
      setTrainersMap(tMap);
      setLoadingPhase("Fetching all clients...");
      let arr = [], pg = 1, more = true;
      while (more) { setLoadingPhase(`Fetching clients (page ${pg})...`); const r = await fetchSuperAdminAllClientsOverviewService({ page: pg, limit: 50, type: "all" }); const b = r?.clients || []; arr = arr.concat(b); more = r?.pagination?.has_more === true && b.length > 0; pg++; if (pg > 20) break; }
      setAllClients(arr);
      setLoadingPhase("Fetching reading history...");
      const dm = {};
      const batches = []; for (let i = 0; i < arr.length; i += 5) batches.push(arr.slice(i, i + 5));
      let f = 0;
      for (const batch of batches) { await Promise.all(batch.map(async c => { if (!c.profile_id) return; try { const r = await fetchClientProfileDatesList(c.profile_id, c.dietitian_id || ""); dm[c.profile_id] = r?.data?.dates || []; } catch { dm[c.profile_id] = []; } })); f += batch.length; setLoadingPhase(`Reading history (${f}/${arr.length})...`); }
      setReadingDatesMap(dm);
    } catch (e) { setError(e?.message || "Failed to load"); toast.error(e?.message || "Failed"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const now = tzNow(timezone);

  const computeTa = useCallback((ta) => {
    if (!ta) return null;
    const all = (trainersMap[ta.user_id] || { trainers: [] }).trainers;
    const nonSelf = all.filter(t => !t.is_self);
    const codes = new Set(all.map(t => (t.partner_code || t.dietician_id || "").toUpperCase()));
    const taCl = allClients.filter(c => codes.has((c.dietitian_id || c.partner_code || "").toUpperCase()));
    const real = taCl.filter(c => !isSelfTest(c, all));
    const selfT = taCl.filter(c => isSelfTest(c, all));

    const enrich = c => {
      const dates = readingDatesMap[c.profile_id] || [];
      const rd = dates.length;
      const sorted = dates.map(d => d.date).filter(Boolean).sort();
      const last = sorted.length ? sorted[sorted.length - 1] : null;
      const onb = c.client?.joined_dttm || (sorted.length ? sorted[0] : null);
      const lastT = c.test_history?.last_test_date_time || last;
      const ds = onb ? daysBetween(onb, now) : 0;
      const pct = ds > 0 ? Math.min(100, Math.round((rd / ds) * 100)) : 0;
      const code = (c.dietitian_id || "").toUpperCase();
      const tr = all.find(t => (t.partner_code || t.dietician_id || "").toUpperCase() === code);
      return { ...c, trainerName: tr?.name || c.associated_dietitian?.name || "—", readingDays: rd, onboardedDate: onb, daysSince: ds, pct, cohort: getCohort(pct), lastDate: lastT };
    };

    const clients = real.map(enrich).sort((a, b) => b.pct - a.pct);
    const trainers = nonSelf.map(t => {
      const te = (t.email || "").toLowerCase().trim(), tn = (t.name || "").trim();
      const tc = (t.partner_code || t.dietician_id || "").toUpperCase();
      const sc = selfT.find(c => { const ce = (c.email || "").toLowerCase().trim(), cn = (c.name || "").trim(); return ce === te || isMaskedMatch(ce, te) || isMaskedNameMatch(cn, tn); });
      const allDates = sc ? (readingDatesMap[sc.profile_id] || []) : [];
      const ds = t.created_at ? daysBetween(t.created_at, now) : 0;
      const dates = t.created_at ? allDates.filter(d => !d.date || new Date(d.date) >= new Date(new Date(t.created_at).getFullYear(), new Date(t.created_at).getMonth(), new Date(t.created_at).getDate())) : allDates;
      const rd = dates.length;
      const pct = ds > 0 ? Math.min(100, Math.round((rd / ds) * 100)) : 0;
      return { ...t, daysSince: ds, readingDays: rd, pct, cohort: getCohort(pct), realClientCount: clients.filter(c => (c.dietitian_id || "").toUpperCase() === tc).length, hasSelfTest: !!sc, selfProfileId: sc?.profile_id || null };
    }).sort((a, b) => b.pct - a.pct || b.realClientCount - a.realClientCount);

    const goals = { weight_loss: 0, fat_loss: 0, muscle_gain: 0 };
    clients.forEach(c => { const g = (c.fitness_goal || "").toLowerCase(); if (g in goals) goals[g]++; });
    return { ta, trainers, clients, totalTrainers: nonSelf.length, activeTrainers: trainers.filter(t => t.pct >= ACTIVE_THRESHOLD).length, totalClients: clients.length, activeClients: clients.filter(c => c.pct >= ACTIVE_THRESHOLD).length, goals };
  }, [trainersMap, allClients, readingDatesMap, now]);

  const taData = useMemo(() => { const m = {}; taList.forEach(ta => { m[ta.user_id] = computeTa(ta); }); return m; }, [taList, computeTa]);
  const allTrainers = useMemo(() => taList.flatMap(ta => { const d = taData[ta.user_id]; return d ? d.trainers.map(t => ({ ...t, taName: ta.name })) : []; }).sort((a, b) => b.pct - a.pct || b.realClientCount - a.realClientCount), [taList, taData]);
  const allRealClients = useMemo(() => taList.flatMap(ta => { const d = taData[ta.user_id]; return d ? d.clients : []; }).sort((a, b) => b.pct - a.pct), [taList, taData]);
  const totals = useMemo(() => {
    const v = Object.values(taData).filter(Boolean);
    return { trainers: v.reduce((s, x) => s + x.totalTrainers, 0), activeT: v.reduce((s, x) => s + x.activeTrainers, 0), clients: v.reduce((s, x) => s + x.totalClients, 0), activeC: v.reduce((s, x) => s + x.activeClients, 0), goals: { fat_loss: v.reduce((s, x) => s + x.goals.fat_loss, 0), muscle_gain: v.reduce((s, x) => s + x.goals.muscle_gain, 0), weight_loss: v.reduce((s, x) => s + x.goals.weight_loss, 0) } };
  }, [taData]);

  const selTa = activeTab !== "overview" ? taList.find(t => t.user_id === activeTab) : null;
  const selData = selTa ? taData[selTa.user_id] : null;
  const tabCl = activeTab === "overview" ? allRealClients : (selData?.clients || []);
  const tabTr = activeTab === "overview" ? allTrainers : (selData?.trainers || []);
  const avgActivity = useMemo(() => { if (!tabCl.length) return 0; return Math.round(tabCl.reduce((s, c) => s + c.pct, 0) / tabCl.length); }, [tabCl]);

  const range = period === "custom" ? customRange : getPeriodRange(period, now);

  const periodTabTr = useMemo(() => {
    if (!matchPeriod || !range) return tabTr;
    return tabTr.map(t => {
      const dates = readingDatesMap[t.selfProfileId] || [];
      const rd = dates.filter(x => inRange(x.date, range)).length;
      const ds = t.daysSince ?? 0;
      const periodDs = range ? Math.max(1, Math.round((range.end - range.start) / 86400000) + 1) : ds;
      const pct = periodDs > 0 ? Math.min(100, Math.round((rd / periodDs) * 100)) : 0;
      return { ...t, readingDays: rd, daysSince: periodDs, pct, cohort: getCohort(pct) };
    });
  }, [matchPeriod, range, tabTr, readingDatesMap]);
  const periodTabCl = useMemo(() => {
    if (!matchPeriod || !range) return tabCl;
    return tabCl.map(c => {
      const dates = readingDatesMap[c.profile_id] || [];
      const rd = dates.filter(x => inRange(x.date, range)).length;
      const periodDs = Math.max(1, Math.round((range.end - range.start) / 86400000) + 1);
      const pct = periodDs > 0 ? Math.min(100, Math.round((rd / periodDs) * 100)) : 0;
      return { ...c, readingDays: rd, daysSince: periodDs, pct, cohort: getCohort(pct) };
    });
  }, [matchPeriod, range, tabCl, readingDatesMap]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ height: "calc(100vh - 130px)" }}>
      <div className="w-10 h-10 rounded-full border-[3px] border-[#E8F1FE] border-t-[#308BF9] animate-spin" />
      <div className="text-[13px] text-[#64748B] font-medium">{loadingPhase}</div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center gap-3" style={{ height: "calc(100vh - 130px)" }}>
      <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] rounded-2xl p-4 text-[13px] max-w-md text-center">{error}</div>
      <button onClick={loadData} className="rounded-full bg-[#EBF3FE] text-[#308BF9] text-[12px] font-semibold px-5 py-2 cursor-pointer hover:bg-[#DBEAFE]">Retry</button>
    </div>
  );

  const tTotal = activeTab === "overview" ? totals.trainers : (selData?.totalTrainers ?? 0);
  const tActive = activeTab === "overview" ? totals.activeT : (selData?.activeTrainers ?? 0);
  const cTotal = activeTab === "overview" ? totals.clients : (selData?.totalClients ?? 0);
  const cActive = activeTab === "overview" ? totals.activeC : (selData?.activeClients ?? 0);
  const curGoals = activeTab === "overview" ? totals.goals : (selData?.goals || { fat_loss: 0, muscle_gain: 0, weight_loss: 0 });

  const prevR = compare && !["all", "custom", "last_week", "last_month"].includes(period) ? getPrevRange(period, now) : null;
  const pm = periodMetrics(tabCl, tabTr, readingDatesMap, range);
  const ppm = prevR ? periodMetrics(tabCl, tabTr, readingDatesMap, prevR) : null;

  const adoptionRate = tTotal > 0 ? Math.round((tActive / tTotal) * 100) : 0;
  const engagementRate = cTotal > 0 ? Math.round((cActive / cTotal) * 100) : 0;
  const activeTrainers = tabTr.filter(t => t.pct >= ACTIVE_THRESHOLD);
  const eliteTrainers = tabTr.filter(t => t.pct >= 100);
  const atRiskTrainers = tabTr.filter(t => t.pct < 30);
  const eliteCount = eliteTrainers.length;
  const atRiskTrainerCount = atRiskTrainers.length;
  const highestRate = tabCl.length > 0 ? Math.max(...tabCl.map(c => c.pct)) : 0;
  const lowestRate = tabCl.length > 0 ? Math.min(...tabCl.map(c => c.pct)) : 0;

  const todayR = getPeriodRange("today", now);
  const yesterdayR = getPrevRange("today", now);
  const todayStats = periodMetrics(tabCl, tabTr, readingDatesMap, todayR);
  const yesterdayStats = periodMetrics(tabCl, tabTr, readingDatesMap, yesterdayR);

  const wkR = getPeriodRange("week", now);
  const pwkR = getPrevRange("week", now);
  const wkStats = periodMetrics(tabCl, tabTr, readingDatesMap, wkR);
  const pwkStats = periodMetrics(tabCl, tabTr, readingDatesMap, pwkR);

  const trainerWeekDelta = wkStats.newTrainers - pwkStats.newTrainers;
  const readingsWeekDelta = wkStats.reads - pwkStats.reads;

  const allTimeTrainerReads = tabTr.reduce((s, t) => {
    if (!t.selfProfileId) return s;
    return s + (readingDatesMap[t.selfProfileId] || []).length;
  }, 0);
  const allTimeClientReads = tabCl.reduce((s, c) => s + (c.readingDays || 0), 0);
  const allTimeTotalReads = allTimeTrainerReads + allTimeClientReads;
  const periodTrainerReads = range ? tabTr.reduce((s, t) => {
    if (!t.selfProfileId) return s;
    const dates = readingDatesMap[t.selfProfileId] || [];
    return s + dates.filter(x => inRange(x.date, range)).length;
  }, 0) : allTimeTrainerReads;
  const periodClientReads = pm.reads;
  const periodTotalReads = periodTrainerReads + periodClientReads;
  const periodLabel = period === "yesterday" ? `YESTERDAY (${fmtDate(range?.start).toUpperCase()})`
    : period === "today" ? `TODAY (${fmtDate(range?.start).toUpperCase()})`
    : period === "week" ? `THIS WEEK (${fmtRange(range).toUpperCase()})`
    : period === "last_week" ? `LAST WEEK (${fmtRange(range).toUpperCase()})`
    : period === "month" ? `THIS MONTH (${fmtRange(range).toUpperCase()})`
    : period === "last_month" ? `LAST MONTH (${fmtRange(range).toUpperCase()})`
    : period === "custom" ? (range ? fmtRange(range).toUpperCase() : "CUSTOM")
    : "ALL TIME";

  const CTIERS = [
    { label: "100%", min: 100, max: 100, color: BLUE },
    { label: "90% – 99%", min: 90, max: 99, color: BLUE },
    { label: "70% – 89%", min: 70, max: 89, color: BLUE },
    { label: "50% – 69%", min: 50, max: 69, color: BLUE },
    { label: "<30%", min: 0, max: 29, color: "#EF4444" },
  ];
  const totalPeople = periodTabTr.length + periodTabCl.length;
  const cohortData = CTIERS.map(tier => {
    const trainersIn = periodTabTr.filter(t => t.pct >= tier.min && t.pct <= tier.max);
    const clientsIn = periodTabCl.filter(c => c.pct >= tier.min && c.pct <= tier.max);
    const count = trainersIn.length + clientsIn.length;
    return { ...tier, count, trainersIn, clientsIn, pctOfTotal: totalPeople > 0 ? Math.round((count / totalPeople) * 100) : 0 };
  });
  const maxCohortCount = Math.max(...cohortData.map(c => c.count), 1);

  const onboardedTrainersToday = tabTr.filter(t => inRange(t.created_at, todayR));
  const onboardedClientsToday = tabCl.filter(c => inRange(c.onboardedDate, todayR));
  const readingsToday = tabCl.filter(c => { const d = readingDatesMap[c.profile_id] || []; return d.some(x => inRange(x.date, todayR)); });
  const onboardedTrainersYesterday = tabTr.filter(t => inRange(t.created_at, yesterdayR));
  const onboardedClientsYesterday = tabCl.filter(c => inRange(c.onboardedDate, yesterdayR));

  const toggleAcc = (key) => setOpenAcc(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const riskyTrainers = tabTr.filter(t => t.pct < ACTIVE_THRESHOLD).sort((a, b) => a.pct - b.pct);
  const riskyClients = tabCl.filter(c => c.pct < ACTIVE_THRESHOLD).sort((a, b) => a.pct - b.pct);

  const tChange = pctChange(todayStats.newTrainers, yesterdayStats.newTrainers);
  const cChange = pctChange(todayStats.newClients, yesterdayStats.newClients);
  const rChange = pctChange(todayStats.reads, yesterdayStats.reads);

  const trainerCols = [
    { key: "name", label: "Name", render: r => <span>{r.name || "—"} <span className="text-[9px] font-semibold text-[#94A3B8] bg-[#F1F5F9] px-1 py-0.5 rounded ml-1">Trainer</span></span> },
    { key: "partner_code", label: "Code", val: r => r.partner_code || "—", className: "text-[#94A3B8] font-mono" },
    ...(activeTab === "overview" ? [{ key: "taName", label: "TA", val: r => r.taName || "—", className: "text-[#6B7280]" }] : []),
    { key: "daysSince", label: "Days", align: "center", val: r => r.daysSince ?? 0 },
    { key: "readingDays", label: "Readings", align: "center", val: r => r.readingDays ?? 0 },
    { key: "pct", label: "Rate %", align: "right", render: r => <span className={r.pct >= ACTIVE_THRESHOLD ? "text-[#10B981] font-semibold" : r.pct > 0 ? "text-[#F59E0B] font-semibold" : "text-[#EF4444] font-semibold"}>{r.pct}%</span> },
  ];
  const clientCols = [
    { key: "name", label: "Name", render: r => <span>{r.name || "—"} <span className="text-[9px] font-semibold text-[#94A3B8] bg-[#F1F5F9] px-1 py-0.5 rounded ml-1">Client</span></span> },
    { key: "trainerName", label: "Trainer", val: r => r.trainerName || "—", className: "text-[#6B7280]" },
    { key: "fitness_goal", label: "Goal", render: r => <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ color: goalColor(r.fitness_goal), backgroundColor: goalColor(r.fitness_goal) + "15" }}>{goalLabel(r.fitness_goal)}</span> },
    { key: "daysSince", label: "Days", align: "center", val: r => r.daysSince ?? 0 },
    { key: "readingDays", label: "Readings", align: "center", val: r => r.readingDays ?? 0 },
    { key: "pct", label: "Rate %", align: "right", render: r => <span className={r.pct >= ACTIVE_THRESHOLD ? "text-[#10B981] font-semibold" : r.pct > 0 ? "text-[#F59E0B] font-semibold" : "text-[#EF4444] font-semibold"}>{r.pct}%</span> },
  ];

  const CS = "bg-white rounded-2xl border border-[#EEF2F6]";
  const SH = { boxShadow: "0 1px 4px rgba(0,0,0,0.04)" };

  const maxGoal = Math.max(curGoals.fat_loss, curGoals.muscle_gain, curGoals.weight_loss, 1);

  return (
    <div className="overflow-y-auto" style={{ height: "calc(100vh - 130px)" }}>
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between py-3 sticky top-0 bg-[#F5F7FA] z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border-b-2 border-transparent">
            {[["overview", "Overview"], ...taList.map(t => [t.user_id, t.name])].map(([id, name]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`px-3 py-2 text-[14px] font-semibold cursor-pointer transition-all border-b-2 ${activeTab === id ? "text-[#308BF9] border-[#308BF9]" : "text-[#6B7280] border-transparent hover:text-[#0F172A]"}`}>{name}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#E5E7EB] overflow-hidden">
            {[["yesterday", "Yesterday"], ["today", "Today"], ["week", "Week"], ["month", "Month"]].map(([k, l]) => (
              <button key={k} onClick={() => { setPeriod(k); setShowCustomPicker(false); setCompare(true); }}
                className={`px-3 py-1.5 text-[13px] font-medium cursor-pointer transition-all ${period === k ? "bg-[#308BF9] text-white" : "bg-white text-[#6B7280] hover:bg-[#F9FAFB]"}`}>{l}</button>
            ))}
            <div className="relative" ref={customRef}>
              <button onClick={() => setShowCustomPicker(v => !v)}
                className={`px-3 py-1.5 text-[13px] font-medium cursor-pointer transition-all flex items-center gap-1 ${["all", "custom", "last_week", "last_month"].includes(period) ? "bg-[#308BF9] text-white" : "bg-white text-[#6B7280] hover:bg-[#F9FAFB]"}`}>
                Custom <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4.5l3 3 3-3"/></svg>
              </button>
              {showCustomPicker && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-[#E5E7EB] shadow-lg z-50 flex" style={{ minWidth: 520 }}>
                  <div className="w-[180px] border-r border-[#F1F5F9] p-2 flex flex-col gap-0.5">
                    {[["today", "Today"], ["yesterday", "Yesterday"], ["week", "This Week"], ["last_week", "Last Week"], ["month", "This Month"], ["last_month", "Last Month"], ["all", "All Time"]].map(([k, l]) => (
                      <button key={k} onClick={() => { setPeriod(k); setCustomRange(null); setCalSelecting(null); setShowCustomPicker(false); if (k === "all") setCompare(false); else setCompare(true); }}
                        className={`text-left px-3 py-2 text-[13px] rounded-lg cursor-pointer transition-all ${period === k && !customRange ? "bg-[#EFF6FF] text-[#308BF9] font-semibold" : "text-[#374151] hover:bg-[#F9FAFB]"}`}>{l}</button>
                    ))}
                  </div>
                  <div className="p-3 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center cursor-pointer text-[#6B7280]">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7.5 9L4.5 6l3-3"/></svg>
                      </button>
                      <span className="text-[14px] font-semibold text-[#0F172A]">{calMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}</span>
                      <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center cursor-pointer text-[#6B7280]">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 3l3 3-3 3"/></svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-0 text-center">
                      {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => <div key={d} className="text-[10px] font-semibold text-[#94A3B8] py-1">{d}</div>)}
                      {(() => {
                        const y = calMonth.getFullYear(), m = calMonth.getMonth();
                        const first = new Date(y, m, 1).getDay();
                        const offset = (first + 6) % 7;
                        const daysInMonth = new Date(y, m + 1, 0).getDate();
                        const cells = [];
                        for (let i = 0; i < offset; i++) cells.push(<div key={`e${i}`} />);
                        for (let d = 1; d <= daysInMonth; d++) {
                          const dt = new Date(y, m, d);
                          const isStart = calSelecting && dt.getTime() === calSelecting.getTime();
                          const isInRange = customRange && dt >= customRange.start && dt <= customRange.end;
                          const isEnd = customRange && dt.getTime() === customRange.end.getTime();
                          const isToday = dt.toDateString() === new Date().toDateString();
                          cells.push(
                            <button key={d} onClick={() => {
                              if (!calSelecting) { setCalSelecting(dt); setCustomRange(null); }
                              else {
                                const s = dt < calSelecting ? dt : calSelecting;
                                const e = dt < calSelecting ? calSelecting : dt;
                                setCustomRange({ start: s, end: e });
                                setPeriod("custom"); setCalSelecting(null); setCompare(false); setShowCustomPicker(false);
                              }
                            }}
                              className={`w-8 h-8 text-[12px] rounded-lg cursor-pointer transition-all ${isStart ? "bg-[#308BF9] text-white font-bold" : isEnd ? "bg-[#308BF9] text-white font-bold" : isInRange ? "bg-[#EFF6FF] text-[#308BF9] font-semibold" : isToday ? "ring-1 ring-[#308BF9] text-[#308BF9] font-semibold hover:bg-[#EFF6FF]" : "text-[#374151] hover:bg-[#F1F5F9]"}`}>
                              {d}
                            </button>
                          );
                        }
                        return cells;
                      })()}
                    </div>
                    {calSelecting && <div className="mt-2 text-[11px] text-[#94A3B8]">Click another date to complete the range</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <span className="text-[12px] text-[#94A3B8]">Compare</span>
            <div className="relative w-8 h-[18px]" onClick={() => { if (!["all", "custom", "last_week", "last_month"].includes(period)) setCompare(c => !c); }}>
              <div className={`w-8 h-[18px] rounded-full transition-colors ${compare && !["all", "custom", "last_week", "last_month"].includes(period) ? "bg-[#308BF9]" : "bg-[#D1D5DB]"}`} />
              <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-all ${compare && !["all", "custom", "last_week", "last_month"].includes(period) ? "left-[16px]" : "left-[2px]"}`} />
            </div>
          </label>
          <button onClick={loadData} className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center cursor-pointer text-[#6B7280] hover:bg-[#F9FAFB]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
          </button>
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex rounded border border-[#E5E7EB] overflow-hidden">
              {Object.entries(TIMEZONES).map(([tz, label]) => (
                <button key={tz} onClick={() => setTimezone(tz)}
                  className={`px-2 py-0.5 text-[11px] font-medium cursor-pointer transition-all ${timezone === tz ? "bg-[#374151] text-white" : "bg-white text-[#94A3B8] hover:text-[#6B7280]"}`}>{label}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[12px] text-[#6B7280] font-mono whitespace-nowrap">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {clock}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 pb-8">

        {/* ═══ TA PROFILE (individual tabs only) ═══ */}
        {selTa && (
          <div className="rounded-2xl px-6 py-4 flex items-center gap-4 text-white" style={{ background: `linear-gradient(135deg, #0F172A 0%, ${BLUE} 100%)` }}>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white font-bold text-[18px]">{(selTa.name || "?")[0]}</div>
            <div className="flex-1">
              <div className="text-[16px] font-bold">{selTa.name}</div>
              <div className="text-white/50 text-[12px]">{selTa.email}</div>
            </div>
            <div className="flex gap-8 shrink-0">
              <div className="text-center"><div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Code</div><div className="text-white text-[13px] font-mono font-bold">{selTa.partner_code}</div></div>
              <div className="text-center"><div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Since</div><div className="text-white text-[13px] font-semibold">{fmtDate(selTa.created_at)}</div></div>
              <div className="text-center"><div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Days Active</div><div className="text-white text-[22px] font-extrabold">{selTa.created_at ? daysBetween(selTa.created_at, now) : "—"}</div></div>
            </div>
          </div>
        )}

        {/* ═══ EXECUTIVE SNAPSHOT ═══ */}
        <div className={`${CS} p-5`} style={SH}>
          <div className="grid grid-cols-[1.8fr_1fr_auto] gap-0">
            {/* LEFT: OVERALL (ALL TIME) — trainers, clients, readings in one row */}
            <div className="pr-5">
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#0F172A] mb-3">Overall <span className="text-[#64748B]">(All Time)</span></div>
              <div className="grid grid-cols-3 gap-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Ico type="people" />
                    <div>
                      <div className="text-[26px] font-extrabold text-[#0F172A] leading-none">{tTotal}</div>
                      <div className="text-[12px] text-[#6B7280]">Total Trainers</div>
                    </div>
                  </div>
                  <div className="text-[12px] mt-2"><span className="font-bold text-[#10B981]">{tActive} Active</span> <span className="text-[#94A3B8]">({"≥"}{ACTIVE_THRESHOLD}%)</span></div>
                  <div className="text-[11px] text-[#6B7280] mt-0.5">{adoptionRate}% Adoption Rate</div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Ico type="person" />
                    <div>
                      <div className="text-[26px] font-extrabold text-[#0F172A] leading-none">{cTotal}</div>
                      <div className="text-[12px] text-[#6B7280]">Total Clients</div>
                    </div>
                  </div>
                  <div className="text-[12px] mt-2"><span className="font-bold text-[#10B981]">{cActive} Active</span> <span className="text-[#94A3B8]">({"≥"}{ACTIVE_THRESHOLD}%)</span></div>
                  <div className="text-[11px] text-[#6B7280] mt-0.5">{engagementRate}% Engagement Rate</div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Ico type="trend" />
                    <div>
                      <div className="text-[26px] font-extrabold text-[#0F172A] leading-none">{allTimeTotalReads}</div>
                      <div className="text-[12px] text-[#6B7280]">Total Readings</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-2 text-[11px]">
                    <span className="text-[#6B7280]">By Trainers: <span className="font-semibold text-[#0F172A]">{allTimeTrainerReads}</span>{allTimeTotalReads > 0 && <span className="text-[#94A3B8]"> ({Math.round((allTimeTrainerReads / allTimeTotalReads) * 100)}%)</span>}</span>
                    <span className="text-[#6B7280]">By Clients: <span className="font-semibold text-[#0F172A]">{allTimeClientReads}</span>{allTimeTotalReads > 0 && <span className="text-[#94A3B8]"> ({Math.round((allTimeClientReads / allTimeTotalReads) * 100)}%)</span>}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE: PERIOD WITH DATE RANGE */}
            <div className="border-l border-[#F1F5F9] pl-5 pr-5">
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#0F172A] mb-3">{periodLabel}</div>
              <div className="grid grid-cols-2 gap-4 items-start">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Ico type="person-add" />
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[20px] font-extrabold text-[#0F172A] leading-none">{pm.newTrainers}</span>
                        {ppm && <span className={`text-[10px] font-bold ${pm.newTrainers >= ppm.newTrainers ? "text-[#10B981]" : "text-[#EF4444]"}`}>{pm.newTrainers >= ppm.newTrainers ? "↑" : "↓"}{Math.abs(pm.newTrainers - ppm.newTrainers)} vs {prevLbl(period, now)}</span>}
                      </div>
                      <div className="text-[11px] text-[#6B7280]">Trainers Onboarded</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ico type="person-add" />
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[20px] font-extrabold text-[#0F172A] leading-none">{pm.newClients}</span>
                        {ppm && <span className={`text-[10px] font-bold ${pm.newClients >= ppm.newClients ? "text-[#10B981]" : "text-[#EF4444]"}`}>{pm.newClients >= ppm.newClients ? "↑" : "↓"}{Math.abs(pm.newClients - ppm.newClients)} vs {prevLbl(period, now)}</span>}
                      </div>
                      <div className="text-[11px] text-[#6B7280]">Clients Onboarded</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Ico type="people" />
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[20px] font-extrabold text-[#0F172A] leading-none">{periodTotalReads}</span>
                        {ppm && <span className={`text-[10px] font-bold ${periodTotalReads >= ppm.reads ? "text-[#10B981]" : "text-[#EF4444]"}`}>{periodTotalReads >= ppm.reads ? "↑" : "↓"}{Math.abs(periodTotalReads - ppm.reads)} vs {prevLbl(period, now)}</span>}
                      </div>
                      <div className="text-[11px] text-[#6B7280]">Total Readings</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 text-[11px] pl-7">
                    <span className="text-[#6B7280]">By Trainers: <span className="font-semibold text-[#0F172A]">{periodTrainerReads}</span>{periodTotalReads > 0 && <span className="text-[#94A3B8]"> ({Math.round((periodTrainerReads / periodTotalReads) * 100)}%)</span>}</span>
                    <span className="text-[#6B7280]">By Clients: <span className="font-semibold text-[#0F172A]">{periodClientReads}</span>{periodTotalReads > 0 && <span className="text-[#94A3B8]"> ({Math.round((periodClientReads / periodTotalReads) * 100)}%)</span>}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: OVERALL DEVICE ADOPTION */}
            <div className="border-l border-[#F1F5F9] pl-5 flex flex-col items-center justify-center">
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#94A3B8] mb-2">Overall Device Adoption</div>
              <Donut pct={avgActivity} size={100} thickness={10} />
              <div className="text-[11px] text-[#6B7280] mt-1.5">Average Reading Rate</div>
            </div>
          </div>
        </div>

        {/* ═══ ROW 2: TRAINER ADOPTION + CLIENT ENGAGEMENT + READING SPLIT ═══ */}
        <div className="grid grid-cols-3 gap-4">
          {/* Trainer Adoption */}
          <div className={`${CS} p-5`} style={SH}>
            <h2 className="text-[16px] font-bold text-[#0F172A]">Trainer Adoption</h2>
            <p className="text-[12px] text-[#6B7280] mt-0.5">Are trainers using the device?</p>
            <div className="flex items-center gap-5 mt-4">
              <Donut pct={adoptionRate} size={100} thickness={10} label="Overall Adoption" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2"><span className="text-[22px] font-extrabold text-[#0F172A]">{tTotal}</span><span className="text-[12px] text-[#6B7280]">Total Trainers</span></div>
                {[
                  { key: "active", dot: "bg-[#10B981]", count: tActive, label: `Active (≥${ACTIVE_THRESHOLD}%)`, list: activeTrainers },
                  { key: "elite", dot: "bg-[#10B981]", count: eliteCount, label: "Elite (100%)", list: eliteTrainers },
                  { key: "atrisk", dot: "bg-[#EF4444]", count: atRiskTrainerCount, label: "At Risk (<30%)", list: atRiskTrainers },
                ].map(g => (
                  <div key={g.key}>
                    <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => g.count > 0 && toggleAcc(g.key)}>
                      <span className={`w-2 h-2 rounded-full ${g.dot}`} /><span className="text-[13px] font-semibold text-[#0F172A]">{g.count}</span><span className="text-[12px] text-[#6B7280]">{g.label}</span>
                      {g.count > 0 && <svg className={`w-3 h-3 text-[#94A3B8] transition-transform ${openAcc.has(g.key) ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4.5l3 3 3-3"/></svg>}
                    </div>
                    {openAcc.has(g.key) && g.list.length > 0 && (
                      <div className="mt-1.5 bg-[#F9FAFB] rounded-lg p-2 overflow-x-auto">
                        <AccTable rows={g.list} cols={trainerCols} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 text-[10px] text-[#94A3B8] italic">Adoption = Trainers with reading rate {"≥"} {ACTIVE_THRESHOLD}% / Total trainers ({tActive}/{tTotal} = {adoptionRate}%)</div>
            <div className={`mt-2 rounded-xl px-3 py-2 text-[12px] ${trainerWeekDelta >= 0 ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FEF2F2] text-[#DC2626]"}`}>
              {trainerWeekDelta >= 0 ? "↑" : "↓"} {Math.abs(trainerWeekDelta)} {trainerWeekDelta === 1 || trainerWeekDelta === -1 ? "trainer" : "trainers"} this week vs last
            </div>
          </div>

          {/* Client Engagement */}
          <div className={`${CS} p-5`} style={SH}>
            <h2 className="text-[16px] font-bold text-[#0F172A]">Client Engagement</h2>
            <p className="text-[12px] text-[#6B7280] mt-0.5">Are clients engaged and consistent?</p>
            <div className="flex gap-5 mt-4">
              <div className="flex flex-col gap-2">
                <div><span className="text-[34px] font-extrabold leading-none" style={{ color: BLUE }}>{avgActivity}%</span></div>
                <div className="text-[12px] text-[#6B7280]">Average Reading Rate</div>
                <div className="flex gap-4 mt-1">
                  <div><span className="text-[18px] font-extrabold text-[#10B981]">{highestRate}%</span><div className="text-[10px] text-[#94A3B8]">Highest</div></div>
                  <div><span className="text-[18px] font-extrabold text-[#EF4444]">{lowestRate}%</span><div className="text-[10px] text-[#94A3B8]">Lowest</div></div>
                </div>
              </div>
              <div className="border-l border-[#F1F5F9] pl-5 flex-1">
                <div className="text-[12px] font-semibold text-[#0F172A] mb-2">Clients by Goal</div>
                {[["fat_loss", "Fat Loss"], ["muscle_gain", "Muscle Gain"], ["weight_loss", "Weight Loss"]].map(([k, l]) => (
                  <div key={k} className="flex items-center gap-2 mb-2">
                    <span className="text-[16px] font-extrabold text-[#0F172A] w-5">{curGoals[k] || 0}</span>
                    <span className="text-[11px] text-[#6B7280] w-[70px]">{l}</span>
                    <div className="flex-1 h-[6px] bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${((curGoals[k] || 0) / maxGoal) * 100}%`, backgroundColor: BLUE }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`mt-3 rounded-xl px-3 py-2 text-[12px] ${readingsWeekDelta >= 0 ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FEF2F2] text-[#DC2626]"}`}>
              {readingsWeekDelta >= 0 ? "↑" : "↓"} {Math.abs(readingsWeekDelta)} readings this week vs last week
            </div>
          </div>

          {/* Reading Split */}
          <div className={`${CS} p-5`} style={SH}>
            <h2 className="text-[16px] font-bold text-[#0F172A]">Reading Split ({period === "yesterday" ? "Yesterday" : period === "today" ? "Today" : period === "week" ? "This Week" : period === "last_week" ? "Last Week" : period === "month" ? "This Month" : period === "last_month" ? "Last Month" : period === "custom" ? "Custom" : "All Time"})</h2>
            <p className="text-[12px] text-[#6B7280] mt-0.5">Who submitted the readings?</p>
            <div className="flex items-center gap-5 mt-4">
              <div className="shrink-0">
                <div className="rounded-full flex items-center justify-center" style={{
                  width: 110, height: 110,
                  background: periodTotalReads > 0
                    ? `conic-gradient(${BLUE} 0% ${Math.round((periodTrainerReads / periodTotalReads) * 100)}%, #93C5FD ${Math.round((periodTrainerReads / periodTotalReads) * 100)}% 100%)`
                    : "#F1F5F9"
                }}>
                  <div className="rounded-full bg-white flex items-center justify-center" style={{ width: 86, height: 86 }}>
                    <span className="text-[22px] font-extrabold text-[#0F172A]">{periodTotalReads}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[12px] text-[#6B7280] mb-2.5">Total Readings</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: BLUE }} />
                    <span className="text-[12px] text-[#6B7280]">By Trainers</span>
                    <span className="text-[13px] font-bold text-[#0F172A] ml-auto">{periodTrainerReads} ({periodTotalReads > 0 ? Math.round((periodTrainerReads / periodTotalReads) * 100) : 0}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#93C5FD]" />
                    <span className="text-[12px] text-[#6B7280]">By Clients</span>
                    <span className="text-[13px] font-bold text-[#0F172A] ml-auto">{periodClientReads} ({periodTotalReads > 0 ? Math.round((periodClientReads / periodTotalReads) * 100) : 0}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ ROW 3: TRAINER ANALYTICS + CLIENT ANALYTICS + READING RATE COHORTS ═══ */}
        <div className="grid grid-cols-3 gap-4">
          {/* Trainer Analytics */}
          <div className={`${CS} p-5`} style={SH}>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#0F172A]">Trainer Analytics</h2>
              <div className="flex rounded-md border border-[#E5E7EB] overflow-hidden">
                <button onClick={() => setMatchPeriod(false)} className={`px-2 py-1 text-[10px] font-medium cursor-pointer transition-all ${!matchPeriod ? "bg-[#308BF9] text-white" : "bg-white text-[#6B7280]"}`}>All Time</button>
                <button onClick={() => setMatchPeriod(true)} className={`px-2 py-1 text-[10px] font-medium cursor-pointer transition-all ${matchPeriod ? "bg-[#308BF9] text-white" : "bg-white text-[#6B7280]"}`}>Match Period</button>
              </div>
            </div>
            <p className="text-[12px] text-[#6B7280] mt-0.5">{periodTabTr.length} trainers{matchPeriod && range ? ` · ${fmtRange(range)}` : ""}</p>
            <div className="mt-3 overflow-x-auto">
              <AccTable rows={periodTabTr} cols={[
                { key: "name", label: "Trainer", val: r => r.name || "—" },
                { key: "realClientCount", label: "Clients", align: "center", val: r => r.realClientCount ?? 0 },
                { key: "daysSince", label: "Days", align: "center", val: r => r.daysSince ?? 0 },
                { key: "readingDays", label: "Tests", align: "center", val: r => r.readingDays ?? 0 },
                { key: "pct", label: "Rate", align: "center", render: r => <span className={r.pct >= ACTIVE_THRESHOLD ? "text-[#10B981] font-semibold" : r.pct > 0 ? "text-[#F59E0B] font-semibold" : "text-[#EF4444] font-semibold"}>{r.pct}%</span> },
                { key: "status", label: "Status", align: "right", val: r => r.pct >= 100 ? 2 : r.pct >= ACTIVE_THRESHOLD ? 1 : 0, render: r => r.pct >= 100
                  ? <span className="bg-[#ECFDF5] text-[#059669] text-[10px] font-bold px-1.5 py-0.5 rounded-md">Elite</span>
                  : r.pct >= ACTIVE_THRESHOLD
                    ? <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold px-1.5 py-0.5 rounded-md">Active</span>
                    : <span className="bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold px-1.5 py-0.5 rounded-md">At Risk</span>
                },
              ]} />
            </div>
          </div>

          {/* Client Analytics */}
          <div className={`${CS} p-5`} style={SH}>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#0F172A]">Client Analytics</h2>
              <div className="flex rounded-md border border-[#E5E7EB] overflow-hidden">
                <button onClick={() => setMatchPeriod(false)} className={`px-2 py-1 text-[10px] font-medium cursor-pointer transition-all ${!matchPeriod ? "bg-[#308BF9] text-white" : "bg-white text-[#6B7280]"}`}>All Time</button>
                <button onClick={() => setMatchPeriod(true)} className={`px-2 py-1 text-[10px] font-medium cursor-pointer transition-all ${matchPeriod ? "bg-[#308BF9] text-white" : "bg-white text-[#6B7280]"}`}>Match Period</button>
              </div>
            </div>
            <p className="text-[12px] text-[#6B7280] mt-0.5">{periodTabCl.length} clients{matchPeriod && range ? ` · ${fmtRange(range)}` : ""}</p>
            <div className="mt-3 overflow-x-auto">
              <AccTable rows={periodTabCl} cols={[
                { key: "name", label: "Client", val: r => r.name || "—" },
                { key: "fitness_goal", label: "Goal", val: r => goalLabel(r.fitness_goal), render: r => <span className="text-[10px] font-semibold px-1 py-0.5 rounded" style={{ color: goalColor(r.fitness_goal), backgroundColor: goalColor(r.fitness_goal) + "15" }}>{goalLabel(r.fitness_goal)}</span> },
                { key: "daysSince", label: "Days", align: "center", val: r => r.daysSince ?? 0 },
                { key: "readingDays", label: "Tests", align: "center", val: r => r.readingDays ?? 0 },
                { key: "pct", label: "Rate", align: "right", render: r => <span className={r.pct >= ACTIVE_THRESHOLD ? "text-[#10B981] font-semibold" : r.pct > 0 ? "text-[#F59E0B] font-semibold" : "text-[#EF4444] font-semibold"}>{r.pct}%</span> },
              ]} />
            </div>
          </div>

          {/* Reading Rate Cohorts */}
          <div className={`${CS} p-5`} style={SH}>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#0F172A]">Reading Rate Cohorts</h2>
              <div className="flex rounded-md border border-[#E5E7EB] overflow-hidden">
                <button onClick={() => setMatchPeriod(false)} className={`px-2 py-1 text-[10px] font-medium cursor-pointer transition-all ${!matchPeriod ? "bg-[#308BF9] text-white" : "bg-white text-[#6B7280]"}`}>All Time</button>
                <button onClick={() => setMatchPeriod(true)} className={`px-2 py-1 text-[10px] font-medium cursor-pointer transition-all ${matchPeriod ? "bg-[#308BF9] text-white" : "bg-white text-[#6B7280]"}`}>Match Period</button>
              </div>
            </div>
            <p className="text-[12px] text-[#6B7280] mt-0.5">Where do your clients & trainers stand?{matchPeriod && range ? ` · ${fmtRange(range)}` : ""}</p>
            <div className="flex flex-col gap-2.5 mt-4">
              {cohortData.map((tier, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => tier.count > 0 && toggleAcc(`cohort-${i}`)}>
                    <span className="text-[11px] font-medium text-[#0F172A] w-[70px] shrink-0">{tier.label}</span>
                    <div className="flex-1 h-[8px] bg-[#F8FAFC] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(tier.count / maxCohortCount) * 100}%`, backgroundColor: tier.color }} />
                    </div>
                    <span className="text-[11px] text-right shrink-0 whitespace-nowrap"><span className="font-bold text-[#0F172A]">{tier.count}</span> <span className="text-[#94A3B8]">({tier.pctOfTotal}%)</span></span>
                    {tier.count > 0 && <svg className={`w-3 h-3 text-[#94A3B8] transition-transform ${openAcc.has(`cohort-${i}`) ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4.5l3 3 3-3"/></svg>}
                  </div>
                  {openAcc.has(`cohort-${i}`) && (
                    <div className="mt-1.5 bg-[#F9FAFB] rounded-lg p-2 flex flex-col gap-1.5 overflow-x-auto">
                      {tier.trainersIn.length > 0 && <>
                        <div className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider">Trainers</div>
                        <AccTable rows={tier.trainersIn} cols={trainerCols} />
                      </>}
                      {tier.clientsIn.length > 0 && <>
                        <div className={`text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider ${tier.trainersIn.length > 0 ? "mt-1" : ""}`}>Clients</div>
                        <AccTable rows={tier.clientsIn} cols={clientCols} />
                      </>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] pt-2 border-t border-[#F1F5F9]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>Active = Reading rate {"≥"} {ACTIVE_THRESHOLD}% {"·"} Reading Rate = Reading days / Days since onboarded {"·"} Self-test by trainers are excluded from client counts but included in trainer adoption.</span>
        </div>
      </div>
    </div>
  );
}
