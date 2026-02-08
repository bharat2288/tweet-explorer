# Tweet Explorer

A semantic search and LLM analysis tool for exploring a corpus of ~79,000 crypto Twitter posts. Built as a research instrument for my dissertation on how crypto discourse communities produce particular kinds of participants through algorithmic ranking, discourse genres, and visual devices.

## What it does

- **Semantic search** over tweet embeddings using FAISS vector similarity (OpenAI `text-embedding-3-large`, 1536 dimensions)
- **Metadata filtering** by content tags, image analysis tags, accounts, date ranges, and engagement thresholds
- **LLM analysis panel** that sends matching tweets as context to GPT-4o or Claude for discourse pattern analysis
- **Expandable detail rows** showing LLM-generated summaries, extracted insights, vision API image captions, and full engagement metrics
- **Excel export** of filtered results

## Architecture

```
React Frontend  ──HTTP──>  FastAPI Backend
  (Vite + Tailwind)            │
                               ├── SQLite (tweets.db) ── metadata + text
                               ├── FAISS (tweets.index) ── vector embeddings
                               ├── id_map.json ── FAISS index ↔ tweet ID
                               └── OpenAI / Anthropic API ── embeddings + LLM
```

**Backend** (`backend/main.py`): FastAPI with three endpoints — `/filters`, `/search`, `/query`. Vector search via FAISS, LLM integration configurable between OpenAI and Anthropic.

**Frontend** (`frontend/src/`): React with component architecture — SearchableSelect, DateRangePicker, ResultsTable with expandable rows, floating GPT panel. Custom design system with dark theme.

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key (required for embeddings + LLM)

### Data files

This project requires three data files that are not included in the repository (too large for GitHub):

| File | Size | Location |
|------|------|----------|
| `tweets.db` | ~140 MB | `backend/data/` |
| `tweets.index` | ~488 MB | `backend/data/` |
| `id_map.json` | ~1.8 MB | `backend/data/` |

Place these files in `backend/data/` before starting the backend.

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt

# Copy .env.example to .env and add your API key
cp .env.example .env
# Edit .env with your OPENAI_API_KEY

python main.py
# Backend runs on http://localhost:8400
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --port 5177
# Frontend runs on http://localhost:5177
```

### Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | — | OpenAI API key for embeddings and LLM |
| `LLM_PROVIDER` | No | `openai` | LLM provider: `openai` or `anthropic` |
| `LLM_MODEL` | No | `gpt-4o` | Model name (e.g., `gpt-4o`, `claude-sonnet-4-5-20250929`) |
| `ANTHROPIC_API_KEY` | No | — | Required only if `LLM_PROVIDER=anthropic` |
| `PORT` | No | `8400` | Backend server port |

## Research context

This tool was built for my dissertation research at UC Berkeley on how platform discourse communities teach participation without formal instruction. The corpus consists of ~79,000 tweets from Crypto Twitter, collected and processed with:

- **LLM-generated summaries and insights** for each tweet
- **Vision API analysis** of tweet images (captions and classification)
- **Multiple tag layers**: regex-extracted tags, LLM-derived tags, semantic tags, and hierarchical image tags
- **OpenAI embeddings** indexed in FAISS for semantic similarity search

The tool enables exploring discourse patterns, tracing how visual and textual genres circulate, and querying the corpus by meaning rather than keywords.

## Project structure

```
tweet-explorer/
├── backend/
│   ├── main.py              # FastAPI app (endpoints, FAISS search, LLM integration)
│   ├── requirements.txt
│   ├── .env.example
│   └── data/                # Gitignored — place data files here
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Layout shell
│   │   ├── config.js        # API base URL
│   │   ├── index.css        # Design system tokens + base styles
│   │   └── components/
│   │       ├── SearchableSelect.jsx
│   │       ├── DateRangePicker.jsx
│   │       ├── FilterSection.jsx
│   │       ├── ResultsTable.jsx
│   │       ├── GPTPanel.jsx
│   │       └── ExpandableText.jsx
│   ├── index.html
│   └── package.json
├── specs/                   # Design docs and session notes
└── .gitignore
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/filters` | Returns all distinct filter values for dropdowns |
| `GET` | `/search` | Semantic + metadata search with pagination |
| `GET` | `/query` | LLM-powered analysis of matching tweets |
| `GET` | `/docs` | Auto-generated API documentation (FastAPI) |
