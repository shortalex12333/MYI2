#!/usr/bin/env python3
"""
Monitoring dashboard for Yacht Insurance Knowledge Base orchestration
Shows pipeline status, logs, and statistics
"""

import json
import os
from datetime import datetime
from pathlib import Path

class OrchestrationMonitor:
    def __init__(self):
        self.project_dir = "/Users/celeste7/MYI2"
        self.log_file = f"{self.project_dir}/orchestration.log"
        self.stats_file = f"{self.project_dir}/orchestration_stats.json"
    
    def get_latest_log_entries(self, n=20):
        """Get last N log entries"""
        if not os.path.exists(self.log_file):
            return []
        
        with open(self.log_file, 'r') as f:
            lines = f.readlines()
        
        return lines[-n:]
    
    def get_latest_stats(self):
        """Get latest orchestration statistics"""
        if not os.path.exists(self.stats_file):
            return None
        
        with open(self.stats_file, 'r') as f:
            return json.load(f)
    
    def get_database_count(self):
        """Check approximate database entry count"""
        try:
            import requests
            response = requests.get("http://localhost:3000/api/knowledge", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return data.get('total', data.get('count', 'Unknown'))
            return "Unavailable"
        except:
            return "Unavailable"
    
    def display_dashboard(self):
        """Display monitoring dashboard"""
        print("\n")
        print("╔" + "=" * 78 + "╗")
        print("║" + " " * 78 + "║")
        print("║" + "  YACHT INSURANCE KB - ORCHESTRATION MONITOR".center(78) + "║")
        print("║" + " " * 78 + "║")
        print("╚" + "=" * 78 + "╝")
        
        # System Status
        print("\n📊 SYSTEM STATUS:")
        print("─" * 80)
        
        db_count = self.get_database_count()
        print(f"  Database Entries: {db_count}")
        print(f"  Dev Server: http://localhost:3000")
        print(f"  Knowledge Base: http://localhost:3000/knowledge")
        print(f"  Upload Portal: http://localhost:3000/admin/bulk-import")
        
        # Latest Statistics
        print("\n📈 LATEST EXECUTION STATS:")
        print("─" * 80)
        
        stats = self.get_latest_stats()
        if stats:
            print(f"  Timestamp: {stats.get('timestamp', 'Unknown')}")
            print(f"  Sources Scraped: {stats.get('scrape_sources', 0)}")
            print(f"  Q&A Extracted: {stats.get('qa_extracted', 0)}")
            print(f"  Imported: {stats.get('imported', 0)}")
            print(f"  Failed: {stats.get('failed', 0)}")
            exec_time = stats.get('execution_time_seconds', 0)
            print(f"  Execution Time: {exec_time:.1f}s")
        else:
            print("  No execution data yet (first run will create stats)")
        
        # Cron Jobs
        print("\n⏰ SCHEDULED CRON JOBS:")
        print("─" * 80)
        
        try:
            result = os.popen("crontab -l 2>/dev/null | grep 'run_orchestrate'").read()
            if result:
                for line in result.strip().split('\n'):
                    if line:
                        print(f"  {line}")
            else:
                print("  No cron jobs scheduled")
        except:
            print("  Unable to read cron jobs")
        
        # Recent Logs
        print("\n📋 RECENT LOG ENTRIES (Last 10):")
        print("─" * 80)
        
        logs = self.get_latest_log_entries(10)
        if logs:
            for line in logs:
                print(f"  {line.rstrip()}")
        else:
            print("  No logs yet")
        
        # Instructions
        print("\n💡 QUICK COMMANDS:")
        print("─" * 80)
        print("  Run pipeline now:     python3 orchestrate.py")
        print("  View full logs:       tail -f orchestration.log")
        print("  View cron jobs:       crontab -l")
        print("  Edit cron jobs:       crontab -e")
        print("  Run monitor again:    python3 monitor.py")
        
        print("\n")

if __name__ == "__main__":
    monitor = OrchestrationMonitor()
    monitor.display_dashboard()
