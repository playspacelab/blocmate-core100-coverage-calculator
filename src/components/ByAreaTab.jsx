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
    const areaValue = parseInt(area) || 1;
    const litersRaw = (areaValue * coats) / COVERAGE_RATE;
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
    // Filter out SKUs that meet the minimum liters needed
    // Also exclude SKUs with too many units (impractical)
    const viableSkus = skuEstimates.filter(s => {
      if (s.totalLiters < litersNeeded) return false;
      // Don't recommend 1L if 7+ units needed (7L+)
      if (s.liters === 1 && s.units >= 7) return false;
      // Don't recommend 4.5L if 9+ units needed (40.5L+)
      if (s.liters === 4.5 && s.units >= 9) return false;
      return true;
    });

    // Sort viable SKUs to minimize leftover
    const sortedViableSkus = [...viableSkus].sort((a, b) => {
      // Priority 1: Less leftover
      if (a.leftover !== b.leftover) {
        return a.leftover - b.leftover;
      }
      // Priority 2: Fewer units
      if (a.units !== b.units) {
        return a.units - b.units;
      }
      // Priority 3: Larger container size
      return b.liters - a.liters;
    });

    const recommended = sortedViableSkus[0] || skuEstimates[0];

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
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
        <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4 block">
          Area
        </label>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => adjustArea(-1)}
            className="h-12 w-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:shadow-md active:scale-95 transition-all"
          >
            <Minus className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              min={1}
              value={area}
              onChange={(e) => setArea(e.target.value)}
              onBlur={(e) => {
                if (e.target.value === '' || parseInt(e.target.value) < 1) {
                  setArea(1);
                }
              }}
              className="text-6xl font-light text-center w-44 bg-transparent outline-none text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-lg text-gray-500 font-medium">m²</span>
          </div>
          <button
            onClick={() => adjustArea(1)}
            className="h-12 w-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:shadow-md active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* ── Coats & Buffer ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-lg border border-gray-100">
          <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3 block">
            Coats
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map((c) => (
              <button
                key={c}
                onClick={() => setCoats(c)}
                className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-all ${
                  coats === c
                    ? "bg-neutral-900 shadow-lg"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
                style={coats === c ? { color: '#ffda00' } : {}}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-lg border border-gray-100">
          <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2 block">
            Buffer
          </label>
          <div className="text-2xl font-light text-center mb-2 text-gray-900">{buffer}%</div>
          <Slider
            value={[buffer]}
            onValueChange={([v]) => setBuffer(v)}
            max={20}
            min={0}
            step={1}
            className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-neutral-900 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-md"
          />
        </div>
      </div>

      {/* ── Volume Needed ── */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">
          You'll Need Approximately
        </p>
        <div className="flex items-baseline gap-2 justify-center">
          <span className="text-4xl font-bold text-gray-900">
            {calc.litersNeeded} L
          </span>
          <span className="text-lg text-gray-500">
            ({calc.gallonsNeeded} gal)
          </span>
        </div>
      </div>

      {/* ── Recommended SKU (Hero Card) ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 border border-red-100 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-200/20 to-orange-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-5 justify-center">
            <Flame className="h-5 w-5 text-red-600" />
            <span className="text-xs font-bold tracking-widest uppercase text-red-700">
              Recommended
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl p-4 text-center shadow-lg" style={{ backgroundColor: '#DC3949' }}>
              <p className="text-xs font-semibold tracking-widest uppercase text-red-100 mb-3">
                SKU
              </p>
              <div className="text-3xl font-bold text-white">
                {calc.recommended.label}
              </div>
            </div>

            <div className="rounded-xl p-4 text-center shadow-lg" style={{ backgroundColor: '#DC3949' }}>
              <p className="text-xs font-semibold tracking-widest uppercase text-red-100 mb-3">
                Quantity
              </p>
              <div className="text-3xl font-bold text-white">
                {calc.recommended.units}
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 space-y-2 text-center">
            <p className="text-sm text-gray-700">
              Total Product Volume:{" "}
              <span className="font-bold text-gray-900">
                {calc.recommended.totalLiters.toFixed(1)} L
              </span>
            </p>
            <p className="text-sm text-gray-700">
              Estimated Excess Volume:{" "}
              <span className="font-bold text-gray-900">
                {calc.recommended.leftover.toFixed(1)} L
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── All SKU Options ── */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-lg border border-gray-100">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">
          All Container Options
        </p>
        <div className="space-y-3">
          {calc.skuEstimates.map((sku) => {
            const isRec = sku.label === calc.recommended.label;
            return (
              <div
                key={sku.label}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  isRec 
                    ? "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 shadow-md" 
                    : "bg-white border border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${
                      isRec
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {sku.label}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {sku.units} {sku.units === 1 ? "unit" : "units"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Total {sku.totalLiters.toFixed(1)} L
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium">Leftover</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {sku.leftover.toFixed(1)} L
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Coverage Note ── */}
      <p className="text-xs text-gray-500 leading-relaxed px-2">
        Coverage rates per coat are approximate and based on smooth, horizontal surfaces. Actual coverage will vary depending on the condition and absorbency of the concrete. These figures are intended for estimation purposes only. For optimal performance, up to three (3) coats may be applied.
      </p>
    </div>
  );
}