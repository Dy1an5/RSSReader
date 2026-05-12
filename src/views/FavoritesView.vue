<template>
  <div>
    <div class="page-header">
      <h2>收藏文章</h2>
    </div>

    <div v-if="store.loading && !articles.length" class="loading">加载中...</div>

    <div v-else-if="!articles.length" class="empty-state">
      <h3>暂无收藏</h3>
      <p>点击文章旁的 ☆ 即可收藏</p>
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
import { ref, computed, onMounted } from 'vue'
import { useArticleStore } from '../stores/articles.js'
import ArticleCard from '../components/ArticleCard.vue'

const store = useArticleStore()
const page = ref(1)

const articles = computed(() => store.articles)
const totalPages = computed(() => Math.ceil(store.total / (store.limit || 10)) || 1)

function load() {
  store.fetchArticles({ favorites: '1', page: page.value, limit: 10 })
}

function changePage(p) {
  page.value = p
  load()
}

onMounted(load)
</script>
