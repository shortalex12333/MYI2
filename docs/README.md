# MyYachtsInsurance Documentation

This folder contains operational documentation for the MyYachtsInsurance.com SEO and link building strategy.

**Last Updated:** January 15, 2026

---

## What's in This Folder

### `/outreach/` - Link Building Materials

**Email Templates:**
- `01_citation_request_email.md` - Request citations for existing content discussing yacht insurance topics
- `02_broken_link_replacement_email.md` - Pitch your resource as a replacement for broken links
- `03_resource_addition_pitch_email.md` - Suggest your linkable assets for resource pages and roundups

**Tracking:**
- `00_prospect_list_guide.md` - Complete guide to using the prospect tracking spreadsheet
- `prospect_list_template.csv` - Spreadsheet template for tracking outreach pipeline

**How to use:**
1. Read the prospect list guide first
2. Import CSV template into Google Sheets
3. Choose appropriate email template for each opportunity
4. Track all outreach activity in the spreadsheet
5. Monitor anchor text distribution (60-70% branded, <5% exact-match)
6. Target 10-15 new referring domains per month max

---

### `/seo/` - SEO Strategy & Compliance

**Guardrails:**
- `guardrails.md` - Hard rules to prevent Google penalties (link spam, keyword stuffing, content quality standards)

**Monitoring:**
- `monthly_checklist.md` - Complete checklist to run on the 1st of every month (traffic review, backlinks, rankings, technical SEO, content updates)

**How to use:**
1. Read guardrails.md BEFORE doing any SEO work
2. Print or bookmark the monthly checklist
3. Complete checklist on the 1st of each month
4. Track trends month-over-month
5. If any red flags appear (traffic drops, manual actions, excessive link velocity), refer to guardrails.md for remediation

---

### Root Level

**Media Kit:**
- `media_kit.md` - One-page reference for journalists, bloggers, and industry professionals who want to feature or cite MyYachtsInsurance.com

**How to use:**
- Share with media contacts
- Reference when pitching guest contributions
- Send to partners or affiliates
- Update quarterly with new content and stats

---

## SEO Infrastructure Implemented

### Technical SEO (Live on Site)

**Files created:**
- `/client/public/robots.txt` - Crawler rules (blocks GPTBot training, allows OAI-SearchBot for ChatGPT Search)
- `/client/public/llms.txt` - AI crawler optimization file listing all key URLs by category
- `/client/src/app/sitemap.ts` - Dynamic sitemap generator with all pages, priorities, and update frequencies
- `/client/src/app/layout.tsx` - Added Schema.org Organization and WebSite structured data

**Pages created:**
- `/client/src/app/about/page.tsx` - About page (E-E-A-T trust signal)
- `/client/src/app/editorial-policy/page.tsx` - Editorial policy (transparency and credibility)
- `/client/src/app/yacht-insurance/page.tsx` - First pillar page with FAQ schema

**All files:**
- Include proper metadata (title, description, Open Graph)
- Follow SEO best practices (breadcrumbs, internal linking, schema markup)
- Have "last updated" dates where appropriate
- Are mobile-responsive and fast-loading

---

## Content Build Plan Status

### Completed ✅

1. **Technical Infrastructure:**
   - robots.txt ✅
   - llms.txt ✅
   - sitemap.ts ✅
   - Schema.org markup ✅

2. **Trust Pages:**
   - About page ✅
   - Editorial Policy page ✅

3. **Pillar Pages (1/8):**
   - Yacht Insurance Overview ✅

4. **Outreach Materials:**
   - 3 email templates ✅
   - Prospect tracking system ✅
   - Media kit ✅

5. **SEO Documentation:**
   - Guardrails document ✅
   - Monthly checklist ✅

### Remaining Work 📋

**Pillar Pages (7 more to create):**
- [ ] Agreed Value vs Actual Cash Value
- [ ] Hull and Machinery Insurance
- [ ] Protection and Indemnity (P&I)
- [ ] Navigation Limits and Lay-Up Warranty
- [ ] Named Storm Deductible Florida
- [ ] Yacht Crew Insurance (Jones Act, maintenance & cure)
- [ ] Charter Yacht Insurance Commercial

**Glossary Pages (12 to create):**
- [ ] Glossary index page
- [ ] agreed-value
- [ ] actual-cash-value
- [ ] hull-and-machinery
- [ ] protection-and-indemnity
- [ ] named-storm-deductible
- [ ] navigation-limits
- [ ] lay-up-warranty
- [ ] sue-and-labour
- [ ] general-average
- [ ] salvage
- [ ] jones-act
- [ ] maintenance-and-cure

**Linkable Assets (2 to create):**
- [ ] Named Storm Deductible Calculator (/tools/named-storm-deductible-calculator)
- [ ] Hurricane Readiness Checklist (/resources/hurricane-readiness-checklist)

---

## Quick Reference: SEO Rules

### Anchor Text Distribution (from guardrails.md)
- **60-70%** Branded/URL ("MyYachtsInsurance", "myyachtsinsurance.com")
- **15-20%** Generic ("click here", "learn more")
- **10-15%** Partial match ("yacht insurance guide")
- **5% max** Exact match ("named storm deductible calculator")

### Link Velocity Limits
- **Month 1-2:** 3-5 new referring domains
- **Month 3-4:** 5-8 new referring domains
- **Month 5-6:** 8-12 new referring domains
- **Ongoing:** 10-15 new referring domains/month max

### Content Standards
- **Pillar pages:** 1,500-2,500 words minimum
- **Glossary pages:** 300-500 words
- **All content:** Unique value, cited sources, natural keyword use
- **Update frequency:** Quarterly for pillar pages

### Never Do This
- ❌ Buy backlinks
- ❌ Use link exchanges
- ❌ Keyword stuff
- ❌ Publish thin content (<300 words)
- ❌ Use automated link building tools
- ❌ Hide text or links
- ❌ Show different content to Googlebot vs users

---

## Tools You'll Need

**Free:**
- Google Analytics (traffic tracking)
- Google Search Console (rankings, backlinks, technical issues)
- Check My Links Chrome extension (broken link finding)

**Paid (Recommended):**
- Ahrefs ($99+/month) - Backlink analysis, keyword tracking, competitor research
- Moz Pro ($99+/month) - Alternative to Ahrefs

**Optional:**
- Hunter.io (find contact emails)
- Screaming Frog (technical SEO audits)
- SimilarWeb (competitor traffic estimates)

---

## Monthly Workflow

**Week 1 (1st-7th):**
- Complete monthly SEO checklist
- Review previous month's metrics
- Set goals for current month

**Week 2 (8th-14th):**
- Research 10-20 link prospects
- Add to prospect spreadsheet
- Identify broken links or resource pages

**Week 3 (15th-21st):**
- Draft 10 outreach emails using templates
- Personalize each email
- Send emails

**Week 4 (22nd-end of month):**
- Update 1-2 existing pillar pages
- Create 1 new piece of content (pillar page, glossary, or tool)
- Monitor responses and update prospect spreadsheet

**Ongoing:**
- Check Search Console weekly for issues
- Monitor traffic trends in Analytics
- Respond to link acquisition opportunities

---

## Questions?

**SEO Strategy:** See `/seo/guardrails.md`
**Outreach Process:** See `/outreach/00_prospect_list_guide.md`
**Media Inquiries:** See `media_kit.md`

**Email:** seo@myyachtsinsurance.com

---

**Good luck building MyYachtsInsurance.com into the go-to yacht insurance education resource!**
