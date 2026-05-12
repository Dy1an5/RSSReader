# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
npm install              # 安装依赖
npm run dev              # 启动 Vite 开发服务器
npm run build            # 构建到 dist/
npx cap add android      # 创建 Android 工程（首次）
npx cap sync android     # 将 dist/ 同步到 Android 工程
npx cap open android     # 用 Android Studio 打开
```

## 架构概览

Vue 3 + Vite 的 RSS 阅读器 SPA，可打包为 Android APK（Capacitor）。

### 数据层 (src/db.js, Dexie/IndexedDB)

两个对象存储：

| 表 | 索引字段 |
|---|---|
| `feeds` | `++id, url, createdAt` |
| `articles` | `++id, feedId, link, isRead, isFavorite, publishedAt` |

- Dexie schema 版本升级时需要保留旧版本定义，递增版本号即可自动迁移
- `publishedAt` 和 `createdAt` 均按 ISO 8601 字符串排序——该格式字典序 = 时间序
- 文章通过 `db.articles.where('link').equals(link)` 去重（`refreshFeedArticles`）

### RSS 解析 (src/services/rss.js)

- 浏览器开发时通过 Vite CORS 代理（`/cors-proxy?url=...`）获取 XML
- Android 端使用 `CapacitorHttp` 原生请求绕过 CORS
- 支持 RSS 2.0 和 Atom 两种格式，`parseDate()` 将日期统一转为 ISO 8601，无日期时使用当前时间兜底
- 注意：解析 RSS 时对 XML 命名空间（如 `content:encoded`、`dc:creator`）通过 `childText()` 按 `localName` 匹配

### 状态管理 (Pinia)

- `useFeedStore` (src/stores/feeds.js)：订阅源列表，按 `createdAt` 倒序
- `useArticleStore` (src/stores/articles.js)：文章列表/详情/搜索/收藏，按 `publishedAt` 倒序，分页使用 offset/limit

### 路由 (src/router/index.js)

| 路径 | 视图 | 说明 |
|---|---|---|
| `/` | FeedList | 全部文章 |
| `/feed/:id` | FeedList | 单个订阅源文章 |
| `/article/:id` | ArticleView | 文章详情（DOMPurify 净化 HTML） |
| `/search` | SearchView | 关键词搜索 |
| `/favorites` | FavoritesView | 收藏文章 |

FeedList 同时服务 `/` 和 `/feed/:id`，通过 `route.params.id` 区分。

### Android 打包

- `capacitor.config.json`：`webDir: "dist"`，通过 `npx cap sync` 将 web 构建产物复制到 Android 工程
- `.github/workflows/build-apk.yml`：GitHub Actions 云端构建，推送 `v*` 标签触发。`android/` 目录在 `.gitignore` 中，CI 中通过 `npx cap add android` 动态生成
- `@capacitor/core` 和 `@capacitor/cli` 在 `dependencies` 中（非 `devDependencies`），确保 CI 中 `npm ci` 可安装
