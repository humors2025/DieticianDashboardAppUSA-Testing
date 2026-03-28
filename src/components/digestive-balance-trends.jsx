"use client";

import Image from "next/image";

function SegmentedProgressBar({
    value = 85,
    totalSegments = 55,
    labels = [0, 60, 80, 100],

    // ✅ treat as weights (ratio only), NOT px width
    segmentWeights = [80, 82, 172],

    filledColor = "#FFBF2D",
    emptyColor = "#E1E6ED",
}) {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

    const totalWeight = segmentWeights.reduce((a, b) => a + b, 0);

    // label positions in % based on cumulative weights
    const labelLeftPct = [0];
    for (let i = 0; i < segmentWeights.length; i++) {
        labelLeftPct.push(labelLeftPct[i] + (segmentWeights[i] / totalWeight) * 100);
    }

    // distribute totalSegments across zones by weight proportion
    const zoneSegments = (() => {
        const raw = segmentWeights.map((w) => (w / totalWeight) * totalSegments);
        const base = raw.map((x) => Math.floor(x));
        let used = base.reduce((a, b) => a + b, 0);

        // allocate remaining segments to largest fractional parts
        const fracOrder = raw
            .map((x, i) => ({ i, frac: x - Math.floor(x) }))
            .sort((a, b) => b.frac - a.frac);

        let idx = 0;
        while (used < totalSegments) {
            base[fracOrder[idx % fracOrder.length].i] += 1;
            used += 1;
            idx += 1;
        }
        return base; // [zone0, zone1, zone2]
    })();

    // ranges matching labels [0,60,80,100]
    const ranges = [
        { from: 0, to: 60, weight: segmentWeights[0], segs: zoneSegments[0] },
        { from: 60, to: 80, weight: segmentWeights[1], segs: zoneSegments[1] },
        { from: 80, to: 100, weight: segmentWeights[2], segs: zoneSegments[2] },
    ];

    // filled segments per zone
    const filledByRange = ranges.map((r) => {
        const overlap = Math.max(0, Math.min(safeValue, r.to) - r.from);
        const span = r.to - r.from;
        return Math.round((overlap / span) * r.segs);
    });

    return (
        <div className="w-full">
            {/* ✅ top labels (responsive) */}
            <div className="relative h-4 mb-[6px] w-full">
                {labels.map((lab, index) => {
                    let alignment = "-translate-x-1/2";
                    if (index === 0) alignment = "translate-x-0";
                    if (index === labels.length - 1) alignment = "-translate-x-full";

                    return (
                        <span
                            key={lab}
                            className={`absolute text-[8px] font-normal text-[#535359] leading-[110%] tracking-[-0.16px] ${alignment}`}
                            style={{ left: `${labelLeftPct[index]}%` }}
                        >
                            {lab}
                        </span>
                    );
                })}
            </div>

            {/* ✅ segmented bar (stretches full width) */}
            <div className="flex items-center gap-[3px] w-full">
                {ranges.map((r, ri) => (
                    <div
                        key={ri}
                        className="flex gap-[3px] items-center"
                        style={{ width: `${(r.weight / totalWeight) * 100}%` }}
                    >
                        {Array.from({ length: r.segs }).map((_, si) => {
                            const isFilled = si < filledByRange[ri];
                            return (
                                <div
                                    key={si}
                                    className="flex-1 h-[40px] "
                                    style={{
                                        backgroundColor: isFilled ? filledColor : emptyColor,
                                    }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}


export default function DigestiveBalanceTrends() {
    const value = 88; // <-- set from API
    const status = "Optimal"; // <-- set from API

    return (
        <>


            <div className="flex gap-[97px] ">
                <div className="flex flex-col gap-[25px] w-full">
                    <div className="flex flex-col gap-2.5">
                        <div className="flex gap-[5px] items-center">
                            <p className="text-[#252525] text-[12px] font-normal leading-[110%] tracking-[-0.24px] whitespace-nowrap">
                                Nutrient Utilization Trend
                            </p>
                            <Image
                                src="/icons/hugeicons_information-circle1.svg"
                                alt="info"
                                width={20}
                                height={20}
                            />
                        </div>

                        <div className="w-[100px] flex items-center px-[25px] py-1.5 rounded-[24px] bg-[#3FAF58]">
                            <p className="text-[#FFFFFF] text-[12px] font-semibold leading-normal tracking-[-0.24px]">
                                Optimal</p>
                        </div>
                    </div>


                    <SegmentedProgressBar
                        value={value}
                        totalSegments={55}
                        labels={[0, 60, 80, 100]}
                        segmentWeights={[80, 82, 172]} // ✅ ratio only
                    />

                    <div className="flex flex-col gap-4 items-baseline">
                        <div className="flex items-baseline gap-[4px]">
                            <p className="text-[#252525] text-[72px] font-normal leading-none tracking-[-1.44px]">
                                {value}
                            </p>

                            <p className="text-[#252525] text-[20px] font-semibold leading-none tracking-[-0.4px] pr-[13px]">
                                %
                            </p>
                        </div>


                        <p className="text-[#738298] text-[12px] font-normal leading-[130%] tracking-[-0.24px]">Utilization</p>
                    </div>
                </div>


                <div className="flex flex-col gap-[25px] w-full">
                    <div className="flex flex-col gap-2.5">
                        <div className="flex gap-[5px] items-center">
                            <p className="text-[#252525] text-[12px] font-normal leading-[110%] tracking-[-0.24px] whitespace-nowrap">
                                Digestive Activity Trend
                            </p>
                            <Image
                                src="/icons/hugeicons_information-circle1.svg"
                                alt="info"
                                width={20}
                                height={20}
                            />
                        </div>

                        <div className="w-[100px] flex justify-center px-[25px] py-1.5 rounded-[24px] bg-[#E48326]">
                            <p className="text-[#FFFFFF] text-[12px] font-semibold leading-normal tracking-[-0.24px]">Focus</p>
                        </div>
                    </div>


                    <SegmentedProgressBar
                        value={value}
                        totalSegments={55}
                        labels={[0, 60, 80, 100]}
                        segmentWeights={[80, 82, 172]}
                        filledColor="#E48326"
                    />

                    <div className="flex flex-col gap-4 items-baseline">
                        <div className="flex items-baseline gap-[4px]">
                            <p className="text-[#252525] text-[72px] font-normal leading-none tracking-[-1.44px]">
                                {value}
                            </p>

                            <p className="text-[#252525] text-[20px] font-semibold leading-none tracking-[-0.4px] pr-[13px]">
                                %
                            </p>
                        </div>


                        <p className="text-[#738298] text-[12px] font-normal leading-[130%] tracking-[-0.24px]">Fermentation (Focus)</p>
                    </div>
                </div>

            </div>

        </>
    )
}