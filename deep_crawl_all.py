#!/usr/bin/env python3
"""Scale deep crawl to all 16 domains"""

import json
from deep_crawler import DeepCrawler

domains = [
    ("investopedia.com", "https://www.investopedia.com/terms/y/yacht-insurance.asp"),
    ("boatus.com", "https://www.boatus.com/expert-advice/"),
    ("superyachtinsurancebrokers.com", "https://superyachtinsurancebrokers.com/news/"),
    ("marineins.com", "https://marineins.com/blog/"),
    ("morganscloud.com", "https://www.morganscloud.com/"),
    ("marinebind.com", "https://marinebind.com/"),
    ("nerdwallet.com", "https://www.nerdwallet.com/article/insurance/boat-insurance/"),
    ("boatingmag.com", "https://www.boatingmag.com/"),
    ("sailingmagazine.net", "https://www.sailingmagazine.net/"),
    ("gowrie.com", "https://www.gowrie.com/marine-insurance/"),
    ("boatingworld.com", "https://www.boatingworld.com/"),
    ("passagemaker.com", "https://www.passagemaker.com/"),
    ("powerandmotoryacht.com", "https://www.powerandmotoryacht.com/"),
    ("sailingtoday.co.uk", "https://www.sailingtoday.co.uk/"),
    ("boatinternational.com", "https://www.boatinternational.com/"),
    ("seatalk.com", "https://www.seatalk.com/"),
]

print("╔════════════════════════════════════════════════════════════════╗")
print("║       DEEP CRAWL ALL 16 DOMAINS - FULL EXTRACTION             ║")
print("╚════════════════════════════════════════════════════════════════╝\n")

crawler = DeepCrawler()
all_results = []

for i, (domain, url) in enumerate(domains, 1):
    print(f"[{i}/16] Crawling {domain}...")
    try:
        result = crawler.crawl_domain(url, domain, max_pages=20)
        all_results.append(result)
        print(f"      ✅ {result['pages_scraped']} pages, {sum(len(p['content'].split()) for p in result['pages']):,} words\n")
    except Exception as e:
        print(f"      ⚠️  Failed: {str(e)}\n")

# Save results
with open('all_domains_crawl.json', 'w') as f:
    json.dump(all_results, f, indent=2)

# Summary
total_pages = sum(len(r['pages']) for r in all_results)
total_words = sum(sum(len(p['content'].split()) for p in r['pages']) for r in all_results)

print("="*60)
print(f"TOTAL PAGES SCRAPED: {total_pages}")
print(f"TOTAL WORDS: {total_words:,}")
print(f"DOMAINS CRAWLED: {len(all_results)}")
print("="*60)
print("\n✅ Results saved to all_domains_crawl.json")
