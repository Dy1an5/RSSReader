<template>
  <div class="search-bar">
    <span class="search-bar-icon">&#128269;</span>
    <input
      v-model="query"
      type="text"
      placeholder="搜索文章..."
      @keyup.enter="doSearch"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = ref('')

function doSearch() {
  if (query.value.trim()) {
    router.push({ name: 'search', query: { q: query.value.trim() } })
  }
}
</script>
