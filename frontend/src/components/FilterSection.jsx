import { useState } from "react";

export default function FilterSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card" style={{ marginBottom: 12, overflow: "hidden" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text-primary)",
          fontSize: 13,
          fontWeight: 600,
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-raised)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <span>{title}</span>
        <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
          {isOpen ? "\u25B2" : "\u25BC"}
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-subtle)" }}>
          {children}
        </div>
      )}
    </div>
  );
}
