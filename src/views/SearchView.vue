<template>
  <div>
    <SearchBar />

    <div v-if="loading" class="loading">搜索中...</div>

    <div v-else-if="searched && !results.length" class="empty-state">
      <h3>未找到结果</h3>
      <p>没有找到与 "{{ route.query.q }}" 相关的文章</p>
    </div>

    <div v-else-if="results.length" class="article-list">
      <div class="page-header">
        <h2>"{{ route.query.q }}" 的搜索结果 ({{ total }})</h2>
      </div>
      <ArticleCard v-for="a in results" :key="a.id" :article="a" />
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
import SearchBar from '../components/SearchBar.vue'
import ArticleCard from '../components/ArticleCard.vue'

const route = useRoute()
const store = useArticleStore()
const results = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const loading = ref(false)
const searched = ref(false)

const totalPages = computed(() => Math.ceil(total.value / limit.value) || 1)

async function doSearch() {
  const q = route.query.q
  if (!q) return
  loading.value = true
  searched.value = true
  try {
    const data = await store.search(q, page.value, 10)
    results.value = data.articles
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function changePage(p) {
  page.value = p
  doSearch()
}

watch(() => route.query.q, () => {
  page.value = 1
  doSearch()
})

onMounted(doSearch)
</script>
