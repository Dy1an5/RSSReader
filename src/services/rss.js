/**
 * Client-side RSS feed fetcher and parser.
 * Uses fetch + DOMParser to parse RSS 2.0 and Atom feeds.
 */

function isCapacitor() {
  return typeof window !== 'undefined' && 'Capacitor' in window
}

// Pass target URL as query parameter for CORS proxy
function proxyUrl(url) {
  return `/cors-proxy?url=${encodeURIComponent(url)}`
}

async function fetchXml(url) {
  // In Capacitor (Android), use native HTTP to bypass CORS
  if (isCapacitor()) {
    const { CapacitorHttp } = await import('@capacitor/core')
    const res = await CapacitorHttp.get({ url, connectTimeout: 10000, readTimeout: 10000 })
    return res.data
  }

  // In browser/dev, use CORS proxy with timeout
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(proxyUrl(url), { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return res.text()
  } finally {
    clearTimeout(timeout)
  }
}

function parseDate(raw) {
  if (!raw) return null
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

function parseRSS(xmlDoc) {
  const channel = xmlDoc.querySelector('channel')
  if (!channel) return null

  const items = []
  channel.querySelectorAll('item').forEach(item => {
    const encoded = childText(item, 'encoded')
    const description = textContent(item, 'description')
    const author = textContent(item, 'author') || childText(item, 'creator')
    const pubDate = textContent(item, 'pubDate') || childText(item, 'date')

    items.push({
      title: textContent(item, 'title'),
      link: textContent(item, 'link'),
      content: encoded || description || '',
      author,
      published_at: parseDate(pubDate) || new Date().toISOString()
    })
  })

  const iconUrl = textContent(channel, 'image url') ||
    childText(channel, 'icon') ||
    channel.querySelector('image url')?.textContent?.trim() || ''

  return {
    title: textContent(channel, 'title') || '',
    description: textContent(channel, 'description') || '',
    icon_url: iconUrl,
    items
  }
}

function parseAtom(xmlDoc) {
  const feed = xmlDoc.querySelector('feed')
  if (!feed) return null

  const items = []
  feed.querySelectorAll('entry').forEach(entry => {
    const contentEl = entry.querySelector('content') || childEl(entry, 'content')
    const summaryEl = entry.querySelector('summary')
    const pubDate = textContent(entry, 'published') || textContent(entry, 'updated')
    items.push({
      title: textContent(entry, 'title'),
      link: getLinkHref(entry),
      content: contentEl?.textContent?.trim() || summaryEl?.textContent?.trim() || '',
      author: textContent(entry, 'author name') || childText(entry, 'name') || textContent(entry, 'author'),
      published_at: parseDate(pubDate) || new Date().toISOString()
    })
  })

  return {
    title: textContent(feed, 'title') || '',
    description: textContent(feed, 'subtitle') || '',
    icon_url: '',
    items
  }
}

function textContent(parent, selector) {
  const el = parent.querySelector(selector)
  return el?.textContent?.trim() || ''
}

// Get child element text by local name (handles XML namespaces like content:encoded, dc:creator)
function childText(parent, ...names) {
  for (const child of parent.children) {
    const name = child.localName || child.tagName?.split(':')?.pop() || ''
    if (names.includes(name)) {
      return child.textContent?.trim() || ''
    }
  }
  return ''
}

// Get child element by local name
function childEl(parent, ...names) {
  for (const child of parent.children) {
    const name = child.localName || child.tagName?.split(':')?.pop() || ''
    if (names.includes(name)) return child
  }
  return null
}

function getLinkHref(entry) {
  const link = entry.querySelector('link[rel="alternate"]') || entry.querySelector('link')
  return link?.getAttribute('href') || ''
}

export async function fetchFeed(url) {
  const xml = await fetchXml(url)
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')

  // Check for parse errors
  const errNode = doc.querySelector('parsererror')
  if (errNode) throw new Error('Failed to parse feed XML')

  // Try RSS 2.0 first, then Atom
  let result = parseRSS(doc)
  if (!result || !result.title) result = parseAtom(doc)
  if (!result) throw new Error('Unsupported feed format')

  return result
}
