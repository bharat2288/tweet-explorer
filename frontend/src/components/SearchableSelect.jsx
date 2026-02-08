import { useState, useEffect, useRef } from "react";

export default function SearchableSelect({ name, label, options, onChange, selectedValues = [] }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (value) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(name, newSelected);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="label" style={{ display: "block", marginBottom: 4 }}>
        {label}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-base"
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "left",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedValues.length > 0
            ? `${selectedValues.length} selected`
            : `Select...`}
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: 10, marginLeft: 8 }}>
          {isOpen ? "\u25B2" : "\u25BC"}
        </span>
      </button>

      {/* Selected badges (when closed) */}
      {selectedValues.length > 0 && !isOpen && (
        <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {selectedValues.slice(0, 3).map((val, i) => (
            <span key={i} className="tag">
              {val.length > 20 ? val.substring(0, 20) + "..." : val}
            </span>
          ))}
          {selectedValues.length > 3 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              +{selectedValues.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            zIndex: 20,
            width: "100%",
            marginTop: 4,
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: 6,
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
          }}
        >
          {/* Search + bulk actions */}
          <div style={{ padding: 8, borderBottom: "1px solid var(--border-subtle)" }}>
            <input
              type="text"
              placeholder={`Filter ${options.length} options...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base"
              style={{ fontSize: 13, padding: "4px 8px" }}
              onClick={(e) => e.stopPropagation()}
            />
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(name, options); }}
                className="btn-secondary"
                style={{ flex: 1, fontSize: 11, padding: "3px 8px" }}
              >
                All ({options.length})
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(name, []); }}
                className="btn-secondary"
                style={{ flex: 1, fontSize: 11, padding: "3px 8px" }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Filtered toggle */}
          {search && filteredOptions.length > 0 && (
            <div style={{ padding: "4px 8px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-raised)" }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const allSelected = filteredOptions.every((opt) => selectedValues.includes(opt));
                  if (allSelected) {
                    onChange(name, selectedValues.filter((v) => !filteredOptions.includes(v)));
                  } else {
                    onChange(name, [...new Set([...selectedValues, ...filteredOptions])]);
                  }
                }}
                className="btn-secondary"
                style={{ width: "100%", fontSize: 11, padding: "3px 8px" }}
              >
                {filteredOptions.every((opt) => selectedValues.includes(opt))
                  ? `Deselect ${filteredOptions.length} filtered`
                  : `Select ${filteredOptions.length} filtered`}
              </button>
            </div>
          )}

          {/* Options list */}
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "8px 12px", color: "var(--text-muted)", fontSize: 13 }}>
                No matches
              </div>
            ) : (
              filteredOptions.map((option, i) => (
                <label
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    transition: "background-color 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-raised)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => handleSelect(option)}
                    style={{ marginRight: 8, accentColor: "var(--accent-camel)" }}
                  />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={option}>
                    {option}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: "6px 12px",
            fontSize: 11,
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-raised)",
          }}>
            {filteredOptions.length} of {options.length}
          </div>
        </div>
      )}
    </div>
  );
}
