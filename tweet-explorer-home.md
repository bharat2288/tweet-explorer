---
type: project-home
project: tweet-explorer
date: 2026-03-07
cssclasses:
  - project-home
---
# Tweet Explorer
*[[dev-hub|Hub]] · [[README|GitHub]]*

Semantic search and analysis tool for ~79,000 crypto Twitter posts. FAISS + LLM-powered corpus exploration built for dissertation research.

## Specs

```dataview
TABLE rows.file.link as Specs
FROM "tweet-explorer/specs"
WHERE type AND type != "spec-prompts"
GROUP BY type
SORT type ASC
```
> [!warning]- Open Errors (`$= dv.pages('"knowledge/exports/errors"').where(p => p.project == "tweet-explorer" && !p.resolved).length`)
> ```dataview
> TABLE module, date
> FROM "knowledge/exports/errors"
> WHERE project = "tweet-explorer" AND resolved = false
> SORT date DESC
> LIMIT 5
> ```

> [!info]- Decisions (`$= dv.pages('"knowledge/exports/decisions"').where(p => p.project == "tweet-explorer").length`)
> ```dataview
> TABLE date
> FROM "knowledge/exports/decisions"
> WHERE project = "tweet-explorer"
> SORT date DESC
> LIMIT 5
> ```
>
> > [!info]- All Decisions
> > ```dataview
> > TABLE date
> > FROM "knowledge/exports/decisions"
> > WHERE project = "tweet-explorer"
> > SORT date DESC
> > ```

> [!tip]- Learnings (`$= dv.pages('"knowledge/exports/learnings"').where(p => p.project == "tweet-explorer").length`)
> ```dataview
> TABLE tags
> FROM "knowledge/exports/learnings"
> WHERE project = "tweet-explorer"
> SORT date DESC
> LIMIT 5
> ```
>
> > [!tip]- All Learnings
> > ```dataview
> > TABLE tags
> > FROM "knowledge/exports/learnings"
> > WHERE project = "tweet-explorer"
> > SORT date DESC
> > ```

> [!abstract]- Project Plans (`$= dv.pages('"knowledge/plans"').where(p => p.project == "tweet-explorer").length`)
> ```dataview
> TABLE title, default(date, file.ctime) as Date
> FROM "knowledge/plans"
> WHERE project = "tweet-explorer"
> SORT default(date, file.ctime) DESC
> ```

> [!note]- Sessions (`$= dv.pages('"knowledge/sessions/tweet-explorer"').length`)
> ```dataview
> TABLE topic
> FROM "knowledge/sessions/tweet-explorer"
> SORT file.mtime DESC
> LIMIT 5
> ```
>
> > [!note]- All Sessions
> > ```dataview
> > TABLE topic
> > FROM "knowledge/sessions/tweet-explorer"
> > SORT file.mtime DESC
> > ```
