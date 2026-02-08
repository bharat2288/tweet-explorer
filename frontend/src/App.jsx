import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { API_BASE } from "./config";
import FilterSection from "./components/FilterSection";
import SearchableSelect from "./components/SearchableSelect";
import DateRangePicker from "./components/DateRangePicker";
import ResultsTable from "./components/ResultsTable";
import GPTPanel from "./components/GPTPanel";

const INITIAL_FILTERS = {
  tags: [],
  image_tags: [],
  image_subtags: [],
  handles: [],
  start_date: "",
  end_date: "",
  min_likes: "",
  min_views: "",
  min_retweets: "",
  min_replies: "",
  min_quotes: "",
  min_bookmarks: "",
};

export default function App() {
  // Available filter options (loaded from backend)
  const [filters, setFilters] = useState({ tags: [], authors: [], handles: [], image_tags: [], image_subtags: [] });
  const [activeFilters, setActiveFilters] = useState(INITIAL_FILTERS);

  // Search state
  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // UI state
  const [gptVisible, setGptVisible] = useState(false);

  // Load filter options on mount
  useEffect(() => {
    fetch(`${API_BASE}/filters`)
      .then((res) => res.json())
      .then(setFilters)
      .catch((err) => console.error("Error loading filters:", err));
  }, []);

  // Build URL params from state (maps plural frontend keys to singular backend params)
  const buildParams = (customPage = 1) => {
    const params = new URLSearchParams({ page: customPage, page_size: pageSize, top_k: 10000 });
    if (queryText) params.append("text", queryText);

    ["tags", "image_tags", "image_subtags", "handles"].forEach((key) => {
      if (activeFilters[key]?.length > 0) {
        const paramName = key.endsWith("s") ? key.slice(0, -1) : key;
        params.append(paramName, activeFilters[key].join(","));
      }
    });

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!["tags", "image_tags", "image_subtags", "handles"].includes(key) && value) {
        params.append(key, value);
      }
    });

    return params;
  };

  const handleSearch = async (customPage = 1) => {
    setPage(customPage);
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/search?${buildParams(customPage).toString()}`);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setResults(data.matches || []);
      setTotalMatches(data.total_matches || 0);
    } catch (err) {
      setError("Search failed. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setActiveFilters((prev) => ({ ...prev, [name]: value }));
  };

  const exportToExcel = () => {
    const rows = results.map((r) => ({
      id: r.id,
      text: r.text,
      summary: r.summary,
      insights: r.insights?.join(" | "),
      tags: r.tags?.join(", "),
      image_tags: r.image_tags?.map((t) => `${t.primary_tag}: ${(t.subtags || []).join(", ")}`).join(" | ") || "",
      vision_captions: Array.isArray(r.vision_captions) ? r.vision_captions.join(" | ") : r.vision_captions || "",
      handle: r.handle,
      author: r.author,
      date: r.date,
      url: r.url,
      likeCount: r.likeCount,
      views: r.views,
      retweetCount: r.retweetCount,
      replyCount: r.replyCount,
      quoteCount: r.quoteCount,
      bookmarkCount: r.bookmarkCount,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tweets");
    XLSX.writeFile(wb, `tweet_results_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const totalPages = Math.ceil(totalMatches / pageSize);
  const hasActiveFilters = Object.values(activeFilters).some((v) => (Array.isArray(v) ? v.length > 0 : v !== "")) || queryText !== "";

  const ENGAGEMENT_FIELDS = [
    { key: "min_likes", label: "Min Likes" },
    { key: "min_views", label: "Min Views" },
    { key: "min_retweets", label: "Min Retweets" },
    { key: "min_replies", label: "Min Replies" },
    { key: "min_quotes", label: "Min Quotes" },
    { key: "min_bookmarks", label: "Min Bookmarks" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ---- Header (generous zone) ---- */}
      <header style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "24px 32px 20px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "var(--shadow-md)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Title + actions row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h1 style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: 36,
                fontWeight: 400,
                color: "var(--text-primary)",
                lineHeight: 1.1,
              }}>
                Tweet Explorer
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-tertiary)" }}>
                Semantic search across {totalMatches > 0 ? totalMatches.toLocaleString() : "~79,000"} crypto discourse tweets
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setGptVisible(!gptVisible)} className="btn-secondary">
                Ask LLM
              </button>
              <button onClick={exportToExcel} disabled={results.length === 0} className="btn-secondary">
                Export .xlsx
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(1)}
              placeholder="Search tweets semantically (or leave empty for metadata search)..."
              className="input-base"
              style={{ paddingRight: 100, fontSize: 15, padding: "12px 110px 12px 16px" }}
            />
            <button
              onClick={() => handleSearch(1)}
              disabled={isSearching}
              className="btn-primary"
              style={{ position: "absolute", right: 6, top: 6, padding: "6px 20px" }}
            >
              {isSearching ? "..." : "Search"}
            </button>
          </div>

          {/* Status line */}
          {error && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--semantic-error)" }}>{error}</p>
          )}
          {!isSearching && !error && totalMatches > 0 && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--semantic-success)" }}>
              {totalMatches.toLocaleString()} tweets found
            </p>
          )}
        </div>
      </header>

      {/* ---- Main content ---- */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 32px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        {/* Sidebar (tight zone) */}
        <aside style={{ position: "sticky", top: 100, alignSelf: "start" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="label-section">Filters</span>
            {hasActiveFilters && (
              <button onClick={() => { setActiveFilters(INITIAL_FILTERS); setQueryText(""); }} className="btn-ghost" style={{ fontSize: 11, padding: "2px 6px" }}>
                Clear all
              </button>
            )}
          </div>

          {/* Content Tags */}
          <div className="card" style={{ padding: 12, marginBottom: 10 }}>
            <span className="label-section" style={{ display: "block", marginBottom: 8 }}>Content Tags</span>
            <SearchableSelect name="tags" label="Regex Tags" options={filters.tags} selectedValues={activeFilters.tags} onChange={handleFilterChange} />
          </div>

          {/* Image Analysis */}
          <div className="card" style={{ padding: 12, marginBottom: 10 }}>
            <span className="label-section" style={{ display: "block", marginBottom: 8 }}>Image Analysis</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <SearchableSelect name="image_tags" label="Primary Tags" options={filters.image_tags} selectedValues={activeFilters.image_tags} onChange={handleFilterChange} />
              <SearchableSelect name="image_subtags" label="Subtags" options={filters.image_subtags || []} selectedValues={activeFilters.image_subtags} onChange={handleFilterChange} />
            </div>
          </div>

          {/* Accounts */}
          <div className="card" style={{ padding: 12, marginBottom: 10 }}>
            <span className="label-section" style={{ display: "block", marginBottom: 8 }}>Accounts</span>
            <SearchableSelect name="handles" label="Handles" options={filters.handles} selectedValues={activeFilters.handles} onChange={handleFilterChange} />
          </div>

          {/* Date Range */}
          <FilterSection title="Date Range" defaultOpen={false}>
            <DateRangePicker startDate={activeFilters.start_date} endDate={activeFilters.end_date} onChange={handleFilterChange} />
          </FilterSection>

          {/* Engagement */}
          <FilterSection title="Engagement" defaultOpen={false}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ENGAGEMENT_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label className="label" style={{ display: "block", marginBottom: 2 }}>{label}</label>
                  <input
                    type="number"
                    value={activeFilters[key]}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className="input-base"
                    style={{ fontSize: 13 }}
                    placeholder="0"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </FilterSection>
        </aside>

        {/* Results (standard zone) */}
        <section>
          <ResultsTable
            results={results}
            page={page}
            totalPages={totalPages}
            onPageChange={handleSearch}
            isLoading={isSearching}
          />
        </section>
      </main>

      {/* GPT Panel */}
      <GPTPanel isVisible={gptVisible} onClose={() => setGptVisible(false)} activeFilters={activeFilters} queryText={queryText} />
    </div>
  );
}
