import { useState } from "react";
import { Ruler, Droplet } from "lucide-react";
import ByAreaTab from "@/components/ByAreaTab";
import ByVolumeTab from "@/components/ByVolumeTab";

const TABS = [
  { key: "area", label: "By Area" },
  { key: "volume", label: "By Volume" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("area");

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/futura-condensed-pt');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;700&display=swap');
      `}</style>
      {/* Header */}
      <div className="px-5 pt-8 pb-0 max-w-lg mx-auto">
        <img 
          src="http://craftbar.ph/CORE100-01.png" 
          alt="Logo" 
          className="w-full mb-6"
        />
        <h1 
          className="text-neutral-900 text-center"
          style={{ 
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: '700',
            letterSpacing: '-0.5pt',
            fontSize: '28pt',
            whiteSpace: 'nowrap'
          }}
        >
          Coverage Calculator
        </h1>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-0 pb-2 max-w-lg mx-auto">
        <div className="flex bg-white rounded-xl p-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tab.key
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
              style={{ fontSize: '14pt', fontFamily: "'Montserrat', sans-serif", fontWeight: 'bold' }}
            >
              {tab.key === "area" && <Ruler className="h-5 w-5" />}
              {tab.key === "volume" && <Droplet className="h-5 w-5" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-5 py-4 pb-12 max-w-lg mx-auto">
        {activeTab === "area" ? <ByAreaTab /> : <ByVolumeTab />}
      </div>
    </div>
  );
}