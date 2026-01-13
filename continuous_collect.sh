#!/bin/bash
# Continuous collection mode - runs orchestration hourly until stopped

PROJECT_DIR="/Users/celeste7/MYI2"
cd "$PROJECT_DIR"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 CONTINUOUS COLLECTION MODE STARTED                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "⏰ Collection starting: $(date)"
echo "🎯 Mode: Continuous hourly scraping"
echo "📍 Location: $PROJECT_DIR"
echo ""
echo "The system will:"
echo "  • Scrape 17 sources every hour"
echo "  • Extract Q&A pairs automatically"
echo "  • Import all new/unique entries to database"
echo "  • Deduplicate by content hash"
echo ""
echo "To stop: Press Ctrl+C or kill this process"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo ""

CYCLE=0
while true; do
  CYCLE=$((CYCLE + 1))
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "CYCLE $CYCLE - $(date '+%Y-%m-%d %H:%M:%S')"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  python3 orchestrate.py
  
  if [ $? -eq 0 ]; then
    echo "✅ Cycle $CYCLE completed successfully"
  else
    echo "⚠️  Cycle $CYCLE completed with warnings (check logs)"
  fi
  
  echo ""
  echo "⏳ Waiting 60 minutes until next cycle..."
  echo "   Next cycle at: $(date -d '+1 hour' '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo 'in 1 hour')"
  
  sleep 3600  # Wait 1 hour between cycles
done
