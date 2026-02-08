import { useState } from "react";
import { API_BASE } from "../config";

export default function GPTPanel({ isVisible, onClose, activeFilters, queryText }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (queryText) params.append("text", queryText);

      // Map frontend plural keys to backend singular params
      ["tags", "image_tags", "image_subtags", "handles"].forEach((key) => {
        if (activeFilters[key]?.length > 0) {
          const paramName = key.endsWith("s") ? key.slice(0, -1) : key;
          params.append(paramName, activeFilters[key].join(","));
        }
      });

      // Other scalar filters
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (!["tags", "image_tags", "image_subtags", "handles"].includes(key) && value) {
          params.append(key, value);
        }
      });

      params.append("text", input);
      params.append("top_k", "20");

      const res = await fetch(`${API_BASE}/query?${params.toString()}`);
      const data = await res.json();
      setResponse(data.gpt_response);
    } catch (err) {
      console.error("LLM query error:", err);
      setResponse("Error querying LLM. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 16,
      right: 16,
      width: 460,
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: 10,
      boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      zIndex: 50,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: "var(--bg-raised)",
        padding: "14px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            Ask About Results
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-muted)" }}>
            LLM analyzes tweets matching your current filters
          </p>
        </div>
        <button onClick={onClose} className="btn-ghost" style={{ padding: "4px 8px", fontSize: 14 }}>
          &times;
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: 16, maxHeight: 440, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Context summary */}
        <div style={{ backgroundColor: "var(--bg-raised)", borderRadius: 6, padding: 10, fontSize: 12 }}>
          <span className="label" style={{ display: "block", marginBottom: 4 }}>Context</span>
          {queryText && (
            <div style={{ color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--text-muted)" }}>Search:</span> &ldquo;{queryText}&rdquo;
            </div>
          )}
          <div style={{ color: "var(--text-secondary)", marginTop: 2 }}>
            <span style={{ color: "var(--text-muted)" }}>Filters:</span>{" "}
            {Object.entries(activeFilters).filter(([_, v]) => (Array.isArray(v) ? v.length > 0 : !!v)).length > 0 ? (
              <span>
                {activeFilters.tags?.length > 0 && `Tags (${activeFilters.tags.length}) `}
                {activeFilters.handles?.length > 0 && `Handles (${activeFilters.handles.length}) `}
                {activeFilters.start_date && `From ${activeFilters.start_date} `}
                {activeFilters.end_date && `To ${activeFilters.end_date}`}
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>None</span>
            )}
          </div>
        </div>

        {/* Input */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit())}
          placeholder="Ask a question about the filtered tweets..."
          className="input-base"
          style={{ resize: "none", minHeight: 72, fontSize: 13 }}
          rows="3"
        />

        {/* Submit */}
        <button onClick={handleSubmit} disabled={isLoading || !input.trim()} className="btn-primary" style={{ width: "100%" }}>
          {isLoading ? "Thinking..." : "Ask"}
        </button>

        {/* Response */}
        {response && (
          <div style={{ backgroundColor: "var(--bg-raised)", borderRadius: 6, padding: 14 }}>
            <span className="label-section" style={{ display: "block", marginBottom: 6 }}>Response</span>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.6 }}>
              {response}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
