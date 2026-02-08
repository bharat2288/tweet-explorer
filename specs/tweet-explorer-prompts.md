# Tweet Explorer — Prompts

> Project-specific commands that complement global macros.
> Copy useful prompts discovered during work into appropriate sections.

---

## Session Management

### Session Start
```
Read specs/tweet-explorer-design.md and specs/tweet-explorer-status.md.
Summarize: (1) what this project does, (2) current state, (3) what's next.
```

### Session End
```
Update specs/tweet-explorer-status.md with:
- What was accomplished this session
- Current state (working / in-progress / blocked)
- Decisions made and rationale
- Specific tasks for next session
```

### Quick Resume
```
What were we working on? Check specs/tweet-explorer-status.md for context.
```

---

## Development Workflow

### Before Implementing
```
Before writing code:
1. Confirm this aligns with specs/tweet-explorer-design.md scope
2. Propose approach in 2-3 sentences
3. Wait for approval
```

### After Implementing
```
Implementation done. Now:
1. Summarize what changed
2. Note any edge cases or limitations
3. Suggest how to test it
```

### Component Extraction Pattern
```
Extracting [ComponentName] from App.jsx:
1. Identify the JSX block and its dependencies (state, handlers, props)
2. Create component file with explicit prop types
3. Move JSX + any component-local logic
4. Import in App.jsx, pass state/handlers as props
5. Verify no broken references
```

---

## Scope Management

### Scope Check
```
Is [this task] in scope for tweet-explorer-design.md?
The makeover scope is: structure + aesthetics only.
If this adds new functionality, defer to Future Ideas.
```

### Design System Check
```
Before marking frontend work complete, verify:
- Whisper Green base (#0c0f0d), not gray-900
- Camel accent (#d4a574) limited to 2-3 uses per view
- Fraunces display font for title/character moment
- 4-level elevation correct
- Energy present (hover transforms, glows)
- Labels: 12px/600/0.06em/uppercase
```

---

## Project-Specific

### Test Backend Locally
```
cd C:\Users\bhara\dev\tweet-explorer\backend
.\venv\Scripts\activate
python -m uvicorn main:app --reload --port 8400
```

### Test Frontend Locally
```
cd C:\Users\bhara\dev\tweet-explorer\frontend
npm run dev -- --port 5177
```

### Verify Data Files
```
Check that these exist in backend/data/:
- tweets.db (~140MB)
- tweets.index (~488MB)
- id_map.json (~1.8MB)
```

---

## Quick Reference

| Need | Prompt |
|------|--------|
| Start session | "Read specs and summarize state" |
| End session | "Update status.md" |
| Check scope | "Is this in scope? Makeover = structure + aesthetics only" |
| Extract component | "Extract [Name] from App.jsx following the pattern" |
| Design system check | "Run design system checklist" |
| Test backend | "Start backend on port 8400" |
| Test frontend | "Start frontend on port 5177" |
