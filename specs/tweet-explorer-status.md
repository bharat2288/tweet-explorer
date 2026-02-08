# Tweet Explorer — Status

> Session continuity document. Claude Code updates this at end of each session.
> Read this first to know where we are.

---

## Sessions

| Session | Focus | Date | Status |
|---------|-------|------|--------|
| `architect-makeover` | Explore archived codebase, plan refactoring scope | 2026-02-08 | 🔄 |

**Status key:** ✓ Complete | 🔄 In Progress | ⏸ Paused | ❌ Abandoned

---

## Current State

### Working
- Original prototype fully functional in `G:\My Drive\Work\Coded\archived\Twitter DB`
- Project structure created at `C:\Users\bhara\dev\tweet-explorer\`
- Specs files created (design, status, prompts)

### In Progress
- Architectural planning — design.md drafted, awaiting approval
- No code has been moved or refactored yet

### Not Started
- Copy source code from archive to new project location
- Frontend component decomposition
- Design system application
- Backend cleanup (type hints, model config, fix imports)
- .gitignore, README, GitHub publish
- Dev Server Manager registration

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

- [ ] Copy source from archive to `C:\Users\bhara\dev\tweet-explorer\` (backend/ and frontend/ folders)
- [ ] Register in Dev Server Manager (backend 8400, frontend 5177)
- [ ] Create .gitignore (data files, venv, node_modules, dist, .env)
- [ ] Backend: fix missing HTTPException import, add type hints, extract config
- [ ] Backend: make LLM model configurable (env var)
- [ ] Backend: update data file paths to `backend/data/` subdirectory
- [ ] Frontend: decompose App.jsx into components (SearchBar, FilterSidebar, SearchableSelect, DateRangePicker, ResultsTable, ResultRow, GPTPanel, ExpandableText)
- [ ] Frontend: extract hooks (useSearch, useFilters)
- [ ] Frontend: extract API base URL to config.js
- [ ] Frontend: apply design system (colors, typography, elevation, energy)
- [ ] Frontend: remove unused legacy component files
- [ ] Create README.md (research story + technical docs + setup instructions)
- [ ] Git init + GitHub publish via /publish

---

## Notes

- The data pipeline (scraping, embedding, NLP processing) is NOT part of this project — that was separate tooling
- The tweets.db schema has some quirks (column indices skip 21-23, 25) — likely from iterative schema evolution
- Frontend currently uses React 19.1.0 and Tailwind 4.1.7 — relatively recent, no need to update
- Backend requirements.txt includes dev tools (pytest, black, flake8) which is good
- The FAISS index is ~488MB — quite large. Consider noting this in README for anyone trying to reproduce
