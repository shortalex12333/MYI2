#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import * as https from 'https'

interface LinkCheckResult {
  url: string
  status: number
  found: boolean
  referrer: string
}

const BASE_URL = 'http://localhost:3000'
const VISITED = new Set<string>()
const RESULTS: LinkCheckResult[] = []
const EXTERNAL_LINKS = new Set<string>()

const PUBLIC_ROUTES = [
  '/',
  '/posts',
  '/categories',
  '/companies',
  '/faq',
  '/knowledge',
  '/contact',
  '/terms',
  '/privacy',
  '/login',
  '/signup',
  '/insights',
  '/experts',
  '/providers',
]

async function checkLink(url: string, referrer: string): Promise<number> {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https')
    const client = isHttps ? https : http
    const timeout = setTimeout(() => {
      resolve(0) // Timeout = no response
    }, 5000)

    const req = client.get(url, { method: 'HEAD' }, (res) => {
      clearTimeout(timeout)
      resolve(res.statusCode || 500)
    })

    req.on('error', () => {
      clearTimeout(timeout)
      resolve(0)
    })

    req.end()
  })
}

async function crawlPage(pageUrl: string, referrer: string = 'home') {
  if (VISITED.has(pageUrl)) return
  VISITED.add(pageUrl)

  console.log(`Checking: ${pageUrl}`)

  try {
    const response = await fetch(pageUrl)
    const html = await response.text()

    // Extract all links
    const linkRegex = /href=["']([^"']+)["']/g
    let match

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1]

      // Skip non-http links
      if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
        continue
      }

      // Handle relative URLs
      let fullUrl = href
      if (href.startsWith('/')) {
        fullUrl = `${BASE_URL}${href}`
      } else if (href.startsWith('http')) {
        EXTERNAL_LINKS.add(href)
        continue
      } else {
        fullUrl = new URL(href, pageUrl).toString()
      }

      // Only check internal links
      if (!fullUrl.startsWith(BASE_URL)) {
        continue
      }

      const path = fullUrl.replace(BASE_URL, '') || '/'

      if (!VISITED.has(fullUrl) && VISITED.size < 100) {
        // Limit crawling to first 100 pages
        await crawlPage(fullUrl, pageUrl)
      }

      // Check link status
      const status = await checkLink(fullUrl, pageUrl)
      if (status === 0 || status >= 400) {
        RESULTS.push({
          url: fullUrl,
          status,
          found: status === 200,
          referrer: pageUrl,
        })
      }
    }
  } catch (error) {
    console.error(`Error crawling ${pageUrl}:`, error)
  }
}

async function main() {
  console.log('Starting link integrity check...')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Routes to check: ${PUBLIC_ROUTES.length}`)
  console.log('')

  // Crawl all public routes
  for (const route of PUBLIC_ROUTES) {
    const pageUrl = `${BASE_URL}${route}`
    await crawlPage(pageUrl, 'root')
  }

  console.log('')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('LINK INTEGRITY REPORT')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`Total pages crawled: ${VISITED.size}`)
  console.log(`External links found: ${EXTERNAL_LINKS.size}`)
  console.log(`Broken links: ${RESULTS.filter((r) => !r.found).length}`)
  console.log('')

  if (RESULTS.length > 0) {
    console.log('BROKEN LINKS:')
    console.log('─────────────────────────────────────────────────────────')
    for (const result of RESULTS) {
      console.log(`❌ ${result.url}`)
      console.log(`   Status: ${result.status}`)
      console.log(`   Found in: ${result.referrer}`)
      console.log('')
    }
  } else {
    console.log('✅ All internal links are working!')
  }

  console.log('═══════════════════════════════════════════════════════════')

  // Exit with error code if broken links found
  process.exit(RESULTS.length > 0 ? 1 : 0)
}

// Wait for server to be ready, then start
setTimeout(main, 2000)
