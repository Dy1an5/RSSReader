<template>
  <aside class="sidebar" :class="{ open }">
    <div class="sidebar-logo">RSS Reader</div>

    <SearchBar @click="$emit('close')" />

    <nav class="sidebar-nav">
      <router-link to="/" @click="$emit('close')">全部文章</router-link>
      <router-link to="/favorites" @click="$emit('close')">收藏文章</router-link>
    </nav>

    <div class="sidebar-feeds-title">订阅源</div>
    <router-link
      v-for="feed in store.feeds"
      :key="feed.id"
      :to="`/feed/${feed.id}`"
      class="sidebar-feed"
      @click="$emit('close')"
    >
      <img v-if="feed.icon_url" :src="feed.icon_url" width="16" height="16" style="border-radius:2px" alt="" />
      <span>{{ feed.title }}</span>
    </router-link>

    <button class="add-feed-btn" @click="showDialog = true">+ 添加订阅</button>

    <!-- Add feed dialog -->
    <div v-if="showDialog" class="dialog-overlay" @click.self="showDialog = false">
      <div class="dialog">
        <h3>添加 RSS 订阅</h3>
        <input v-model="feedUrl" type="url" placeholder="输入 RSS 订阅地址..." @keyup.enter="addFeed" />
        <div v-if="error" class="dialog-error">{{ error }}</div>
        <div class="dialog-actions">
          <button class="dialog-cancel" @click="showDialog = false">取消</button>
          <button class="dialog-submit" @click="addFeed" :disabled="loading">
            {{ loading ? '添加中...' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFeedStore } from '../stores/feeds.js'
import SearchBar from './SearchBar.vue'

defineProps({ open: Boolean })
defineEmits(['close'])

const store = useFeedStore()
const showDialog = ref(false)
const feedUrl = ref('')
const error = ref('')
const loading = ref(false)

onMounted(() => store.fetchFeeds())

async function addFeed() {
  error.value = ''
  if (!feedUrl.value.trim()) return
  loading.value = true
  try {
    await store.addFeed(feedUrl.value.trim())
    feedUrl.value = ''
    showDialog.value = false
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
