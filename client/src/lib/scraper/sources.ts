// Prioritized yacht insurance sources for scraping
// Tier 1 = highest ROI (clean Q&A)
// Tier 5+ = supplementary

export const prioritizedSources = [
  // Tier 1 (Highest ROI)
  { url: 'https://www.investopedia.com/terms/y/yacht-insurance.asp', domain: 'investopedia.com', sourceType: 'guide', priority: 1, crawlFrequencyDays: 90 },
  { url: 'https://www.boatus.com/expert-advice/', domain: 'boatus.com', sourceType: 'faq', priority: 1, crawlFrequencyDays: 7 },
  { url: 'https://theboatgalley.com/boat-insurance-pitfalls/', domain: 'theboatgalley.com', sourceType: 'guide', priority: 2, crawlFrequencyDays: 30 },
  { url: 'https://www.morganscloud.com/2021/06/03/insurance-for-offshore-voyaging/', domain: 'morganscloud.com', sourceType: 'guide', priority: 2, crawlFrequencyDays: 60 },
  { url: 'https://www.yachting-pages.com/articles/insurance-articles', domain: 'yachting-pages.com', sourceType: 'guide', priority: 3, crawlFrequencyDays: 14 },
  { url: 'https://marineins.com/blog/', domain: 'marineins.com', sourceType: 'broker', priority: 3, crawlFrequencyDays: 7 },
  { url: 'https://superyachtinsurancebrokers.com/news/', domain: 'superyachtinsurancebrokers.com', sourceType: 'broker', priority: 3, crawlFrequencyDays: 14 },
  { url: 'https://marinebind.com/marine-insights/', domain: 'marinebind.com', sourceType: 'guide', priority: 3, crawlFrequencyDays: 7 },
  { url: 'https://www.travelers.com/resources/article/boat-and-yacht-insurance', domain: 'travelers.com', sourceType: 'insurer', priority: 2, crawlFrequencyDays: 60 },
  { url: 'https://www.allstate.com/insurance/boat-owners-insurance', domain: 'allstate.com', sourceType: 'insurer', priority: 2, crawlFrequencyDays: 60 },
  { url: 'https://southeastinsure.com/insurance-blog/', domain: 'southeastinsure.com', sourceType: 'broker', priority: 3, crawlFrequencyDays: 7 },
  { url: 'https://www.chubb.com/us-en/business/marine.html', domain: 'chubb.com', sourceType: 'insurer', priority: 3, crawlFrequencyDays: 60 },
  { url: 'https://www.cruisersforum.com/forums/f67/yacht-insurance-84854.html', domain: 'cruisersforum.com', sourceType: 'forum', priority: 4, crawlFrequencyDays: 3 },
  { url: 'https://www.cruisersforum.com/forums/tags/insurance.html', domain: 'cruisersforum.com', sourceType: 'forum', priority: 4, crawlFrequencyDays: 3 },
  { url: 'https://www.thehulltruth.com/boating-forum/1279296-new-boater-new-boat-insurance-recommendations.html', domain: 'thehulltruth.com', sourceType: 'forum', priority: 4, crawlFrequencyDays: 3 },
  { url: 'https://forums.ybw.com/threads/recommendations-for-boat-insurance-company.612738/', domain: 'forums.ybw.com', sourceType: 'forum', priority: 4, crawlFrequencyDays: 3 },
  { url: 'https://www.reddit.com/r/SailboatCruising/search/?q=insurance', domain: 'reddit.com', sourceType: 'forum', priority: 5, crawlFrequencyDays: 2 },
  { url: 'https://forums.sailinganarchy.com/threads/offshore-sailing-insurance.236364/', domain: 'forums.sailinganarchy.com', sourceType: 'forum', priority: 5, crawlFrequencyDays: 7 },
  { url: 'https://www.trawlerforum.com/threads/insurance-hull-coverage-vs-liability-only.14283/', domain: 'trawlerforum.com', sourceType: 'forum', priority: 5, crawlFrequencyDays: 7 },
  { url: 'https://www.ukpandi.com/loss-prevention/', domain: 'ukpandi.com', sourceType: 'p&i_club', priority: 6, crawlFrequencyDays: 30 },
  { url: 'https://www.gardclub.com/web/en/knowledge-base', domain: 'gardclub.com', sourceType: 'p&i_club', priority: 6, crawlFrequencyDays: 30 },
  { url: 'https://www.uscg.gov/lifeline/boating-safety', domain: 'uscg.gov', sourceType: 'regulatory', priority: 7, crawlFrequencyDays: 60 },
  { url: 'https://megayachtnews.com/insurance/', domain: 'megayachtnews.com', sourceType: 'guide', priority: 8, crawlFrequencyDays: 14 },
  { url: 'https://powerandmotoryacht.com/blogs/special-report-embedded-with-a-boat-us-catastrophe-team/', domain: 'powerandmotoryacht.com', sourceType: 'guide', priority: 8, crawlFrequencyDays: 60 },
  { url: 'https://www.investopedia.com/terms/w/watercraft-insurance.asp', domain: 'investopedia.com', sourceType: 'guide', priority: 1, crawlFrequencyDays: 90 },
];
