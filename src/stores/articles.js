import { defineStore } from 'pinia'
import db from '../db.js'

export const useArticleStore = defineStore('articles', {
  state: () => ({
    articles: [],
    currentArticle: null,
    total: 0,
    page: 1,
    limit: 10,
    loading: false
  }),
  actions: {
    async fetchArticles({ feedId, page = 1, limit = 10, favorites } = {}) {
      this.loading = true
      this.limit = limit
      try {
        let collection = db.articles.orderBy('publishedAt').reverse()

        if (feedId) {
          collection = collection.filter(a => a.feedId === Number(feedId))
        }
        if (favorites) {
          collection = collection.filter(a => a.isFavorite === 1)
        }

        this.total = await collection.count()
        const offset = (page - 1) * limit
        this.articles = await collection.offset(offset).limit(limit).toArray()
        this.page = page

        // Attach feed title
        const feeds = await db.feeds.toArray()
        const feedMap = Object.fromEntries(feeds.map(f => [f.id, f.title]))
        this.articles.forEach(a => { a.feed_title = feedMap[a.feedId] || '' })
      } finally {
        this.loading = false
      }
    },
    async fetchArticle(id) {
      const article = await db.articles.get(Number(id))
      if (!article) return null
      const feed = await db.feeds.get(article.feedId)
      article.feed_title = feed?.title || ''

      await db.articles.update(Number(id), { isRead: 1 })
      article.isRead = 1
      this.currentArticle = article
      return article
    },
    async search(q, page = 1, limit = 10) {
      this.loading = true
      try {
        const all = await db.articles
          .orderBy('publishedAt')
          .reverse()
          .filter(a =>
            (a.title && a.title.toLowerCase().includes(q.toLowerCase())) ||
            (a.content && a.content.toLowerCase().includes(q.toLowerCase()))
          )
          .toArray()

        const total = all.length
        const offset = (page - 1) * limit
        const articles = all.slice(offset, offset + limit)

        const feeds = await db.feeds.toArray()
        const feedMap = Object.fromEntries(feeds.map(f => [f.id, f.title]))
        articles.forEach(a => { a.feed_title = feedMap[a.feedId] || '' })

        return { articles, total, page, limit }
      } finally {
        this.loading = false
      }
    },
    async toggleRead(id, isRead) {
      await db.articles.update(id, { isRead: isRead ? 1 : 0 })
    },
    async toggleFavorite(id, isFavorite) {
      await db.articles.update(id, { isFavorite: isFavorite ? 1 : 0 })
      const article = this.articles.find(a => a.id === id)
      if (article) article.isFavorite = isFavorite ? 1 : 0
      if (this.currentArticle?.id === id) this.currentArticle.isFavorite = isFavorite ? 1 : 0
    }
  }
})
