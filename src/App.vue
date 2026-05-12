<template>
  <button class="menu-toggle" @click="sidebarOpen = !sidebarOpen">&#9776;</button>
  <FeedSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
  <main class="main-content">
    <router-view />
  </main>
</template>

<script setup>
import { ref } from 'vue'
import FeedSidebar from './components/FeedSidebar.vue'

const sidebarOpen = ref(false)
</script>
