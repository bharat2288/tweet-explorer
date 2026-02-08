import { useState } from "react";

export default function ExpandableText({ text, maxLength = 100 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  if (text.length <= maxLength) return <span>{text}</span>;

  return (
    <span>
      {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="btn-ghost"
        style={{ fontSize: 11, padding: "2px 6px", marginLeft: 4, display: "inline" }}
      >
        {isExpanded ? "less" : "more"}
      </button>
    </span>
  );
}
