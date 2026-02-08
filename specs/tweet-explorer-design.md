# Tweet Explorer — Design

> Living document: what we're building and why.
> Update when scope changes, architecture evolves, or constraints are discovered.

---

## Purpose

Tweet Explorer is a semantic search and analysis tool built for exploring a corpus of ~79,000 scraped crypto Twitter posts. It was originally created as a research instrument for my dissertation on how crypto discourse communities produce particular kinds of participants through algorithmic ranking, discourse genres, and visual devices. The tool combines FAISS vector similarity search with LLM-powered contextual analysis, letting me query the corpus by meaning rather than just keywords, filter by metadata (dates, accounts, engagement, tags), and ask GPT to synthesize patterns across matching tweets.

This makeover refactors the working prototype into a portfolio-quality codebase — proper component architecture, design system aesthetics, clean project structure — without changing what the tool does.

---

## Current Scope

> This is a refactoring/makeover project. Core functionality stays the same.

### Existing Features (preserve as-is)

- **Semantic search**: Vector similarity search via FAISS + OpenAI embeddings (text-embedding-3-large, 1536 dims)
- **Metadata filtering**: Tags (regex + LLM-derived + semantic), image analysis tags, accounts/handles, date ranges, engagement thresholds
- **Results table**: Compact view with expandable detail rows (summary, insights, image analysis, engagement metrics, visual tags)
- **GPT analysis panel**: Floating panel that sends matching tweets as context to an LLM for discourse analysis
- **Excel export**: Download filtered results as .xlsx

### Makeover Scope (what we're changing)

- **Frontend component decomposition**: Break 1,324-line App.jsx into ~6-8 focused components
- **Design system application**: Apply the global design system (dark theme, Camel/Terracotta accents, Fraunces display font, elevation system, energy)
- **Backend cleanup**: Fix missing import, add type hints, make LLM model configurable
- **Project structure**: Proper layout with specs, .gitignore, README
- **Configuration**: Extract hardcoded URLs/paths to environment variables
- **Dead code removal**: Remove unused legacy component files in src/components/

---

## Architecture

> Same architecture, cleaner implementation.

```
[React Frontend]  ──HTTP──>  [FastAPI Backend]
   (Vite + Tailwind)            │
                                ├── SQLite (tweets.db) — metadata + text
                                ├── FAISS (tweets.index) — vector embeddings
                                ├── id_map.json — FAISS index ↔ tweet ID
                                └── OpenAI API — embeddings + LLM analysis
```

### Project Structure (target)

```
tweet-explorer/
├── specs/
│   ├── tweet-explorer-design.md
│   ├── tweet-explorer-status.md
│   └── tweet-explorer-prompts.md
├── backend/
│   ├── main.py              # FastAPI app (cleaned up)
│   ├── requirements.txt
│   ├── .env.example          # Template for required env vars
│   └── data/                 # Gitignored — user places DB + index here
│       ├── tweets.db
│       ├── tweets.index
│       └── id_map.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Shell — layout + routing
│   │   ├── main.jsx
│   │   ├── index.css         # Tailwind + design system tokens
│   │   ├── components/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterSidebar.jsx
│   │   │   ├── SearchableSelect.jsx
│   │   │   ├── DateRangePicker.jsx
│   │   │   ├── ResultsTable.jsx
│   │   │   ├── ResultRow.jsx
│   │   │   ├── GPTPanel.jsx
│   │   │   └── ExpandableText.jsx
│   │   ├── hooks/
│   │   │   ├── useFilters.js
│   │   │   └── useSearch.js
│   │   └── config.js         # API base URL, defaults
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .gitignore
└── README.md
```

### Key Files

- `backend/main.py` — FastAPI with 3 endpoints: `/filters`, `/search`, `/query`
- `frontend/src/App.jsx` — Layout shell, delegates to components
- `frontend/src/components/FilterSidebar.jsx` — All filter controls grouped
- `frontend/src/components/ResultsTable.jsx` — Data table with expandable rows
- `frontend/src/components/GPTPanel.jsx` — Floating LLM analysis panel
- `frontend/src/hooks/useSearch.js` — Search state + API calls
- `frontend/src/hooks/useFilters.js` — Filter state + API calls

### Data Flow

```
User types query / adjusts filters
    ↓
useSearch hook builds params from state
    ↓
fetch(`${API_BASE}/search?...`)
    ↓
Backend: if text → embed query → FAISS top_k → filter matches
         if no text → scan all → filter matches
    ↓
Return paginated { matches, total_matches, page }
    ↓
ResultsTable renders rows
    ↓
[Optional] User asks GPT question
    ↓
fetch(`${API_BASE}/query?...`) → backend sends tweet context to LLM
    ↓
GPTPanel displays response
```

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/filters` | All distinct filter values for dropdowns |
| GET | `/search` | Semantic + metadata search with pagination |
| GET | `/query` | LLM-powered analysis of matching tweets |

### Database Schema

SQLite `tweets` table with columns: id, text, summary, insights (JSON), vision_captions (JSON), tags (JSON), llm_tags (JSON), semantic_tags (JSON), author, handle, year, month, date, createdAt, url, replyCount, quoteCount, retweetCount, likeCount, views, bookmarkCount, allMediaURL (JSON), image_tags (JSON nested: [{primary_tag, subtags}]).

---

## Constraints

- **Technical**: Python 3.10+, Node 18+, OpenAI API key required for search + LLM features
- **Data**: tweets.db (~140MB), tweets.index (~488MB) are gitignored — user must provide their own or obtain from me
- **Scope**: No new features. Same search, same filters, same GPT panel. Code and aesthetics only.
- **Workflow**: Must work with `C:\Users\bhara\dev\` development workflow (venv, port registry, specs)
- **Ports**: Backend 8400, Frontend 5177

---

## Design System Application

### What Changes

The frontend currently uses generic Tailwind dark theme (gray-800/gray-900, blue accents, emoji icons). The makeover applies the global design system:

| Current | Target |
|---------|--------|
| bg-gray-900 (#111827) | Whisper Green (#0c0f0d) base |
| Blue accents (#3b82f6) | Camel (#d4a574) primary, Terracotta (#cd8264) secondary |
| System fonts | Geist base, Fraunces for title/character moment |
| Flat surfaces | 4-level elevation (Base → Surface → Raised → Elevated) |
| No hover energy | Glows, shadows, hover transforms |
| Emoji icons | Clean text or minimal SVG |
| Dense uniform layout | Varied density zones (tight table, generous header) |

### What Stays

- Dark theme overall feel
- Sidebar + main content layout
- Expandable table rows pattern
- Filter organization (tags, accounts, dates, engagement)
- Floating GPT panel concept

---

## LLM Integration

### Current

- OpenAI GPT-4-turbo hardcoded
- System prompt: "You are a crypto discourse analyst"
- Context: tweet summaries + insights sent as numbered list

### Target

- Model configurable via environment variable (`LLM_MODEL`)
- Support OpenAI models (GPT-4o, GPT-4-turbo) and Anthropic Claude (via API)
- Provider determined by model name prefix or separate `LLM_PROVIDER` env var
- Default: `gpt-4o` (latest, better than hardcoded turbo)
- System prompt unchanged

---

## Future Ideas

> Not in scope for this makeover. Captured for later.

- [ ] Saved searches / bookmarked queries
- [ ] Dark/light mode toggle
- [ ] TypeScript migration
- [ ] Test suite (pytest backend, Vitest frontend)
- [ ] Thread reconstruction (group tweets into conversations)
- [ ] Timeline visualization of tweet volume
- [ ] Network graph of account interactions
- [ ] Local embedding model option (no OpenAI dependency)
- [ ] Client-side caching / optimistic UI

---

## References

- Original archive: `G:\My Drive\Work\Coded\archived\Twitter DB`
- Design system: `C:\Users\bhara\dev\design\design-system.md`
- Port registry: Backend 8400, Frontend 5177
- Dissertation context: Crypto Twitter discourse analysis, ~79K tweets, speculative pedagogical assemblages
