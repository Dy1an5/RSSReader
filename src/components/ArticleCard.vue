<template>
  <div class="article-card" :class="{ read: article.is_read }" @click="$router.push(`/article/${article.id}`)">
    <div class="article-card-header">
      <div style="flex:1">
        <h3>{{ article.title }}</h3>
        <div class="article-card-meta">
          <span>{{ article.feed_title }}</span>
          <span v-if="article.author">{{ article.author }}</span>
          <span v-if="article.published_at">{{ formatDate(article.published_at) }}</span>
        </div>
      </div>
      <button
        class="fav-btn"
        :class="{ active: article.is_favorite }"
        @click.stop="toggleFav"
      >
        {{ article.is_favorite ? '★' : '☆' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useArticleStore } from '../stores/articles.js'

const props = defineProps({ article: Object })
const store = useArticleStore()

function formatDate(d) {
  return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function toggleFav() {
  store.toggleFavorite(props.article.id, !props.article.is_favorite)
}
</script>
