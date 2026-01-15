# SEO Guardrails for MyYachtsInsurance.com

**Purpose:** This document defines hard rules to prevent the site from drifting into Google-penalized territory (link spam, keyword stuffing, low-quality content). These are non-negotiable guidelines that must be followed at all times.

**Last Updated:** January 15, 2026

---

## Core Principle

> **User-first, search engines second.** Every piece of content and every link should genuinely help yacht owners understand insurance better. If you're doing something solely to manipulate rankings, stop.

---

## HARD RULES (Never Violate These)

### 1. Link Building

❌ **NEVER:**
- Buy backlinks, participate in link exchanges, or use link farms
- Offer reciprocal links ("I'll link to you if you link to me")
- Use automated link building tools or services
- Create fake accounts to post links on forums/communities
- Place links in blog comment sections
- Use PBNs (Private Blog Networks)
- Hide links in footers, sidebars, or widgets with keyword-rich anchor text
- Pay for guest posts that exist solely for the link
- Use exact-match anchor text excessively (see Anchor Text Rules below)

✅ **ALWAYS:**
- Earn links by creating genuinely valuable content (guides, tools, calculators)
- Personalize every outreach email with specific references
- Only pitch resources that are legitimately relevant to the target site
- Respect "no" answers and never harass site owners
- Disavow spammy links if you receive them unsolicited
- Focus on relevance over domain authority (a relevant DA 40 link > irrelevant DA 70 link)

### 2. Anchor Text Distribution

Google monitors anchor text ratios. Unnatural patterns trigger manual reviews.

**Target Distribution:**
- **60-70%:** Branded or URL anchors ("MyYachtsInsurance", "MyYachtsInsurance.com", "this site")
- **15-20%:** Generic anchors ("click here", "learn more", "read this guide", "this resource")
- **10-15%:** Partial match ("yacht insurance guide", "insurance calculator")
- **5%:** Exact match ("named storm deductible calculator", "agreed value vs actual cash value")

❌ **NEVER:**
- Have more than 5% exact-match keyword anchors
- Use commercial keywords in footer links across multiple pages
- Stuff keywords into anchor text unnaturally

✅ **ALWAYS:**
- Track anchor text ratio in outreach spreadsheet
- Suggest branded or generic anchors when pitching links
- Vary anchor text even when linking to the same resource

### 3. Content Quality

❌ **NEVER:**
- Keyword stuff (repeating "yacht insurance" 50 times in 500 words)
- Publish thin content (<300 words) just to rank for a keyword
- Spin or auto-generate content
- Duplicate content from other sites (even with attribution)
- Use misleading titles or clickbait
- Create pages solely for ranking without user value ("dorway pages")
- Hide text or links with white-on-white, tiny fonts, or CSS tricks

✅ **ALWAYS:**
- Write for humans first, search engines second
- Aim for comprehensive coverage (1,000-2,500 words for pillar pages)
- Use keywords naturally in context
- Provide unique insights, examples, or tools not available elsewhere
- Update content regularly (quarterly for pillar pages)
- Mark "last updated" dates on key pages
- Cite credible sources

### 4. Internal Linking

❌ **NEVER:**
- Create "SEO silos" with over-optimized internal anchor text
- Link every mention of a keyword across all pages
- Build footer links with keyword anchors
- Create circular linking patterns solely for PageRank flow

✅ **ALWAYS:**
- Link contextually where it helps the reader
- Use descriptive but natural anchor text
- Ensure all pages are reachable within 3 clicks from homepage
- Use breadcrumbs for navigation clarity
- Link to glossary terms naturally when explaining concepts

### 5. Technical SEO

❌ **NEVER:**
- Cloak content (show different content to Googlebot vs users)
- Use sneaky redirects
- Block CSS or JavaScript from Googlebot
- Create duplicate pages with URL parameters
- Allow infinite scroll or pagination to create endless URLs
- Use noindex on important content to manipulate crawling

✅ **ALWAYS:**
- Use canonical tags consistently
- Ensure mobile responsiveness
- Optimize page speed (Core Web Vitals)
- Use HTTPS sitewide
- Submit sitemap to Google Search Console
- Fix broken links promptly
- Use robots.txt appropriately (see current robots.txt)

---

## Anchor Text Rules in Detail

### What Google's Penguin Algorithm Looks For

Google penalizes sites with unnatural link profiles, especially:
- Exact-match anchors pointing to commercial pages
- Same anchor text from multiple domains
- Keyword-stuffed anchors in footer/sidebar links
- Sudden spikes in exact-match anchors

### Safe Anchor Text Examples

**For homepage:**
- ✅ "MyYachtsInsurance"
- ✅ "MyYachtsInsurance.com"
- ✅ "this yacht insurance resource"
- ❌ "best yacht insurance guide" (exact-match commercial)

**For Named Storm Calculator:**
- ✅ "this calculator"
- ✅ "MyYachtsInsurance's deductible calculator"
- ✅ "deductible calculator from MyYachtsInsurance"
- ⚠️ "named storm deductible calculator" (partial match - use sparingly)
- ❌ "Florida named storm deductible calculator for yacht insurance" (over-optimized)

**For Agreed Value Guide:**
- ✅ "this comparison guide"
- ✅ "guide from MyYachtsInsurance"
- ⚠️ "agreed value vs ACV guide" (partial match - use sparingly)
- ❌ "agreed value vs actual cash value yacht insurance guide" (over-optimized)

### How to Suggest Anchors in Outreach

When pitching links, provide 2-3 anchor text options:

**Example (pitching calculator):**
```
If you'd like to link to the calculator, here are a few anchor text options:

- "this calculator" (generic)
- "MyYachtsInsurance's calculator" (branded)
- "named storm deductible calculator" (descriptive)

Use whichever fits your content best!
```

This gives them flexibility while guiding toward safer options.

---

## Content Publishing Rules

### Before Publishing ANY Page:

1. **Pass the user-first test:** Would this page be useful if search engines didn't exist?
2. **Unique value test:** Does this offer something not available elsewhere (unique insights, tools, examples)?
3. **Length test:** Is it comprehensive? (Aim for 1,000+ words for pillar pages, 300-500 for glossary)
4. **Citation test:** Are claims backed by credible sources?
5. **Keyword test:** Do keywords appear naturally, or are they forced?
6. **Link test:** Are internal links helpful to users, or just for SEO?

### Pillar Page Standards

All pillar pages must have:
- ✅ 1,500-2,500 words minimum
- ✅ Clear H2/H3 structure
- ✅ At least one unique element (tool, visual, comparison table, etc.)
- ✅ Internal links to 5-10 related pages (naturally integrated)
- ✅ FAQ section with Schema.org FAQPage markup
- ✅ "Last updated" date
- ✅ Meta description (120-155 characters)
- ✅ CTA linking to /signup or /contact
- ✅ Breadcrumb navigation
- ✅ Related resources section at bottom

### Glossary Page Standards

All glossary pages must have:
- ✅ Clear, concise definition (50-100 words)
- ✅ Real-world example or scenario (100-200 words)
- ✅ Related terms section linking to 3-5 other glossary entries
- ✅ Link to primary pillar page discussing the concept
- ✅ Total length: 300-500 words

---

## Link Acquisition Rules

### Outreach Volume Limits

To avoid Google's radar for unnatural link velocity:

**Month 1-2:** 3-5 new referring domains
**Month 3-4:** 5-8 new referring domains
**Month 5-6:** 8-12 new referring domains
**Ongoing:** 10-15 new referring domains per month

❌ **NEVER:**
- Acquire 20+ links in a single week
- Get multiple links from the same domain in the same month
- Show sudden spikes in link velocity after algorithm updates

✅ **ALWAYS:**
- Space out link acquisition naturally
- Track referring domains (not just links)
- Prioritize diversity of domain types (yacht clubs, marinas, blogs, magazines, etc.)

### Link Quality Checklist

Before accepting or pursuing a link, verify:

1. **Relevance:** Is the linking site related to yachts, boats, insurance, or marine industry?
2. **Quality:** Does the site have original content, or is it spammy?
3. **Traffic:** Does the site get real visitors? (Check SimilarWeb or Ahrefs)
4. **No red flags:** Is the site penalized? (Check Google: "site:domain.com" for indexing)
5. **Editorial:** Is the link editorially given, or paid/forced?

❌ **Reject links from:**
- Link farms or PBNs
- Sites with thin or duplicate content
- Sites with excessive ads or pop-ups
- Sites clearly existing just for SEO
- Sites with spammy comment sections

---

## Penalty Prevention

### Google Manual Actions to Avoid

**Link Spam (most common):**
- **Cause:** Unnatural backlink profiles (bought links, link exchanges, keyword-stuffed anchors)
- **Prevention:** Follow anchor text rules, never buy links, track link velocity

**Thin Content:**
- **Cause:** Pages with little to no value (short, duplicated, auto-generated)
- **Prevention:** Publish only comprehensive, unique content (1,000+ words for pillar pages)

**Keyword Stuffing:**
- **Cause:** Repeating keywords unnaturally to manipulate rankings
- **Prevention:** Write naturally, use synonyms, focus on user clarity

**Cloaking:**
- **Cause:** Showing different content to Googlebot vs users
- **Prevention:** Never do this. Ever.

### How to Check for Penalties

**Monthly:**
1. Check Google Search Console for "Manual Actions" messages
2. Monitor traffic for sudden drops (50%+ = possible algorithmic penalty)
3. Review new backlinks in Search Console for spam
4. Test rankings for primary keywords (if all drop suddenly, investigate)

**If penalized:**
1. Identify cause (manual action message will specify)
2. Fix the issue (remove bad links, improve content, etc.)
3. Submit reconsideration request (for manual actions)
4. Wait for recovery (can take 1-6 months)

---

## Monitoring & Reporting

### Monthly Checklist (See `monthly_checklist.md` for details)

Track these metrics:
- Organic traffic (Google Analytics)
- Rankings for primary keywords (Ahrefs or SimilarWeb)
- New backlinks acquired (Google Search Console)
- Anchor text distribution (Ahrefs Site Explorer)
- Page speed (Google PageSpeed Insights)
- Core Web Vitals (Search Console)
- Manual actions or warnings (Search Console)

### Red Flags to Watch For

If you see any of these, investigate immediately:

🚩 **Traffic drops 50%+ overnight** → Possible algorithmic penalty
🚩 **Manual action message in Search Console** → Google penalty in effect
🚩 **Sudden influx of spammy backlinks** → Negative SEO attack (disavow immediately)
🚩 **Anchor text >10% exact-match** → Unnatural link profile building
🚩 **Link velocity >20 referring domains in 1 month** → Too fast, slow down
🚩 **Indexation dropping** → Technical issue or penalty

---

## What to Do If Someone Offers Paid Links

You will receive offers. Here's how to handle them:

**Common pitches:**
- "I can get you 50 backlinks for $500"
- "Buy a guest post on our DA 70 site"
- "We'll feature you in our directory for $99/month"
- "Link exchange opportunity"

**Response:**
```
Thanks for reaching out, but we don't participate in paid link schemes
or link exchanges. We focus on earning links through high-quality content.

Best,
[YOUR NAME]
```

Then mark the sender's email as spam and move on.

---

## Emergency Contacts

### If You Suspect a Penalty

1. **Check Google Search Console** → Manual Actions section
2. **Document the issue** → Screenshot traffic drop, Search Console messages
3. **Identify cause** → Review recent link activity, content changes
4. **Consult SEO expert** → For major penalties, get professional help

### Disavowing Toxic Links

If you receive spammy backlinks (negative SEO attack or past mistakes):

1. **Export backlinks** from Google Search Console or Ahrefs
2. **Identify toxic links** (irrelevant, spammy, or manipulative sites)
3. **Create disavow file** (list of domains/URLs to ignore)
4. **Upload to Google** via Search Console Disavow Tool
5. **Document reasoning** for future reference

**Important:** Only disavow if you're certain the links are harmful. Disavowing good links hurts your rankings.

---

## Annual SEO Audit

Once per year (suggested: January), conduct a comprehensive audit:

1. **Content Review:** Are all pages still accurate and valuable?
2. **Link Profile:** Any toxic backlinks to disavow?
3. **Technical SEO:** Any crawl errors, broken links, or speed issues?
4. **Competitor Analysis:** What are competitors doing that's working?
5. **Strategy Adjustment:** Update link building and content plans based on results

---

## Key Takeaways

✅ **User-first always:** If it's not valuable to users, don't do it for SEO
✅ **Quality over quantity:** 10 relevant, high-quality links > 100 spammy links
✅ **Natural patterns:** Link velocity, anchor text, and content publishing should look natural
✅ **White hat only:** Never buy links, keyword stuff, or use manipulative tactics
✅ **Monitor constantly:** Check Search Console monthly for warnings
✅ **Document everything:** Track outreach, link acquisition, and content updates

---

**Questions? Email:** seo@myyachtsinsurance.com

**Last Updated:** January 15, 2026
**Next Review:** April 15, 2026 (quarterly)
