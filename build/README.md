
# 🐦 Twitter Data Preprocessing Workflow

This ReadME explains how the pre-build and build scripts
run to prepare the twitter data.

The project extracts and resolves short Twitter links (e.g. `https://t.co/...`) from a SQLite database and prepares Markdown files with clean, readable URLs.

---

## 🛠️ Workflow Overview

```text
┌────────────────────────────┐
│ url_extraction_sql.py      │  ← Pre-build
└─────────────┬──────────────┘
              │
              ▼
     Extract short links from
     original SQLite database
              │
              ▼
     Resolve links via HTTP
              │
              ▼
┌────────────────────────────┐
│ Store in resolved_urls.db  │
└────────────────────────────┘


┌────────────────────┐
│ sqlite_extraction.py│     ←  build time, imports change_url.py
└─────────┬──────────┘
          │             
          ▼
┌────────────────────┐
│  resolved_urls.db  │ ◄────────────┐
└─────────┬──────────┘              │
          │                         │
          ▼                         │   ←  change_url.py uses db
                                    │      
 Read body_text from SQLite         │
          │                         │
          ▼                         │
 Run text_url_replace() ────────────┘
 (uses resolved_urls.db)
          │
          ▼
┌────────────────────┐
│ Output .md files   │
└────────────────────┘


