# Tweet Explorer — Status

> Session continuity document. Claude Code updates this at end of each session.
> Read this first to know where we are.

---

## Sessions

| Session | Focus | Date | Status |
|---------|-------|------|--------|
| `architect-makeover` | Explore archived codebase, plan refactoring scope | 2026-02-08 | ✓ |
| `implementation` | Copy, refactor, decompose, design system, publish | 2026-02-08 | ✓ |
| `pipeline-report` | Document full pipeline, fix RAG augmentation, reduce top_k | 2026-02-11 | ✓ |
| `screenshots-research` | Old frontend screenshots, pipeline enrichment research, fine-tuning discovery | 2026-02-11 | ✓ |

**Status key:** ✓ Complete | 🔄 In Progress | ⏸ Paused | ❌ Abandoned

---

## Current State

### Working
- Project live at `C:\Users\bhara\dev\tweet-explorer\`
- Published to GitHub: https://github.com/bharat2288/tweet-explorer
- Registered in Dev Server Manager (backend 8400, frontend 5177)
- Frontend build passes (`npm run build`)

### Completed Last Session (2026-02-11, screenshots-research)
- Set up old "Twitter DB" frontend locally at `C:\Users\bhara\dev\twitter-db-old\` for before/after screenshots (servers on ports 8001/5180, currently stopped but ready to restart)
- Took before/after screenshots comparing generic Tailwind UI vs design system version
- Researched exact enrichment pipeline mechanics — traced all 6 stages from CSV→JSON through fine-tuning to vectorization
- **Discovered fine-tuning arc was missing from pipeline report** — production enrichments came from fine-tuned GPT-4.1 (`ft:gpt-4.1-2025-04-14:bhasuri:llm-enrichment-gpt4-1:BXnhup29`), not vanilla API calls
- Updated NOTES-vibe-coding-pipeline-report.md: added fine-tuning section to 3g, new "apprenticeship" LLM role in taxonomy, file inventory for fine-tuning scripts

### Completed Prior Session (2026-02-11, pipeline-report)
- Wrote comprehensive pipeline report (NOTES-vibe-coding-pipeline-report.md, ~850 lines)
- Fixed RAG augmentation: /query now sends original text, tags, image descriptions, image tags, summary, insights (was summary+insights only)
- Reduced search top_k from 10000 to 100 for meaningful semantic results
- Tested RAG fix: GPT-4o now cites specific tweets by number without prompt engineering
- Deep discussion of vectorization, FAISS, embedding models, RAG architecture documented in report

### Completed Prior Session (2026-02-08)
- Copied source from archive to new project location
- Created .gitignore, .env.example
- Backend rewritten: type hints, extracted helpers, configurable LLM (OpenAI/Anthropic), fixed imports, relative data paths
- Frontend decomposed: 1,324-line monolith → 7 focused components (App, SearchableSelect, DateRangePicker, FilterSection, ResultsTable, GPTPanel, ExpandableText) + config.js
- Design system applied: CSS custom properties, Fraunces display font, 4-level elevation, warm accents, energy on buttons
- Deleted unused legacy files (Filters.jsx, SearchPanel.jsx, ColumnVisibilityPanel.jsx, App.css, react.svg)
- README.md with research context + technical docs
- Git initialized and published to GitHub

### Tested & Working
- Backend starts, FAISS index loads (79,432 vectors)
- Semantic search returns results (tested "diamond hands", "failed")
- Metadata-only search works (empty search, tag filters)
- Frontend connects to backend successfully

---

## Decisions Made

### Project Name
- **Context**: Archived as "Twitter DB" — needed a portfolio-friendly name
- **Choice**: `tweet-explorer`
- **Rationale**: Simple, descriptive, emphasizes the exploration/search aspect

### Data File Strategy
- **Context**: tweets.db (~140MB) and tweets.index (~488MB) can't go to GitHub
- **Choice**: Gitignore + README instructions
- **Rationale**: Simplest approach; document where to place data files

### Refactoring Depth
- **Context**: Could range from cosmetic to full TypeScript rewrite
- **Choice**: Structure + aesthetics — component decomposition, design system, proper project structure
- **Rationale**: Maximum portfolio impact without excessive timeline; keeps JS, keeps core FastAPI

### Portfolio Framing
- **Context**: How should GitHub visitors read this project?
- **Choice**: Both angles — README tells the research story, code demonstrates technical competence
- **Rationale**: Appeals to both research-oriented and engineering-oriented reviewers

### LLM Integration
- **Context**: GPT-4-turbo was hardcoded
- **Choice**: Make model configurable via env var, support OpenAI + Anthropic
- **Rationale**: More flexible, demonstrates awareness of model ecosystem

### Ports
- **Context**: Need ports for dev server manager
- **Choice**: Backend 8400, Frontend 5177
- **Rationale**: Next available in port registry

---

## Next Session

> Specific, actionable tasks. First item = start here.

- [ ] Visual review of frontend — check design system application looks right in browser
- [ ] Test RAG with various queries now that augmentation is enriched
- [ ] Consider: add Anthropic model to LLM panel UI (currently backend-only config)
- [ ] Consider: pre-retrieval filtering (FAISS ID filtering) to improve precision
- [ ] Consider: adjustable top_k in UI for power users

---

## Notes

- The data pipeline (scraping, embedding, NLP processing) is NOT part of this project — that was separate tooling
- The tweets.db schema has some quirks (column indices skip 21-23, 25) — likely from iterative schema evolution
- Frontend currently uses React 19.1.0 and Tailwind 4.1.7 — relatively recent, no need to update
- Backend requirements.txt includes dev tools (pytest, black, flake8) which is good
- The FAISS index is ~488MB — quite large. Consider noting this in README for anyone trying to reproduce
