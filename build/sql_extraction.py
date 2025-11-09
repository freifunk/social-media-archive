"""
Social Media Archive - SQLite to Markdown Exporter

This script extracts exported Twitter data from an SQLite database
and converts each entry to a markdown file. It replaces t.co URLs with their resolved 
URLs from a resolved_urls table in the same database and formats them into markdown link format.
The script assumes there is a "text", "tweetID" and "id" column in the tweet db,
and "original_url", "resolved_url", "status" columns in the resolved_urls table.

Copyright (C) 2025 Freifunk

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

Author: Sandra Taskovic
Date: 2025-08-03
Source: Claude AI took my previous scripts and re-structured into a class to improve performance, added error handling and timer.
"""

import sqlite3
import os
import yaml  # Requires: pip install PyYAML
import argparse
import re
import time
import json
from datetime import datetime

class TwitterToMarkdownExporter:
    def __init__(self, db_path):
        """Initialize the exporter with database path.
        
        Args:
            db_path (str): Path to the SQLite database file containing both tweets and resolved URLs
        """
        self.db_path = db_path
        self.url_map = {}
        self.stats = {
            'total_tweets': 0,
            'tweets_with_urls': 0,
            'urls_replaced': 0,
            'urls_failed': 0
        }
    
    def load_url_map(self, url_table='resolved_urls'):
        """Load URL mappings from database once for efficient lookup.
        
        Args:
            url_table (str): Name of the table containing resolved URLs
            
        Returns:
            dict: Mapping of original URLs to resolved URLs (only successful ones)
        """
        print("Loading URL mappings from database...")
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if the resolved_urls table exists
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name=?
            """, (url_table,))
            
            if not cursor.fetchone():
                print(f"Warning: Table '{url_table}' not found. URLs will not be resolved.")
                conn.close()
                return {}
            
            # Only load successful URL resolutions
            cursor.execute(f"""
                SELECT original_url, resolved_url, status 
                FROM {url_table} 
                WHERE status = 'SUCCESS'
            """)
            
            rows = cursor.fetchall()
            
            # Create mapping for successful resolutions only
            self.url_map = {row[0]: row[1] for row in rows}
            
            # Count failed URLs for stats
            cursor.execute(f"SELECT COUNT(*) FROM {url_table} WHERE status = 'FAILED'")
            failed_count = cursor.fetchone()[0]
            
            conn.close()
            
            print(f"Loaded {len(self.url_map)} successful URL mappings")
            if failed_count > 0:
                print(f"Found {failed_count} failed URL resolutions (will be left as t.co links)")
                
            return self.url_map
            
        except sqlite3.Error as e:
            print(f"Error loading URL mappings: {e}")
            return {}
    
    def replace_tco_links(self, text):
        """Replace t.co links in text with resolved URLs in markdown format.
        
        Args:
            text (str): Text containing potential t.co links
            
        Returns:
            str: Text with t.co links replaced with markdown formatted resolved URLs
        """
        if not text:
            return text
            
        # Pattern to match t.co URLs
        tco_pattern = r'https://t\.co/\S+'
        
        urls_found = re.findall(tco_pattern, text)
        if urls_found:
            self.stats['tweets_with_urls'] += 1
        
        def replacer(match):
            short_url = match.group()
            resolved_url = self.url_map.get(short_url)
            
            if resolved_url:
                self.stats['urls_replaced'] += 1
                # Create markdown link format: [display_text](url)
                # Use domain name as display text for cleaner appearance
                try:
                    from urllib.parse import urlparse
                    domain = urlparse(resolved_url).netloc
                    display_text = domain if domain else resolved_url
                except:
                    display_text = resolved_url
                
                return f"[{display_text}]({resolved_url})"
            else:
                # Keep original t.co link if no resolution found
                self.stats['urls_failed'] += 1
                return short_url
        
        return re.sub(tco_pattern, replacer, text)
    
    def export_to_markdown(self, tweet_table, output_dir, url_table='resolved_urls'):
        """Export tweets from SQLite database to markdown files.
        
        Args:
            tweet_table (str): Name of the table containing tweet data
            output_dir (str): Directory to save markdown files
            url_table (str): Name of the table containing resolved URLs
        """
        # Start timing
        start_time = time.time()
        
        print(f"Starting export from '{tweet_table}' to '{output_dir}'")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 60)
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Load URL mappings once
        self.load_url_map(url_table)
        
        # Connect to database
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Get all tweets
            cursor.execute(f"SELECT * FROM {tweet_table};")
            rows = cursor.fetchall()
            
            if not rows:
                print(f"No data found in table '{tweet_table}'")
                conn.close()
                return
            
            self.stats['total_tweets'] = len(rows)
            print(f"Processing {len(rows)} tweets...")
            
            # Process each tweet
            exported_count = 0
            skipped_count = 0
            
            for i, row in enumerate(rows, 1):
                # Convert Row to dictionary
                data = dict(row)
                
                # Extract and process tweet text
                body_text = data.pop("text", "").strip()
                processed_text = self.replace_tco_links(body_text)
                
                # Generate filename using tweetID or id
                tweet_id = data.get('tweetID') or data.get('id', f'tweet_{i}')
                filename = f"{tweet_id}.md"
                filepath = os.path.join(output_dir, filename)
                
                # Skip if file already exists
                if os.path.exists(filepath):
                    skipped_count += 1
                    continue
                
                # Create YAML frontmatter from remaining data
                try:
                    frontmatter = yaml.dump(data, sort_keys=False, allow_unicode=True)
                except Exception as e:
                    print(f"Warning: Error creating frontmatter for tweet {tweet_id}: {e}")
                    frontmatter = f"# Error creating frontmatter: {e}\n"
                
                # Write markdown file
                try:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write("---\n")
                        f.write(frontmatter)
                        f.write("---\n\n")
                        f.write(processed_text)
                    
                    exported_count += 1
                    
                    # Progress indicator
                    if i % 100 == 0:
                        print(f"Processed {i}/{len(rows)} tweets...")
                        
                except Exception as e:
                    print(f"Error writing file {filepath}: {e}")
            
            conn.close()
            
            # Calculate elapsed time
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
            
            # Print summary
            print("-" * 60)
            print("Export Summary:")
            print(f"  Total tweets processed: {self.stats['total_tweets']}")
            print(f"  New markdown files created: {exported_count}")
            print(f"  Files skipped (already exist): {skipped_count}")
            print(f"  Tweets containing t.co URLs: {self.stats['tweets_with_urls']}")
            print(f"  URLs successfully replaced: {self.stats['urls_replaced']}")
            print(f"  URLs left as t.co (failed/not found): {self.stats['urls_failed']}")
            print(f"  Output directory: {output_dir}")
            print(f"  Total processing time: {time_str}")
            print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
        except sqlite3.Error as e:
            print(f"Database error: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")


def main():
    """Main function to handle command line arguments and execute the export process."""
    
    parser = argparse.ArgumentParser(
        description="Export Twitter data from SQLite to Markdown with URL resolution",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage with resolved URLs in same database
  python sql_extraction.py --db-path data.sqlite3 --tweet-table tweet --output-dir ./src/content/tweets
  
  # Custom URL table name
  python sql_extraction.py --db-path data.sqlite3 --tweet-table tweet --url-table my_resolved_urls --output-dir ./markdown_output
        """
    )
    
    parser.add_argument(
        "--db-path",
        type=str,
        required=True,
        help="Path to the SQLite database file containing both tweets and resolved URLs"
    )
    
    parser.add_argument(
        "--tweet-table",
        type=str,
        required=True,
        help="Name of the table containing tweet data"
    )
    
    parser.add_argument(
        "--url-table",
        type=str,
        default="resolved_urls",
        help="Name of the table containing resolved URLs (default: resolved_urls)"
    )
    
    parser.add_argument(
        "--output-dir",
        type=str,
        required=False,
        help="Directory to save the exported markdown files"
    )
    
    parser.add_argument(
        "--config",
        type=str,
        help="Path to JSON configuration file (optional, overrides other arguments if provided)"
    )
    
    args = parser.parse_args()
    
    # Load config from file if provided
    if args.config:
        if not os.path.exists(args.config):
            print(f"Error: Config file not found: {args.config}")
            return
        
        try:
            with open(args.config, 'r') as f:
                config = json.load(f)
            
            db_path = config.get('database', {}).get('path', args.db_path)
            tweet_table = config.get('database', {}).get('tweet_table', args.tweet_table)
            url_table = config.get('database', {}).get('url_table', args.url_table or 'resolved_urls')
            output_dir = config.get('output', {}).get('directory', args.output_dir)
            
            # Validate required fields
            if not db_path or not tweet_table or not output_dir:
                print("Error: Config file must contain database.path, database.tweet_table, and output.directory")
                return
            
            # Create exporter and run with config
            exporter = TwitterToMarkdownExporter(db_path)
            exporter.export_to_markdown(tweet_table, output_dir, url_table)
            return
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in config file: {e}")
            return
        except Exception as e:
            print(f"Error loading config file: {e}")
            return
    
    # Use command-line arguments (backward compatibility)
    if not args.db_path or not args.tweet_table or not args.output_dir:
        print("Error: --db-path, --tweet-table, and --output-dir are required when not using --config")
        return
    
    # Create exporter and run
    exporter = TwitterToMarkdownExporter(args.db_path)
    exporter.export_to_markdown(args.tweet_table, args.output_dir, args.url_table)


if __name__ == "__main__":
    main()