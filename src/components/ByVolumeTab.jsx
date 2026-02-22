import { useState, useMemo } from "react";
import { Plus, Minus } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// ── Constants ──
const COVERAGE_RATE = 6; // m² per liter per coat
const GALLONS_PER_LITER = 3.78541;
const SKUS = [
  { label: "22L", liters: 22 },
  { label: "4.5L", liters: 4.5 },
  { label: "1L", liters: 1 },
];

export default function ByVolumeTab() {
  const [selectedSku, setSelectedSku] = useState(0); // index into SKUS
  const [units, setUnits] = useState(1);
  const [coats, setCoats] = useState(1);

  const calc = useMemo(() => {
    const sku = SKUS[selectedSku];
    const unitsValue = parseInt(units) || 1;
    const totalLiters = sku.liters * unitsValue;
    const gallonsTotal = totalLiters / GALLONS_PER_LITER;
    const coverageRaw = totalLiters * COVERAGE_RATE;
    const coverageFinal = coverageRaw / coats;

    return {
      totalLiters,
      gallonsTotal: gallonsTotal.toFixed(2),
      coverageFinal: coverageFinal.toFixed(1),
      skuLabel: sku.label,
    };
  }, [selectedSku, units, coats]);

  return (
    <div className="space-y-5">
      {/* ── SKU Selector ── */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3 block text-center" style={{ fontFamily: "'Antenna Medium', sans-serif" }}>
          Container Size
        </label>
        <div className="flex gap-2">
          {SKUS.map((sku, i) => (
            <button
              key={sku.label}
              onClick={() => setSelectedSku(i)}
              className={`flex-1 h-14 rounded-xl text-base font-semibold transition-all ${
                selectedSku === i
                  ? "bg-neutral-900 text-white shadow-md"
                  : "bg-neutral-100 text-gray-500 hover:bg-neutral-200"
              }`}
              style={{ fontFamily: "'Antenna Medium', sans-serif" }}
            >
              {sku.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Units Input ── */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3 block text-center" style={{ fontFamily: "'Antenna Medium', sans-serif" }}>
          Number of Containers
        </label>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setUnits((prev) => Math.max(1, prev - 1))}
            className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Minus className="h-5 w-5 text-gray-500" />
          </button>
          <input
            type="number"
            min={1}
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            onBlur={(e) => {
              if (e.target.value === '' || parseInt(e.target.value) < 1) {
                setUnits(1);
              }
            }}
            className="text-6xl font-light text-center w-44 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => setUnits((prev) => prev + 1)}
            className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ── Coats ── */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3 block text-center" style={{ fontFamily: "'Antenna Medium', sans-serif" }}>
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
                  : "bg-neutral-100 text-gray-500 hover:bg-neutral-200"
              }`}
              style={{ fontFamily: "'Antenna Medium', sans-serif" }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2 text-center" style={{ fontFamily: "'Antenna Medium', sans-serif" }}>
            Total Volume
          </p>
          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-4xl font-bold text-neutral-900">
              {calc.totalLiters} L
            </span>
            <span className="text-lg text-gray-500">
              ({calc.gallonsTotal} gal)
            </span>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2 text-center" style={{ fontFamily: "'Antenna Medium', sans-serif" }}>
            Approx Coverage
          </p>
          <div className="flex items-baseline gap-1 justify-center">
            <span className="text-5xl font-bold text-neutral-900">
              {calc.coverageFinal}
            </span>
            <span className="text-xl text-gray-500 font-medium">m²</span>
          </div>
        </div>

        <p className="mt-5 text-xs text-gray-500 leading-relaxed text-center" style={{ fontFamily: "'Antenna Medium', sans-serif" }}>
          Based on {coats} coat{coats > 1 ? "s" : ""} at {COVERAGE_RATE} m² per
          liter per coat.
        </p>
      </div>

      {/* ── Coverage Note ── */}
      <p className="text-sm text-gray-500 leading-relaxed px-2" style={{ fontFamily: "'Antenna Medium', sans-serif" }}>
        Coverage rates per coat are approximate and based on smooth, horizontal surfaces. Actual coverage will vary depending on the condition and absorbency of the concrete. These figures are intended for estimation purposes only. For optimal performance, up to three (3) coats may be applied.
      </p>
    </div>
  );
}