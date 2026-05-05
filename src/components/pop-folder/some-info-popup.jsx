"use client";

import { useSelector } from "react-redux";
import SignalDetailCard from "./SignalDetailCard";

// Per-trend deep-dive popup. Shows ONE sub-score breakdown for the trend the
// user clicked into. The `type` prop maps to a signal name we look up in
// metabolism_signals_by_marker. Used by:
//   - Fuel & Energy Trends:        type="fuel"     | type="energy"
//   - Metabolic Recovery Trends:   type="metabolic"| type="recovery"
//   - Digestive Balance Trends:    type="nutrient" | type="digestive"

const TYPES = {
  fuel:      { signalName: "Fuel Utilization",    title: "Fuel Utilization breakdown",    subtitle: "Acetone — fuel & energy",      limiterBadge: false },
  energy:    { signalName: "Energy Source",        title: "Energy Source breakdown",       subtitle: "Acetone — fuel & energy",      limiterBadge: false },
  metabolic: { signalName: "Metabolic Load",       title: "Metabolic Load breakdown",      subtitle: "Ethanol — metabolic recovery", limiterBadge: false },
  recovery:  { signalName: "Recovery Activity",    title: "Recovery Activity breakdown",   subtitle: "Ethanol — metabolic recovery", limiterBadge: false },
  nutrient:  { signalName: "Nutrient Utilization", title: "Nutrient Utilization breakdown",subtitle: "Hydrogen — digestive balance", limiterBadge: true  },
  digestive: { signalName: "Digestive Activity",   title: "Digestive Activity breakdown",  subtitle: "Hydrogen — digestive balance", limiterBadge: true  },
};

export default function SomeInfoPopup({ onClose, type }) {
  const clientIndividualProfile = useSelector(
    (state) => state.clientIndividualProfile.data
  );

  const meta = TYPES[type];

  // Look up the signal by NAME, not by index. Backend response may put the
  // grouped form (metabolism_signals_by_marker) under partial / missing data,
  // so we also fall back to the flat metabolism_signals list. Whichever
  // source has the named signal wins.
  const findSignal = (signalName) => {
    const why =
      clientIndividualProfile?.data?.raw_json?.trainer_direction_elite
        ?.why_todays_plan;
    if (!why) return null;

    const grouped = why.metabolism_signals_by_marker || {};
    for (const marker of Object.keys(grouped)) {
      const hit = grouped[marker]?.find((s) => s?.signal === signalName);
      if (hit) return hit;
    }

    const flat = why.metabolism_signals;
    if (Array.isArray(flat)) {
      const hit = flat.find((s) => s?.signal === signalName);
      if (hit) return hit;
    }

    return null;
  };

  const signal = meta ? findSignal(meta.signalName) : null;

  return (
    <div
      className="relative bg-white rounded-[16px] shadow-xl max-w-[480px] w-[90vw] max-h-[90vh] overflow-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E1E6ED] flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[#252525] text-[16px] font-bold leading-tight tracking-[-0.3px]">
            {meta?.title || "Signal breakdown"}
          </h2>
          {meta?.subtitle && (
            <p className="text-[#535359] text-[11px] mt-0.5">{meta.subtitle}</p>
          )}
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

      {/* Body */}
      <div className="p-5">
        {!meta ? (
          <p className="text-[#A1A1A1] text-[12px]">Unknown signal type.</p>
        ) : !signal ? (
          <p className="text-[#A1A1A1] text-[12px]">
            No data available for this signal.
          </p>
        ) : (
          <SignalDetailCard
            signalName={signal.signal || meta.signalName}
            zoneLabel={signal.zone_label}
            tier={signal.tier}
            flag={signal.flag}
            score={signal.score}
            thresholdRule={signal.threshold_rule}
            interpretation={signal.trainer_interpretation}
            showLimiterBadge={meta.limiterBadge}
          />
        )}
      </div>
    </div>
  );
}
