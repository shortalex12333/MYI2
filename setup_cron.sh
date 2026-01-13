#!/bin/bash
# Setup 3x daily cron jobs for yacht insurance knowledge base

SCRIPT_DIR="/Users/celeste7/MYI2"
LOG_DIR="/Users/celeste7/MYI2/logs"

# Create logs directory
mkdir -p "$LOG_DIR"

# Create cron job entries
CRON_ENTRIES="
# Yacht Insurance Knowledge Base - Deep Crawl & Import Pipeline
# 8 AM Daily
0 8 * * * cd $SCRIPT_DIR && python3 orchestrate.py >> $LOG_DIR/orchestrate_8am.log 2>&1

# 2 PM Daily
0 14 * * * cd $SCRIPT_DIR && python3 orchestrate.py >> $LOG_DIR/orchestrate_2pm.log 2>&1

# 8 PM Daily
0 20 * * * cd $SCRIPT_DIR && python3 orchestrate.py >> $LOG_DIR/orchestrate_8pm.log 2>&1
"

# Get existing cron jobs (excluding our entries)
EXISTING_CRON=$(crontab -l 2>/dev/null | grep -v "Yacht Insurance Knowledge Base" | grep -v "orchestrate.py")

# Combine and set
(echo "$EXISTING_CRON"; echo "$CRON_ENTRIES") | crontab -

echo "✅ Cron jobs installed successfully!"
echo ""
echo "Scheduled tasks:"
echo "  - 8:00 AM:  python3 orchestrate.py"
echo "  - 2:00 PM:  python3 orchestrate.py"
echo "  - 8:00 PM:  python3 orchestrate.py"
echo ""
echo "Logs will be saved to: $LOG_DIR"
echo ""
echo "Current cron jobs:"
crontab -l | grep orchestrate || echo "No cron jobs found"

