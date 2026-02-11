# Vibe Coding as Methodology: The Complete Pipeline Report

> A comprehensive record of the dissertation Twitter data analysis pipeline — from ethnographic immersion through computational operationalization to queryable research instrument.

---

## 1. Overview

### What This Pipeline Produced

A system for semantically querying ~79,000 crypto Twitter posts, built to support a dissertation on how Crypto Twitter (CT) produces particular kinds of participants through algorithmic ranking, discourse genres, and visual devices. The final system — now published as **Tweet Explorer** on GitHub — lets a researcher:

- Search the corpus by *meaning* (vector similarity) rather than keywords
- Filter by ethnographically-derived discourse categories (46 tags), accounts, dates, engagement
- Ask an LLM to synthesize patterns across matching tweets
- Export filtered results for qualitative close-reading

### What It Took to Build

The pipeline evolved across two distinct phases over approximately two years:

1. **Phase 1: Ethnographic Data Collection & Manual Coding** — Account selection, extraction, typological classification, and manual tagging in Excel. This phase produced the *categories* and the *corpus*.
2. **Phase 2: Computational Pipeline** — CSV→JSON conversion, regex tagging (four iterations), semantic tagging (one experiment), LLM enrichment, image captioning, vectorization, and a query interface. This phase *operationalized* the categories at scale.

### The Core Methodological Principle

**Computation follows ethnography.** At every stage, the computational tools were built to operationalize categories that emerged from years of immersion in crypto discourse. The researcher's embedded knowledge of CT — what terms mean, what practices they index, what stances they encode — generated the analytical vocabulary. LLMs and code then scaled that vocabulary across 79,000+ texts.

This is the double meaning of "vibe coding": ethnographic attunement to the affective atmospheres of digital discourse ("vibing" with the data) converging with LLM-assisted programming ("vibe coding" the tools). The researcher who *vibes with the scene* also *vibe-codes the instruments* to analyze it.

---

## 2. Phase 1: Ethnographic Data Collection & Manual Coding

### 2a. Account Identification and Extraction

**The ethnographic rationale.** Account selection was not random sampling. It was *curated ethnographically* — leveraging the researcher's embedded knowledge of CT to identify influential accounts, discourse clusters, and moments of discursive salience. The researcher had spent 10+ years as a participant-observer in crypto spaces, active as trader, lurker, and interlocutor across multiple market cycles.

**The tool.** TwExtract, a Twitter data extraction tool, pulled full timelines into structured CSV format. Each CSV preserved: `id`, `tweetText`, `tweetURL`, `type`, `tweetAuthor`, `handle`, `replyCount`, `quoteCount`, `retweetCount`, `likeCount`, `views`, `bookmarkCount`, `createdAt`, `allMediaURL`, `videoURL`.

**The numbers.** 37 accounts were extracted individually, each into a timestamped CSV (e.g., `TwExtract-blknoiz06-20240913_090806.csv`). Extraction dates ranged from September to December 2024, indicating a systematic campaign. The full list:

```
0xSisyphus, 0xWangarian, adamscochran, AltcoinSherpa, Arthur_0x, AviFelman,
AWice, blknoiz06, CarpeNoctom, cburniske, ColdBloodShill, CredibleCrypto,
Crypto_McKenna, CryptoCred, CryptoDonAlt, CryptoHayes, CryptoKaleo, dcfgod,
Fiskantes, hedgedhog7, hosseeb, intocryptoverse, KeyboardMonkey3, KyleSamani,
mrjasonchoi, MustStopMurad, Pentosh1, Pool2Paulie, pythianism, QwQiao,
Rewkang, santiagoroel, Tradermayne, Travis_Kling, Web3Quant, zhusu, ZoomerOracle
```

File sizes varied dramatically — `blknoiz06` at 26.6 MB (one of the most prolific accounts) vs. `QwQiao` at 280 KB — reflecting real differences in posting volume and style.

**Location:** `C:\Users\bhara\OneDrive\Desktop\Twitter Data\Selections\`

### 2b. Account Typology

Two typed databases were created:
- **Fundamentalist Twitter Database** (24 MB) — accounts oriented toward protocol analysis, value investing, macro thesis
- **Trader Twitter Database** (42 MB) — accounts focused on technical analysis, market timing, sentiment trading

These categories — *Trader* and *Fundamentalist* — emerged from ethnographic observation. They map onto native CT distinctions: accounts that think in *charts and entries* vs. accounts that think in *theses and narratives*. A third category, *Shitposter*, was discussed but may not have produced a separate database. A fourth, *Macro*, captured accounts operating at the intersection of crypto and traditional finance.

The typed databases were multi-sheet Excel workbooks where individual account timelines were organized as separate tabs, consolidating all tweets from Jan 2020 to May 2024.

**Location:** `C:\Users\bhara\OneDrive\Desktop\Twitter Data\`
- `Fundamentalist Twitter Database_Jan 2020-May 2024_Consolidated_Analyzing.xlsx`
- `Trader Twitter Database_Jan 2020-May 2024_Consolidated_Analyzing.xlsx`

### 2c. Manual Coding and Early Analysis

Manual coding happened in the Excel workbooks. The `analyzetweets.py` script (`C:\Users\bhara\OneDrive\Desktop\Twitter Data\analyzetweets.py`) reveals the first computational move: loading both databases, merging all sheets, and tagging tweets containing "generational" or "generation" — one of the dissertation's key analytical categories:

```python
def tag_tweets(df):
    mask = df['tweetText'].str.contains(
        r'\bgenerational\b|\bgeneration\b', case=False, na=False
    )
    df.loc[mask, 'Generated_Tags'] = 'Generational'
    return df
```

This produced `Combined_Twitter_Data.xlsx` (61 MB) — the first unified dataset.

Further analysis scripts followed:

- **`consolidatedanalysis.py`** — Posts per handle, monthly trends, tweet length distribution (0-100 / 100-300 / 300+ chars), and LDA topic modeling (5 topics) using scikit-learn. Standard exploratory analysis.

- **`topicmodelscript.py`** — A more sophisticated topic model run on a single account (`QwQiao`), with a *custom tokenizer preserving 80+ crypto-specific terms*. This is significant: the tokenizer is a hand-built vocabulary of CT discourse features (degen, whale, maxi, larp, threadooor, rotatooor, midcurve, hodler, rugpull, paper_hands, diamond_hands, wagmi, ngmi, hfsp, iykyk, rekt, kek, ponzi, supercycle, leftcurve, memecoin, wealth_effect, top_signal, time_preference, etc.). It's a proto-version of what would later become the full `crypto_vocab_tags.json`.

### 2d. Peak Activity Selection

The `peak posts.py` script (`C:\Users\bhara\OneDrive\Desktop\Twitter Data\Selections\peak posts.py`) reveals a methodologically important step: manually identifying high-activity periods for each account, then filtering the combined dataset to those windows.

```python
notable_periods = {
    "@0xSisyphus": [("2021-08-01", "2021-08-31"), ("2021-08-23", "2021-08-29")],
    "@CryptoHayes": [("2022-11-01", "2022-11-30"), ("2022-11-07", "2022-11-13")],
    "@CryptoKaleo": [("2021-04-01", "2021-04-30"), ("2021-04-05", "2021-04-11")],
    "@MustStopMurad": [("2024-07-01", "2024-07-31"), ("2024-07-01", "2024-07-07")],
    # ... 21 accounts with 2 periods each (74 total periods)
}
```

The periods capture *moments of maximum visibility and discourse intensity* — bull market peaks (April 2021), bear market capitulation (November 2022 / FTX collapse), altcoin seasons, recovery rallies. These aren't random samples; they're ethnographically selected for when accounts' framing would be most influential to followers. Output: `peak_posts.csv` (38,347 tweets).

### 2e. The Material Constraint

The `import os.py` script concatenated all 37 CSVs into `combined_filtered.csv` (155 MB, 1,133,887 tweets filtered to post-2020). The full corpus is 600,000+ tweets across the broader collection.

At this scale, Excel-based manual coding became unworkable. The Trader and Fundamentalist databases alone were 66 MB combined. Hardware limitations (Excel struggling with 1M+ rows), the sheer volume of text, and the need for systematic pattern detection across the full corpus drove the transition to computational methods.

---

## 3. Phase 2: The Computational Pipeline

### 3a. CSV → JSON Conversion

**The script:** `twitter_chunker.py` (and batch variants `twitter_chunker_batch.py`, `twitter_chunker_batch_split.py`)

**What it did:** Transformed raw CSV tweet data into structured JSON with rich metadata:

```python
meta = {
    "author": row.get("tweetAuthor", ""),
    "text_type": "Twitter Dump",
    "source_type": "Tweets",
    "handle": row.get("handle", ""),
    "createdAt": created_str,
    "date": created.date().isoformat(),
    "month": created.month,
    "year": created.year,
    "replyCount": safe_int(row.get("replyCount", 0)),
    "quoteCount": safe_int(row.get("quoteCount", 0)),
    "retweetCount": safe_int(row.get("retweetCount", 0)),
    "likeCount": safe_int(row.get("likeCount", 0)),
    "views": safe_int(row.get("views", 0)),
    "bookmarkCount": safe_int(row.get("bookmarkCount", 0)),
    "allMediaURL": row.get("allMediaURL", None),
    "videoURL": row.get("videoURL", None),
    "tags": []  # Pre-allocated for later tagging
}
```

**Key decisions:**
- **JSON over CSV** — JSON's nested structure supported extensibility: tags, image_tags, vision_captions, and LLM enrichment could be added as nested fields without schema changes
- **Pre-allocated `tags: []`** — Forward-looking design; empty arrays ready for the tagging pipeline
- **Date decomposition** — `createdAt` was parsed into separate `date`, `month`, `year` fields for efficient filtering
- **Line-delimited JSON** — Compatible with OpenAI's Files API for cloud vector store upload

### 3b. Chunking and Preparation

**Why chunking was necessary:** File size limits for OpenAI's vector store API (and practical processing constraints) required splitting large accounts into manageable parts. The batch splitter (`twitter_chunker_batch_split.py`) split JSON files into ~10 MB parts.

**Output:** `dumpv1/` (61 files, 796 MB) → `prepared jsons/` (114 files, 1.2 GB)

### 3c. Regex Tagging — The Four Versions

This is the heart of the pipeline's evolution. Each version solved a problem the previous version revealed.

#### Version 1: `regex_batch_tagger.py`

**Purpose:** Baseline pattern matching — apply the vocabulary to the tweet corpus.

```python
def regex_pass(text, vocab):
    hits = [tag["name"] for tag in vocab
            if any(rx.search(text) for rx in tag["rx"])]
    return hits
```

**Input:** JSON tweet files + `crypto_vocab_tags.json`
**Output:** CSV with `regex_tags` column + stats JSON
**Logic:** Load vocab, compile patterns case-insensitively, iterate all tweets, test all patterns, collect matches.

**What it revealed:** The basic approach worked — tags hit across the corpus. But the output format (CSV) didn't integrate back into the JSON pipeline well, and the hit rates needed investigation.

#### Version 2: `regex_batch_taggerv2.py`

**New features:**
- Filter by media URL presence (only count tweets with images)
- Filter by year range (2020-2024)
- Tag frequency counter (`Counter` from collections)

```python
if regex_tags and all_media_url and str(all_media_url).lower() not in ["nan", "none", ""] and 2020 <= tweet_year <= 2024:
```

**What it solved:** Allowed targeted analysis — specifically, understanding which tagged tweets also contained images (relevant for the visual discourse analysis chapters).
**What it revealed:** The need for a lighter-weight output format that could feed directly into vector store metadata updates.

#### Version 3: `regex_batch_taggerv3.py`

**New feature:** Minimal JSON output alongside the full CSV.

```python
minimal_updates = [{"id": tweet["id"], "regex_tags": regex_tags}]
```

**Design rationale:** Separated "full data for analysis" (CSV) from "vector metadata updates" (JSON). The minimal JSON could patch the cloud vector store without re-uploading full tweet records.

**What it revealed:** After examining results at scale, a false positive problem emerged. Tags like "cycle" matched "bicycle" and "recycling." Tags like "pump" matched "pumpkin." Tags without word boundaries were over-counting dramatically.

#### Version 4: `regex_json_taggerv4.py` — The Current Version

**Architecture change:** Direct in-place JSON modification, no CSV intermediate.

```python
def compile_patterns(vocab):
    for tag, keywords in vocab.items():
        combined_regex = r"|".join([f"\\b{kw}\\b" for kw in keywords])
        patterns[tag] = re.compile(combined_regex, re.IGNORECASE)
    return patterns

def tag_tweet(tweet_text, patterns):
    matched_tags = [tag for tag, pattern in patterns.items()
                    if pattern.search(tweet_text)]
    return matched_tags

# In-place modification:
tweet.setdefault("metadata", {}).setdefault("tags", []).extend(matched_tags)
```

**Key changes from v3:**
- **Word boundary enforcement:** `\\b{kw}\\b` wraps every keyword pattern, preventing substring matches
- **Pre-compiled combined regex** — all keywords for a tag compiled into a single alternation pattern (more efficient)
- **Direct JSON modification** — reads prepared JSONs, writes to `tagged jsonsv4/` directory
- **Path-based I/O** — uses `pathlib.Path` objects for clarity

**The quantitative impact of word boundaries** — The structural change was from patterns like `pump` (matching "pumpkin," "pumped-up") to `\bpump\b` (matching only the standalone word). The v3 statistics files are on an unmounted drive and not currently accessible for direct comparison, but the effect is visible in the vocabulary itself: tags in the generic glossary layer (e.g., `vapor`, `PvP`, `generational`) had keywords with no word boundaries, meaning every substring match inflated their counts. The v4 final counts below should be understood as *corrected* baselines — the pre-boundary numbers were higher, in some cases substantially so, for short common-substring tags like `ape`, `pump`, `cycle`, and `retail`. The global tag summary report (`NOTES-DATA-tag_summary_report_global_only.json`) shows the corrected counts:

| Tag | Final Count | Category |
|-----|-------------|----------|
| shilling | 11,155 | Highest — CT's promotion culture |
| pumping | 9,503 | Market manipulation discourse |
| liquidity | 9,227 | Financial infrastructure |
| cycle | 8,560 | Temporal framing |
| memecoin | 5,734 | Asset class |
| retail | 4,095 | Participant category |
| rekt | 4,064 | Outcome |
| leveraged trading | 3,468 | Trading practice |
| funding | 3,415 | Market mechanics |
| Consolidation | 3,208 | Market state |
| FUD | 2,629 | Sentiment manipulation |
| FOMO | 2,294 | Psychological driver |
| PnL_Flexing | 2,062 | Performance display |
| degen | 1,326 | Identity category |
| China Ban | 110 | Specific event |
| Time Preference | 97 | Theoretical concept |
| supercycle | 72 | Narrative |
| PvE | 67 | Lowest — niche concept |

**Total regex tag instances across corpus: 97,857**

#### Special-Purpose: `pnl_flexing_tagger.py`

A single-tag variant that ran only the `PnL_Flexing` tag against the corpus:

```python
selected_tags = ['PnL_Flexing']  # Only process this tag
```

**Why it existed:** When new tags were developed or refined (like PnL_Flexing, which captured the dissertation's core interest in wealth display), they could be run incrementally without re-running the full pipeline. This is "computation follows ethnography" in practice — a new ethnographic insight produced a new tag, which needed its own focused pass.

#### Hybrid Validation: `twitter_tagger.py`

A comparison tool that ran regex alongside GPT-4o-mini:

```python
def regex_pass(text, vocab):
    hits = [tag["name"] for tag in vocab ...] or ["no_regex_match"]

def llm_pass(text, vocab, client):
    messages = [
        {"role": "system", "content": "Return JSON array of tag names..."},
        {"role": "user", "content": text},
    ]
```

**Purpose:** Validation — run both regex and LLM tagging on the same tweets, compare results side-by-side. This quantified where regex was sufficient and where LLM interpretation added value.

### 3d. The Vocabulary File: `NOTES-crypto_vocab_tags.json`

**Location:** `G:\My Drive\Work\Claude Artifacts\0. Dissertation\NOTES-crypto_vocab_tags.json`

This is the pipeline's analytical core — 46 tags with definitions and keyword patterns. It has a visible two-layer structure that reveals its authorship history.

#### Layer 1: The Generic Glossary (Tags 1–36)

The first 36 tags use 2-space indentation and a mix of keyword styles:

```json
{
    "name": "vapor",
    "definition": "Crypto tokens lacking real utility, product, or tangible backing...",
    "keywords": ["vapor", "vaporware", "speculative token"]
},
{
    "name": "PvP",
    "definition": "A competitive market condition where traders directly profit from others' losses...",
    "keywords": ["PvP", "player versus player", "competitive trading"]
},
{
    "name": "generational",
    "definition": "Opportunities perceived as rare, substantial financial events...",
    "keywords": ["generational", "once-in-a-lifetime", "wealth transfer"]
}
```

**Characteristics:**
- Keywords are *short phrases without word boundaries* — no `\b` wrappers
- Definitions read as *dictionary entries* — neutral, generic explanations
- 3-4 keywords per tag, mostly literal
- Some tags DO have word boundaries (cycle, altseason, pumping, rug pull, diamond hands, PnL_Flexing) — these were likely refined in a later editing pass

**This layer reads like an LLM-generated glossary** — comprehensive, even-handed, defining terms any crypto observer might recognize.

#### Layer 2: The Ethnographic Categories (Tags 37–46)

Starting from the duplicate `bagholder` entry (line 208), the style shifts dramatically:

```json
{
    "name": "bagholder",
    "definition": "Investors holding significantly depreciated crypto assets due to mistimed entries, market downturns, or project failures...",
    "keywords": ["bagholders?", "heavy bags?", "holding bags?", "\\bstuck holders?\\b", "\\btrapped investors?\\b"]
},
{
    "name": "BTC Leadership",
    "definition": "Condition in the crypto market where Bitcoin's price movements precede and strongly influence the direction of altcoins...",
    "keywords": ["BTC leads?", "bitcoin leads?", "\\bBTC dominance\\b", "\\bBTC moves first\\b", "\\bBitcoin-led\\b"]
}
```

**Characteristics:**
- 4-space indentation (different authoring session)
- Keywords use **regex quantifiers** (`bagholders?`, `BTC leads?`) and **consistent word boundaries** (`\b`)
- Definitions are *analytically richer* — not just defining terms but specifying their *function in discourse*
- More keywords per tag (5-8 vs 3-4)
- Tags like `top signal`, `trader mindset`, `main character` capture *practices* and *subject positions*, not just vocabulary

The later tags also include:
- **Consolidation** (line 194): 8 keywords with sophisticated regex (`\bprice chop(ping)?\b`, `\b(distribution|accumulation) phase\b`, `\bchoppy market\b`)
- **trader mindset** (line 254): Captures psychological orientation (`\bstick(ing)? to (the )?plan\b`, `\bmanage risk\b`)
- **main character** (line 268): Captures CT's attention economy (`\bmain character\b`, `\bcenter of attention\b`, `\bElon\b`)

#### Duplicates and Overlaps

Two tags appear twice, revealing the layering:

1. **bagholder** — Line 164 (simple: `"bagholder", "holding bags", "trapped investor"`) and line 208 (sophisticated: `"bagholders?", "heavy bags?", "\\bstuck holders?\\b"`)
2. **Supercycle** — Line 228 (mixed: some `\b`, keywords like "up only") and **supercycle** (line 280, lowercase, all `\b`, different keywords like "institutional adoption", "generational shift")

These duplicates are *archaeological evidence*: the later entries didn't replace the earlier ones, they supplemented them. The pipeline compiled both, meaning tweets could match on either version's patterns.

#### The Subset: `subset_vocab_tags.json`

A curated subset of just 4 tags: `top signal`, `trader mindset`, `main character`, `supercycle`. These are the most ethnographically specific tags — concepts that emerged from deep immersion, not from any glossary. They represent the dissertation's core analytical interests: how CT constructs attention hierarchies (main character), psychological discipline (trader mindset), market temporality (supercycle), and reflexive market commentary (top signal).

### 3e. Semantic Tagging — The Experiment That Underperformed

**Script:** `semantic_tagging.py`

**The concept:** Use sentence embeddings to match tweets to tag *definitions* by meaning, not keywords. A tweet about "this market feels like it's about to blow off the top" should match "euphoria" even without the literal word.

**Implementation:**
```python
# Model: all-MiniLM-L6-v2 (SentenceTransformer, 384 dims)
tag_embeddings = model.encode(tag_definitions, convert_to_tensor=True, normalize_embeddings=True)

for batch in tweet_batches:  # 1024 tweets per batch, CUDA
    tweet_embeds = model.encode(tweet_texts, ...)
    cosine_scores = util.cos_sim(tweet_embeds, tag_embeddings)

    for scores in cosine_scores:
        matched_tags = [tag_names[idx] for idx, score in enumerate(scores)
                        if score >= 0.55]  # Cosine threshold
```

**Results (from global tag summary):**

| Tag | Regex Hits | Semantic Hits | Ratio |
|-----|-----------|---------------|-------|
| shilling | 11,155 | 2,057 | 5.4:1 |
| altseason | 614 | 2,658 | 1:4.3 |
| vapor | 379 | 1,297 | 1:3.4 |
| cycle | 8,560 | 449 | 19:1 |
| memecoin | 5,734 | 642 | 8.9:1 |
| midcurve | 242 | 675 | 1:2.8 |
| degen | 1,326 | 746 | 1.8:1 |
| pumping | 9,503 | 18 | 528:1 |
| ape | 2,127 | 1 | 2,127:1 |

**Total: 97,857 regex hits vs. 10,351 semantic hits**

**Why it underperformed:**
- **Threshold too conservative** — 0.55 cosine similarity is high. Short tweets (most are <280 chars) don't generate enough semantic signal to clear the bar.
- **Model too small** — `all-MiniLM-L6-v2` is a general-purpose 384-dim model, not fine-tuned for crypto discourse. The semantic space doesn't capture domain-specific meanings.
- **Definition mismatch** — Tag definitions are analytical prose; tweets are slang, abbreviations, and memes. The embedding spaces don't align well.
- **Interesting anomalies** — Semantic tagging *outperformed* regex for "altseason" (2,658 vs 614) and "vapor" (1,297 vs 379), suggesting these concepts are often discussed without their literal terms. "Midcurve" similarly caught more semantic hits, possibly because people describe the concept without using the word.

**The verdict:** An experiment, not a failure. The concept was sound — semantic matching should capture what regex misses — but the implementation wasn't tuned for this domain. The semantic tags were kept as a separate metadata field (`metadata.semantic_tags`) and preserved through the merge, but they play a secondary role to regex tags in the final system.

### 3f. Tag Merging

**Script:** `merge_tagged_jsons.py`

**Problem:** Two separate tag layers needed reconciliation.

**Solution:** Keep them separate but co-located:

```python
def dedup_case_insensitive(tags):
    seen = set()
    unique = []
    for tag in tags:
        if tag.lower() not in seen:
            seen.add(tag.lower())
            unique.append(tag)
    return unique

# Merge: preserve provenance
metadata["tags"] = merged_tags          # regex layer
metadata["semantic_tags"] = merged_sem_tags  # semantic layer
```

**Key decision:** Tags were NOT merged into a single field. Keeping `tags` and `semantic_tags` separate preserves provenance — you can query by source, compare coverage, and trust the regex layer's higher precision when needed.

**Output:** `merged_tags_final/` (114 files, ~1.3 GB)

### 3g. LLM Enrichment

**Script:** `llm_enrich.py` in `enriched_final/`

**What problem it solved:** Regex tags tell you *that* a tweet is about "cycle" or "euphoria." They don't tell you *how* — what stance the author takes, what the tweet adds to the discourse. The enrichment layer filled this gap.

**Implementation:**
```python
def enrich_text(tweet_text, tag):
    prompt = (
        f"You are analyzing Twitter discourse with the specific theme '{tag}'. "
        f"Given the tweet: \"{tweet_text}\", "
        f"briefly explain its relevance to the theme '{tag}'."
    )
    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=100
    )
    return response.choices[0].message.content.strip()
```

**The input structure** organized tweets by tag — all "cycle" tweets grouped together, all "euphoria" tweets grouped — then enriched each tweet with a brief LLM-generated explanation of its relevance to the theme.

**Output fields:** `summary` and `insights` per tweet, stored in the enriched JSON and later the SQLite database.

**This is a DIFFERENT use of LLMs from the coding phase.** When writing the Python scripts, the LLM was *infrastructure* — a plumber helping build the pipes. Here, the LLM is doing *interpretive work* — reading tweets and explaining their discursive significance. The ethnographic judgment enters through the prompt design (which tags to enrich, what "relevance" means) and through the prior tagging (only tagged tweets get enriched, and the tags came from ethnographic categories).

**Output:** `enriched_final/enriched jsons/` (18 parts, 164 MB) → `combined_enriched.json`

### 3h. Image Processing

**Script:** `image_embed_async.py` in `misc/image/`

**The problem:** ~20% of tagged tweets contained images — trading charts, memes, screenshots, annotated graphics. These are *central* to CT communicative practices. Charts are arguments. Memes are stances. Screenshots are evidence. Ignoring them loses a major discourse channel.

**The solution:** GPT-4o-mini vision captioning:

```python
async def caption_image(url, sem, pause):
    resp = await async_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "type": "text",
            "text": "Describe this image in one short factual sentence."
        }, {
            "type": "image_url",
            "image_url": {"url": url, "detail": "low"}
        }],
        max_tokens=25
    )
```

**Rate limiting:** 2 concurrent requests, 24-second pause between captions (~5 images/minute under 200K TPM quota).

**The recursive tagging move:** After vision captioning, the captions themselves were tagged using the ethnographic vocabulary's regex patterns. A caption like "A candlestick chart showing extreme price volatility with annotated support levels" gets tagged with `Consolidation` and picks up image subtags like `candlestick`, `support`, `price movements`.

**This is "computation follows ethnography" applied to images.** The vision API sees what's in the image (perception). The ethnographic vocabulary tags what it *means* in CT context (interpretation). A chart isn't just a chart — it's evidence of a particular analytical orientation.

**Image tag statistics (from global summary):**

| Primary Tag | Count |
|-------------|-------|
| Charts & Graphs | 10,329 |
| Technical Analysis | 9,162 |
| Cryptocurrency & Digital Assets | 8,007 |
| Trading Platforms | 4,398 |
| Social Media & Communication | 2,829 |
| Human Elements | 1,951 |
| Nature & Environment | 1,947 |

The dominance of charts and technical analysis images confirms what ethnographic observation suggested: CT is a *visual epistemic culture* where knowledge claims are primarily made through chart markup and pattern recognition.

**Output:** `vision_batches/` (66 files, 602 MB)

### 3i. Vectorization and Retrieval

**Script:** `build_local_vector_store.py` in `misc/local embedding/`

**Three distinct components, often conflated:** The "vectorization" step involves three separate technologies doing three different jobs:

1. **The embedding model** (OpenAI `text-embedding-3-large`): A neural network that converts text into 1536-dimensional numerical vectors. This is the actual "vectorization" — it turns words into numbers that encode semantic meaning. Each tweet becomes a point in 1536-dimensional space, where proximity corresponds to meaning-similarity. This is a cloud API call — it costs money (~$0.13 per million tokens) and requires an internet connection.

2. **The index** (FAISS — Facebook AI Similarity Search): A library for fast nearest-neighbor search over pre-computed vectors. FAISS is *not* an embedding algorithm and not a model. It's a specialized data structure — think of it as a database optimized for the question "which stored vectors are closest to this query vector?" Specifically, `IndexFlatL2` was used: exhaustive L2 (Euclidean) distance comparison with no approximation, ensuring full transparency and reproducibility.

3. **The metadata store** (SQLite): A relational database holding all tweet data — text, tags, summaries, engagement metrics, URLs, everything. FAISS only knows about vectors and index positions. SQLite holds the actual content.

**Embedding composition:** Each tweet's embedding combines multiple text layers:
```python
block = "\n".join([
    tweet.get("text", ""),                      # Original tweet
    " ".join(tweet.get("vision_captions", [])),  # Image descriptions
    enrichment.get("summary", ""),               # LLM summary
    " ".join(enrichment.get("insights", []))     # LLM insights
]).strip()
```

The embedding doesn't just represent the raw tweet. It represents the *enriched composite* — original content + vision descriptions + LLM-generated summaries and insights. This means the stored vectors encode both the original discourse and its computational interpretation. Searching for "bear market survival" matches against this composite, so the enrichment layer expands the semantic surface beyond what the raw 280-character tweet would provide.

**A critical detail about model lock-in:** The embedding model defines the vector space. Vectors produced by `text-embedding-3-large` live in a different mathematical space than vectors from, say, `text-embedding-ada-002` or a local model like `all-MiniLM-L6-v2`. You cannot mix models — query vectors and stored vectors must come from the same model, or the distance calculations are meaningless. Choosing an embedding model is a commitment: switching later means re-embedding the entire corpus.

**Performance:** 10 tweets/batch, 3 concurrent workers, async OpenAI API calls.

**Output:** `tweets.index` (465 MB), `tweets.db` (141 MB), `id_map.json` (1.7 MB) — a mapping of FAISS index positions to tweet IDs, since FAISS itself only knows integer positions, not tweet identifiers.

### 3j. The Query Interface: A RAG Pipeline

**Scripts:** `main.py` and `mainv2.py` (FastAPI)

The query interface implements what is now widely known as **RAG (Retrieval-Augmented Generation)** — a pattern where a generative LLM's response is grounded in retrieved evidence rather than relying solely on its training data. RAG has become one of the most discussed LLM application patterns, typically used for context management (giving models access to documents beyond their training data) or for keeping proprietary data private (though true privacy requires running open-source models locally; any data sent to cloud APIs like OpenAI or Anthropic is transmitted to their servers).

**This pipeline is a working RAG system** — one built before the term became ubiquitous, for a specific research purpose rather than as a generic chatbot layer.

**The exact search flow:**

```
User types: "What do traders say about surviving bear markets?"
    ↓
1. EMBEDDING: OpenAI text-embedding-3-large converts the query
   into a 1536-dim vector. [API call, costs fractions of a cent]
    ↓
2. RETRIEVAL: FAISS compares query vector against 79,432 stored
   tweet vectors using L2 distance. Returns top_k closest matches
   (index positions + distance scores). [Pure math, no API call]
    ↓
3. HYDRATION: For each FAISS result, look up the tweet ID via
   id_map.json, then query SQLite for full tweet data.
    ↓
4. FILTERING: Python applies metadata filters (tags, dates,
   accounts, engagement thresholds) on the hydrated results.
   Filters happen AFTER retrieval, not during it.
    ↓
5. AUGMENTATION: Filtered tweets' summaries and insights are
   formatted into a text prompt alongside the user's question.
    ↓
6. GENERATION: GPT-4o (configurable) receives the augmented
   prompt and produces a synthesized response.
```

Steps 1–4 are the **R** (Retrieval). Steps 5–6 are the **AG** (Augmented Generation).

**Three endpoints:**
- **`/filters`** — Returns all distinct filter values for UI dropdowns
- **`/search`** — Steps 1–4 only: semantic retrieval + filtering, no LLM generation. Returns paginated results for browsing.
- **`/query`** — Full RAG: steps 1–6. Sends filtered tweet summaries to GPT-4o for synthesis.

**What gets sent to the LLM:** In the original implementation, only two fields per tweet were sent — `summary` and `insights`. Not the original tweet text, not the metadata, not the tags, not engagement metrics. The generative model synthesized across *pre-interpreted* material: summaries and insights that were themselves generated by GPT during the enrichment stage (Section 3g). This meant the RAG pipeline's generative layer operated on a *twice-removed* representation: original tweet → LLM enrichment → LLM synthesis. The original discourse voice — slang, tone, rhetorical moves — was mediated twice before reaching the final output.

**The fix:** After testing revealed this limitation (see Section 5), the augmentation was rewritten to send rich context per tweet:

```python
# What GPT-4o now receives per tweet:
def format_tweet_context(i, m):
    parts = [f"Tweet {i + 1} (@{m.get('handle', '?')}, {m.get('date', '?')}):"]
    parts.append(f"Text: {m.get('text', '')}")              # Original tweet
    if m.get("tags"):
        parts.append(f"Tags: {', '.join(m['tags'])}")       # Ethnographic tags
    if m.get("vision_captions"):
        parts.append(f"Image: {'; '.join(m['vision_captions'])}")  # Image descriptions
    if m.get("image_tags"):
        parts.append(f"Image tags: ...")                     # Image classification
    if m.get("summary"):
        parts.append(f"Summary: {m['summary']}")             # LLM enrichment
    if m.get("insights"):
        parts.append(f"Insights: {', '.join(m['insights'])}") # LLM enrichment
    return "\n".join(parts)
# System prompt: "You are a crypto discourse analyst."
```

The enriched augmentation sends: original tweet text, handle, date, regex tags (the 46 ethnographic categories), vision captions (image descriptions), image tags (primary classification), and the LLM-generated summary and insights. This gives GPT-4o access to both the raw discourse *and* its computational annotations — a significant improvement over the summary-only version.

**Post-retrieval filtering architecture:** A significant design limitation. Filters narrow *within* the FAISS result set rather than constraining retrieval itself. If you search "bear market survival" with `tag=survival` and `top_k=100`, FAISS returns the 100 closest vectors by meaning, then the filter throws away any without the `survival` tag — you might end up with 8 results from those 100. A more sophisticated approach would filter before or during retrieval (using FAISS ID filtering or hybrid vector+SQL search). The current architecture is: retrieve broadly, then trim.

**Important: these features were experimental, not operational.** The semantic search and Ask LLM panel were not used in the actual dissertation research. They were experimental extensions built to understand how LLMs and vector retrieval function — part of the researcher's systematic learning of AI/ML infrastructure. Evidence of their experimental status is visible in the frontend configuration: the search bar sent `top_k: 10000` to FAISS (effectively returning the entire corpus ranked by distance), producing hundreds of pages of results where only the first few were meaningfully relevant. The GPT panel used a more reasonable `top_k: 20`, but even there, testing revealed that when queries fell outside the 46 ethnographic tags (e.g., "black swan"), the retrieved tweets were only loosely related, and GPT-4o's synthesis fell back to its training data rather than grounding in the evidence — the classic RAG failure mode.

**The research purpose of semantic search** was to surface themes that were *not* part of the ethnographic vocabulary — to discover what the 46 tags missed. Instead of repeatedly re-tagging the entire corpus whenever a new analytical category emerged (a process that was provisioned for and done several times — see `pnl_flexing_tagger.py` — but expensive and slow), semantic search offered a different approach: query by concept and see what comes back, without needing a pre-defined regex pattern. This represents a limit the researcher was hitting against: the vocabulary was comprehensive but finite, and the corpus always contained more patterns than any tag set could capture. Semantic search was an attempt to work around that limit — an experiment in letting computation lead rather than follow, inverting the usual "computation follows ethnography" principle.

**That inversion is itself methodologically significant.** The experiment revealed that computation-first discovery (semantic search) was less reliable than ethnography-first categorization (regex tagging) for this corpus. The semantic search returned too many loosely related results; the LLM synthesis produced generic essays rather than grounded analysis. The ethnographic tags — despite being finite — were more analytically productive because they encoded *specific knowledge about what matters*, not just vague semantic proximity.

The filter system supports: date ranges, year/month, tags (OR logic), image tags, accounts/handles, engagement thresholds (min likes, views, retweets, etc.).

---

## 4. The Frontend: Tweet Explorer

The GitHub-published version (`C:\Users\bhara\dev\tweet-explorer\`) is a refactored "makeover" of the working prototype. It preserves all functionality while applying professional code structure and a custom design system.

**Architecture:** React 19 + Vite + Tailwind frontend, FastAPI backend, FAISS + SQLite data layer.

**What a user can do:**
- Enter a semantic search query (embedded via OpenAI, searched via FAISS)
- Filter by content tags (46 ethnographic categories), image analysis tags, accounts, dates, engagement metrics
- View results in a compact table with expandable detail rows showing summaries, insights, image analysis, visual tags, and full engagement metrics
- Ask an LLM to analyze the filtered results (floating GPT panel)
- Export filtered results to Excel (.xlsx)

**What it doesn't do:** No data pipeline (assumes pre-built FAISS index + SQLite), no user accounts, no saved searches, no visualization (yet).

**Design system:** Dark theme (Whisper Green `#0c0f0d` base), Camel (`#d4a574`) primary accent, Terracotta (`#cd8264`) secondary, Fraunces display font for title, Geist base font, 4-level elevation system, hover energy (glows, transforms).

**Component decomposition:** 7 focused components (FilterSection, SearchableSelect, DateRangePicker, ResultsTable, ExpandableText, GPTPanel) orchestrated by App.jsx.

---

## 5. Failures, Dead Ends, and Pivots

### The v1–v3 False Positive Problem

Discovered only through v4's word boundary enforcement. Without `\b` wrappers, patterns like `pump` matched "pumpkin," `cycle` matched "bicycle," `ape` matched "drape" and "escape." The scale of overcounting was invisible until v4 provided corrected baselines. This is a reminder that computational tools produce confident-looking numbers that can be systematically wrong.

**What it taught:** Always enforce word boundaries in regex tagging of short-text corpora. The cost of false negatives (missing a match) is lower than the cost of false positives (inflating a category), because false positives corrupt the quantitative picture silently.

### Semantic Tagging's Underperformance

As documented in Section 3e. The 0.55 cosine threshold was too aggressive for short texts, and the general-purpose embedding model didn't capture crypto-specific semantics. Total semantic hits (10,351) were roughly 10% of regex hits (97,857).

**What it taught:** Small embedding models are not plug-and-play for domain-specific classification. Fine-tuning on crypto discourse or using a larger model (or lower threshold with manual validation) might produce useful results. The concept — matching tweets to analytical definitions by meaning — remains sound for future work.

### The RAG Pipeline's Limitations

The semantic search and Ask LLM features constitute a working RAG (Retrieval-Augmented Generation) pipeline — built before the acronym became an industry buzzword. Testing revealed several instructive limitations:

**Semantic search noise.** With the frontend configured at `top_k: 10000`, a query like "black swan" returned hundreds of pages of results. Only the first handful were meaningfully relevant; the rest were vague semantic neighbors that happened to be in the same general region of embedding space. Short, slangy tweets (~280 chars) produce weak, generic embeddings — two tweets about completely different topics can end up nearby in vector space because they're both short and use common words.

**RAG failure mode.** When the GPT panel was asked "what is the meaning of black swans for crypto participants?", the response was a generic essay about black swan events in crypto — it didn't cite any specific tweet, didn't reference any account, didn't engage with the actual discourse in the corpus. Because "black swan" isn't one of the 46 ethnographic tags, the retrieved tweets were only loosely related, and GPT-4o fell back to its training data. The system *looked* like it was grounding its answer in the data, but it wasn't. This is the fundamental RAG problem: when retrieval doesn't surface relevant evidence, the "augmented" generation is just generation.

**Post-retrieval filtering.** Filters applied *after* FAISS retrieval rather than constraining it. This meant the system retrieved broadly then trimmed, rather than searching within a pre-filtered subset — an architectural limitation that reduced both precision and efficiency.

**Twice-removed representation (original version).** The LLM synthesis layer initially received only pre-generated `summary` and `insights` fields — not the original tweet text. GPT-4o was synthesizing across LLM-generated summaries of tweets, not the tweets themselves. The original discourse voice — the slang, the tone, the rhetorical moves that make CT texts analytically interesting — was mediated twice before reaching the final output.

**The fix and its result.** After identifying the twice-removed problem, the augmentation was rewritten to send full tweet context: original text, handle, date, ethnographic regex tags, image descriptions, image tags, plus the existing summary and insights. The improvement was immediate and dramatic. Re-testing the same "black swan" query that had previously produced a generic essay, GPT-4o now cited specific tweets by number ("Tweets 1 and 2 discuss liquidation cascades," "Tweets like 6 and 7 emphasize prediction challenges"), referenced account handles and dates, distinguished sub-themes within the corpus (market volatility, skepticism, analogies with traditional finance, "white swan" counterpoints), and grounded every claim in actual retrieved evidence. Notably, no prompt engineering was required — the system prompt remained a single sentence ("You are a crypto discourse analyst."). The quality jump came entirely from richer context: giving the model the actual discourse rather than pre-digested summaries was sufficient for it to produce analytically grounded output.

**What these RAG experiments taught:** The experimental RAG features were more valuable as a learning exercise in LLM infrastructure than as a research instrument — but the iterative debugging also demonstrated something methodologically interesting. The original twice-removed augmentation failed because it stripped out the very material that makes CT texts analytically interesting. The fix succeeded because it restored that material. The ethnographic tags — despite being finite — were more analytically productive for the dissertation than open-ended semantic search, because they encoded *specific knowledge about what matters*. And when the RAG pipeline was given actual discourse data (not just summaries), the LLM could engage with it productively. This is itself evidence for the "computation follows ethnography" principle: computation works best when ethnographic judgment structures what it receives.

### The Vocabulary's Visible Seam

The two-layer structure of `crypto_vocab_tags.json` (generic glossary + ethnographic categories, different indentation, different keyword sophistication) reveals the file was authored in phases. The generic layer was likely LLM-generated as a starting vocabulary; the ethnographic layer was hand-refined based on observation. The duplicates (bagholder, supercycle) show that later additions didn't systematically clean up earlier entries.

**What it taught:** Vocabulary files are living documents. They should be version-controlled with clear authorship markers. The "seam" is actually *evidence* of the methodology — it shows where generic computational knowledge ended and ethnographic knowledge began.

---

## 6. The LLM's Role: A Taxonomy

| Use | Stage | LLM Role | Ethnographic Role |
|-----|-------|----------|-------------------|
| Writing Python scripts | Throughout | **Infrastructure** (plumber) | Researcher specifies what to build, validates output |
| Proposing initial vocab/glossary | Vocabulary creation | **Translation** (natural language → structured data) | Researcher provides categories, refines, adds domain specificity |
| Proposing regex patterns | Vocabulary refinement | **Translation** (definitions → regex) | Researcher validates patterns against known discourse |
| Semantic tagging | Stage 3d | **Analytical** (autonomous matching) | Minimal — model decides matches based on embedding similarity |
| Image captioning | Stage 3h | **Perceptual** (what's in this image?) | Researcher's vocab tags the captions; LLM describes, human categories interpret |
| Tweet enrichment | Stage 3g | **Interpretive** (why is this relevant to this theme?) | Researcher designed the prompt, chose which tags to enrich, validated output |
| Vectorization (embedding) | Stage 3i | **Infrastructure** (measurement instrument) | None — the embedding model converts text to vectors mechanically; it doesn't interpret or judge |
| Semantic search (retrieval) | Query interface | **Infrastructure** (nearest-neighbor lookup) | Researcher poses queries; FAISS does math; the ethnographic tags remain the more reliable filter |
| RAG synthesis (generation) | Query interface | **Synthesis** (answer questions from evidence) | Experimental — researcher poses questions, but LLM often fell back to training data rather than grounding in retrieved evidence |
| Topic modeling tokenizer | Phase 1 scripts | **None** (manual) | Researcher hand-built the crypto term vocabulary (80+ terms) |

**The gradient:** LLM involvement ranges from zero (hand-built tokenizers) through infrastructure (code writing, embedding, retrieval) to analytical autonomy (semantic tagging, RAG synthesis). The dissertation's core argument is that the most valuable uses kept ethnographic judgment in the loop — the LLM amplified human categories rather than replacing them. The experimental RAG features (semantic search + Ask LLM) represent an attempt to push toward computation-first discovery, and their limited effectiveness for this corpus reinforces the ethnography-first principle.

---

## 7. Vibe Coding as Methodology

### How Ethnographic Sensing Generated the Categories

The 46 tags in `crypto_vocab_tags.json` didn't come from a literature review or a topic model. They came from years of inhabiting the feed: observing what CT participants *talk about*, what they *mean* when they use specific terms, what *practices* the terms index.

"PvP" isn't just a gaming metaphor borrowed by traders — it's a *worldview* about the zero-sum nature of crypto markets during certain phases. "Main character" isn't just CT slang — it describes an *attention economy* where narrative dominance translates into market influence. "Top signal" isn't just contrarianism — it's a *reflexive practice* where participants read their own community's enthusiasm as evidence of imminent reversal.

These categories are ethnographic constructs. They emerged from what the dissertation calls "vibe coding" — a sensibility-driven orientation that foregrounds felt nuance and pattern recognition from within the scene.

### How LLMs Operationalized Those Categories Computationally

Once the categories existed as felt understandings, they needed to become *computable*. This required:

1. **Defining** them — writing definitions precise enough for regex matching
2. **Translating** them — converting definitions into regex patterns
3. **Validating** them — checking whether the patterns captured what the researcher meant
4. **Refining** them — iterating through v1→v4 as problems emerged
5. **Enriching** them — using GPT to explain *how* each tweet relates to its tag

LLMs assisted at every step except the first. The definitions came from ethnographic knowledge. Everything else was a collaboration between researcher intent and computational execution.

### The Double Meaning

"Vibe coding" operates on two registers simultaneously:

1. **Vibe as ethnographic method** — Attunement to the affective atmospheres and ambient logics of digital discourse. Not fixed categories but a sensibility. What does it *feel like* to be on CT during a bull run? During a liquidation cascade? During the FTX collapse? This felt knowledge generates the analytical vocabulary.

2. **Vibe coding as programming practice** — Using LLMs to write code through natural language instruction rather than traditional software engineering. The researcher describes what they want; the LLM produces the implementation. Most of this pipeline was "vibe coded" in this sense — the Python scripts were written collaboratively with LLMs.

The convergence: a researcher who *vibes with the data* (years of immersion, felt knowledge of CT's rhythms and registers) also *vibe-codes the tools* (LLM-assisted programming that translates ethnographic sensibility into computational operations). The same person holds both meanings. The pipeline is the proof.

### Where Computation Followed Ethnography

Everywhere:
- **Account selection** — ethnographic knowledge of who matters on CT → extraction list
- **Typed databases** — ethnographic observation of discourse styles → Trader/Fundamentalist categorization
- **Tag vocabulary** — immersive familiarity with CT language → 46 discourse categories
- **Regex patterns** — understanding of how terms are used in practice → pattern matching
- **Image captioning → regex tagging** — ethnographic vocabulary applied to vision API output
- **LLM enrichment prompts** — ethnographic framing ("relevance to theme X") guides interpretation
- **Query interface design** — filter categories reflect ethnographic understanding of what matters

### Where Computation Tried to Lead — and What Happened

The semantic search and RAG features represent the one place in the pipeline where computation was asked to lead rather than follow. Instead of starting from ethnographic categories and operationalizing them computationally, semantic search started from a query and asked the vector space to find relevant material — including material that might not fit any existing tag.

The motivation was real: the 46-tag vocabulary was comprehensive but finite. Every time a new analytical category emerged, the researcher had to write new regex patterns, re-run the tagger, and validate the results. This was provisioned for (see `pnl_flexing_tagger.py`, which ran a single new tag against the corpus) but remained expensive and slow. Semantic search offered an alternative — query by concept without pre-defining a pattern.

The experiment was instructive precisely because it underperformed. Semantic search produced noisy results for domain-specific queries. The RAG synthesis fell back to generic LLM knowledge when retrieval didn't surface focused evidence. The ethnographic tags — despite being a finite, human-authored vocabulary — consistently outperformed open-ended semantic retrieval for this corpus.

This is itself evidence for the methodology. The pipeline's most productive analytical work happened where ethnographic knowledge constrained computation: hand-built categories, validated regex patterns, carefully prompted enrichment. Where computation operated without that constraint — semantic tagging with a general-purpose model, semantic search across the full vector space — it produced weaker results. The limit isn't computational power; it's the absence of the researcher's embedded knowledge of what matters.

### Where Computation Preceded Ethnography

Nowhere — and the semantic search experiment helps prove the point.

The LDA topic model (`topicmodelscript.py`) is one case where computation discovered patterns without ethnographic input. But even there, the custom tokenizer was hand-built with 80+ crypto-specific terms derived from observation. The model discovered topics, but it discovered them *within a vocabulary the researcher defined*.

The semantic search is the other case — and it revealed the cost of letting computation lead. Without ethnographic categories constraining the search, retrieval produced semantic proximity without analytical significance. The vector space doesn't know what matters; the researcher does.

---

## 8. Appendix: File Inventory

### Phase 1: Ethnographic Data Collection

| File | Location | Size | Description |
|------|----------|------|-------------|
| `Selections/*.csv` (37 files) | OneDrive/Desktop/Twitter Data/Selections/ | 280KB–26.6MB each | Individual account tweet extractions |
| `combined_filtered.csv` | OneDrive/Desktop/Twitter Data/ | 155 MB | All 37 accounts, 1,133,887 tweets, post-2020 |
| `peak_posts.csv` | OneDrive/Desktop/Twitter Data/ | 5.6 MB | 38,347 tweets from manually-selected peak periods |
| `Combined_Twitter_Data.xlsx` | OneDrive/Desktop/Twitter Data/ | 61 MB | Merged Trader + Fundamentalist with Generated_Tags |
| `Fundamentalist Twitter Database...xlsx` | OneDrive/Desktop/Twitter Data/ | 24 MB | Fundamentalist-typed account database |
| `Trader Twitter Database...xlsx` | OneDrive/Desktop/Twitter Data/ | 42 MB | Trader-typed account database |
| `summary_by_month.csv` | OneDrive/Desktop/Twitter Data/ | 8.5 KB | Monthly tweet counts per account |
| `Topic_Modeling_Output.xlsx` | OneDrive/Desktop/Twitter Data/ | 27 KB | LDA topic modeling results (20 topics) |
| `Twitter_Analysis_Output.xlsx` | OneDrive/Desktop/Twitter Data/ | 35 KB | Summary statistics |
| `analyzetweets.py` | OneDrive/Desktop/Twitter Data/ | 2.2 KB | Merge databases + tag "generational" |
| `consolidatedanalysis.py` | OneDrive/Desktop/Twitter Data/ | 3.4 KB | Summary stats + 5-topic LDA |
| `topicmodelscript.py` | OneDrive/Desktop/Twitter Data/ | 5.3 KB | 20-topic LDA with crypto tokenizer |
| `import os.py` | OneDrive/Desktop/Twitter Data/Selections/ | 1 KB | Concatenate 37 CSVs into combined_filtered |
| `peak posts.py` | OneDrive/Desktop/Twitter Data/Selections/ | 2 KB | Filter by ethnographically-selected peak periods |

### Phase 2: Computational Pipeline

| File/Directory | Location (twitter dump/) | Size | Description |
|---|---|---|---|
| `misc/chunking/twitter_chunker*.py` | Chunking scripts | ~5 KB each | CSV → JSON conversion + batch splitting |
| `dumpv1/` | 61 files | 796 MB | First JSON conversion output |
| `prepared jsons/` | 114 files | 1.2 GB | Chunked, upload-ready JSONs |
| `tagging/misc/regex_batch_tagger.py` | Tagger v1 | ~3 KB | Baseline regex matching → CSV |
| `tagging/misc/regex_batch_taggerv2.py` | Tagger v2 | ~4 KB | Added media + year filters |
| `tagging/misc/regex_batch_taggerv3.py` | Tagger v3 | ~5 KB | Added minimal JSON output |
| `tagging/misc/regex_json_taggerv4.py` | Tagger v4 | ~4 KB | Word boundaries, direct JSON modification |
| `tagging/misc/pnl_flexing_tagger.py` | Single-tag tagger | ~3 KB | PnL_Flexing-only focused pass |
| `tagging/misc/twitter_tagger.py` | Hybrid tagger | ~5 KB | Regex vs. GPT-4o-mini comparison |
| `tagging/misc/semantic_tagging.py` | Semantic tagger | ~6 KB | SentenceTransformer cosine matching |
| `tagging/misc/merge_tagged_jsons.py` | Merge script | ~4 KB | Combine regex + semantic tags |
| `NOTES-crypto_vocab_tags.json` | Claude Artifacts/0. Dissertation/ | ~10 KB | **THE vocabulary: 46 tags, definitions, keyword patterns** |
| `subset_vocab_tags.json` | tagging/misc/ | ~2 KB | 4-tag subset (top signal, trader mindset, main character, supercycle) |
| `tagged jsonsv4/` | 114 files | 1.2 GB | V4-tagged output (word boundaries enforced) |
| `tagged_semantic_v1/` | 233 files | 1.3 GB | Semantic tagging output |
| `merged_tags_final/` | 114 files | 1.3 GB | Combined regex + semantic tags |
| `enriched_final/llm_enrich.py` | Enrichment script | ~4 KB | GPT-4 enrichment per tag theme |
| `enriched_final/enriched jsons/` | 18 parts | 164 MB | LLM-enriched tweets |
| `misc/image/image_embed_async.py` | Image pipeline | ~8 KB | Async GPT-4o-mini vision captioning |
| `vision_batches/` | 66 files | 602 MB | Vision API output |
| `misc/local embedding/build_local_vector_store.py` | Vector build | ~8 KB | FAISS + SQLite construction |
| `tweets.index` | Local data | 465 MB | FAISS vector index (79,432 × 1536 dims) |
| `tweets.db` | Local data | 141 MB | SQLite tweet database |
| `id_map.json` | Local data | 1.7 MB | FAISS index → tweet ID mapping |
| `main.py` / `mainv2.py` | Query interface | ~15 KB each | FastAPI endpoints for search + LLM synthesis |
| `NOTES-DATA-tag_summary_report_global_only.json` | Claude Artifacts/ | ~15 KB | Global tag frequency report |

### Phase 3: Tweet Explorer (GitHub)

| File | Location (tweet-explorer/) | Lines | Description |
|------|---|---|---|
| `backend/main.py` | Backend | 497 | FastAPI app: /filters, /search, /query |
| `frontend/src/App.jsx` | Frontend | 282 | Layout shell + state management |
| `frontend/src/components/ResultsTable.jsx` | Frontend | 346 | Expandable results table |
| `frontend/src/components/GPTPanel.jsx` | Frontend | 137 | Floating LLM analysis panel |
| `frontend/src/components/SearchableSelect.jsx` | Frontend | 197 | Multi-select filter dropdown |
| `frontend/src/components/FilterSection.jsx` | Frontend | 39 | Collapsible filter container |
| `frontend/src/components/DateRangePicker.jsx` | Frontend | — | Date range input |
| `frontend/src/components/ExpandableText.jsx` | Frontend | — | Truncate + expand utility |
| `frontend/src/index.css` | Frontend | 240 | Design system tokens + utilities |
| `specs/tweet-explorer-design.md` | Specs | 217 | What we're building and why |
| `specs/tweet-explorer-status.md` | Specs | 98 | Session continuity log |
| `README.md` | Root | — | Research context + setup instructions |

### Reference Files

| File | Location | Description |
|------|----------|-------------|
| `NOTES-twitter_database_details.txt` | Claude Artifacts/0. Dissertation/ | System + frontend overview |
| `NOTES-Twitter Data Analysis.md` | Claude Artifacts/0. Dissertation/Introduction/Methods/ | Methodology section draft (computational focus) |
| `NOTES-Draft Methodology Section.md` | Claude Artifacts/0. Dissertation/Introduction/Methods/ | Full methodology chapter draft |
| `CORE-dissertation.pdf` | Claude Artifacts/1. Career(s)/ | Published dissertation (Section 3.5.3: vibe coding) |

### Total Pipeline Data

| Stage | Output Size | Files |
|-------|------------|-------|
| Chunking | 1.2 GB | 114 |
| Regex Tagging | 1.2 GB | 114 |
| Semantic Tagging | 1.3 GB | 233 |
| Tag Merging | 1.3 GB | 114 |
| Image Processing | 602 MB | 66 |
| Enrichment | 164 MB | 18 |
| Vectorization | 607 MB | 2 |
| **Total** | **~6.4 GB** | **~661** |

---

*This document was compiled on February 11, 2026, by reading actual files across the project filesystem. Every claim traces to a specific file on disk.*
