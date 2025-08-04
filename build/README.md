# Twitter Data Preprocessing Workflow

This README explains how the pre-build and build scripts should run to prepare the Twitter data for the Social Media Archive.

The project extracts and resolves short Twitter links (e.g. https://t.co/...) from a SQLite database and prepares Markdown files with their resolved URLs formatted as links.

---

## Workflow Overview

```text

To improve the speed of tweet extraction at build time, we decided to improve performance by resolving URLs
and storing them in the same database as an additional pre-build step.
Then, at build time, we use the resolved URLs from the same database to speed 
up the extraction process.

-----------------------------------
Example terminal input:

python url_extraction.py --db-path data.sqlite3 --tweet-table tweet --url-table resolved_urls

┌────────────────────────────┐
│ run url_extraction.py      │     ← Pre-build 
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
│ Stores in resolved_urls    │
│ table in data.sqlite3      │
└────────────────────────────┘

Example output:

Original URL                   Status     Resolved URL / Error
--------------------------------------------------------------------------------
https://t.co/1kb5KUmsjs        SUCCESS    https://social.freifunk.net/@freifunk
--------------------------------------------------------------------------------
Results saved to 'resolved_urls' table in data.sqlite3
Total 1 tweets processed in 2.48s
Processing completed at: 2025-08-03 23:23:17


-----------------------------------

Example terminal input:

python sql_extraction.py --db-path data.sqlite3 --tweet-table tweet --url-table resolved_urls --output-dir ./src/content/tweets

┌────────────────────────────┐
│ run sql_extraction.py      │     ←  During build
└─────────────┬──────────────┘
              │             
              ▼
 Read body text from SQLite tweet     ◄──────────┐       
              │                                  │     ←  uses resolved_urls table
              ▼                                  │       from same database
     Run text_url_replace()                      │
(replace old link with resolved link)            │
              │                                  │
              ▼                                  │
┌────────────────────────────┐                   │
│ access resolved_urls table │     ──────────────┘
│ in data.sqlite3            │
└─────────────┬──────────────┘              
              │                             
              ▼    
┌──────────────────────────┐
│ Output .md files to dir  │        ←  final md files stored to /src/content/tweets
└──────────────────────────┘

Example output:

Starting export from 'tweet' to './src/content/tweets'
Started at: 2025-08-04 01:41:14
------------------------------------------------------------
Loading URL mappings from database...
Loaded 924 successful URL mappings
Found 50 failed URL resolutions (will be left as t.co links)
Processing 1528 tweets...
Processed 100/1528 tweets...
Processed 200/1528 tweets...
Processed 300/1528 tweets...
Processed 400/1528 tweets...
Processed 500/1528 tweets...
Processed 600/1528 tweets...
Processed 700/1528 tweets...
Processed 800/1528 tweets...
Processed 900/1528 tweets...
Processed 1000/1528 tweets...
Processed 1100/1528 tweets...
Processed 1200/1528 tweets...
Processed 1300/1528 tweets...
Processed 1400/1528 tweets...
Processed 1500/1528 tweets...
------------------------------------------------------------
Export Summary:
  Total tweets processed: 1528
  New markdown files created: 1528
  Files skipped (already exist): 0
  Tweets containing t.co URLs: 1045
  URLs successfully replaced: 1107
  URLs left as t.co (failed/not found): 79
  Output directory: ./src/content/tweets
  Total processing time: 1.54s
Completed at: 2025-08-04 01:41:16

