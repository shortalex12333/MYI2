#!/bin/bash
# Wrapper script for cron to run orchestration pipeline
cd /Users/celeste7/MYI2
/usr/bin/python3 orchestrate.py >> orchestration.log 2>&1
