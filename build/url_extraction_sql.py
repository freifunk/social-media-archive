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
then save the results to an SQLite database. The results are also printed in the terminal.
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

def init_database(db_file):
    """Initialize SQLite database with the required table.
    Args:
        db_file (str): The SQLite database file/path to initialize.
    Returns:
        tuple: (connection, cursor) objects for the database.
    Output:
        Creates a table for storing resolved URLs if it doesn't exist."""
    
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row  # access columns by name
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resolved_urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_url TEXT NOT NULL,
            status TEXT NOT NULL,
            resolved_url TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            UNIQUE(original_url, timestamp)
        )
    ''')
    
    conn.commit()
    return conn, cursor

def find_and_resolve_tco_urls(text, cursor):
    """Find all t.co URLs in text, resolve them, and save to SQLite database.
    Args:
        text (str): The input text containing t.co URLs.
        cursor (sqlite3.Cursor): The SQLite cursor to execute database operations.
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
        print("No t.co URLs found in the text.")
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
            cursor.execute('''
                INSERT INTO resolved_urls (original_url, status, resolved_url, timestamp)
                VALUES (?, ?, ?, ?)
            ''', (result['original_url'], result['status'], result['resolved_url'], result['timestamp']))
            
        except sqlite3.IntegrityError:
            # Handle duplicate entries (same URL and timestamp)
            pass


def main(db_path, tweet_db='tweets', url_db='resolved_urls'):
    global connections, start_time, processed_count
    
    # Start timing
    start_time = time.time()
    processed_count = 0
    print(f"Starting URL resolution at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 80)

    # Initialize output database
    conn, cursor = init_database(url_db)
    connections['output'] = conn

    # Connect to the input database containing tweets
    tweet_conn = sqlite3.connect(db_path)
    tweet_conn.row_factory = sqlite3.Row
    tweet_cursor = tweet_conn.cursor()
    connections['input'] = tweet_conn

    # Retrieve all tweets from the specified tweet database
    tweet_cursor.execute(f"SELECT * FROM {tweet_db};")
    rows = tweet_cursor.fetchall()

    if not rows:
        print(f"No data found in table '{tweet_db}'.")
        conn.close()
        tweet_conn.close()
        return
    
    # Print table header
    print(f"{'Original URL':<30} {'Status':<10} {'Resolved URL / Error'}")
    print("-" * 80)

    for row in rows:
        # Convert Row object to a dictionary
        data = dict(row)
        # Extract tweet text
        text = data.get("text", "").strip()
        find_and_resolve_tco_urls(text, cursor)
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
    
    print(f"Results saved to {url_db} SQLite database")
    print(f"Total {len(rows)} tweets processed in {time_str}")
    print(f"Processing completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    conn.close()
    tweet_conn.close()
    connections.clear()
    return


if __name__ == "__main__":
    # Example test case

    # sample_text = """
    # Check out this article: https://t.co/knVzQ92haM
    # And also this one: https://t.co/example123
    # Some regular text here.
    # Another link: https://t.co/abc123def
    # Not a t.co link: https://google.com
    # Final t.co link: https://t.co/xyz789
    # """

    parser = argparse.ArgumentParser(
        description="Data extraction to markdown from SQLite database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
            Examples:
            python3 sqlite_extraction.py --db-path path/to/database.db --table-name tweets --output-dir output_directory"
            """
    )

    parser.add_argument(
        "--db-path",
        type=str,
        required=True,
        help="Path to the SQLite twitter database file to resolve urls."
    )
    parser.add_argument(
        "--tweet-db",
        type=str,   
        required=True,
        help="Name of the table containing tweets."
    )
    parser.add_argument(
        "--url-db",
        type=str,
        default='resolved_urls',
        help="Name of the table to save resolved URLs."
    )

    args = parser.parse_args()

    main(args.db_path, args.tweet_db, args.url_db)