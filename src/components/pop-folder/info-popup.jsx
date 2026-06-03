"use client";

import { useSelector } from "react-redux";
import SignalDetailCard from "./SignalDetailCard";

// Deep-dive popup for Fat-use Pattern Trend. Shows ALL 6 sub-scores grouped
// by their breath marker (acetone / ethanol / hydrogen).
//
// IMPORTANT: backend response shape varies. Sometimes both `metabolism_signals`
// (flat) AND `metabolism_signals_by_marker` (grouped) are present; sometimes
// only the flat list is populated; sometimes the grouped form is partial
// (e.g., ethanol populated, acetone/hydrogen empty). To be robust:
//   1. Read both fields.
//   2. If a marker's grouped array is empty/missing, rebuild it from the flat
//      list filtered by signal.marker_source.
//   3. Iterate the resulting arrays directly — don't assume a fixed signal at
//      a fixed index. Whatever signals the engine returns gets rendered.
//
// Reference: trainer_direction_2tabs.html (engineer's canonical UI) does the
// same thing — it iterates byMrk.acetone, .ethanol, .hydrogen as arrays.

const MARKERS = [
  { key: "acetone",  title: "Acetone",  subtitle: "Fuel & Energy" },
  { key: "ethanol",  title: "Ethanol",  subtitle: "Metabolic Recovery" },
  { key: "hydrogen", title: "Hydrogen", subtitle: "Digestive Balance" },
];

// Mark these signals' UI as a "Limiter" badge (instead of a numeric score)
// when they're flagged as a limiter — matches the original popup behaviour
// only Hydrogen-derived signals were treated as limiter-style cards.
const LIMITER_BADGE_SIGNALS = new Set([
  "Nutrient Utilization",
  "Digestive Activity",
]);

// Only these signals should be rendered in the popup.
const VISIBLE_SIGNALS = new Set([
  "Digestive Activity",
  "Fuel Utilization",
  "Metabolic Load",
]);

// Resolve a marker-grouped view of the signals from the response.
// Prefers the engine's pre-grouped object; falls back to filtering the flat
// list. Always returns { acetone: [], ethanol: [], hydrogen: [] }.
function resolveSignalsByMarker(metabolismSignals, signalsByMarker) {
  const fromGrouped = signalsByMarker || {};
  const fromFlat = Array.isArray(metabolismSignals) ? metabolismSignals : [];

  return MARKERS.reduce((acc, { key }) => {
    const grouped = Array.isArray(fromGrouped[key]) ? fromGrouped[key] : [];
    const source = grouped.length > 0
      ? grouped
      : fromFlat.filter((s) => s?.marker_source === key);
    acc[key] = source.filter((s) => VISIBLE_SIGNALS.has(s?.signal));
    return acc;
  }, {});
}

export default function InfoPopUp({ onClose }) {
  const clientIndividualProfile = useSelector(
    (state) => state.clientIndividualProfile.data
  );

  const why =
    clientIndividualProfile?.data?.raw_json?.trainer_direction_elite
      ?.why_todays_plan || {};

  const byMarker = resolveSignalsByMarker(
    why.metabolism_signals,
    why.metabolism_signals_by_marker
  );

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative bg-white rounded-[16px] shadow-xl max-w-[980px] w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-[#E1E6ED] px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
              Fat-use Pattern Trend — breakdown
            </h2>
            <p className="text-[#535359] text-[12px] mt-1">
              All sub-scores across the three breath markers powering this trend.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F5F7FA] hover:bg-[#E1E6ED] text-[#535359] text-[16px] font-semibold flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          {MARKERS.map(({ key, title, subtitle }) => {
            const signals = byMarker[key] || [];
            return (
              <div
                key={key}
                className="bg-[#F5F7FA] rounded-[12px] border border-[#E1E6ED] p-4 flex flex-col gap-4"
              >
                <div>
                  <div className="text-[#252525] font-semibold text-[14px] tracking-[-0.02em]">
                    {title}
                  </div>
                  <div className="text-[#535359] text-[11px] mt-0.5">
                    {subtitle}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {signals.length === 0 ? (
                    <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-4 text-[#A1A1A1] text-[11px] text-center">
                      No {title.toLowerCase()} signals available.
                    </div>
                  ) : (
                    signals.map((sig, idx) => (
                      <SignalDetailCard
                        key={`${key}-${sig.signal || idx}`}
                        signalName={sig.signal}
                        zoneLabel={sig.zone_label}
                        tier={sig.tier}
                        flag={sig.flag}
                        score={sig.score}
                        thresholdRule={sig.threshold_rule}
                        interpretation={sig.trainer_interpretation}
                        showLimiterBadge={LIMITER_BADGE_SIGNALS.has(sig.signal)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
