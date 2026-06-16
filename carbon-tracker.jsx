import { useState, useEffect } from "react";

const CATEGORIES = [
  {
    id: "transport",
    label: "Transport",
    icon: "🚗",
    color: "#E07B39",
    actions: [
      { id: "car", label: "Car (km/day)", factor: 0.21, unit: "km" },
      { id: "bike", label: "Motorbike (km/day)", factor: 0.11, unit: "km" },
      { id: "flight", label: "Flights (hrs/month)", factor: 0.255, unit: "hrs" },
      { id: "bus", label: "Bus (km/day)", factor: 0.089, unit: "km" },
    ],
  },
  {
    id: "home",
    label: "Home Energy",
    icon: "🏠",
    color: "#3B82F6",
    actions: [
      { id: "electricity", label: "Electricity (kWh/month)", factor: 0.82, unit: "kWh" },
      { id: "lpg", label: "LPG/Gas (kg/month)", factor: 2.98, unit: "kg" },
      { id: "ac", label: "AC usage (hrs/day)", factor: 1.5, unit: "hrs" },
    ],
  },
  {
    id: "food",
    label: "Food & Diet",
    icon: "🍽️",
    color: "#10B981",
    actions: [
      { id: "meat", label: "Meat meals (per week)", factor: 3.3, unit: "meals" },
      { id: "dairy", label: "Dairy servings (per day)", factor: 0.6, unit: "servings" },
      { id: "waste", label: "Food waste (kg/week)", factor: 2.5, unit: "kg" },
    ],
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "🛍️",
    color: "#8B5CF6",
    actions: [
      { id: "clothes", label: "Clothing items (per month)", factor: 10, unit: "items" },
      { id: "electronics", label: "Electronics (per year)", factor: 70, unit: "items" },
      { id: "plastic", label: "Plastic bags (per week)", factor: 0.06, unit: "bags" },
    ],
  },
];

const TIPS = {
  transport: [
    "Switch to public transport or carpooling 3 days a week.",
    "Try cycling for trips under 5 km.",
    "Combine errands into one trip to cut fuel use.",
  ],
  home: [
    "Set AC to 24°C instead of 18°C — saves up to 20% energy.",
    "Switch to LED bulbs — they use 75% less energy.",
    "Unplug devices when not in use to cut phantom loads.",
  ],
  food: [
    "Try 2 meat-free days per week — saves ~600 kg CO₂/year.",
    "Buy local and seasonal produce to cut transport emissions.",
    "Plan meals to reduce food waste.",
  ],
  shopping: [
    "Buy second-hand before buying new.",
    "Carry a reusable bag — skip single-use plastic.",
    "Repair electronics instead of replacing them.",
  ],
};

const INDIA_AVG = 1.9; // tonnes CO2/year per person

function GaugeArc({ value, max }) {
  const pct = Math.min(value / max, 1);
  const angle = pct * 180;
  const r = 70;
  const cx = 90, cy = 90;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcX = (deg) => cx + r * Math.cos(toRad(180 + deg));
  const arcY = (deg) => cy + r * Math.sin(toRad(180 + deg));
  const needleX = cx + (r - 10) * Math.cos(toRad(180 + angle));
  const needleY = cy + (r - 10) * Math.sin(toRad(180 + angle));
  const color = pct < 0.4 ? "#10B981" : pct < 0.7 ? "#F59E0B" : "#EF4444";

  return (
    <svg viewBox="0 0 180 100" width="180" height="100">
      <path d={`M ${arcX(0)} ${arcY(0)} A ${r} ${r} 0 0 1 ${arcX(180)} ${arcY(180)}`}
        fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
      {angle > 0 && (
        <path d={`M ${arcX(0)} ${arcY(0)} A ${r} ${r} 0 0 1 ${arcX(angle)} ${arcY(angle)}`}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      )}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill="#1f2937" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="11" fill="#6b7280">CO₂/yr</text>
    </svg>
  );
}

export default function CarbonTracker() {
  const [inputs, setInputs] = useState({});
  const [activeTab, setActiveTab] = useState("transport");
  const [showTips, setShowTips] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getVal = (id) => parseFloat(inputs[id] || 0);

  const calcCategory = (cat) => {
    return cat.actions.reduce((sum, a) => {
      const v = getVal(a.id);
      let monthly = v;
      if (a.unit === "km" || a.unit === "hrs" || a.unit === "servings") monthly = v * 30;
      else if (a.unit === "meals" || a.unit === "bags") monthly = v * 4.3;
      else if (a.unit === "items" && a.id === "electronics") monthly = v / 12;
      return sum + monthly * a.factor;
    }, 0);
  };

  const totalMonthly = CATEGORIES.reduce((s, c) => s + calcCategory(c), 0);
  const totalAnnual = (totalMonthly * 12) / 1000; // kg → tonnes

  const activeCat = CATEGORIES.find((c) => c.id === activeTab);

  const handleChange = (id, val) => setInputs((p) => ({ ...p, [id]: val }));

  const topCategory = CATEGORIES.reduce((best, c) => {
    const v = calcCategory(c);
    return v > calcCategory(best) ? c : best;
  }, CATEGORIES[0]);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f0fdf4", minHeight: "100vh", padding: "0 0 40px 0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)", color: "#fff", padding: "28px 20px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "#6ee7b7", marginBottom: 6 }}>Hack2Skill · Challenge 3</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>🌿 CarbonSense</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#a7f3d0", opacity: 0.9 }}>
          Track. Understand. Reduce.
        </p>
      </div>

      {/* Score Card */}
      <div style={{ background: "#fff", margin: "0 16px", marginTop: -1, borderRadius: "0 0 20px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "20px 16px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 32 }}>
          <div>
            <GaugeArc value={totalAnnual} max={8} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: totalAnnual < 2 ? "#10B981" : totalAnnual < 4 ? "#F59E0B" : "#EF4444", lineHeight: 1 }}>
              {totalAnnual.toFixed(2)}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>tonnes CO₂/year</div>
            <div style={{ marginTop: 8, fontSize: 12, background: "#f0fdf4", borderRadius: 8, padding: "4px 10px", color: "#065f46", fontWeight: 600 }}>
              India avg: {INDIA_AVG}t/yr
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
          {CATEGORIES.map((c) => {
            const v = (calcCategory(c) * 12) / 1000;
            return (
              <div key={c.id} style={{ flex: 1, background: "#f9fafb", borderRadius: 10, padding: "8px 4px", textAlign: "center" }}>
                <div style={{ fontSize: 18 }}>{c.icon}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{c.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{v.toFixed(1)}t</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, margin: "20px 16px 0", background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setActiveTab(c.id)}
            style={{ flex: 1, padding: "12px 4px", border: "none", background: activeTab === c.id ? c.color : "transparent",
              color: activeTab === c.id ? "#fff" : "#6b7280", fontWeight: 700, fontSize: 11, cursor: "pointer",
              transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 18 }}>{c.icon}</span>
            <span>{c.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Input Panel */}
      <div style={{ background: "#fff", margin: "12px 16px 0", borderRadius: 16, padding: "20px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: activeCat.color, display: "flex", alignItems: "center", gap: 8 }}>
          <span>{activeCat.icon}</span> {activeCat.label}
        </h3>
        {activeCat.actions.map((a) => (
          <div key={a.id} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: 600 }}>
              {a.label}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="number" min="0" value={inputs[a.id] || ""}
                onChange={(e) => handleChange(a.id, e.target.value)}
                placeholder="0"
                style={{ flex: 1, padding: "10px 14px", border: `2px solid ${inputs[a.id] ? activeCat.color : "#e5e7eb"}`,
                  borderRadius: 10, fontSize: 15, outline: "none", fontWeight: 600,
                  background: inputs[a.id] ? `${activeCat.color}10` : "#fff" }} />
              <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 36 }}>{a.unit}</span>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 8, background: `${activeCat.color}15`, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>Category total</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: activeCat.color }}>
            {((calcCategory(activeCat) * 12) / 1000).toFixed(2)} t/yr
          </span>
        </div>
      </div>

      {/* Insights */}
      {totalAnnual > 0 && (
        <div style={{ margin: "12px 16px 0", borderRadius: 16, background: "#fff", padding: "18px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: "#1f2937" }}>📊 Personalized Insights</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: totalAnnual <= INDIA_AVG ? "#f0fdf4" : "#fef3c7", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: totalAnnual <= INDIA_AVG ? "#065f46" : "#92400e" }}>
                {totalAnnual <= INDIA_AVG ? "✅ Below India average!" : "⚠️ Above India average"}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                You emit {Math.abs(totalAnnual - INDIA_AVG).toFixed(2)}t {totalAnnual <= INDIA_AVG ? "less" : "more"} than the average Indian.
              </div>
            </div>
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af" }}>🔥 Biggest source: {topCategory.label} {topCategory.icon}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                Focus here for maximum impact — it's {(((calcCategory(topCategory) * 12) / 1000) / totalAnnual * 100).toFixed(0)}% of your footprint.
              </div>
            </div>
            <div style={{ background: "#fdf4ff", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#7e22ce" }}>🌍 Global context</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                The 1.5°C climate target requires &lt;2t/person/year. You're at {totalAnnual.toFixed(2)}t.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{ margin: "12px 16px 0" }}>
        <button onClick={() => setShowTips(!showTips)}
          style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #065f46, #047857)",
            color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {showTips ? "▲ Hide Tips" : "💡 Show Reduction Tips"}
        </button>
        {showTips && (
          <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", padding: "16px", boxShadow: "0 4px 10px rgba(0,0,0,0.06)" }}>
            {CATEGORIES.map((c) => (
              <div key={c.id} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: c.color, marginBottom: 6 }}>{c.icon} {c.label}</div>
                {TIPS[c.id].map((t, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 5, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#10b981", flexShrink: 0 }}>→</span> {t}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pledge */}
      <div style={{ margin: "16px 16px 0", background: "linear-gradient(135deg, #064e3b, #065f46)", borderRadius: 16, padding: "20px 16px", color: "#fff", textAlign: "center" }}>
        <div style={{ fontSize: 22, marginBottom: 8 }}>🌱</div>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Take the Green Pledge</div>
        <div style={{ fontSize: 12, color: "#a7f3d0", marginBottom: 14 }}>
          Commit to reducing your footprint by 10% this year
        </div>
        <button onClick={() => setSubmitted(!submitted)}
          style={{ background: submitted ? "#10B981" : "#fff", color: submitted ? "#fff" : "#065f46",
            border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          {submitted ? "✅ Pledged! Keep it up!" : "I Pledge to Go Greener"}
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#9ca3af" }}>
        Built for Hack2Skill Challenge 3 · CarbonSense
      </div>
    </div>
  );
}
