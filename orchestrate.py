#!/usr/bin/env python3
"""
Automated Yacht Insurance Knowledge Base Orchestration
Scrapes sources → Extracts Q&A → Imports to Database
Fully automated pipeline with error handling and logging
"""

import json
import subprocess
import sys
import time
from datetime import datetime
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(dotenv_path="client/.env.local")

class YachtInsuranceOrchestrator:
    def __init__(self):
        # Use SUPABASE_SERVICE_ROLE_KEY for authentication (replaces deprecated SCRAPER_API_KEY)
        self.api_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not self.api_key:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY not found in environment variables")

        # Use production Vercel URL for imports (not localhost which may not be running)
        # Production has correct environment variables configured
        self.api_url = "https://www.myyachtsinsurance.com/api/v1/bulk-import"
        self.log_file = "orchestration.log"
        self.stats = {
            "scrape_sources": 0,
            "qa_extracted": 0,
            "imported": 0,
            "failed": 0,
            "timestamp": datetime.now().isoformat()
        }
        
    def log(self, message, level="INFO"):
        """Log messages to file and console"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_msg = f"[{timestamp}] [{level}] {message}"
        print(log_msg)
        with open(self.log_file, 'a') as f:
            f.write(log_msg + "\n")
    
    def step_1_scrape(self):
        """Step 1: Run deep web crawler"""
        self.log("=" * 80)
        self.log("STEP 1: DEEP CRAWLING WEB SOURCES", "START")
        self.log("=" * 80)

        try:
            result = subprocess.run(
                ["python3", "deep_crawl_all.py"],
                capture_output=True,
                text=True,
                timeout=600  # 10 minutes for deep crawl
            )

            if result.returncode == 0:
                self.log("✅ Deep crawling completed successfully")
                # Parse output to get page count
                if "TOTAL PAGES SCRAPED:" in result.stdout:
                    for line in result.stdout.split('\n'):
                        if "TOTAL PAGES SCRAPED:" in line:
                            parts = line.split(":")[-1].strip()
                            self.stats["scrape_sources"] = int(parts) if parts.isdigit() else 0
                self.log(f"   Pages crawled: {self.stats['scrape_sources']}")
                return True
            else:
                self.log(f"❌ Deep crawling failed: {result.stderr}", "ERROR")
                return False

        except subprocess.TimeoutExpired:
            self.log("❌ Deep crawling timeout (>600s)", "ERROR")
            return False
        except Exception as e:
            self.log(f"❌ Deep crawling error: {str(e)}", "ERROR")
            return False
    
    def step_2_extract(self):
        """Step 2: Extract Q&A pairs from deep crawl results"""
        self.log("")
        self.log("=" * 80)
        self.log("STEP 2: EXTRACTING Q&A PAIRS FROM CRAWL", "START")
        self.log("=" * 80)

        try:
            # Use the DeepCrawlQAExtractor directly
            from extract_from_deep_crawl import DeepCrawlQAExtractor

            self.log("   Initializing deep crawl Q&A extractor...")
            extractor = DeepCrawlQAExtractor()

            self.log("   Processing crawl results...")
            qa_pairs = extractor.process_crawl_results('all_domains_crawl.json')

            self.log(f"✅ Q&A extraction completed successfully")
            self.stats["qa_extracted"] = len(qa_pairs)
            self.log(f"   Q&A pairs extracted: {self.stats['qa_extracted']}")

            # Save to file for import step
            with open('all_domains_qa.json', 'w') as f:
                json.dump(qa_pairs, f, indent=2)

            self.log("   Saved to all_domains_qa.json")
            return True

        except FileNotFoundError as e:
            self.log(f"❌ File not found: {str(e)}", "ERROR")
            return False
        except Exception as e:
            self.log(f"❌ Extraction error: {str(e)}", "ERROR")
            return False
    
    def step_3_import(self):
        """Step 3: Import to database via API in batches"""
        self.log("")
        self.log("=" * 80)
        self.log("STEP 3: IMPORTING TO DATABASE", "START")
        self.log("=" * 80)

        try:
            # Load Q&A pairs
            with open("all_domains_qa.json", "r") as f:
                qa_entries = json.load(f)

            if not qa_entries:
                self.log("⚠️  No Q&A entries to import", "WARN")
                return True

            self.log(f"   Total entries to import: {len(qa_entries)}")

            # Import in batches of 100
            batch_size = 100
            total_imported = 0
            total_duplicates = 0
            batch_num = 1

            headers = {
                "x-api-key": self.api_key,
                "Content-Type": "application/json"
            }

            for i in range(0, len(qa_entries), batch_size):
                batch = qa_entries[i:i+batch_size]
                payload = {
                    "entries": batch,
                    "dryRun": False
                }

                try:
                    response = requests.post(
                        self.api_url,
                        json=payload,
                        headers=headers,
                        timeout=60
                    )

                    if response.status_code == 200:
                        result = response.json()
                        imported = result.get('imported', 0)
                        duplicates = result.get('duplicates', 0)
                        total_imported += imported
                        total_duplicates += duplicates
                        self.log(f"   [Batch {batch_num}] ({i+1}-{min(i+batch_size, len(qa_entries))}) ✅ {imported} imported, {duplicates} duplicates")
                    else:
                        self.log(f"   [Batch {batch_num}] ❌ Status {response.status_code}")
                        if "duplicate key" not in response.text:
                            self.stats["failed"] += len(batch)

                except Exception as e:
                    self.log(f"   [Batch {batch_num}] ❌ Error: {str(e)}")

                batch_num += 1

            self.stats["imported"] = total_imported
            self.log(f"\n✅ Import completed: {total_imported} new entries imported")
            if total_duplicates > 0:
                self.log(f"   ({total_duplicates} duplicates skipped)")
            return True

        except FileNotFoundError:
            self.log("❌ all_domains_qa.json not found", "ERROR")
            return False
        except Exception as e:
            self.log(f"❌ Import error: {str(e)}", "ERROR")
            return False
    
    def run_pipeline(self):
        """Execute full pipeline"""
        self.log("\n")
        self.log("╔" + "=" * 78 + "╗")
        self.log("║" + " " * 78 + "║")
        self.log("║" + "  YACHT INSURANCE KNOWLEDGE BASE - AUTOMATED PIPELINE".center(78) + "║")
        self.log("║" + " " * 78 + "║")
        self.log("╚" + "=" * 78 + "╝")
        
        start_time = time.time()
        
        # Execute pipeline steps
        if not self.step_1_scrape():
            self.log("\n❌ PIPELINE FAILED AT STEP 1", "ERROR")
            return False
        
        if not self.step_2_extract():
            self.log("\n❌ PIPELINE FAILED AT STEP 2", "ERROR")
            return False
        
        if not self.step_3_import():
            self.log("\n❌ PIPELINE FAILED AT STEP 3", "ERROR")
            return False
        
        # Success
        elapsed = time.time() - start_time
        self.log("")
        self.log("╔" + "=" * 78 + "╗")
        self.log("║" + " " * 78 + "║")
        self.log("║" + "  ✅ PIPELINE COMPLETED SUCCESSFULLY".center(78) + "║")
        self.log("║" + " " * 78 + "║")
        self.log("╚" + "=" * 78 + "╝")
        
        # Summary
        self.log("")
        self.log("SUMMARY:")
        self.log(f"  ✅ Sources scraped: {self.stats['scrape_sources']}")
        self.log(f"  ✅ Q&A pairs extracted: {self.stats['qa_extracted']}")
        self.log(f"  ✅ Entries imported: {self.stats['imported']}")
        self.log(f"  ⏱️  Total execution time: {elapsed:.1f} seconds")
        self.log(f"  📊 Entries/minute: {(self.stats['imported'] / (elapsed / 60)):.0f}")
        
        # Save stats
        self.stats["execution_time_seconds"] = elapsed
        with open("orchestration_stats.json", "w") as f:
            json.dump(self.stats, f, indent=2)
        
        self.log("")
        return True

if __name__ == "__main__":
    orchestrator = YachtInsuranceOrchestrator()
    success = orchestrator.run_pipeline()
    sys.exit(0 if success else 1)
