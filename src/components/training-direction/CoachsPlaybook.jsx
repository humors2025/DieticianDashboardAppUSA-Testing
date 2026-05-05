"use client";

// "Coach's Playbook" tab — the rules engine for the session.
// Reads:
//   exercise_strategy.constraints_applied  — category caps + banned combos
//   progression_permission                 — what may be progressed today
//   next_session_plan                      — what to do based on tomorrow's scores
//   red_flags                              — explicit blockers (rare)

const CATEGORY_LABELS = {
  compound_barbell:       "Compound · Barbell",
  compound_machine:       "Compound · Machine",
  compound_dumbbell:      "Compound · Dumbbell",
  compound_bodyweight:    "Compound · Bodyweight",
  isolation_single_joint: "Isolation",
  conditioning:           "Conditioning",
};

const PROGRESSION_LABELS = {
  load_progression:      "Load",
  volume_progression:    "Volume",
  density_progression:   "Density (rest cuts)",
  technical_progression: "Technical (tempo, ROM)",
};

function Card({ children, className = "" }) {
  return (
    <section className={`bg-white rounded-[10px] border border-[#E1E6ED] p-5 ${className}`}>
      {children}
    </section>
  );
}

function CardTitle({ children, hint }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="text-[#252525] text-[14px] font-bold tracking-[-0.02em]">{children}</h3>
      {hint && <span className="text-[#A1A1A1] text-[11px]">{hint}</span>}
    </div>
  );
}

function statusTone(value) {
  const v = String(value || "").toLowerCase();
  if (v === "allowed" || v === "true" || v === "yes") return { label: "Allowed", bg: "#E5F6EE", text: "#1F7A4A" };
  if (v === "denied" || v === "false" || v === "no")  return { label: "Denied",  bg: "#FCEAEB", text: "#B5363A" };
  if (v === "small_only" || v === "limited")          return { label: "Limited", bg: "#FFF4E0", text: "#A66B00" };
  return { label: value || "—", bg: "#F5F7FA", text: "#535359" };
}

export default function CoachsPlaybook({ data }) {
  const constraints = data?.exercise_strategy?.constraints_applied || {};
  const categoryCaps = constraints.category_caps || {};
  const progression = data?.progression_permission || {};
  const nextSession = data?.next_session_plan || {};
  const redFlags = Array.isArray(data?.red_flags) ? data.red_flags : [];

  const categoryRows = Object.entries(categoryCaps);
  const progressionRows = ["load_progression", "volume_progression", "density_progression", "technical_progression"]
    .map((k) => ({ key: k, label: PROGRESSION_LABELS[k], value: progression[k] }))
    .filter((r) => r.value);

  const nextSessionRows = [
    { key: "if_scores_improve", label: "If scores improve",  text: nextSession.if_scores_improve, accent: "#1F7A4A", bg: "#E5F6EE" },
    { key: "if_scores_same",    label: "If scores stay same", text: nextSession.if_scores_same,    accent: "#A66B00", bg: "#FFF4E0" },
    { key: "if_scores_worse",   label: "If scores worsen",    text: nextSession.if_scores_worse,   accent: "#B5363A", bg: "#FCEAEB" },
  ].filter((r) => r.text);

  return (
    <div className="flex flex-col gap-4">
      {/* Movement constraints */}
      {categoryRows.length > 0 && (
        <Card>
          <CardTitle hint={constraints.training_mode || constraints.mode}>Movement constraints</CardTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[#A1A1A1] text-[10px] uppercase tracking-wide font-semibold text-left border-b border-[#F5F7FA]">
                  <th className="py-2 pr-3 font-semibold">Category</th>
                  <th className="py-2 pr-3 font-semibold text-right">Max RPE</th>
                  <th className="py-2 pr-3 font-semibold">Failure</th>
                  <th className="py-2 font-semibold">Allowed</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map(([key, cap]) => {
                  const fail = statusTone(cap.failure);
                  const allow = statusTone(cap.allowed);
                  return (
                    <tr key={key} className="border-b border-[#F5F7FA] last:border-0">
                      <td className="py-2.5 pr-3 text-[#252525]">{CATEGORY_LABELS[key] || key.replace(/_/g, " ")}</td>
                      <td className="py-2.5 pr-3 text-right text-[#252525] font-semibold">{cap.max_rpe ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex rounded-full text-[10px] font-semibold px-2 py-0.5"
                              style={{ backgroundColor: fail.bg, color: fail.text }}>
                          {fail.label}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex rounded-full text-[10px] font-semibold px-2 py-0.5"
                              style={{ backgroundColor: allow.bg, color: allow.text }}>
                          {allow.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Progression permission */}
      {progressionRows.length > 0 && (
        <Card>
          <CardTitle hint={progression.allowed === false ? "Progression denied today" : null}>
            Progression permission
          </CardTitle>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {progressionRows.map((r) => {
              const tone = statusTone(r.value);
              return (
                <div key={r.key} className="flex items-baseline justify-between py-2 border-b border-[#F5F7FA] last:border-0">
                  <span className="text-[#535359] text-[12px]">{r.label}</span>
                  <span className="inline-flex rounded-full text-[10px] font-semibold px-2.5 py-0.5"
                        style={{ backgroundColor: tone.bg, color: tone.text }}>
                    {tone.label}
                  </span>
                </div>
              );
            })}
          </div>
          {(progression.type || progression.reason) && (
            <div className="mt-4 rounded-[8px] bg-[#F5F7FA] px-3 py-2.5 text-[#535359] text-[12px] leading-[1.5]">
              {progression.type && <div>{progression.type}</div>}
              {progression.reason && <div className="text-[#A1A1A1] text-[11px] mt-1">{progression.reason}</div>}
            </div>
          )}
        </Card>
      )}

      {/* Next session plan */}
      {nextSessionRows.length > 0 && (
        <Card>
          <CardTitle>Next session plan</CardTitle>
          <div className="mt-4 flex flex-col gap-3">
            {nextSessionRows.map((r) => (
              <div key={r.key} className="flex items-baseline gap-3">
                <span className="flex-shrink-0 inline-flex rounded-full text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1"
                      style={{ backgroundColor: r.bg, color: r.accent }}>
                  {r.label}
                </span>
                <span className="text-[#252525] text-[13px] leading-[1.5]">{r.text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Red flags */}
      {redFlags.length > 0 && (
        <Card>
          <CardTitle>Red flags</CardTitle>
          <ul className="mt-4 flex flex-col gap-2">
            {redFlags.map((flag, i) => (
              <li key={i} className="rounded-[8px] bg-[#FCEAEB] px-3 py-2 text-[#B5363A] text-[12px]">
                {typeof flag === "string" ? flag : (flag.message || JSON.stringify(flag))}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
