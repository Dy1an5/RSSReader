<template>
  <div>
    <div class="page-header">
      <h2>{{ feedTitle || '全部文章' }}</h2>
      <button
        v-if="route.params.id"
        class="back-btn"
        @click="store.refreshFeed(route.params.id)"
        :disabled="refreshing"
      >
        {{ refreshing ? '刷新中...' : '刷新' }}
      </button>
    </div>

    <div v-if="store.loading && !articles.length" class="loading">加载中...</div>

    <div v-else-if="!articles.length" class="empty-state">
      <h3>暂无文章</h3>
      <p v-if="route.params.id">该订阅源还没有文章</p>
      <p v-else>请先添加 RSS 订阅源</p>
    </div>

    <div v-else class="article-list">
      <ArticleCard v-for="a in articles" :key="a.id" :article="a" />
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
      <span style="align-self:center;font-size:0.875rem">{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '../stores/articles.js'
import { useFeedStore } from '../stores/feeds.js'
import ArticleCard from '../components/ArticleCard.vue'

const route = useRoute()
const store = useArticleStore()
const feedStore = useFeedStore()
const page = ref(1)
const refreshing = ref(false)

const articles = computed(() => store.articles)
const totalPages = computed(() => Math.ceil(store.total / (store.limit || 10)) || 1)

const feedTitle = computed(() => {
  if (!route.params.id) return ''
  const feed = feedStore.feeds.find(f => f.id === Number(route.params.id))
  return feed?.title || ''
})

function load() {
  const params = { page: page.value, limit: 10 }
  if (route.params.id) params.feed_id = route.params.id
  store.fetchArticles(params)
}

function changePage(p) {
  page.value = p
  load()
}

async function refreshFeed() {
  refreshing.value = true
  await feedStore.refreshFeed(route.params.id)
  load()
  refreshing.value = false
}

watch(() => route.params.id, () => {
  page.value = 1
  load()
})

onMounted(load)
</script>
