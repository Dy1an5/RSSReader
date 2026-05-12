import Dexie from 'dexie'

const db = new Dexie('RSSReader')

db.version(1).stores({
  feeds: '++id, url',
  articles: '++id, feedId, link, isRead, isFavorite, publishedAt'
})

db.version(2).stores({
  feeds: '++id, url, createdAt',
  articles: '++id, feedId, link, isRead, isFavorite, publishedAt'
})

// Helper: add feed and its articles in a transaction
export async function addFeedWithArticles(feedData, articles) {
  return db.transaction('rw', db.feeds, db.articles, async () => {
    const feedId = await db.feeds.add({
      title: feedData.title,
      url: feedData.url,
      description: feedData.description || '',
      iconUrl: feedData.icon_url || '',
      lastFetchedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })

    for (const a of articles) {
      await db.articles.put({
        feedId,
        title: a.title,
        link: a.link,
        content: a.content || '',
        author: a.author || '',
        publishedAt: a.published_at || null,
        isRead: 0,
        isFavorite: 0,
        createdAt: new Date().toISOString()
      })
    }

    return feedId
  })
}

// Helper: refresh feed articles (insert new, skip existing by link)
export async function refreshFeedArticles(feedId, articles) {
  return db.transaction('rw', db.articles, async () => {
    let added = 0
    for (const a of articles) {
      const exists = await db.articles.where('link').equals(a.link).count()
      if (exists === 0) {
        await db.articles.put({
          feedId,
          title: a.title,
          link: a.link,
          content: a.content || '',
          author: a.author || '',
          publishedAt: a.published_at || null,
          isRead: 0,
          isFavorite: 0,
          createdAt: new Date().toISOString()
        })
        added++
      }
    }
    await db.feeds.update(feedId, { lastFetchedAt: new Date().toISOString() })
    return added
  })
}

export default db
