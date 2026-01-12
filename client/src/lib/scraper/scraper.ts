/**
 * Ethical Web Scraper for Yacht Insurance Content
 * Features: robots.txt compliance, rate limiting, caching, deduplication
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import parseRobotsTxt from 'robots-parser';

interface ScraperConfig {
  supabaseUrl: string;
  supabaseKey: string;
  rateLimitSeconds: number;
  userAgent: string;
  timeoutSeconds: number;
  cacheDir: string;
}

interface ScrapedContent {
  url: string;
  domain: string;
  title: string;
  content: string;
  contentHash: string;
  scrapedAt: Date;
  statusCode: number;
  headers: Record<string, string>;
}

interface SourceConfig {
  url: string;
  domain: string;
  sourceType: 'forum' | 'faq' | 'guide' | 'broker' | 'insurer' | 'p&i_club' | 'regulatory';
  priority: number; // 1-10, 1 is highest
  crawlFrequencyDays: number;
}

class EthicalWebScraper {
  private config: ScraperConfig;
  private supabase: ReturnType<typeof createClient>;
  private robotsCache: Map<string, any> = new Map();
  private lastRequestTime: Map<string, number> = new Map();

  constructor(config: ScraperConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.ensureCacheDir();
  }

  /**
   * Initialize scraper: register sources in database
   */
  async initializeSources(sources: SourceConfig[]): Promise<void> {
    for (const source of sources) {
      const { error } = await this.supabase
        .from('sources')
        .upsert([
          {
            url: source.url,
            domain: source.domain,
            source_type: source.sourceType,
            priority: source.priority,
            crawl_frequency_days: source.crawlFrequencyDays,
            is_active: true,
          },
        ], { onConflict: 'url' });

      if (error) {
        console.error(`Failed to register source ${source.url}:`, error);
      }
    }
  }

  /**
   * Fetch and respect robots.txt
   */
  private async canScrape(domain: string): Promise<boolean> {
    // Development mode: skip robots.txt checks for localhost testing
    if (process.env.SCRAPER_DEV_MODE === 'true') {
      return true;
    }

    if (this.robotsCache.has(domain)) {
      const robots = this.robotsCache.get(domain);
      return robots.isAllowed(this.config.userAgent, '/');
    }

    try {
      const robotsUrl = `https://${domain}/robots.txt`;
      const response = await fetch(robotsUrl, {
        headers: { 'User-Agent': this.config.userAgent },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const text = await response.text();
        const robots = parseRobotsTxt(text, robotsUrl);
        this.robotsCache.set(domain, robots);
        return robots.isAllowed(this.config.userAgent, '/');
      }

      // No robots.txt = assume allowed, but cache result
      this.robotsCache.set(domain, { isAllowed: () => true });
      return true;
    } catch (error) {
      console.warn(`Failed to fetch robots.txt for ${domain}:`, error);
      // On error, assume not allowed (conservative approach)
      return false;
    }
  }

  /**
   * Rate limiting: respect per-domain request throttling
   */
  private async respectRateLimit(domain: string): Promise<void> {
    const lastTime = this.lastRequestTime.get(domain) || 0;
    const elapsed = Date.now() - lastTime;
    const delayNeeded = this.config.rateLimitSeconds * 1000;

    if (elapsed < delayNeeded) {
      await new Promise(resolve => setTimeout(resolve, delayNeeded - elapsed));
    }

    this.lastRequestTime.set(domain, Date.now());
  }

  /**
   * Fetch URL with ethical headers and caching
   */
  async fetch(url: string): Promise<ScrapedContent | null> {
    const domain = new URL(url).hostname;

    // Check robots.txt first
    const allowed = await this.canScrape(domain);
    if (!allowed) {
      console.log(`Scraping blocked by robots.txt for ${domain}`);
      return null;
    }

    // Check cache first
    const cached = this.getFromCache(url);
    if (cached) {
      console.log(`Cache hit for ${url}`);
      return cached;
    }

    // Rate limit
    await this.respectRateLimit(domain);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'DNT': '1',
        },
        signal: AbortSignal.timeout(this.config.timeoutSeconds * 1000),
      });

      if (!response.ok) {
        console.error(`HTTP ${response.status} for ${url}`);
        return null;
      }

      const content = await response.text();
      const contentHash = this.hashContent(content);

      const scraped: ScrapedContent = {
        url,
        domain,
        title: this.extractTitle(content),
        content,
        contentHash,
        scrapedAt: new Date(),
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };

      // Cache to disk
      this.saveToCache(url, scraped);

      return scraped;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  }

  /**
   * Store scraped content in database
   */
  async storeSnapshot(scraped: ScrapedContent): Promise<number | null> {
    // Check for duplicate content via hash
    const { data: existing } = await this.supabase
      .from('source_snapshots')
      .select('id')
      .eq('content_hash', scraped.contentHash)
      .single();

    if (existing) {
      console.log(`Duplicate content detected for ${scraped.url}, skipping storage`);
      return existing.id;
    }

    // Get source ID
    const { data: source } = await this.supabase
      .from('sources')
      .select('id')
      .eq('url', scraped.url)
      .single();

    if (!source) {
      console.error(`Source not registered: ${scraped.url}`);
      return null;
    }

    // Store snapshot
    const { data, error } = await this.supabase
      .from('source_snapshots')
      .insert([
        {
          source_id: source.id,
          content: scraped.content,
          content_hash: scraped.contentHash,
          extraction_status: 'pending',
          crawled_at: scraped.scrapedAt,
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error(`Failed to store snapshot for ${scraped.url}:`, error);
      return null;
    }

    console.log(`Stored snapshot ${data.id} for ${scraped.url}`);
    return data.id;
  }

  /**
   * Process a batch of sources from priority queue
   */
  async processBatch(batchSize: number = 5): Promise<number> {
    // Get highest-priority sources due for crawl
    const { data: sources, error } = await this.supabase
      .from('sources')
      .select('*')
      .eq('is_active', true)
      .lt('next_crawl', new Date().toISOString())
      .order('priority', { ascending: true })
      .limit(batchSize);

    if (error) {
      console.error('Failed to fetch sources:', error);
      return 0;
    }

    let processed = 0;

    for (const source of sources || []) {
      console.log(`Processing source ${source.priority}: ${source.url}`);

      const scraped = await this.fetch(source.url);
      if (!scraped) {
        console.warn(`Failed to scrape ${source.url}`);
        continue;
      }

      const snapshotId = await this.storeSnapshot(scraped);
      if (snapshotId) {
        processed++;

        // Update source metadata
        const nextCrawl = new Date();
        nextCrawl.setDate(nextCrawl.getDate() + source.crawl_frequency_days);

        await this.supabase
          .from('sources')
          .update({
            last_crawled: new Date().toISOString(),
            next_crawl: nextCrawl.toISOString(),
          })
          .eq('id', source.id);
      }
    }

    return processed;
  }

  // ===== Cache Management =====

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.config.cacheDir)) {
      fs.mkdirSync(this.config.cacheDir, { recursive: true });
    }
  }

  private getCachePath(url: string): string {
    const hash = this.hashContent(url);
    return path.join(this.config.cacheDir, `${hash}.json`);
  }

  private getFromCache(url: string): ScrapedContent | null {
    try {
      const cachePath = this.getCachePath(url);
      if (fs.existsSync(cachePath)) {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        cached.scrapedAt = new Date(cached.scrapedAt);
        return cached;
      }
    } catch (error) {
      console.warn(`Cache read error for ${url}:`, error);
    }
    return null;
  }

  private saveToCache(url: string, content: ScrapedContent): void {
    try {
      const cachePath = this.getCachePath(url);
      fs.writeFileSync(cachePath, JSON.stringify(content, null, 2));
    } catch (error) {
      console.warn(`Cache write error for ${url}:`, error);
    }
  }

  private hashContent(content: string): string {
    return require('crypto')
      .createHash('sha256')
      .update(content)
      .digest('hex');
  }

  private extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : 'Untitled';
  }
}

export { EthicalWebScraper, ScraperConfig, SourceConfig, ScrapedContent };
