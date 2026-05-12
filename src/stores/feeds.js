import { defineStore } from 'pinia'
import db, { addFeedWithArticles, refreshFeedArticles } from '../db.js'
import { fetchFeed } from '../services/rss.js'

export const useFeedStore = defineStore('feeds', {
  state: () => ({
    feeds: [],
    loading: false
  }),
  actions: {
    async fetchFeeds() {
      this.loading = true
      try {
        this.feeds = await db.feeds.orderBy('createdAt').reverse().toArray()
      } finally {
        this.loading = false
      }
    },
    async addFeed(url) {
      const data = await fetchFeed(url)
      await addFeedWithArticles({ ...data, url }, data.items)
      await this.fetchFeeds()
    },
    async refreshFeed(id) {
      const feed = await db.feeds.get(id)
      if (!feed) throw new Error('Feed not found')
      const data = await fetchFeed(feed.url)
      await refreshFeedArticles(id, data.items)
    },
    async removeFeed(id) {
      await db.transaction('rw', db.feeds, db.articles, async () => {
        await db.articles.where('feedId').equals(id).delete()
        await db.feeds.delete(id)
      })
      await this.fetchFeeds()
    }
  }
})
