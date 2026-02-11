"""Tweet Explorer API — semantic search and LLM analysis over a tweet corpus."""

import json
import logging
import os
import sqlite3
import traceback
from pathlib import Path
from typing import Optional

import faiss
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

load_dotenv()

# Paths — data files live in backend/data/
DATA_DIR = Path(__file__).parent / "data"
DB_PATH = str(DATA_DIR / "tweets.db")
INDEX_PATH = str(DATA_DIR / "tweets.index")
ID_MAP_PATH = str(DATA_DIR / "id_map.json")

# LLM configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o")

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8400"))

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# LLM Client Setup
# ---------------------------------------------------------------------------


def create_llm_client():
    """Create the appropriate LLM client based on LLM_PROVIDER env var."""
    if LLM_PROVIDER == "anthropic":
        try:
            from anthropic import Anthropic
            return Anthropic()
        except ImportError:
            raise RuntimeError("anthropic package not installed. Run: pip install anthropic")
    else:
        from openai import OpenAI
        return OpenAI()


def call_llm(client, system_prompt: str, user_prompt: str) -> str:
    """Send a prompt to the configured LLM and return the response text."""
    if LLM_PROVIDER == "anthropic":
        response = client.messages.create(
            model=LLM_MODEL,
            max_tokens=4096,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return response.content[0].text
    else:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return response.choices[0].message.content


# Initialize clients and data
llm_client = create_llm_client()

# Also need OpenAI for embeddings regardless of LLM provider
from openai import OpenAI as OpenAIClient

embedding_client = OpenAIClient()

logger.info("Loading FAISS index from %s", INDEX_PATH)
index = faiss.read_index(INDEX_PATH)
logger.info("FAISS index loaded: %d vectors", index.ntotal)

with open(ID_MAP_PATH, "r", encoding="utf-8") as f:
    id_map: list[str] = json.load(f)

logger.info("Loaded id_map with %d entries", len(id_map))
logger.info("LLM provider: %s, model: %s", LLM_PROVIDER, LLM_MODEL)

# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Tweet Explorer API",
    description="Semantic search and LLM analysis over a crypto Twitter corpus.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def as_list(value: str) -> list[str]:
    """Split a comma-separated string into a list."""
    if isinstance(value, str) and "," in value:
        return value.split(",")
    return [value]


def safe_float(value) -> float | None:
    """Parse a float, returning None for NaN/inf/unparseable values."""
    try:
        f = float(value)
        if f != f or abs(f) == float("inf"):
            return None
        return round(f, 4)
    except (TypeError, ValueError):
        return None


def safe_json_field(value) -> list:
    """Parse a JSON string, returning empty list on failure."""
    if value is None or value == "NaN":
        return []
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return []


def row_to_dict(row: tuple) -> dict:
    """Convert a SQLite row tuple to a tweet dictionary."""
    return {
        "id": row[0],
        "text": row[1],
        "summary": row[2],
        "insights": json.loads(row[3]),
        "vision_captions": safe_json_field(row[4]),
        "tags": json.loads(row[5]),
        "llm_tags": safe_json_field(row[6]),
        "semantic_tags": safe_json_field(row[7]),
        "author": row[8],
        "handle": row[9],
        "year": row[10],
        "month": row[11],
        "date": row[12],
        "createdAt": row[13],
        "url": row[14],
        "replyCount": row[15],
        "quoteCount": row[16],
        "retweetCount": row[17],
        "likeCount": row[18],
        "views": row[19],
        "bookmarkCount": row[20],
        "allMediaURL": safe_json_field(row[24]),
        "image_tags": safe_json_field(row[26]),
    }


def extract_primary_tags(image_tags_data: list) -> list[str]:
    """Extract primary_tag values from the nested image_tags structure."""
    if not isinstance(image_tags_data, list):
        return []
    return [
        item["primary_tag"]
        for item in image_tags_data
        if isinstance(item, dict) and "primary_tag" in item
    ]


def extract_subtags(image_tags_data: list) -> list[str]:
    """Extract all subtag values from the nested image_tags structure."""
    if not isinstance(image_tags_data, list):
        return []
    subtags = []
    for item in image_tags_data:
        if isinstance(item, dict) and "subtags" in item:
            subtags.extend(item.get("subtags", []))
    return subtags


def filter_matches(matches: list[dict], **filters) -> list[dict]:
    """Apply metadata filters to a list of tweet dicts. OR logic for multi-select."""
    results = []
    for m in matches:
        # Date filters
        if filters.get("year") and m.get("year") != filters["year"]:
            continue
        if filters.get("month") and m.get("month") != filters["month"]:
            continue
        if filters.get("start_date") and m.get("date") and m["date"] < filters["start_date"]:
            continue
        if filters.get("end_date") and m.get("date") and m["date"] > filters["end_date"]:
            continue

        # Tag filters (OR across selected values)
        if filters.get("tag"):
            if not any(t in (m.get("tags") or []) for t in as_list(filters["tag"])):
                continue

        # Image tag filters (nested structure)
        if filters.get("image_tag"):
            primary_tags = extract_primary_tags(m.get("image_tags") or [])
            if not any(t in primary_tags for t in as_list(filters["image_tag"])):
                continue

        if filters.get("image_subtag"):
            all_subtags = extract_subtags(m.get("image_tags") or [])
            if not any(t in all_subtags for t in as_list(filters["image_subtag"])):
                continue

        # Account filters
        if filters.get("author"):
            if m.get("author") not in as_list(filters["author"]):
                continue
        if filters.get("handle"):
            if m.get("handle") not in as_list(filters["handle"]):
                continue

        # Engagement thresholds
        if (m.get("likeCount") or 0) < filters.get("min_likes", 0):
            continue
        if (m.get("views") or 0) < filters.get("min_views", 0):
            continue
        if (m.get("retweetCount") or 0) < filters.get("min_retweets", 0):
            continue
        if (m.get("quoteCount") or 0) < filters.get("min_quotes", 0):
            continue
        if (m.get("replyCount") or 0) < filters.get("min_replies", 0):
            continue
        if (m.get("bookmarkCount") or 0) < filters.get("min_bookmarks", 0):
            continue

        results.append(m)
    return results


def embed_query(text: str) -> np.ndarray:
    """Generate an embedding vector for a search query."""
    response = embedding_client.embeddings.create(
        model="text-embedding-3-large",
        input=[text],
        dimensions=1536,
    )
    return np.array(response.data[0].embedding, dtype="float32").reshape(1, -1)


def search_faiss(query_vector: np.ndarray, top_k: int) -> list[tuple[str, float]]:
    """Search the FAISS index, returning (tweet_id, score) pairs."""
    distances, indices = index.search(query_vector, top_k)
    results = []
    for idx, score in zip(indices[0], distances[0]):
        if idx < 0:
            continue
        tweet_id = id_map[int(idx)]
        results.append((tweet_id, float(score)))
    return results


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/filters")
def get_filters() -> dict:
    """Return all distinct filter values for the frontend dropdowns."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    tags: set[str] = set()
    authors: set[str] = set()
    handles: set[str] = set()
    image_tags: set[str] = set()
    image_subtags: set[str] = set()

    cursor.execute("SELECT tags, author, handle, image_tags FROM tweets")
    for row in cursor.fetchall():
        tags.update(json.loads(row[0]))
        authors.add(row[1])
        handles.add(row[2])

        image_entry = json.loads(row[3])
        if isinstance(image_entry, list):
            for item in image_entry:
                tag = item.get("primary_tag")
                if tag:
                    image_tags.add(tag)
                for st in item.get("subtags", []):
                    image_subtags.add(st)

    conn.close()
    return {
        "tags": sorted(tags),
        "authors": sorted(authors),
        "handles": sorted(handles),
        "image_tags": sorted(image_tags),
        "image_subtags": sorted(image_subtags),
    }


@app.get("/search")
def search(
    text: Optional[str] = None,
    top_k: int = Query(default=100, ge=1, le=10000),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    tag: Optional[str] = None,
    image_tag: Optional[str] = None,
    image_subtag: Optional[str] = None,
    author: Optional[str] = None,
    handle: Optional[str] = None,
    min_likes: int = 0,
    min_views: int = 0,
    min_retweets: int = 0,
    min_quotes: int = 0,
    min_replies: int = 0,
    min_bookmarks: int = 0,
) -> JSONResponse:
    """Semantic search (if text provided) or metadata-only search with filters."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        matches = []

        if text:
            query_vector = embed_query(text)
            faiss_results = search_faiss(query_vector, top_k)

            for tweet_id, score in faiss_results:
                cursor.execute("SELECT * FROM tweets WHERE id = ?", (tweet_id,))
                row = cursor.fetchone()
                if row:
                    match = row_to_dict(row)
                    match["score"] = safe_float(score)
                    matches.append(match)
        else:
            cursor.execute("SELECT * FROM tweets")
            for row in cursor.fetchall():
                match = row_to_dict(row)
                match["score"] = None
                matches.append(match)

        conn.close()

        filtered = filter_matches(
            matches,
            start_date=start_date, end_date=end_date,
            year=year, month=month,
            tag=tag, image_tag=image_tag, image_subtag=image_subtag,
            author=author, handle=handle,
            min_likes=min_likes, min_views=min_views,
            min_retweets=min_retweets, min_quotes=min_quotes,
            min_replies=min_replies, min_bookmarks=min_bookmarks,
        )

        total = len(filtered)
        start_idx = (page - 1) * page_size
        paginated = filtered[start_idx : start_idx + page_size]

        return JSONResponse({
            "query": text or "(metadata search)",
            "page": page,
            "page_size": page_size,
            "total_matches": total,
            "matches": paginated,
        })

    except Exception as e:
        logger.error("Search failed: %s", traceback.format_exc())
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/query")
def query_with_llm(
    text: str = Query(..., min_length=1),
    top_k: int = Query(default=100, ge=1, le=10000),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    tag: Optional[str] = None,
    image_tag: Optional[str] = None,
    image_subtag: Optional[str] = None,
    handle: Optional[str] = None,
    min_likes: int = 0,
    min_views: int = 0,
    min_retweets: int = 0,
    min_quotes: int = 0,
    min_replies: int = 0,
    min_bookmarks: int = 0,
) -> JSONResponse:
    """Retrieve matching tweets and send them to an LLM for analysis."""
    try:
        query_vector = embed_query(text)
        faiss_results = search_faiss(query_vector, top_k)

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        matches = []

        for tweet_id, score in faiss_results:
            cursor.execute("SELECT * FROM tweets WHERE id = ?", (tweet_id,))
            row = cursor.fetchone()
            if row:
                match = row_to_dict(row)
                match["score"] = safe_float(score)
                matches.append(match)

        conn.close()

        filtered = filter_matches(
            matches,
            start_date=start_date, end_date=end_date,
            year=year, month=month,
            tag=tag, image_tag=image_tag, image_subtag=image_subtag,
            handle=handle,
            min_likes=min_likes, min_views=min_views,
            min_retweets=min_retweets, min_quotes=min_quotes,
            min_replies=min_replies, min_bookmarks=min_bookmarks,
        )

        logger.info("Tweets sent to LLM for context: %d", len(filtered))
        if not filtered:
            logger.warning("No tweets matched filters — LLM receives no context")

        # Build rich context from tweet data
        def format_tweet_context(i: int, m: dict) -> str:
            parts = [f"Tweet {i + 1} (@{m.get('handle', '?')}, {m.get('date', '?')}):"]
            parts.append(f"Text: {m.get('text', '')}")
            if m.get("tags"):
                parts.append(f"Tags: {', '.join(m['tags'])}")
            if m.get("vision_captions"):
                parts.append(f"Image: {'; '.join(m['vision_captions'])}")
            if m.get("image_tags"):
                img_labels = [
                    t["primary_tag"] for t in m["image_tags"]
                    if isinstance(t, dict) and "primary_tag" in t
                ]
                if img_labels:
                    parts.append(f"Image tags: {', '.join(img_labels)}")
            if m.get("summary"):
                parts.append(f"Summary: {m['summary']}")
            if m.get("insights"):
                parts.append(f"Insights: {', '.join(m['insights'])}")
            return "\n".join(parts)

        context = "\n\n".join(
            format_tweet_context(i, m) for i, m in enumerate(filtered)
        )
        user_prompt = f"Here are tweets from a crypto discourse corpus:\n\n{context}\n\nBased on these tweets, answer: {text}"

        system_prompt = "You are a crypto discourse analyst."
        llm_response = call_llm(llm_client, system_prompt, user_prompt)

        return JSONResponse({
            "query": text,
            "matches": filtered,
            "gpt_response": llm_response,
        })

    except Exception as e:
        logger.error("Query failed: %s", traceback.format_exc())
        return JSONResponse(status_code=500, content={"error": str(e)})


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
