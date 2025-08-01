import sqlite3
import re

# Step 1: Load resolved URL mappings into a dict
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
    # re.sub works like re.sub(regex_pattern to look for, the thing you want to replace with, the original string you are looking to replace)
    return re.sub(pattern, lambda m: url_map.get(m.group(), m.group()), body_text)

def main_replace(db_path, db_table_nam, body_text):
    url_map = load_url_map(db_path, db_table_name)
    new_body = replace_links(body_text, url_map)
    return new_body

if __name__ == "__main__":
    # Usage
    # program assumed columbs "original_url" and "resolved_url"  are in db_table_name
    db_path = "resolved_urls.db"
    db_table_name = "resolved_urls"
    print("---------------")
    body_text = "Check this out https://t.co/knVzQ92haM and also https://t.co/xyz456"
    print("Before changes: ", body_text)
    print("---------------")
    new_body = main_replace(db_path, db_table_name, body_text)
    print("After changes: ", new_body)
    print("---------------")

