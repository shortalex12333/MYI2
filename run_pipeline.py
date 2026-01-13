#!/usr/bin/env python3
"""
Full Pipeline: Scrape → Extract → Format → Ready for Import
Run this once to generate qa_import.csv, then upload via admin UI
"""

import subprocess
import sys

def run_command(cmd, description):
    print(f"\n{'='*60}")
    print(f"🚀 {description}")
    print(f"{'='*60}\n")
    try:
        result = subprocess.run(cmd, shell=True, check=True)
        if result.returncode == 0:
            print(f"\n✅ {description} - SUCCESS\n")
            return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ {description} - FAILED\n")
        return False

def main():
    print("\n")
    print("╔════════════════════════════════════════════════════════╗")
    print("║  Yacht Insurance KB - Scrape → Extract → Import       ║")
    print("╚════════════════════════════════════════════════════════╝\n")
    
    # Step 1: Scrape web
    if not run_command(
        "python3 scraper.py",
        "Step 1: Scraping web sources"
    ):
        print("Scraping failed. Check your internet connection.")
        sys.exit(1)
    
    # Step 2: Extract Q&A
    if not run_command(
        "python3 extract_qa.py",
        "Step 2: Extracting Q&A pairs"
    ):
        print("Q&A extraction failed.")
        sys.exit(1)
    
    # Step 3: Summary
    print("\n" + "="*60)
    print("✅ PIPELINE COMPLETE!")
    print("="*60)
    print("\nNext steps:")
    print("1. Go to: http://localhost:3000/admin/bulk-import")
    print("2. Upload the generated: qa_import.csv")
    print("3. Check 'Dry Run' first to preview")
    print("4. Click Import to add to database")
    print("5. Visit /knowledge to see published entries")
    print("\n")

if __name__ == "__main__":
    main()
