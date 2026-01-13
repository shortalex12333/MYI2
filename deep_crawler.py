#!/usr/bin/env python3
"""
REAL Deep Web Crawler for Yacht Insurance Content
Handles pagination, archives, categories, internal links
"""

import json
import time
from datetime import datetime
from typing import List, Set
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import hashlib

class DeepCrawler:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.visited_urls = set()
        self.all_content = {}
        
    def discover_links(self, url: str, base_domain: str, max_depth=3) -> List[str]:
        """Discover all accessible URLs under a domain"""
        links = []
        to_visit = [url]
        visited = set()
        depth = 0
        
        while to_visit and depth < max_depth:
            current = to_visit.pop(0)
            if current in visited:
                continue
            
            visited.add(current)
            
            try:
                response = self.session.get(current, timeout=10)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                for link in soup.find_all('a', href=True):
                    href = link.get('href')
                    full_url = urljoin(current, href)
                    
                    # Only follow links on same domain
                    if base_domain in full_url and full_url not in visited:
                        links.append(full_url)
                        if len(to_visit) < 50:  # Limit queue
                            to_visit.append(full_url)
                
                depth += 1
                
            except Exception as e:
                print(f"  ⚠️  Error discovering links from {current}: {str(e)}")
                continue
        
        return list(set(links))
    
    def scrape_page(self, url: str) -> dict:
        """Scrape single page for content"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Extract content
            text = soup.get_text(separator='\n', strip=True)
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            content = '\n'.join(lines[:2000])
            
            return {
                'url': url,
                'content': content,
                'title': soup.title.string if soup.title else 'No title',
                'scraped_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"  ✗ Error scraping {url}: {str(e)}")
            return None
    
    def crawl_domain(self, start_url: str, domain: str, max_pages=20) -> dict:
        """Deep crawl a domain"""
        print(f"\n🔍 DEEP CRAWLING: {domain}")
        print(f"   Start URL: {start_url}")
        
        # Step 1: Discover all accessible links
        print(f"   [1] Discovering links...")
        links = self.discover_links(start_url, domain, max_depth=2)
        
        # Filter for article-like URLs (blogs, posts, etc)
        article_links = [l for l in links if any(x in l for x in 
            ['/blog/', '/post/', '/article/', '/news/', '/guide/', '/page/', '/category/'])]
        
        if not article_links:
            article_links = links
        
        print(f"   [2] Found {len(article_links)} potential article links")
        
        # Step 2: Scrape top pages
        scraped_pages = []
        for i, url in enumerate(article_links[:max_pages]):
            print(f"      Scraping {i+1}/{min(max_pages, len(article_links))}...", end='\r')
            page_data = self.scrape_page(url)
            if page_data:
                scraped_pages.append(page_data)
            time.sleep(1)  # Rate limiting
        
        print(f"   [3] Scraped {len(scraped_pages)} pages successfully")
        
        return {
            'domain': domain,
            'start_url': start_url,
            'total_links_found': len(links),
            'article_links_found': len(article_links),
            'pages_scraped': len(scraped_pages),
            'pages': scraped_pages,
            'scraped_at': datetime.now().isoformat()
        }

if __name__ == "__main__":
    # Test domains - pick the 3 best
    test_domains = [
        ("marineins.com", "https://marineins.com/blog/"),
        ("morganscloud.com", "https://www.morganscloud.com/"),
        ("marinebind.com", "https://marinebind.com/"),
    ]
    
    crawler = DeepCrawler()
    all_results = []
    
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║           DEEP CRAWL TEST - 3 DOMAINS                         ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    
    for domain, url in test_domains:
        result = crawler.crawl_domain(url, domain, max_pages=15)
        all_results.append(result)
        
        print(f"\n✅ {domain}:")
        print(f"   Links found: {result['total_links_found']}")
        print(f"   Articles found: {result['article_links_found']}")
        print(f"   Pages scraped: {result['pages_scraped']}")
        print(f"   Content volume: {sum(len(p['content'].split()) for p in result['pages'])} words")
    
    # Save results
    with open('deep_crawl_results.json', 'w') as f:
        json.dump(all_results, f, indent=2)
    
    print("\n✅ Deep crawl results saved to deep_crawl_results.json")
    
    # Summary
    total_pages = sum(len(r['pages']) for r in all_results)
    total_words = sum(sum(len(p['content'].split()) for p in r['pages']) for r in all_results)
    
    print(f"\n📊 SUMMARY:")
    print(f"   Total pages scraped: {total_pages}")
    print(f"   Total words: {total_words:,}")
    print(f"   Average per page: {total_words // total_pages if total_pages > 0 else 0} words")
