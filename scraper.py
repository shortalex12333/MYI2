#!/usr/bin/env python3
"""
Efficient Web Scraper for Yacht Insurance Facts
Scrapes web content and saves to JSON for offline processing
"""

import json
import time
from datetime import datetime
from typing import List, Dict
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import hashlib

class YachtInsuranceScraper:
    def __init__(self, output_file="scraped_content.json"):
        self.output_file = output_file
        self.content = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        
    def scrape_url(self, url: str) -> Dict:
        """Scrape single URL and extract text content"""
        try:
            print(f"Scraping: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Extract title
            title = soup.find('h1')
            title_text = title.get_text(strip=True) if title else "Unknown"
            
            # Extract main content
            text = soup.get_text(separator='\n', strip=True)
            
            # Clean up text
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            clean_text = '\n'.join(lines[:1000])  # Limit to first 1000 lines
            
            domain = urlparse(url).netloc
            content_hash = hashlib.md5(clean_text.encode()).hexdigest()
            
            return {
                'url': url,
                'domain': domain,
                'title': title_text,
                'content': clean_text,
                'hash': content_hash,
                'timestamp': datetime.now().isoformat(),
                'word_count': len(clean_text.split())
            }
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            return None
    
    def scrape_sources(self, urls: List[str]) -> None:
        """Scrape multiple sources"""
        print(f"\n🌐 Starting scrape of {len(urls)} sources...\n")
        
        for i, url in enumerate(urls, 1):
            result = self.scrape_url(url)
            if result:
                self.content.append(result)
                print(f"  ✓ Saved ({i}/{len(urls)})")
            
            time.sleep(2)  # Rate limiting (ethical)
        
        self.save_to_file()
        print(f"\n✅ Scraping complete: {len(self.content)} sources saved to {self.output_file}")
    
    def save_to_file(self) -> None:
        """Save scraped content to JSON"""
        with open(self.output_file, 'w') as f:
            json.dump(self.content, f, indent=2)

if __name__ == "__main__":
    # Yacht insurance sources to scrape - KNOWN WORKING SOURCES ONLY
    sources = [
        "https://www.investopedia.com/terms/y/yacht-insurance.asp",
        "https://www.boatus.com/expert-advice/",
        "https://superyachtinsurancebrokers.com/news/",
        "https://marineins.com/blog/",
        "https://www.morganscloud.com/2021/06/03/insurance-for-offshore-voyaging/",
        "https://marinebind.com/marine-insights/",
        "https://www.nerdwallet.com/article/insurance/boat-insurance/",
        "https://www.boatingmag.com/",
        "https://www.sailingmagazine.net/",
        "https://www.gowrie.com/marine-insurance/",
        "https://www.boatingworld.com/",
        "https://www.passagemaker.com/",
        "https://www.powerandmotoryacht.com/",
        "https://www.sailingtoday.co.uk/",
        "https://www.boatinternational.com/",
        "https://www.seatalk.com/",
    ]
    
    scraper = YachtInsuranceScraper()
    scraper.scrape_sources(sources)
