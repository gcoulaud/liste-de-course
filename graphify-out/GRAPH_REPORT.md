# Graph Report - liste-de-course  (2026-09-16)

## Corpus Check
- 17 files · ~212,380 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 5, .rules 1, .webmanifest 1)

## Summary
- 141 nodes · 199 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8c98403e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Autocomplete et interface
- Pipeline Graphify
- Données de courses
- Illustration de courses
- Partage familial
- Profils utilisateurs
- Rendu des suggestions
- Icône favicon
- QR code 96 px
- QR code principal
- Icône Apple Touch
- Icône application 192
- Icône application 512
- QR code 24 px
- Configuration Firebase
- Regroupement Graphify
- Sorties Graphify

## God Nodes (most connected - your core abstractions)
1. `switchUser()` - 10 edges
2. `render()` - 10 edges
3. `Graphify pipeline` - 9 edges
4. `bootstrap()` - 7 edges
5. `Shopping Cart Filled with Groceries` - 7 edges
6. `connectToSharedList()` - 6 edges
7. `Groceries` - 6 edges
8. `loadLocalItems()` - 5 edges
9. `detectCategory()` - 5 edges
10. `normalizeText()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Project graphify policy` --semantically_similar_to--> `Graphify pipeline`  [INFERRED] [semantically similar]
  AGENTS.md → .codex/skills/graphify/SKILL.md
- `Household profile tabs` --semantically_similar_to--> `Firebase household sharing configuration`  [INFERRED] [semantically similar]
  index.html → FIREBASE_SETUP.md
- `Project graphify policy` --references--> `Graph node explanation`  [EXTRACTED]
  AGENTS.md → .codex/skills/graphify/references/query.md
- `Project graphify policy` --references--> `Shortest graph path`  [EXTRACTED]
  AGENTS.md → .codex/skills/graphify/references/query.md
- `Firebase-generated 404 page` --conceptually_related_to--> `Firebase household sharing configuration`  [INFERRED]
  404.html → FIREBASE_SETUP.md

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

### Community 0 - "Autocomplete et interface"
Cohesion: 0.06
Nodes (27): autocompleteList, beaufilsUserBtn, CATEGORY_KEYWORDS, CATEGORY_ORDER, clearBtn, cloudSuggestions, currentUser, customSuggestions (+19 more)

### Community 1 - "Pipeline Graphify"
Cohesion: 0.14
Nodes (18): Project graphify policy, Folder watch, URL ingestion, Graph export formats, Graphify MCP server, Knowledge graph extraction schema, Cross-repository graph merge, CLAUDE.md graphify integration (+10 more)

### Community 2 - "Données de courses"
Cohesion: 0.20
Nodes (16): bootstrap(), compareItemsByCategoryThenName(), connectToSharedList(), connectToSharedSuggestions(), detectCategory(), itemDocRef(), itemsCollection(), loadFirebaseModules() (+8 more)

### Community 3 - "Illustration de courses"
Cohesion: 0.46
Nodes (8): Beverages, Fresh Produce, Groceries, Grocery Shopping, Ketchup, Packaged Food, Shopping Cart, Shopping Cart Filled with Groceries

### Community 4 - "Partage familial"
Cohesion: 0.33
Nodes (7): Firebase-generated 404 page, Firebase household sharing configuration, Firestore security guidance, Household profile tabs, QR code sharing interface, Shopping item template, Shopping list user interface

### Community 5 - "Profils utilisateurs"
Cohesion: 0.29
Nodes (7): createUserProfile(), loadUserProfile(), normalizeText(), rememberSuggestion(), renderUserTabs(), sanitizeUserId(), suggestionDocRef()

### Community 6 - "Rendu des suggestions"
Cohesion: 0.50
Nodes (4): escapeHtml(), formatSuggestion(), hideAutocomplete(), renderAutocomplete()

### Community 7 - "Icône favicon"
Cohesion: 0.83
Nodes (4): Groceries, Grocery Cart Icon, Grocery Shopping, Shopping Cart

### Community 8 - "QR code 96 px"
Cohesion: 0.67
Nodes (4): Digital Scanning, Machine-Readable Code, QR Code, QR Code Icon

### Community 9 - "QR code principal"
Cohesion: 0.50
Nodes (4): Encoded Data, Machine-Readable Scanning, QR Code, QR Code Image

### Community 10 - "Icône Apple Touch"
Cohesion: 1.00
Nodes (3): Groceries, Grocery Shopping App Icon, Shopping Cart

### Community 11 - "Icône application 192"
Cohesion: 1.00
Nodes (3): Groceries, Grocery Shopping App Icon, Shopping Cart

### Community 12 - "Icône application 512"
Cohesion: 0.67
Nodes (3): Grocery list application icon, Assorted grocery products, Shopping cart illustration

### Community 13 - "QR code 24 px"
Cohesion: 0.67
Nodes (3): Machine-Readable Scanning, QR Code, QR Code Icon

### Community 14 - "Configuration Firebase"
Cohesion: 0.13
Nodes (18): cloudEntries, connectCloud(), currentUser, DEFAULT_USER, deleteEntry(), emptyElement, listElement, localSuggestions (+10 more)

## Knowledge Gaps
- **55 isolated node(s):** `DEFAULT_USER`, `CATEGORY_ORDER`, `CATEGORY_KEYWORDS`, `SUGGESTIONS`, `customSuggestions` (+50 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 62 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `firebaseConfig` connect `Configuration Firebase` to `Autocomplete et interface`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `DEFAULT_USER`, `CATEGORY_ORDER`, `CATEGORY_KEYWORDS` to the rest of the system?**
  _55 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Autocomplete et interface` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Pipeline Graphify` be split into smaller, more focused modules?**
  _Cohesion score 0.13725490196078433 - nodes in this community are weakly interconnected._
- **Should `Configuration Firebase` be split into smaller, more focused modules?**
  _Cohesion score 0.13405797101449277 - nodes in this community are weakly interconnected._