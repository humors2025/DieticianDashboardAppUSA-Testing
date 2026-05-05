"use client"
import { useSelector } from "react-redux";
export default function InfoPopUp({ onClose, children }) {

    const clientIndividualProfile = useSelector(
        (state) => state.clientIndividualProfile.data
      );

      console.log("clientIndividualProfile09:-", clientIndividualProfile);
    
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Extract metabolism signals data
  const metabolismSignals = clientIndividualProfile?.data?.raw_json?.trainer_direction_elite?.why_todays_plan?.metabolism_signals_by_marker;

  // Get individual marker data
  const acetoneSignals = metabolismSignals?.acetone || [];
  const ethanolSignals = metabolismSignals?.ethanol || [];
  const hydrogenSignals = metabolismSignals?.hydrogen || [];

  // Helper function to get the first signal from an array
  const getFirstSignal = (signals) => signals[0] || {};
  const getSecondSignal = (signals) => signals[1] || {};

  return (
    <>
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-[12px] shadow-lg relative max-w-[90vw] max-h-[90vh] overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[18px] font-normal text-[#252525] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          type="button"
          aria-label="Close popup"
        >
          X
        </button>

        <div>
          <div className="flex pb-[25px] pl-2.5 pt-[25px] border-b border-[#E1E6ED]">
          <p className="text-[#252525] font-semibold text-[25px] leading-[100%] tracking-[-4%]">
            Fat-use Pattern Trend Breakdown
          </p>
          </div>

          <div className="flex gap-[19px] mt-5">
            {/* Acetone Column - Fuel & Energy Trends */}
            <div className="px-[15px] py-[15px] bg-[#F5F7FA] rounded-[15px] border border-[#E1E6ED]">
              <div className="flex flex-col gap-1 justify-start pt-[15px] pl-[5px] pr-[13px]">
                <span className="text-[#252525] font-semibold text-[15px] leading-[100%] tracking-[-2%]">
                  Acetone
                </span>
                <span className="text-[#535359] text-[12px] leading-[110%] tracking-[-2%]">
                  Fuel & Energy Trends
                </span>
              </div>

              <div className="flex flex-col gap-[15px]">
                {/* Fuel Utilization */}
                {(() => {
                  const signal = getFirstSignal(acetoneSignals);
                  const score = signal.score || 71.1;
                  const tier = signal.tier || 'mid';
                  const zoneLabel = signal.zone_label || 'Strong (fat-use dominant)';
                  const flag = signal.flag || 'strong';
                  const thresholdRule = signal.threshold_rule || '≥80 strong / 70–79 mid / 70 low';
                  const interpretation = signal.trainer_interpretation || 'Mixed day — some stored-energy use with periods of quick-use reliance. Improving meal structure usually strengthens consistency.';
                  
                  // Determine border color based on tier/flag
                  const getBorderColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#3FAF58';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  // Determine score color based on tier/flag
                  const getScoreColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#3FAF58';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  return (
                    <div className={`mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] bg-[#FFFFFF] rounded-[10px]`} 
                         style={{ borderLeftColor: getBorderColor(flag, tier) }}>
                      <div className="flex justify-between">
                        <div className="flex flex-col gap-[5px] justify-start">
                          <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                            {signal.signal || 'Fuel Utilization'}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              {zoneLabel}
                            </span>
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              tier: {tier}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[18px] leading-[110%] tracking-[-2px]"
                              style={{ color: getScoreColor(flag, tier) }}>
                          {score}
                        </span>
                      </div>

                      <div className="mt-[15px] py-[5px]">
                        <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                          {thresholdRule}
                        </p>
                      </div>

                      <div className="mt-3">
                        <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                          {interpretation}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Energy Source */}
                {(() => {
                  const signal = getSecondSignal(acetoneSignals);
                  const score = signal.score || 71.1;
                  const tier = signal.tier || 'mid';
                  const zoneLabel = signal.zone_label || 'Ideal (steady meals)';
                  const flag = signal.flag || 'ideal';
                  const thresholdRule = signal.threshold_rule || '≤20 ideal / 21–30 mid / 30 limiter';
                  const interpretation = signal.trainer_interpretation || 'Quick-use reliance moderate (21–30). Some meals balanced, others lean carb-heavy. Pairing carbs with protein and fiber improves steadiness.';

                  const getBorderColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#3FAF58';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  const getScoreColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#3FAF58';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  return (
                    <div className="mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] bg-[#FFFFFF] rounded-[10px]"
                         style={{ borderLeftColor: getBorderColor(flag, tier) }}>
                      <div className="flex justify-between">
                        <div className="flex flex-col gap-[5px] justify-start">
                          <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                            {signal.signal || 'Energy Source'}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              {zoneLabel}
                            </span>
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              tier: {tier}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[18px] leading-[110%] tracking-[-2px]"
                              style={{ color: getScoreColor(flag, tier) }}>
                          {score}
                        </span>
                      </div>

                      <div className="mt-[15px] py-[5px]">
                        <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                          {thresholdRule}
                        </p>
                      </div>

                      <div className="mt-3">
                        <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                          {interpretation}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Ethanol Column - Metabolic Recovery Trends */}
            <div className="px-[15px] py-[15px] bg-[#F5F7FA] rounded-[15px] border border-[#E1E6ED]">
              <div className="flex flex-col gap-1 justify-start pt-[15px] pl-[5px] pr-[13px]">
                <span className="text-[#252525] font-semibold text-[15px] leading-[100%] tracking-[-2%]">
                Ethanol
                </span>
                <span className="text-[#535359] text-[12px] leading-[110%] tracking-[-2%]">
                Metabolic Recovery Trends
                </span>
              </div>

              <div className="flex flex-col gap-[15px]">
                {/* Metabolic Load */}
                {(() => {
                  const signal = getFirstSignal(ethanolSignals);
                  const score = signal.score || 71.1;
                  const tier = signal.tier || 'mid';
                  const zoneLabel = signal.zone_label || 'High limiter (elevated load)';
                  const flag = signal.flag || 'high_limiter';
                  const thresholdRule = signal.threshold_rule || '≥80 strong / 70–79 mid / 70 low';
                  const interpretation = signal.trainer_interpretation || 'Load high (30). Common pattern: late heavy meals, higher sugar/refined intake, heavier cooking. Simplifying meals 24–48h often reduces load quickly.';

                  const getBorderColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#F8B10F';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  const getScoreColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#F8B10F';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  return (
                    <div className="mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] bg-[#FFFFFF] rounded-[10px]"
                         style={{ borderLeftColor: getBorderColor(flag, tier) }}>
                      <div className="flex justify-between">
                        <div className="flex flex-col gap-[5px] justify-start">
                          <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                          {signal.signal || 'Metabolic Load'}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              {zoneLabel}
                            </span>
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              tier: {tier}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[18px] leading-[110%] tracking-[-2px]"
                              style={{ color: getScoreColor(flag, tier) }}>
                          {score}
                        </span>
                      </div>

                      <div className="mt-[15px] py-[5px]">
                        <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                          {thresholdRule}
                        </p>
                      </div>

                      <div className="mt-3">
                        <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                          {interpretation}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Recovery Activity */}
                {(() => {
                  const signal = getSecondSignal(ethanolSignals);
                  const score = signal.score || 71.1;
                  const tier = signal.tier || 'mid';
                  const zoneLabel = signal.zone_label || 'Low stability';
                  const flag = signal.flag || 'low_limiter';
                  const thresholdRule = signal.threshold_rule || '≤20 ideal / 21–30 mid / 30 limiter';
                  const interpretation = signal.trainer_interpretation || 'Stability low (70). Reflects irregular meal windows, late heavy meals, inconsistent hydration. A structured day usually improves this quickly.';

                  const getBorderColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#3FAF58';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  const getScoreColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#3FAF58';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  return (
                    <div className="mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] bg-[#FFFFFF] rounded-[10px]"
                         style={{ borderLeftColor: getBorderColor(flag, tier) }}>
                      <div className="flex justify-between">
                        <div className="flex flex-col gap-[5px] justify-start">
                          <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                          {signal.signal || 'Recovery Activity'}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              {zoneLabel}
                            </span>
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              tier: {tier}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[18px] leading-[110%] tracking-[-2px]"
                              style={{ color: getScoreColor(flag, tier) }}>
                          {score}
                        </span>
                      </div>

                      <div className="mt-[15px] py-[5px]">
                        <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                          {thresholdRule}
                        </p>
                      </div>

                      <div className="mt-3">
                        <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                          {interpretation}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Hydrogen Column - Digestive Balance Trends */}
            <div className="px-[15px] py-[15px] bg-[#F5F7FA] rounded-[15px] border border-[#E1E6ED]">
              <div className="flex flex-col gap-1 justify-start pt-[15px] pl-[5px] pr-[13px]">
                <span className="text-[#252525] font-semibold text-[15px] leading-[100%] tracking-[-2%]">
                Hydrogen
                </span>
                <span className="text-[#535359] text-[12px] leading-[110%] tracking-[-2%]">
                Digestive Balance trends
                </span>
              </div>

              <div className="flex flex-col gap-[15px]">
                {/* Nutrient Utilization */}
                {(() => {
                  const signal = getFirstSignal(hydrogenSignals);
                  const score = signal.score || 71.1;
                  const tier = signal.tier || 'mid';
                  const zoneLabel = signal.zone_label || 'Low absorption';
                  const flag = signal.flag || 'low_limiter';
                  const thresholdRule = signal.threshold_rule || '≥80 strong / 70–79 mid / 70 low';
                  const interpretation = signal.trainer_interpretation || 'Load high (30). Common pattern: late heavy meals, higher sugar/refined intake, heavier cooking. Simplifying meals 24–48h often reduces load quickly.';

                  const getBorderColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#3FAF58';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  const getScoreColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#3FAF58';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  // Determine if we should show the "Limiter" badge
                  const showLimiterBadge = flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter';

                  return (
                    <div className="mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] bg-[#FFFFFF] rounded-[10px]"
                         style={{ borderLeftColor: getBorderColor(flag, tier) }}>
                      <div className="flex justify-between">
                        <div className="flex flex-col gap-[5px] justify-start">
                          <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                          {signal.signal || 'Nutrient Utilization'}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              {zoneLabel}
                            </span>
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              tier: {tier}
                            </span>
                          </div>
                        </div>
                        
                        {showLimiterBadge && (
                          <div className="flex items-center px-2.5 py-0.5 rounded-[20px] bg-[#DA5747]">
                            <span className="text-[#FFFFFF] text-[10px] font-semibold leading-[110%] tracking-[-0.2px]">Limiter</span>
                          </div>
                        )}
                        {!showLimiterBadge && (
                          <span className="font-semibold text-[18px] leading-[110%] tracking-[-2px]"
                                style={{ color: getScoreColor(flag, tier) }}>
                            {score}
                          </span>
                        )}
                      </div>

                      <div className="mt-[15px] py-[5px]">
                        <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                          {thresholdRule}
                        </p>
                      </div>

                      <div className="mt-3">
                        <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                          {interpretation}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Digestive Activity */}
                {(() => {
                  const signal = getSecondSignal(hydrogenSignals);
                  const score = signal.score || 71.1;
                  const tier = signal.tier || 'mid';
                  const zoneLabel = signal.zone_label || 'High fermentation';
                  const flag = signal.flag || 'high_limiter';
                  const thresholdRule = signal.threshold_rule || '≤20 ideal / 21–30 mid / 30 limiter';
                  const interpretation = signal.trainer_interpretation || 'Stability low (70). Reflects irregular meal windows, late heavy meals, inconsistent hydration. A structured day usually improves this quickly.';

                  const getBorderColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#3FAF58';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  const getScoreColor = (flag, tier) => {
                    if (flag === 'strong' || tier === 'best') return '#3FAF58';
                    if (flag === 'ideal' || tier === 'mid') return '#3FAF58';
                    if (flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter') return '#DA5747';
                    return '#F8B10F';
                  };

                  const showLimiterBadge = flag === 'high_limiter' || flag === 'low_limiter' || tier === 'limiter';

                  return (
                    <div className="mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] bg-[#FFFFFF] rounded-[10px]"
                         style={{ borderLeftColor: getBorderColor(flag, tier) }}>
                      <div className="flex justify-between">
                        <div className="flex flex-col gap-[5px] justify-start">
                          <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                          {signal.signal || 'Digestive Activity'}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              {zoneLabel}
                            </span>
                            <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                              tier: {tier}
                            </span>
                          </div>
                        </div>
                        {showLimiterBadge && (
                          <div className="flex items-center px-2.5 py-0.5 rounded-[20px] bg-[#DA5747]">
                            <span className="text-[#FFFFFF] text-[10px] font-semibold leading-[110%] tracking-[-0.2px]">Limiter</span>
                          </div>
                        )}
                        {!showLimiterBadge && (
                          <span className="font-semibold text-[18px] leading-[110%] tracking-[-2px]"
                                style={{ color: getScoreColor(flag, tier) }}>
                            {score}
                          </span>
                        )}
                      </div>

                      <div className="mt-[15px] py-[5px]">
                        <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                          {thresholdRule}
                        </p>
                      </div>

                      <div className="mt-3">
                        <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                          {interpretation}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}