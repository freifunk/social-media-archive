import sqlite3
import os
import yaml
import argparse
from change_urls import text_url_replace

"""
Author: Sandra 
Date: 2025-08-03
Purpose: This script extracts exported twitter data from an SQLite database
and converts each entry to a markdown file. The script assums there is a "text", "tweetID"
and "id" column of data in the tweet db. It also assumes there is a "resolved_urls" table
in the url db. "https://t.co/xxx.. URLs in the bodytext are replaced with their resolved URLs 
and formatted into markdown link format.
 """

def export_sqlite_to_markdown(db_path, tweet_db, url_db, output_dir):
    """Export data from SQLite database to markdown files.
    Args:
        db_path (str): Path to the SQLite database file.
        tweet_db (str): Name of the table to extract tweet data from.
        url_db (str): Name of the table containing resolved URLs.
        output_dir (str): Directory to save the exported markdown files.
    Returns:
        None
    Output:
        Creates markdown files in the specified output directory, each containing the data from one row.
    """
    
    # make output directory if needed
    os.makedirs(output_dir, exist_ok=True)

    try:
        conn = sqlite3.connect(db_path)
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return
    
    conn.row_factory = sqlite3.Row  # access columns by name
    cursor = conn.cursor()

    cursor.execute(f"SELECT * FROM {tweet_db};")
    rows = cursor.fetchall()

    if not rows:
        print(f"No data found in table '{tweet_db}'.")
        conn.close()
        return

    for row in rows:
        # Convert Row object to a dictionary
        data = dict(row)

        # Extract tweet text as body
        body_text = data.pop("text", "").strip()

        body_text = text_url_replace(url_db, "resolved_urls", body_text)

        # Use tweetID or fallback to id as filename
        filename = f"{data.get('tweetID') or data.get('id')}.md"
        filepath = os.path.join(output_dir, filename)

        # Convert remaining fields to YAML frontmatter
        frontmatter = yaml.dump(data, sort_keys=False, allow_unicode=True)

        # Write to .md file frontmatter and body
        # Write to .md file only if it doesn't already exist
        if not os.path.exists(filepath):
            with open(filepath, "w", encoding="utf-8") as f:
                f.write("---\n")
                f.write(frontmatter)
                f.write("---\n\n")
                f.write(body_text)

    conn.close()
    print(f"Exported {len(rows)} markdown files to: {output_dir}")


if __name__ == "__main__":
    """Main function to handle command line arguments and execute the cleaning process."""
    
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
        help="Path to the SQLite database file."
    )
    parser.add_argument(
        "--tweet-db",
        type=str,
        required=True,
        help="Name of the table to extract tweet data from."
    )

    parser.add_argument(
        "--url-db",
        type=str,
        required=True,
        help="Name of the table containing resolved URLs."
    )

    parser.add_argument(
        "--output-dir",
        type=str,
        required=True,
        help="Directory to save the exported markdown files."
    )

    args = parser.parse_args()

    export_sqlite_to_markdown(args.db_path, args.tweet_db, args.url_db, args.output_dir)
