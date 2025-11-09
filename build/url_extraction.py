import requests
import re
import sqlite3
from datetime import datetime
import argparse
import time
import signal
import sys

"""
Author: Sandra Taskovic
Sources: Claude AI and ChatGPT adding timer, signal handler and error handling
Date: 2025-08-03
Purpose: This script finds and resolves t.co URLs in a given string text to their original links,
then save the results to a table in the same SQLite database. The results are also printed in the terminal.
 """

# Global variables for clean shutdown
connections = {}
start_time = None
processed_count = 0

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\n" + "="*80)
    print("Interrupted by user (Ctrl+C)")
    
    # Close database connections
    for name, conn in connections.items():
        if conn:
            try:
                conn.close()
                print(f"Closed {name} database connection")
            except:
                pass
    
    # Calculate elapsed time if we have a start time
    if start_time:
        elapsed_time = time.time() - start_time
        hours = int(elapsed_time // 3600)
        minutes = int((elapsed_time % 3600) // 60)
        seconds = elapsed_time % 60
        
        if hours > 0:
            time_str = f"{hours}h {minutes}m {seconds:.2f}s"
        elif minutes > 0:
            time_str = f"{minutes}m {seconds:.2f}s"
        else:
            time_str = f"{seconds:.2f}s"
        
        print(f"Processed {processed_count} tweets before interruption")
        print(f"Elapsed time: {time_str}")
    
    print(f"Program terminated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    sys.exit(0)

# Set up signal handler for Ctrl+C
signal.signal(signal.SIGINT, signal_handler)

def resolve_tco_url(tco_url):
    """Resolve a t.co URL to its final destination.
    Args:
        tco_url (str): The t.co URL to resolve.
    Returns:
        dict: A dictionary containing the original URL, status, resolved URL or error message, and timestamp.
    """

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.head(tco_url, allow_redirects=True, headers=headers, timeout=10)
        resolved_url = response.url
        
        # Check if the URL actually resolved (not still a t.co link)
        if resolved_url == tco_url or 't.co/' in resolved_url:
            return {
                'original_url': tco_url,
                'status': 'FAILED',
                'resolved_url': 'URL not resolved or invalid link',
                'timestamp': datetime.now().isoformat()
            }
        else:
            return {
                'original_url': tco_url,
                'status': 'SUCCESS',
                'resolved_url': resolved_url,
                'timestamp': datetime.now().isoformat()
            }
    except Exception as e:
        return {
            'original_url': tco_url,
            'status': 'FAILED',
            'resolved_url': str(e),
            'timestamp': datetime.now().isoformat()
        }

def init_resolved_urls_table(conn, table_name='resolved_urls'):
    """Initialize the resolved_urls table in the existing database.
    Args:
        conn (sqlite3.Connection): The database connection.
        table_name (str): The name of the table to create.
    Returns:
        sqlite3.Cursor: Cursor object for the database.
    Output:
        Creates a table for storing resolved URLs if it doesn't exist."""
    
    cursor = conn.cursor()
    
    cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {table_name} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_url TEXT NOT NULL,
            status TEXT NOT NULL,
            resolved_url TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            UNIQUE(original_url, timestamp)
        )
    ''')
    
    conn.commit()
    return cursor

def find_and_resolve_tco_urls(text, cursor, table_name='resolved_urls'):
    """Find all t.co URLs in text, resolve them, and save to SQLite database.
    Args:
        text (str): The input text containing t.co URLs.
        cursor (sqlite3.Cursor): The SQLite cursor to execute database operations.
        table_name (str): The name of the table to store resolved URLs.
    Returns:
        None
    Output:
        Prints the results to the console and saves them to the SQLite database.
    """

    # Regex pattern to find t.co URLs
    tco_pattern = r'https://t\.co/[A-Za-z0-9]+'
    
    # Find all t.co URLs in the text
    tco_urls = re.findall(tco_pattern, text)
    
    if not tco_urls:
        return

    # Process each URL
    for tco_url in tco_urls:
        # Resolve the URL
        result = resolve_tco_url(tco_url)
        
        # Print results
        status = result['status']
        resolved = result['resolved_url']
        print(f"{result['original_url']:<30} {status:<10} {resolved}")
        
        # Save to SQLite database
        try:
            cursor.execute(f'''
                INSERT INTO {table_name} (original_url, status, resolved_url, timestamp)
                VALUES (?, ?, ?, ?)
            ''', (result['original_url'], result['status'], result['resolved_url'], result['timestamp']))
            
        except sqlite3.IntegrityError:
            # Handle duplicate entries (same URL and timestamp)
            pass


def main(db_path, tweet_table='tweets', url_table='resolved_urls'):
    global connections, start_time, processed_count
    
    # Start timing
    start_time = time.time()
    processed_count = 0
    print(f"Starting URL resolution at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 80)

    # Connect to the database (same one for both tweets and resolved URLs)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    connections['main'] = conn

    # Initialize the resolved_urls table
    cursor = init_resolved_urls_table(conn, url_table)

    # Retrieve all tweets from the specified tweet table
    cursor.execute(f"SELECT * FROM {tweet_table};")
    rows = cursor.fetchall()

    if not rows:
        print(f"No data found in table '{tweet_table}'.")
        conn.close()
        return
    
    # Print table header
    print(f"{'Original URL':<30} {'Status':<10} {'Resolved URL / Error'}")
    print("-" * 80)

    for row in rows:
        # Convert Row object to a dictionary
        data = dict(row)
        # Extract tweet text
        text = data.get("text", "").strip()
        find_and_resolve_tco_urls(text, cursor, url_table)
        conn.commit()
        processed_count += 1

    print("-" * 80)
    
    # Calculate and print elapsed time
    end_time = time.time()
    elapsed_time = end_time - start_time
    
    # Format elapsed time nicely
    hours = int(elapsed_time // 3600)
    minutes = int((elapsed_time % 3600) // 60)
    seconds = elapsed_time % 60
    
    if hours > 0:
        time_str = f"{hours}h {minutes}m {seconds:.2f}s"
    elif minutes > 0:
        time_str = f"{minutes}m {seconds:.2f}s"
    else:
        time_str = f"{seconds:.2f}s"
    
    print(f"Results saved to '{url_table}' table in {db_path}")
    print(f"Total {len(rows)} tweets processed in {time_str}")
    print(f"Processing completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    conn.close()
    connections.clear()
    return


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Resolve t.co URLs from tweets and store in the same database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
            Examples:
            python url_extraction_sql.py --db-path data.sqlite3 --tweet-table tweet --url-table resolved_urls
            """
    )

    parser.add_argument(
        "--db-path",
        type=str,
        required=True,
        help="Path to the SQLite database file containing tweets."
    )
    parser.add_argument(
        "--tweet-table",
        type=str,   
        required=True,
        help="Name of the table containing tweets."
    )
    parser.add_argument(
        "--url-table",
        type=str,
        default='resolved_urls',
        help="Name of the table to create/use for storing resolved URLs (default: resolved_urls)."
    )
    
    parser.add_argument(
        "--config",
        type=str,
        help="Path to JSON configuration file (optional, overrides other arguments if provided)"
    )

    args = parser.parse_args()
    
    # Load config from file if provided
    if args.config:
        import json
        import os
        
        if not os.path.exists(args.config):
            print(f"Error: Config file not found: {args.config}")
            return
        
        try:
            with open(args.config, 'r') as f:
                config = json.load(f)
            
            db_path = config.get('database', {}).get('path', args.db_path)
            tweet_table = config.get('database', {}).get('tweet_table', args.tweet_table)
            url_table = config.get('database', {}).get('url_table', args.url_table or 'resolved_urls')
            
            # Validate required fields
            if not db_path or not tweet_table:
                print("Error: Config file must contain database.path and database.tweet_table")
                return
            
            main(db_path, tweet_table, url_table)
            return
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in config file: {e}")
            return
        except Exception as e:
            print(f"Error loading config file: {e}")
            return
    
    # Use command-line arguments (backward compatibility)
    if not args.db_path or not args.tweet_table:
        print("Error: --db-path and --tweet-table are required when not using --config")
        return

    main(args.db_path, args.tweet_table, args.url_table)