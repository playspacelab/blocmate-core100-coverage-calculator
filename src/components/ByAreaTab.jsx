import { useState, useMemo } from "react";
import { Plus, Minus, Flame } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// ── Constants ──
const COVERAGE_RATE = 6; // m² per liter per coat
const GALLONS_PER_LITER = 3.78541;
const SKUS = [
  { label: "22L", liters: 22 },
  { label: "4.5L", liters: 4.5 },
  { label: "1L", liters: 1 },
];

export default function ByAreaTab() {
  const [area, setArea] = useState(10);
  const [coats, setCoats] = useState(1);
  const [buffer, setBuffer] = useState(0);

  // ── Core calculations ──
  const calc = useMemo(() => {
    const litersRaw = (area * coats) / COVERAGE_RATE;
    const litersNeeded = litersRaw * (1 + buffer / 100);
    const gallonsNeeded = litersNeeded / GALLONS_PER_LITER;

    // Single-SKU estimates
    const skuEstimates = SKUS.map((sku) => {
      const units = Math.ceil(litersNeeded / sku.liters);
      const totalLiters = units * sku.liters;
      const leftover = totalLiters - litersNeeded;
      return { ...sku, units, totalLiters, leftover };
    });

    // ── Recommendation logic ──
    // Determine preferred SKU based on area size
    let preferredLabel;
    if (area <= 6) preferredLabel = "1L";
    else if (area <= 25) preferredLabel = "4.5L";
    else if (area >= 100) preferredLabel = "22L";
    else preferredLabel = "4.5L"; // 26–99 m²

    const preferred = skuEstimates.find((s) => s.label === preferredLabel);
    const minUnits = Math.min(...skuEstimates.map((s) => s.units));
    const minUnitSku = skuEstimates
      .filter((s) => s.units === minUnits)
      .sort((a, b) => b.liters - a.liters)[0]; // tie → prefer larger

    // If preferred requires >1 extra container vs minimum, switch
    let recommended;
    if (preferred.units > minUnitSku.units + 1) {
      recommended = minUnitSku;
    } else {
      recommended = preferred;
    }

    return {
      litersNeeded: litersNeeded.toFixed(1),
      gallonsNeeded: gallonsNeeded.toFixed(2),
      skuEstimates,
      recommended,
    };
  }, [area, coats, buffer]);

  const adjustArea = (delta) => {
    setArea((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="space-y-5">
      {/* ── Area Input ── */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-3 block">
          Area
        </label>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => adjustArea(-1)}
            className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Minus className="h-5 w-5 text-neutral-600" />
          </button>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              min={1}
              value={area}
              onChange={(e) => setArea(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-5xl font-light text-center w-24 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-lg text-neutral-400 font-medium">m²</span>
          </div>
          <button
            onClick={() => adjustArea(1)}
            className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="h-5 w-5 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* ── Coats & Buffer ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-3 block">
            Coats
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map((c) => (
              <button
                key={c}
                onClick={() => setCoats(c)}
                className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-all ${
                  coats === c
                    ? "bg-neutral-900 text-white shadow-md"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-2 block">
            Buffer
          </label>
          <div className="text-2xl font-light text-center mb-2">{buffer}%</div>
          <Slider
            value={[buffer]}
            onValueChange={([v]) => setBuffer(v)}
            max={20}
            min={0}
            step={1}
            className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-neutral-900 [&_[role=slider]]:border-0"
          />
        </div>
      </div>

      {/* ── Recommended SKU (Hero Card) ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-6 shadow-[0_2px_12px_rgba(217,119,6,0.08)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold tracking-widest uppercase text-amber-700">
              Recommended
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-light text-neutral-900">
              {calc.recommended.units}
            </span>
            <span className="text-2xl text-neutral-500 font-light">×</span>
            <span className="text-3xl font-medium text-neutral-900">
              {calc.recommended.label}
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-sm text-neutral-600">
              Total Provided:{" "}
              <span className="font-semibold text-neutral-800">
                {calc.recommended.totalLiters.toFixed(1)} L
              </span>
            </p>
            <p className="text-sm text-neutral-600">
              Estimated Leftover:{" "}
              <span className="font-semibold text-neutral-800">
                {calc.recommended.leftover.toFixed(1)} L
              </span>
            </p>
          </div>
          <p className="mt-4 text-xs text-amber-700/70 leading-relaxed">
            Recommendation is based on project size and optimal container quantity.
          </p>
        </div>
      </div>

      {/* ── Volume Needed ── */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-2">
          You'll Need Approximately
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-light text-neutral-900">
            {calc.litersNeeded} L
          </span>
          <span className="text-lg text-neutral-400">
            ({calc.gallonsNeeded} gal)
          </span>
        </div>
      </div>

      {/* ── All SKU Options ── */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-4">
          All Container Options
        </p>
        <div className="space-y-3">
          {calc.skuEstimates.map((sku) => {
            const isRec = sku.label === calc.recommended.label;
            return (
              <div
                key={sku.label}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  isRec ? "bg-amber-50 border border-amber-200/50" : "bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isRec
                        ? "bg-amber-100 text-amber-700"
                        : "bg-neutral-200/70 text-neutral-600"
                    }`}
                  >
                    {sku.label}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">
                      {sku.units} {sku.units === 1 ? "unit" : "units"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Total {sku.totalLiters.toFixed(1)} L
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-400">Leftover</p>
                  <p className="text-sm font-medium text-neutral-600">
                    {sku.leftover.toFixed(1)} L
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}