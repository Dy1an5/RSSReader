import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/FeedList.vue')
  },
  {
    path: '/feed/:id',
    name: 'feed',
    component: () => import('../views/FeedList.vue')
  },
  {
    path: '/article/:id',
    name: 'article',
    component: () => import('../views/ArticleView.vue')
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchView.vue')
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('../views/FavoritesView.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
