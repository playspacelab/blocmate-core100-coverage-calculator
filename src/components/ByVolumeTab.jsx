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
  const [buffer, setBuffer] = useState(0);

  const calc = useMemo(() => {
    const sku = SKUS[selectedSku];
    const totalLiters = sku.liters * units;
    const gallonsTotal = totalLiters / GALLONS_PER_LITER;
    const coverageRaw = totalLiters * COVERAGE_RATE;
    const coverageAfterCoats = coverageRaw / coats;
    const coverageFinal = coverageAfterCoats * (1 - buffer / 100);

    return {
      totalLiters,
      gallonsTotal: gallonsTotal.toFixed(2),
      coverageFinal: coverageFinal.toFixed(1),
      skuLabel: sku.label,
    };
  }, [selectedSku, units, coats, buffer]);

  return (
    <div className="space-y-5">
      {/* ── SKU Selector ── */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-3 block">
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
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {sku.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Units Input ── */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-3 block">
          Number of Containers
        </label>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setUnits((prev) => Math.max(1, prev - 1))}
            className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Minus className="h-5 w-5 text-neutral-600" />
          </button>
          <input
            type="number"
            min={1}
            value={units}
            onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
            className="text-5xl font-light text-center w-20 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => setUnits((prev) => prev + 1)}
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

      {/* ── Results ── */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-2">
            Total Volume
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-light text-neutral-900">
              {calc.totalLiters} L
            </span>
            <span className="text-lg text-neutral-400">
              ({calc.gallonsTotal} gal)
            </span>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-2">
            Approx Coverage
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-light text-neutral-900">
              {calc.coverageFinal}
            </span>
            <span className="text-xl text-neutral-400 font-medium">m²</span>
          </div>
        </div>

        <p className="mt-5 text-xs text-neutral-400 leading-relaxed">
          Based on {coats} coat{coats > 1 ? "s" : ""} at {COVERAGE_RATE} m² per
          liter per coat.
        </p>
      </div>
    </div>
  );
}