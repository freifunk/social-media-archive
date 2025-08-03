import sqlite3
import re


"""
Author: Sandra 
Date: 2025-08-03
Purpose: This script looks for t.co links in a body text, replaces them with their resolved 
URLs if they exist in the SQLite database, and formats them into markdown link format.
The script assumes the database has a table with columns "original_url" and "resolved_url".
 """

def load_url_map(db_path, db_table_name):

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        command = f"SELECT original_url, resolved_url FROM {db_table_name};"
        cursor.execute(command)
    except Exception as e:
        print("Error: ", e)
    
    #Create a dict with just the columns for O(1) lookup
    url_map = {row[0]: row[1] for row in cursor.fetchall()}
    conn.close()
    return url_map

def replace_links(body_text, url_map):
    pattern = r"https://t\.co/\S+"
    
    def replacer(match):
        short_url = match.group()
        resolved_url = url_map.get(short_url, short_url)
        return f"[{resolved_url}]({resolved_url})"  # Markdown format: [text](url)

    return re.sub(pattern, replacer, body_text)


def text_url_replace(db_path, db_table_name, body_text):

    url_map = load_url_map(db_path, db_table_name)
    new_body = replace_links(body_text, url_map)
    return new_body

if __name__ == "__main__":
    # Example test case

    # program assumed columns "original_url" and "resolved_url"  are in db_table_name

    db_path = "resolved_urls.db"
    db_table_name = "resolved_urls"
    body_text = "Check this out https://t.co/knVzQ92haM and also https://t.co/xyz456"

    print("Before: ", body_text)
    print("---------------")
    new_body = text_url_replace(db_path, db_table_name, body_text)
    print("After: ", new_body)
    print("---------------")

