import sqlite3
import re

# Step 1: Load resolved URL mappings into a dict
def load_url_map(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        command = f"SELECT original_url, resolved_url FROM {db_table_name};"
        cursor.execute(command)
    except:
        print("Error no query. Check if the table exists.")

        if not cursor.fetchone():
            print("Table 'resolved_urls' does not exist.")
            return {}

        cursor.execute("SELECT  resolved_urls")
        url_map = {row[0]: row[1] for row in cursor.fetchall()}

    conn.close()
    return url_map

# Step 2: Replace t.co links in the markdown body
def replace_links(body_text, url_map):
    pattern = r"https://t\.co/\S+"

    def replace_match(match):
        link = match.group()
        return url_map.get(link, link)  # Replace if in map, else keep original

    return re.sub(pattern, replace_match, body_text)

# Usage
# programa assumed 
db_path = "resolved_urls.db"
db_table_name = "resolved_urls"
body_text = "Check this out https://t.co/knVzQ92haM and also https://t.co/xyz456"

url_map = load_url_map(db_path, db_table_name)
new_body = replace_links(body_text, url_map)

print(new_body)
