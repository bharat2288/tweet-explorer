import { useState } from "react";
import ExpandableText from "./ExpandableText";

function EngagementCell({ tweet }) {
  const metrics = [
    { key: "likeCount", short: "L", color: "var(--semantic-error)" },
    { key: "retweetCount", short: "RT", color: "var(--semantic-success)" },
    { key: "replyCount", short: "Re", color: "var(--accent-camel)" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 13 }}>
      {metrics.map(({ key, short, color }) => (
        <span key={key} style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ color, fontWeight: 600, fontSize: 11 }}>{short}</span>
          <span style={{ color: "var(--text-secondary)", minWidth: 20, textAlign: "right" }}>
            {(tweet[key] || 0).toLocaleString()}
          </span>
        </span>
      ))}
    </div>
  );
}

function ExpandedRow({ tweet }) {
  return (
    <tr style={{ backgroundColor: "var(--bg-surface)" }}>
      <td colSpan="7" style={{ padding: "20px 16px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Two-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Left: Summary + Insights */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tweet.summary && (
                <div style={{ backgroundColor: "var(--bg-raised)", borderRadius: 6, padding: 14, border: "1px solid var(--border-subtle)" }}>
                  <h4 className="label-section" style={{ marginBottom: 8 }}>Summary</h4>
                  <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    <ExpandableText text={tweet.summary} maxLength={200} />
                  </div>
                </div>
              )}
              {tweet.insights?.length > 0 && (
                <div style={{ backgroundColor: "var(--bg-raised)", borderRadius: 6, padding: 14, border: "1px solid var(--border-subtle)" }}>
                  <h4 className="label-section" style={{ marginBottom: 8 }}>Insights</h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {tweet.insights.map((insight, idx) => (
                      <li key={idx} style={{ color: "var(--text-secondary)", fontSize: 13, display: "flex" }}>
                        <span style={{ color: "var(--text-muted)", marginRight: 8 }}>&bull;</span>
                        <ExpandableText text={insight} maxLength={150} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Image Analysis + Metrics */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tweet.vision_captions?.length > 0 && (
                <div style={{ backgroundColor: "var(--bg-raised)", borderRadius: 6, padding: 14, border: "1px solid var(--border-subtle)" }}>
                  <h4 className="label-section" style={{ marginBottom: 8 }}>Image Analysis</h4>
                  <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    <ExpandableText
                      text={Array.isArray(tweet.vision_captions) ? tweet.vision_captions.join(", ") : tweet.vision_captions}
                      maxLength={200}
                    />
                  </div>
                </div>
              )}
              <div style={{ backgroundColor: "var(--bg-raised)", borderRadius: 6, padding: 14, border: "1px solid var(--border-subtle)" }}>
                <h4 className="label-section" style={{ marginBottom: 8 }}>Engagement</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                  {[
                    { label: "Likes", key: "likeCount" },
                    { label: "Retweets", key: "retweetCount" },
                    { label: "Replies", key: "replyCount" },
                    { label: "Views", key: "views" },
                    { label: "Quotes", key: "quoteCount" },
                    { label: "Bookmarks", key: "bookmarkCount" },
                  ].map(({ label, key }) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 500, fontFamily: "var(--font-mono)" }}>
                        {(tweet[key] || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visual tags */}
          {tweet.image_tags?.length > 0 && (
            <div style={{ backgroundColor: "var(--bg-raised)", borderRadius: 6, padding: 14, border: "1px solid var(--border-subtle)", marginBottom: 12 }}>
              <h4 className="label-section" style={{ marginBottom: 8 }}>Visual Tags</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tweet.image_tags.map((imgTag, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ color: "var(--accent-terra)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>
                      {imgTag.primary_tag}
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {imgTag.subtags?.length > 0 ? (
                        imgTag.subtags.map((subtag, j) => (
                          <span key={j} className="tag-terra">{subtag}</span>
                        ))
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 12, fontStyle: "italic" }}>No subtags</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata footer */}
          <div style={{
            fontSize: 12,
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
          }}>
            {tweet.createdAt && <span>Created: {tweet.createdAt}</span>}
            {tweet.author && <span>Author: {tweet.author}</span>}
            {tweet.id && <span style={{ fontFamily: "var(--font-mono)" }}>ID: {tweet.id}</span>}
            {tweet.allMediaURL?.length > 0 && (
              <>
                <span>Media:</span>
                {(Array.isArray(tweet.allMediaURL) ? tweet.allMediaURL : [tweet.allMediaURL]).map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-camel)", textDecoration: "none", fontSize: 12 }}>
                    [{idx + 1}]
                  </a>
                ))}
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function ResultsTable({ results, page, totalPages, onPageChange, isLoading }) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const toggleRow = (rowKey) => {
    const next = new Set(expandedRows);
    next.has(rowKey) ? next.delete(rowKey) : next.add(rowKey);
    setExpandedRows(next);
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (!sortConfig.key) return 0;
    return sortConfig.direction === "asc"
      ? (a[sortConfig.key] || 0) - (b[sortConfig.key] || 0)
      : (b[sortConfig.key] || 0) - (a[sortConfig.key] || 0);
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 240, color: "var(--text-muted)" }}>
        <div style={{ width: 24, height: 24, border: "2px solid var(--border-emphasis)", borderTopColor: "var(--accent-camel)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 12 }} />
        <p>Searching tweets...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
        <p style={{ fontSize: 16, marginBottom: 4 }}>No results</p>
        <p style={{ fontSize: 13 }}>Try adjusting your search or filters.</p>
      </div>
    );
  }

  const thStyle = {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-tertiary)",
    whiteSpace: "nowrap",
  };

  const tdStyle = { padding: "12px 14px", verticalAlign: "top" };

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-raised)", borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ ...thStyle, width: 40 }}></th>
              <th style={{ ...thStyle, width: 130 }}>Handle / Date</th>
              <th style={{ ...thStyle, minWidth: 280 }}>Tweet</th>
              <th style={{ ...thStyle, width: 140 }}>Tags</th>
              <th style={{ ...thStyle, width: 140 }}>Image Tags</th>
              <th
                style={{ ...thStyle, width: 200, textAlign: "center", cursor: "pointer", color: "var(--accent-camel)" }}
                onClick={() => handleSort("likeCount")}
              >
                Engagement {sortConfig.key && (sortConfig.direction === "asc" ? "\u2191" : "\u2193")}
              </th>
              <th style={{ ...thStyle, width: 60, textAlign: "center" }}>Links</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((tweet, i) => {
              const rowKey = tweet.id || i;
              const isExpanded = expandedRows.has(rowKey);
              return (
                <tr key={rowKey} style={{ cursor: "default" }}>
                  <td colSpan="7" style={{ padding: 0 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        <tr
                          style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background-color 0.1s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <td style={{ ...tdStyle, width: 40 }}>
                            <button
                              onClick={() => toggleRow(rowKey)}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: isExpanded ? "var(--accent-camel)" : "var(--text-muted)",
                                fontSize: 12, padding: 4, transition: "color 0.15s",
                              }}
                            >
                              {isExpanded ? "\u25BC" : "\u25B6"}
                            </button>
                          </td>
                          <td style={{ ...tdStyle, width: 130 }}>
                            <div style={{ fontWeight: 500, color: "var(--accent-camel)", fontSize: 13 }}>{tweet.handle}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>
                              {new Date(tweet.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                          </td>
                          <td style={{ ...tdStyle, minWidth: 280 }}>
                            <div style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 360 }}>
                              <ExpandableText text={tweet.text} maxLength={120} />
                            </div>
                          </td>
                          <td style={{ ...tdStyle, width: 140 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {tweet.tags?.length > 0 ? (
                                <>
                                  {tweet.tags.slice(0, 3).map((tag, j) => <span key={j} className="tag">{tag}</span>)}
                                  {tweet.tags.length > 3 && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{tweet.tags.length - 3}</span>}
                                </>
                              ) : (
                                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>&mdash;</span>
                              )}
                            </div>
                          </td>
                          <td style={{ ...tdStyle, width: 140 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {tweet.image_tags?.length > 0 ? (
                                <>
                                  {tweet.image_tags.slice(0, 2).map((imgTag, j) => (
                                    <span key={j} className="tag-terra" title={imgTag.subtags?.join(", ") || ""}>
                                      {imgTag.primary_tag}
                                    </span>
                                  ))}
                                  {tweet.image_tags.length > 2 && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{tweet.image_tags.length - 2}</span>}
                                </>
                              ) : (
                                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>&mdash;</span>
                              )}
                            </div>
                          </td>
                          <td style={{ ...tdStyle, width: 200 }}>
                            <EngagementCell tweet={tweet} />
                          </td>
                          <td style={{ ...tdStyle, width: 60, textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                              {tweet.url && (
                                <a
                                  href={tweet.url.startsWith("http") ? tweet.url : `https://${tweet.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "var(--text-tertiary)", fontSize: 13, textDecoration: "none", transition: "color 0.15s" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-camel)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                                  title="View tweet"
                                >
                                  Link
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && <ExpandedRow tweet={tweet} />}
                      </tbody>
                    </table>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-raised)",
        }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="btn-secondary" style={{ fontSize: 12, padding: "4px 12px" }}>
              Previous
            </button>
            <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="btn-secondary" style={{ fontSize: 12, padding: "4px 12px" }}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
