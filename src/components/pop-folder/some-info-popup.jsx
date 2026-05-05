"use client"
import { useSelector } from "react-redux";

export default function SomeInfoPopup({ onClose, type }) {
  const clientIndividualProfile = useSelector(
    (state) => state.clientIndividualProfile.data
  );



  // Fix: Access the correct path - data is nested inside clientIndividualProfile
  const metabolismSignals = clientIndividualProfile?.data?.raw_json?.trainer_direction_elite?.why_todays_plan?.metabolism_signals_by_marker;
  


  // Helper function to get signal data by signal name
  const getSignalData = (signalName) => {
    if (!metabolismSignals) return null;
    
    // Search through all marker categories (hydrogen, ethanol, acetone)
    for (const marker in metabolismSignals) {
      const signal = metabolismSignals[marker]?.find(
        s => s.signal === signalName
      );
      if (signal) return signal;
    }
    return null;
  };


  const nutrientSignal = getSignalData("Nutrient Utilization");
  const digestiveSignal = getSignalData("Digestive Activity");
  const fuelSignal = getSignalData("Fuel Utilization");

  const energySignal = getSignalData("Energy Source");

  const metabolicSignal = getSignalData("Metabolic Load");
  const recoverySignal = getSignalData("Recovery Activity");



  // Fallback function to get tier text
  const getTierText = (tier) => {
    if (!tier) return "mid";
    return tier.replace(/_/g, ' ');
  };

  // Fallback function to get flag text
  const getFlagText = (flag) => {
    if (!flag) return "Limiter";
    return flag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div
      className="bg-white rounded-[12px] shadow-lg relative max-w-[90vw] max-h-[90vh] overflow-auto p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-[18px] font-normal text-[#252525] z-10 cursor-pointer hover:opacity-70 transition-opacity"
        type="button"
      >
        X
      </button>

      <div>
        {type === "nutrient" && (
          <div className="mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] border-[#DA5747] bg-[#FFFFFF] rounded-[10px]">
            <div className="flex justify-between">
              <div className="flex flex-col gap-[5px] justify-start">
                <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                  Nutrient Utilization
                </span>
                <div className="flex gap-2">
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    {nutrientSignal?.zone_label ??  "NA"}
                  </span>
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    tier: {getTierText(nutrientSignal?.tier)}
                  </span>
                </div>
              </div>
              
              <div className="px-2.5 py-0.5 rounded-[20px] bg-[#DA5747]">
                <span className="text-[#FFFFFF] text-[10px] font-semibold leading-[110%] tracking-[-0.2px]">
                  {getFlagText(nutrientSignal?.flag)}
                </span>
              </div>
            </div>

            <div className="mt-[15px] py-[5px]">
              <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                {nutrientSignal?.threshold_rule ??  "NA"}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                {nutrientSignal?.trainer_interpretation ??  "NA"}
              </p>
            </div>
          </div>
        )}

        {type === "digestive" && (
          <div className="mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] border-[#DA5747] bg-[#FFFFFF] rounded-[10px]">
            <div className="flex justify-between">
              <div className="flex flex-col gap-[5px] justify-start">
                <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                  Digestive Activity
                </span>
                <div className="flex gap-2">
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    {digestiveSignal?.zone_label ??  "NA"}
                  </span>
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    tier: {getTierText(digestiveSignal?.tier)}
                  </span>
                </div>
              </div>
              <div className="px-2.5 py-0.5 rounded-[20px] bg-[#DA5747]">
                <span className="text-[#FFFFFF] text-[10px] font-semibold leading-[110%] tracking-[-0.2px]">
                  {getFlagText(digestiveSignal?.flag)}
                </span>
              </div>
            </div>

            <div className="mt-[15px] py-[5px]">
              <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                {digestiveSignal?.threshold_rule ??  "NA"}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                {digestiveSignal?.trainer_interpretation ??  "NA"}
              </p>
            </div>
          </div>
        )}

        {type === "fuel" && (
          <div className="mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] border-[#3FAF58] bg-[#FFFFFF] rounded-[10px]">
            <div className="flex justify-between">
              <div className="flex flex-col gap-[5px] justify-start">
                <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                  Fuel Utilization
                </span>
                <div className="flex gap-2">
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    {fuelSignal?.zone_label ??  "NA"}
                  </span>
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    tier: {getTierText(fuelSignal?.tier)}
                  </span>
                </div>
              </div>
              <span className="text-[#3FAF58] font-semibold text-[18px] leading-[110%] tracking-[-2px]">
                {fuelSignal?.score ??  "NA"}
              </span>
            </div>

            <div className="mt-[15px] py-[5px]">
              <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                {fuelSignal?.threshold_rule ??  "NA"}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                {fuelSignal?.trainer_interpretation ??  "NA"}
              </p>
            </div>
          </div>
        )}

        {type === "energy" && (
          <div className="mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] border-[#3FAF58] bg-[#FFFFFF] rounded-[10px]">
            <div className="flex justify-between">
              <div className="flex flex-col gap-[5px] justify-start">
                <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                  Energy Source
                </span>
                <div className="flex gap-2">
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    {energySignal?.zone_label ??  "NA"}
                  </span>
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    tier: {getTierText(energySignal?.tier)}
                  </span>
                </div>
              </div>
              <span className="text-[#3FAF58] font-semibold text-[18px] leading-[110%] tracking-[-2px]">
                {energySignal?.score ??  "NA"}
              </span>
            </div>

            <div className="mt-[15px] py-[5px]">
              <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                {energySignal?.threshold_rule ??  "NA"}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                {energySignal?.trainer_interpretation ??  "NA"}
              </p>
            </div>
          </div>
        )}

        {type === "metabolic" && (
          <div className="mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] border-[#F8B10F] bg-[#FFFFFF] rounded-[10px]">
            <div className="flex justify-between">
              <div className="flex flex-col gap-[5px] justify-start">
                <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                  Metabolic Load
                </span>
                <div className="flex gap-2">
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    {metabolicSignal?.zone_label ??  "NA"}
                  </span>
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    tier: {getTierText(metabolicSignal?.tier)}
                  </span>
                </div>
              </div>
              <span className="text-[#F8B10F] font-semibold text-[18px] leading-[110%] tracking-[-2px]">
                {metabolicSignal?.score ??  "NA"}
              </span>
            </div>

            <div className="mt-[15px] py-[5px]">
              <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                {metabolicSignal?.threshold_rule ??  "NA"}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                {metabolicSignal?.trainer_interpretation ??  "NA"}
              </p>
            </div>
          </div>
        )}

        {type === "recovery" && (
          <div className="mt-5 pl-5 pr-[13px] pt-[14px] pb-[37px] border-l-[3px] border-[#F8B10F] bg-[#FFFFFF] rounded-[10px]">
            <div className="flex justify-between">
              <div className="flex flex-col gap-[5px] justify-start">
                <span className="text-[#252525] font-semibold text-[12px] leading-[100%] tracking-[-2%]">
                  Recovery Activity
                </span>
                <div className="flex gap-2">
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    {recoverySignal?.zone_label ??  "NA"}
                  </span>
                  <span className="text-[#535359] text-[10px] leading-[110%] tracking-[-2%] capitalize">
                    tier: {getTierText(recoverySignal?.tier)}
                  </span>
                </div>
              </div>
              <span className="text-[#3FAF58] font-semibold text-[18px] leading-[110%] tracking-[-2px]">
                {recoverySignal?.score ??  "NA"}
              </span>
            </div>

            <div className="mt-[15px] py-[5px]">
              <p className="text-[#738298] text-[9px] font-normal leading-[110%] tracking-[-0.18px]">
                {recoverySignal?.threshold_rule ??  "NA"}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-[#738298] text-[11px] font-normal leading-[130%]">
                {recoverySignal?.trainer_interpretation ?? "NA"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}