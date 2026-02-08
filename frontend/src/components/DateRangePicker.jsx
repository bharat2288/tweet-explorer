import { useState, useEffect } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const QUICK_OPTIONS = [
  { label: "Last Month", months: 1 },
  { label: "Last 3 Mo", months: 3 },
  { label: "Last Year", months: 12 },
  { label: "2024", fixed: ["2024-01-01", "2024-12-31"] },
  { label: "2023", fixed: ["2023-01-01", "2023-12-31"] },
  { label: "2022", fixed: ["2022-01-01", "2022-12-31"] },
];

export default function DateRangePicker({ startDate, endDate, onChange }) {
  const [showCustom, setShowCustom] = useState(false);
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");

  const applyQuick = (option) => {
    if (option.fixed) {
      onChange("start_date", option.fixed[0]);
      onChange("end_date", option.fixed[1]);
    } else {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - option.months);
      onChange("start_date", start.toISOString().split("T")[0]);
      onChange("end_date", end.toISOString().split("T")[0]);
    }
  };

  useEffect(() => {
    if (startMonth && startYear) {
      onChange("start_date", `${startYear}-${String(startMonth).padStart(2, "0")}-01`);
    }
    if (endMonth && endYear) {
      const lastDay = new Date(endYear, endMonth, 0).getDate();
      onChange("end_date", `${endYear}-${String(endMonth).padStart(2, "0")}-${lastDay}`);
    }
  }, [startMonth, startYear, endMonth, endYear]);

  const clearAll = () => {
    onChange("start_date", "");
    onChange("end_date", "");
    setStartMonth("");
    setStartYear("");
    setEndMonth("");
    setEndYear("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Quick select */}
      <div>
        <span className="label" style={{ display: "block", marginBottom: 6 }}>Quick Select</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          {QUICK_OPTIONS.map((opt, i) => (
            <button key={i} onClick={() => applyQuick(opt)} className="btn-secondary" style={{ fontSize: 11, padding: "4px 6px" }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom range toggle */}
      <button onClick={() => setShowCustom(!showCustom)} className="btn-ghost" style={{ fontSize: 12, textAlign: "left", padding: "4px 0" }}>
        {showCustom ? "\u25BC Hide custom range" : "\u25B6 Custom range"}
      </button>

      {showCustom && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Month/Year selectors */}
          {[
            { label: "From", month: startMonth, setMonth: setStartMonth, year: startYear, setYear: setStartYear },
            { label: "To", month: endMonth, setMonth: setEndMonth, year: endYear, setYear: setEndYear },
          ].map((row) => (
            <div key={row.label}>
              <span className="label" style={{ display: "block", marginBottom: 4 }}>{row.label}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <select value={row.month} onChange={(e) => row.setMonth(e.target.value)} className="input-base" style={{ flex: 1, fontSize: 13, padding: "4px 8px" }}>
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select value={row.year} onChange={(e) => row.setYear(e.target.value)} className="input-base" style={{ width: 80, fontSize: 13, padding: "4px 8px" }}>
                  <option value="">Year</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          ))}

          {/* Specific date inputs */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 10 }}>
            <span className="label" style={{ display: "block", marginBottom: 6 }}>Or Specific Dates</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <input type="date" value={startDate} onChange={(e) => onChange("start_date", e.target.value)} max={endDate || undefined} className="input-base" style={{ fontSize: 13 }} />
              <input type="date" value={endDate} onChange={(e) => onChange("end_date", e.target.value)} min={startDate || undefined} className="input-base" style={{ fontSize: 13 }} />
            </div>
          </div>
        </div>
      )}

      {(startDate || endDate) && (
        <button onClick={clearAll} className="btn-ghost" style={{ fontSize: 11, textAlign: "left", padding: "2px 0", color: "var(--accent-camel)" }}>
          Clear dates
        </button>
      )}
    </div>
  );
}
