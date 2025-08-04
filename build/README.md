
# 🐦 Twitter Data Preprocessing Workflow

This README explains how the pre-build and build scripts
should run to prepare the twitter data for the Social Media Archive.

The project extracts and resolves short Twitter links (e.g. `https://t.co/...`) from a SQLite database and prepares Markdown files with their resolved URLs formatted as links.

---

## 🛠️ Workflow Overview

```text

┌────────────────────────────┐
│ run url_extraction_sql.py  │     ← Pre-build 
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
│ Stores in resolved_urls.db │
└────────────────────────────┘




┌────────────────────────────┐
│ run sqlite_extraction.py   │     ←  build time, imports and calls change_url.py
└─────────────┬──────────────┘
              │             
              ▼
     Read body text from SQLite     ◄────────────┐       
              │                                  │     ←  change_url.py uses resolved_urls.db
              ▼                                  │
     Run text_url_replace()                      │
(replace old link with resolved link)            │
              │                                  │
              ▼                                  │
┌────────────────────────────┐                   │
│  resolved_urls.db          │     ──────────────┘
└─────────────┬──────────────┘              
              │                             
              ▼    
┌──────────────────────────┐
│ Output .md files         │        ←  final md files stored to /src/content/tweets
└──────────────────────────┘


