<template>
  <div>
    <button class="back-btn" @click="$router.back()">&larr; 返回</button>

    <div v-if="!article" class="loading">加载中...</div>

    <article v-else class="article-view">
      <h1>{{ article.title }}</h1>
      <div class="article-view-meta">
        <span>{{ article.feed_title }}</span>
        <span v-if="article.author">{{ article.author }}</span>
        <span v-if="article.published_at">{{ formatDate(article.published_at) }}</span>
        <a v-if="article.link" :href="article.link" target="_blank">原文链接</a>
        <button
          class="fav-btn"
          :class="{ active: article.is_favorite }"
          @click="toggleFav"
        >
          {{ article.is_favorite ? '★ 已收藏' : '☆ 收藏' }}
        </button>
      </div>
      <div class="article-content" v-html="sanitizedContent" />
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '../stores/articles.js'
import DOMPurify from 'dompurify'

const route = useRoute()
const store = useArticleStore()
const article = ref(null)

function formatDate(d) {
  return new Date(d).toLocaleString('zh-CN')
}

const sanitizedContent = computed(() => {
  if (!article.value?.content) return ''
  return DOMPurify.sanitize(article.value.content, {
    ADD_ATTR: ['target'],
    ALLOW_DATA_ATTR: false
  })
})

function toggleFav() {
  if (!article.value) return
  store.toggleFavorite(article.value.id, !article.value.is_favorite)
}

onMounted(async () => {
  article.value = await store.fetchArticle(route.params.id)
})
</script>
