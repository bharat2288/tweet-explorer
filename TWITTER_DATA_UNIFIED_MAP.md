# Dissertation Twitter Data: Unified File Map

**Generated:** 2026-02-11
**Total files:** 1,275 | **Total size:** ~11.3 GB

---

## How These Directories Relate

These two directories are **two phases of the same research pipeline** -- they are not independent datasets.

```
H:\My Drive\Thesis\
├── Twitter Data\              ← PHASE 1: Collection, curation, qualitative coding
└── Literature\twitter dump\   ← PHASE 2: Computational analysis, tagging, retrieval
```

### Phase 1: Twitter Data (1.2 GB, 178 files)

**What it is:** The ethnographic data collection and manual qualitative coding layer.

- Raw tweet archives extracted via TwExtract (140 accounts total)
- Manual categorization of accounts into types (Trader, Fundamentalist, Shitposter)
- Curation of a core sample (60 accounts → `Selections/`)
- Consolidation into typed Excel databases with analysis columns
- Manual coding in Excel (theme columns P, Q)
- Collation and filtered exports for qualitative analysis

### Phase 2: Literature/twitter dump (10.1 GB, 1,097 files)

**What it is:** The computational NLP/ML processing layer that operates on the curated subset.

- Converts the 60 Selections CSVs (+ 1 extra: `blknoiz06`) into JSON
- Runs two-layer automated tagging: regex pattern matching + LLM semantic analysis
- Enriches tweets with additional metadata
- Builds vector stores (local FAISS + cloud OpenAI) for semantic search
- Enables RAG-style querying: ask questions, retrieve relevant tweets, generate responses

### The Bridge

The exact connection point:

```
Twitter Data/Twitter Account Dump/Selections/     (60 CSVs, per-account tweet archives)
                        ↓ CSV → JSON conversion
Literature/twitter dump/misc/chunking/dumpv1/      (61 JSONs, same accounts + blknoiz06)
```

**Account overlap verified:** All 60 Selections accounts appear in the computational pipeline. One additional account (`blknoiz06`, from the main Twitter Account Dump folder, not Selections) was also included -- likely due to its significance as a high-volume poster (25.4 MB of tweets).

### Why "Literature"?

The computational pipeline lives under `Literature/` because the vector store it produces was used to **search the tweet corpus as primary source material** during dissertation writing. The `query_and_respond.ipynb` notebooks and `main.py` scripts implement a RAG system: pose a research question, retrieve relevant tweets, generate a synthesis. The tweets function as the "literature" being computationally interrogated.

---

## End-to-End Pipeline

```
                        PHASE 1: COLLECTION & QUALITATIVE CODING
                        ─────────────────────────────────────────

Twitter bookmarks + account tracking
    ↓ extract via TwExtract (Sep-Dec 2024)
Twitter Data/Twitter Account Dump/
    80 accounts (main) + 60 accounts (Selections/)
    ↓ categorize accounts
Twitter Data/CT Accounts Consolidated.xlsx
    Account types: Trader (42 MB) | Fundamentalist (23 MB) | Shitposter (15 MB)
    ↓ consolidate into typed databases
Twitter Data/Trader Twitter Database_..._Analyzing.xlsx
Twitter Data/Fundamentalist Twitter Database_..._Analyzing.xlsx
Twitter Data/Shitposter Twitter Database_..._Analyzing.xlsx
    ↓ combine
Twitter Data/Combined_Twitter_Data.xlsx (60.8 MB master file)
    ↓ manual coding (themes, categories in columns P, Q)
Twitter Data/Manual Tags.xlsx + consolidated CSVs
    ↓ collate
Twitter Data/collated_tweet_data*.xlsx (multiple versions)

────────────────────────────────────────────────────────────────

                        PHASE 2: COMPUTATIONAL ANALYSIS
                        ───────────────────────────────

Twitter Data/.../Selections/ (60 CSVs)
    ↓ convert CSV → JSON, one file per account
Literature/twitter dump/misc/chunking/dumpv1/ (61 JSONs, 796 MB)
    ↓ split large accounts into parts (~17 MB each)
Literature/twitter dump/misc/chunking/prepared jsons/ (114 parts, 1.2 GB)
    ↓ chunk text for embedding/upload
Literature/twitter dump/misc/chunking/chunked jsons/ (114 files, 1.0 GB)
    ↓ organize into upload batches
Literature/twitter dump/misc/chunking/dumpv2/ (12 batch dirs, 1.0 GB)

    ↓ REGEX TAGGING (pattern matching: crypto vocab, PnL flexing, etc.)
Literature/twitter dump/tagging/misc/tagged jsonsv4/ (114 files, 1.2 GB)
    ↓ LLM SEMANTIC TAGGING (contextual classification)
Literature/twitter dump/tagging/misc/tagged_semantic_v1/ (233 files, 1.3 GB)
    ↓ merge both tag layers
Literature/twitter dump/tagging/merged_tags_final/ (114 files, ~1.3 GB)

    ↓ enrich with metadata
Literature/twitter dump/enriched_final/enriched jsons/ (18 parts, 164 MB)
    ↓ combine into single file
Literature/twitter dump/enriched_final/misc/combined_enriched.json (164 MB)

    ↓ embed + index
Literature/twitter dump/misc/local embedding/
    tweets.db (141 MB, SQLite) + tweets.index (465 MB, FAISS)

    ↓ query (RAG)
Literature/twitter dump/misc/main.py + notebooks
    → Pose question → retrieve relevant tweets → LLM response

    ↓ IMAGE PROCESSING (parallel track)
Literature/twitter dump/misc/image/
    vision_batches/ (66 files, 602 MB) → Vision API for tweet images
```

---

## Phase 1 Detail: Twitter Data

**Location:** `H:\My Drive\Thesis\Twitter Data\`
**178 files | 1,186.7 MB**

### Directory Structure

```
Twitter Data/
├── [27 files]                          # Databases, collations, scripts, notes
├── Dump/                               # [12 files] Raw exports and processing scripts
└── Twitter Account Dump/               # [80 files] Per-account tweet extractions
    └── Selections/                     # [60 files] Core dissertation sample
```

### Primary Databases

| File | Size | Description |
|------|------|-------------|
| `Combined_Twitter_Data.xlsx` | 60.8 MB | Combined dataset across all account types |
| `Trader Twitter Database_..._Analyzing.xlsx` | 42.0 MB | Trader accounts, with analysis columns |
| `Fundamentalist Twitter Database_..._Analyzing.xlsx` | 23.1 MB | Fundamentalist accounts, with analysis columns |
| `Shitposter Twitter Database_..._Analyzing.xlsx` | 14.6 MB | Shitposter accounts |

### Collated Outputs

| File | Size | Description |
|------|------|-------------|
| `collated_tweet_data_FULL_with_mediaURL.xlsx` | 16.9 MB | Full collation including media URLs |
| `collated_tweet_data_FULL.xlsx` | 14.8 MB | Full collation (no media URLs) |
| `collated_tweet_data.xlsx` | 14.7 MB | Base collation |
| `collation_summary*.json` | <1 KB ea. | Summary stats for each collation |

### Consolidated CSVs (Filtered Extracts)

| File | Size | Description |
|------|------|-------------|
| `consolidated_full_nonempty_Q_FIXED.csv` | 167.0 KB | Non-empty column Q rows, ID-fixed |
| `consolidated_full_nonempty_P_THEME_FIXED.csv` | 164.5 KB | Non-empty theme (col P) rows, ID-fixed |
| `FULL_consolidated_nonempty_THEME.csv` | 159.5 KB | Full non-empty theme rows |
| `consolidated_full_nonempty_P_THEME.csv` | 159.5 KB | Non-empty theme (col P) rows |
| `consolidated_full_nonempty_Q.csv` | 149.4 KB | Non-empty column Q rows |
| `consolidated_nonempty_rows.csv` | 9.1 KB | Non-empty rows (smaller subset) |
| `consolidated_nonempty_columnQ.csv` | 6.8 KB | Non-empty column Q (smaller subset) |

### Reference & Metadata

| File | Size | Description |
|------|------|-------------|
| `NOTES-Kling (2024) - Financial Nihilism (Parts I-III).pdf` | 2.9 MB | Reading notes |
| `Bookmarks Processing_2019 to May 2024.xlsx` | 655.2 KB | Bookmarks processing tracker |
| `Manual Tags.xlsx` | 68.6 KB | Manual coding/tagging reference |
| `CT Accounts Consolidated.xlsx` | 63.3 KB | Account list with types |

### Scripts

| File | Size | Description |
|------|------|-------------|
| `image_urls_sampled.py` | 3.3 KB | Sample image URLs |
| `print_tweet_as_citation.py` | 2.4 KB | Format tweets as citations |
| `unique_handles.py` | 1.1 KB | Extract unique handles |
| `filtered_image_urls.py` | 0.9 KB | Filter image URLs |

### Dump/ (Raw Exports)

| File | Size | Description |
|------|------|-------------|
| `Trader Twitter Database_..._Individual.xlsx` | 111.0 MB | Trader tweets, individual |
| `Trader Twitter Database_..._Consolidated.xlsx` | 42.6 MB | Trader tweets, consolidated |
| `Original Bookmark Dump...xlsx` | 637.9 KB | Raw bookmarks export |
| `TO BE PROCESSED_Trader...csv` | 64.1 MB | Trader data awaiting processing |
| `TO BE PROCESSED_Fundamentalists...csv` | 36.1 MB | Fundamentalist data awaiting processing |
| `TO BE PROCESSED_Shitposter...csv` | 17.7 MB | Shitposter data awaiting processing |
| `traders_export.xlsx` | 58.6 KB | Trader account list |
| `fundamentalists_export.xlsx` | 51.4 KB | Fundamentalist account list |
| `macro_export.xlsx` | 35.0 KB | Macro account list |
| `shitposter_export.xlsx` | 32.4 KB | Shitposter account list |
| `recover_ids_from_urls.py` | 1.7 KB | Recover tweet IDs from URLs |
| `fix_original_csv_ids.py` | 1.0 KB | Fix ID formatting |

### Twitter Account Dump/ (80 accounts, main)

Per-account tweet archives extracted via TwExtract. Naming: `TwExtract-{handle}-{YYYYMMDD_HHMMSS}.csv`

| Handle | Size | | Handle | Size |
|--------|------|-|--------|------|
| `_FabianHD` | 2.6 MB | | `lightcrypto` | 1.1 MB |
| `0xShual` | 3.5 MB | | `LizAnnSonders` | 9.9 MB |
| `0xtuba` | 3.5 MB | | `ljin18` | 1.6 MB |
| `abetrade` | 4.1 MB | | `LoganJastremski` | 1.8 MB |
| `alpha_pls` | 2.5 MB | | `LukeGromen` | 23.4 MB |
| `Awawat_Trades` | 8.9 MB | | `LynAldenContact` | 7.4 MB |
| `biancoresearch` | 8.8 MB | | `MapleLeafCap` | 1.2 MB |
| `BigDickBull69` | 1.9 MB | | `mizew_` | 0.5 MB |
| `**blknoiz06**` | **25.4 MB** | | `MonetSupply` | 4.9 MB |
| `blockgraze` | 6.5 MB | | `MoonOverlord` | 4.7 MB |
| `BobEUnlimited` | 8.2 MB | | `Moonpl0x` | 3.0 MB |
| `ByzGeneral` | 3.0 MB | | `naniXBT` | 8.3 MB |
| `caseykcaruso` | 0.2 MB | | `naval` | 4.0 MB |
| `cdixon` | 2.2 MB | | `NeerajKA` | 12.2 MB |
| `chiefingza` | 0.6 MB | | `OuroborosCap8` | 0.7 MB |
| `cmsholdings` | 4.4 MB | | `PeterZeihan` | 6.8 MB |
| `Cov_duk` | 1.1 MB | | `pierre_crypt0` | 32.9 MB |
| `crossbordercap` | 3.7 MB | | `qthomp` | 1.0 MB |
| `CryptoUB` | 2.8 MB | | `rektdiomedes` | 6.2 MB |
| `dampedspring` | 16.2 MB | | `RemilioTrader` | 7.8 KB |
| `DariusDale42` | 6.6 MB | | `RyanWatkins_` | 1.3 MB |
| `DeFi_Cheetah` | 1.4 MB | | `sayinshallah` | 25.2 KB |
| `Defi_Maestro` | 1.7 MB | | `Shaughnessy119` | 1.2 MB |
| `DegenSpartan` | 0.5 MB | | `shutterbugsid` | 0.3 MB |
| `Dentoshi` | 3.0 MB | | `SplitCapital` | 3.8 MB |
| `DoombergT` | 1.6 MB | | `StephanieKelton` | 6.8 MB |
| `DTAPCAP` | 2.1 MB | | `TheCryptoDog` | 6.0 MB |
| `EdgeSimps` | 0.6 MB | | `thedefiedge` | 3.3 MB |
| `ErikVoorhees` | 6.9 MB | | `ThorHartvigsen` | 1.6 MB |
| `EvgenyGaevoy` | 1.4 MB | | `tomhschmidt` | 1.5 MB |
| `FedGuy12` | 1.2 MB | | `trader1sz` | 31.2 MB |
| `fejau_inc` | 2.2 MB | | `Tradersreality` | 0.7 MB |
| `Flowslikeosmo` | 7.1 MB | | `trading_axe` | 2.4 MB |
| `GameofTrades_` | 3.9 MB | | | |
| `hasufl` | 6.4 MB | | | |
| `hendry_hugh` | 3.8 MB | | | |
| `hildobby_` | 1.1 MB | | | |
| `intern` | 2.1 MB | | | |
| `JacobCanfield` | 6.4 MB | | | |
| `JamesGRickards` | 8.8 MB | | | |
| `JeffSnider_EDU` | 5.1 MB | | | |
| `jimtalbot` | 11.7 MB | | | |
| `joel_john95` | 2.5 MB | | | |
| `jon_charb` | 1.5 MB | | | |
| `JulianMI2` | 1.0 MB | | | |
| `JulietteJDI` | 2.0 MB | | | |

**Bold:** `blknoiz06` -- the one account from this folder (not Selections/) that was also pulled into the computational pipeline.

### Twitter Account Dump/Selections/ (60 accounts -- core sample)

The curated dissertation corpus. Every account here was processed through Phase 2.

| Handle | Size | | Handle | Size |
|--------|------|-|--------|------|
| `0xfoobar` | 0.9 MB | | `mattigags` | 1.1 MB |
| `0xKNL__` | 3.2 MB | | `mrjasonchoi` | 4.5 MB |
| `0xSisyphus` | 5.7 MB | | `MustStopMurad` | 2.5 MB |
| `0xWangarian` | 0.9 MB | | `nic__carter` | 14.0 MB |
| `adamscochran` | 16.0 MB | | `Pentosh1` | 0.7 MB |
| `AltcoinPsycho` | 1.2 MB | | `Pool2Paulie` | 1.2 MB |
| `AltcoinSherpa` | 8.7 MB | | `pythianism` | 1.5 MB |
| `Arthur_0x` | 2.2 MB | | `QwQiao` | 0.3 MB |
| `AviFelman` | 1.7 MB | | `RaoulGMI` | 9.2 MB |
| `AWice` | 2.1 MB | | `Rewkang` | 2.1 MB |
| `BobLoukas` | 7.8 MB | | `SalsaTekila` | 2.1 MB |
| `BTC_JackSparrow` | 11.4 MB | | `santiagoroel` | 3.6 MB |
| `CarpeNoctom` | 11.7 MB | | `satsdart` | 9.0 MB |
| `cburniske` | 4.8 MB | | `SolanaLegend` | 4.0 MB |
| `CL207` | 8.5 MB | | `TechDev_52` | 1.1 MB |
| `cointradernik` | 4.7 MB | | `TheFlowHorse` | 7.7 MB |
| `ColdBloodShill` | 8.6 MB | | `theunipcs` | 0.7 MB |
| `CredibleCrypto` | 19.8 MB | | `Trader_XO` | 7.5 MB |
| `Crypto_Chase` | 7.0 MB | | `Tradermayne` | 9.4 MB |
| `Crypto_McKenna` | 1.3 MB | | `Travis_Kling` | 1.1 MB |
| `CryptoCapo_` | 3.5 MB | | `Web3Quant` | 1.9 MB |
| `CryptoCred` | 5.9 MB | | `zhusu` | 2.1 MB |
| `CryptoDonAlt` | 8.8 MB | | `ZoomerOracle` | 1.4 MB |
| `CryptoHayes` | 0.3 MB | | | |
| `CryptoKaleo` | 12.4 MB | | | |
| `dcfgod` | 0.3 MB | | | |
| `ercwl` | 13.2 MB | | | |
| `Fiskantes` | 11.5 MB | | | |
| `hedgedhog7` | 1.2 MB | | | |
| `hosseeb` | 1.3 MB | | | |
| `IamCryptoWolf` | 2.1 MB | | | |
| `iamDCinvestor` | 13.5 MB | | | |
| `intocryptoverse` | 4.4 MB | | | |
| `KeyboardMonkey3` | 7.0 MB | | | |
| `KyleSamani` | 5.1 MB | | | |
| `LomahCrypto` | 6.3 MB | | | |
| `LSDinmycoffee` | 14.9 MB | | | |

---

## Phase 2 Detail: Literature/twitter dump

**Location:** `H:\My Drive\Thesis\Literature\twitter dump\`
**1,097 files | 10,137.4 MB**

### Directory Structure

```
twitter dump/
├── tagging/                            # Tag vocabulary + final merged tagged JSONs
│   ├── merged_tags_final/              # [114 files] Final merged tagged tweet JSONs
│   └── misc/                           # Tagging scripts, CSVs, intermediate outputs
│       ├── json_batches/               # [20 files] Batched JSONs for processing
│       ├── tagged jsonsv4/             # [114 files] v4-tagged tweet JSONs
│       │   └── Stats/                  # Tag statistics and exports
│       └── tagged_semantic_v1/         # [233 files] Semantic-tagged tweet JSONs
├── enriched_final/                     # Final enriched tweet data
│   ├── enriched jsons/                 # [18 files] Enriched tweet JSONs (split parts)
│   └── misc/                           # Enrichment scripts, vector prep, combined output
├── twitter_db_tag_summary/             # Tag summary reports and READMEs
└── misc/                               # Processing scripts, notebooks, infrastructure
    ├── chunking/                       # Tweet chunking pipeline
    │   ├── dumpv1/                     # [61 files] v1 per-account JSONs
    │   ├── dumpv2/                     # [114 files] v2 chunked into upload batches
    │   │   └── chunk00/ ... chunk11/   # 12 numbered batch directories
    │   ├── prepared jsons/             # [114 files] JSONs prepared for chunking
    │   └── chunked jsons/              # [114 files] Chunked output JSONs
    ├── image/                          # Image embedding pipeline
    │   ├── vision_batches/             # [66 files] Vision API batch files
    │   └── testchunk/                  # [2 files] Test data
    └── local embedding/                # Local vector store (SQLite + FAISS)
        └── patch_urls_files/           # [8 files] URL patching assets
```

### Stage 1: Chunking (CSV → JSON → Parts → Chunks)

#### Scripts

| File | Size | Description |
|------|------|-------------|
| `twitter_chunker_batch_split.py` | 5.8 KB | Batch chunker with file splitting |
| `twitter_chunker.py` | 5.2 KB | Original chunker |
| `twitter_chunker_batch.py` | 4.6 KB | Batch chunker |
| `reattach_to_twitter_dump.py` | 4.2 KB | Reattach chunks to vector store |
| `prepare_enrichment_structure.py` | 3.6 KB | Prepare structure for enrichment |
| `diagnose_vector_store.py` | 2.2 KB | Diagnose vector store issues |
| `delete_files.py` | 2.2 KB | Delete files from vector store |
| `print_metadata.py` | 1.8 KB | Print vector metadata |
| `list_vector_ids.py` | 1.6 KB | List vector IDs |
| `detach_all_twitter_dump.py` | 1.5 KB | Detach all from vector store |
| `print_TwExtract.py` | 0.3 KB | Print TwExtract file info |

#### Data

| Directory / File | Files | Size | Description |
|------------------|-------|------|-------------|
| `dumpv1/` | 61 | 796 MB | v1: one JSON per account |
| `prepared jsons/` | 114 | 1,234 MB | Split into parts for processing |
| `chunked jsons/` | 114 | 1,009 MB | Chunked for embedding |
| `dumpv2/` (chunk00-chunk11) | 114 | 1,009 MB | Same as chunked, organized into upload batches |
| `twitter_upload_summary.xlsx` | 1 | 13 KB | Upload tracking |
| `upload summary.jsonl` | 1 | 22 KB | Upload log |

### Stage 2: Regex Tagging

#### Scripts (in `tagging/misc/`)

| File | Size | Description |
|------|------|-------------|
| `regex_json_taggerv4.py` | 2.6 KB | Current regex tagger |
| `regex_batch_taggerv3.py` | 3.2 KB | Batch tagger v3 |
| `regex_batch_taggerv2.py` | 3.1 KB | Batch tagger v2 |
| `regex_batch_tagger.py` | 2.5 KB | Batch tagger v1 |
| `pnl_flexing_tagger.py` | 3.4 KB | PnL flexing pattern tagger |
| `twitter_taggerv1.py` | 10.8 KB | Tweet tagger v1 |
| `twitter_tagger.py` | 3.7 KB | Tweet tagger (current) |

#### Outputs

| Directory / File | Files | Size | Description |
|------------------|-------|------|-------------|
| `tagged jsonsv4/` | 114 | 1,237 MB | v4 regex-tagged JSONs |
| `tagged_hits_v4.json` (in Stats/) | 1 | 82 MB | All v4 hits combined |
| `tagged_hits_v4.csv` (in Stats/) | 1 | 21 MB | Hits as CSV export |
| `merged_regex_hits.csv` | 1 | 124 MB | All regex hits merged |
| `integrated_regex_hits.csv` | 1 | 103 MB | Integrated hits |
| `integrated_regex_hits 2020-2024.csv` | 1 | 84 MB | 2020-2024 filtered |

### Stage 3: Semantic Tagging (LLM-Based)

| File / Directory | Size | Description |
|------------------|------|-------------|
| `semantic_tagging.py` | 4.3 KB | LLM semantic tagging script |
| `tagged_semantic_v1/` (233 files) | 1,279 MB | Semantic-tagged tweet JSONs |
| `NOTES-crypto_vocab_tags.json` | 15 KB | Tag vocabulary definitions |
| `subset_vocab_tags.json` | 1.7 KB | Subset vocabulary |

### Stage 4: Merge Tags

| Directory | Files | Size | Description |
|-----------|-------|------|-------------|
| `merged_tags_final/` | 114 | ~1,300 MB | Final merged JSONs (regex + semantic) |

Supporting scripts: `merge_tagging_outputs.py`, `merge_tagged_jsons.py`, `remove_duplicate_tags.py`

### Stage 5: Enrichment

| File / Directory | Files | Size | Description |
|------------------|-------|------|-------------|
| `enriched jsons/` | 18 | 164 MB | Enriched parts (9.5 MB each) |
| `combined_enriched.json` | 1 | 164 MB | All enriched data combined |
| `enriched_tweets.xlsx` | 1 | 43 MB | Excel export |
| `enriched_summary_log.json` | 1 | 7 KB | Process log |

Supporting scripts: `llm_enrich.py`, `prepare_for_upsert.py`, `sanitize_vectors.py`, `sanitize_metadata.py`, `find_bad_vector.py`, `find_bad_metadata.py`

### Stage 6: Vectorization & Retrieval

#### Local (FAISS + SQLite)

| File | Size | Description |
|------|------|-------------|
| `tweets.index` | 465 MB | FAISS vector index |
| `tweets.db` | 141 MB | SQLite (text + metadata) |
| `id_map.json` | 1.7 MB | Vector ID → tweet ID map |
| `checkpoint.json` | 1.7 MB | Embedding progress |
| `build_local_vector_store.py` | 6.9 KB | Build script |
| `search_locally.py` | 1.6 KB | Search script |

#### Cloud (OpenAI Vector Store)

Scripts: `upload_vectors.py`, `upload_jsonl_to_vector_store.py`, `upload_to_files.py`, `attach_to_store.py`, `query_vector_store.py`, `check_vector_file_status.py`

Data: `prepared_vectors_for_upsert.json` (600 KB), `vectors_upsert_ready.json` (426 KB), `vector_metadata_updates.json` (14.7 MB)

#### Query Interface

| File | Size | Description |
|------|------|-------------|
| `main.py` | 12.5 KB | Main query/response script |
| `mainv2.py` | 7.6 KB | v2 query script |
| `query_and_respond.ipynb` | 10.2 KB | Interactive notebook |
| `query_and_respond_function.ipynb` | 5.4 KB | Function-based notebook |

### Image Processing (Parallel Track)

| File / Directory | Files | Size | Description |
|------------------|-------|------|-------------|
| `image_embed_async.py` | 1 | 11 KB | Async image embedding |
| `tweetimage_embed.py` | 1 | 10 KB | Tweet image embedding |
| `image_sample_tweets.py` | 1 | 6 KB | Sample tweets with images |
| `vision_batches/` | 66 | 602 MB | Vision API batch requests |
| `vision_embeddings_batch.jsonl` | 1 | 69 KB | Embedding results |

### Tag Summary Reports

| File | Size | Description |
|------|------|-------------|
| `tag_summary_report.json` | 655 KB | Full report |
| `tag_summary_report_pruned.json` | 277 KB | Significant tags only |
| `tag_summary_report_global_only.json` | 11 KB | Global-level only |
| `README_tag_summary_pruned.md` | 2.9 KB | Documentation |
| `README_tag_summary_global_only.md` | 2.3 KB | Documentation |

---

## Account Populations

| Population | Count | Where | Role |
|------------|-------|-------|------|
| **Full extraction** | 80 | `Twitter Data/Twitter Account Dump/` | Broader CT field |
| **Selections** | 60 | `Twitter Data/.../Selections/` | Core dissertation sample |
| **Computationally processed** | 61 | `Literature/twitter dump/` pipeline | 60 Selections + blknoiz06 |
| **Wider context** (not extracted) | 20 | Main dump only, not in Selections | Background/reference accounts |

### Account Typology (from Phase 1)

| Type | Database Size | Description |
|------|--------------|-------------|
| **Traders** | 42.0 MB | Technical analysis, market calls, PnL posts |
| **Fundamentalists** | 23.1 MB | Macro, on-chain, thesis-driven |
| **Shitposters** | 14.6 MB | Memes, irony, community identity |
| **Macro** | (exported list only) | Macro-financial commentators |

---

## Storage Analysis

| Component | Size | % | Status |
|-----------|------|---|--------|
| Phase 1 (Twitter Data) | 1.2 GB | 10.5% | Archival + reference |
| Phase 2 intermediate (chunking, prepared) | 4.0 GB | 35.7% | Could be regenerated |
| Phase 2 tagged outputs | 3.9 GB | 34.2% | Expensive to regenerate (LLM costs) |
| Phase 2 final (enriched + vectors) | 0.8 GB | 7.2% | Active/queryable |
| Phase 2 image pipeline | 0.6 GB | 5.4% | Reference |
| Phase 2 CSVs/stats/scripts | 0.8 GB | 7.0% | Reference |
| **Total** | **~11.3 GB** | | |

### Potential Space Recovery

| What | Size | Risk |
|------|------|------|
| `dumpv2/` (duplicate of `chunked jsons/`) | ~1.0 GB | Low -- same data, different directory layout |
| `dumpv1/` (regenerable from CSVs) | ~0.8 GB | Low -- CSV→JSON is trivial |
| `prepared jsons/` (intermediate) | ~1.2 GB | Low -- regenerable from dumpv1 |
| `integrated_regex_hitsv1.csv` (superseded) | ~0.1 GB | Low -- merged version exists |
| **Recoverable total** | **~3.1 GB** | |

---

## Key Technical Details

- **Extraction tool:** TwExtract
- **Extraction period:** Sep - Dec 2024
- **Tweet date range:** Jan 2020 - May 2024
- **Tweet count:** ~79,000+ across 61 accounts
- **Tagging:** Two-layer (regex v4 + LLM semantic v1), merged
- **Tag vocabulary:** Crypto-specific (PnL flexing, PvE/PvP, etc.)
- **Vector stores:** Local FAISS + SQLite; Cloud OpenAI API
- **Image processing:** OpenAI Vision API
- **ID issue:** Excel truncates large tweet IDs; `_FIXED` / `_STRINGIDS` suffixes indicate corrections
