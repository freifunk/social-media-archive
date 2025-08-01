#!/usr/bin/env python3
import requests
import re
import json
import os
from datetime import datetime

def resolve_tco_url(tco_url):
    """Resolve a t.co URL to its final destination."""
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

def find_and_resolve_tco_urls(text, output_file='resolved_urls.json'):
    """Find all t.co URLs in text, resolve them, and save to JSON file."""
    
    # Regex pattern to find t.co URLs
    tco_pattern = r'https://t\.co/[A-Za-z0-9]+'
    
    # Find all t.co URLs in the text
    tco_urls = re.findall(tco_pattern, text)
    
    if not tco_urls:
        print("No t.co URLs found in the text.")
        return
    
    print(f"Found {len(tco_urls)} t.co URL(s)")
    print()
    
    # Print header
    print(f"{'Original URL':<30} {'Status':<10} {'Resolved URL / Error'}")
    print("-" * 80)
    
    results = []
    
    # Load existing results if file exists
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r') as f:
                results = json.load(f)
        except:
            results = []
    
    # Process each URL
    for tco_url in tco_urls:
        result = resolve_tco_url(tco_url)
        results.append(result)
        
        # Print result
        status = result['status']
        resolved = result['resolved_url']
        print(f"{result['original_url']:<30} {status:<10} {resolved}")
        
        # Save to JSON file after each resolution
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)

def main():
    # Example usage
    sample_text = """
    Check out this article: https://t.co/knVzQ92haM
    And also this one: https://t.co/example123
    Some regular text here.
    Another link: https://t.co/abc123def
    Not a t.co link: https://google.com
    Final t.co link: https://t.co/xyz789
    """
    
    print("Processing text for t.co URLs...")
    print("=" * 50)
    find_and_resolve_tco_urls(sample_text)
    print("=" * 50)
    print("Results saved to resolved_urls.json")

if __name__ == "__main__":
    # You can replace this with your actual text input
    # For interactive input, uncomment the lines below:
    
    # print("Enter your text (press Ctrl+D when done):")
    # import sys
    # text = sys.stdin.read()
    # find_and_resolve_tco_urls(text)
    
    main()