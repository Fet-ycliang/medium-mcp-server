# Agent Skills 使用範例

本文件展示如何使用 `format-article-summary` 工具將 Medium 文章資訊格式化為繁體中文 Markdown 格式。

## 基本使用

### 格式化單篇文章

```json
{
  "tool": "format-article-summary",
  "parameters": {
    "articles": [
      {
        "title": "探索人工智慧的無限可能",
        "url": "https://medium.com/@techwriter/ai-possibilities-2026",
        "author": "李明",
        "publishedAt": "2026-02-15",
        "summary": "本文深入探討人工智慧在各領域的應用，從醫療保健到金融科技，展示 AI 如何改變我們的生活方式。",
        "tags": ["人工智慧", "科技", "未來趨勢"]
      }
    ],
    "format": "single"
  }
}
```

**輸出：**
```markdown
# 探索人工智慧的無限可能

**文章連結：** https://medium.com/@techwriter/ai-possibilities-2026

**作者：** 李明

**發佈時間：** 2026-02-15

**標籤：** 人工智慧, 科技, 未來趨勢

## 摘要

本文深入探討人工智慧在各領域的應用，從醫療保健到金融科技，展示 AI 如何改變我們的生活方式。
```

### 格式化多篇文章列表

```json
{
  "tool": "format-article-summary",
  "parameters": {
    "articles": [
      {
        "title": "深度學習入門指南",
        "url": "https://medium.com/@aiexpert/deep-learning-guide",
        "author": "陳小華",
        "publishedAt": "2026-01-20",
        "summary": "從零開始學習深度學習，包含神經網路基礎、常用框架介紹及實作範例。",
        "tags": ["深度學習", "機器學習", "教學"]
      },
      {
        "title": "TypeScript 最佳實踐",
        "url": "https://medium.com/@devpro/typescript-best-practices",
        "author": "王大明",
        "publishedAt": "2026-02-01",
        "summary": "分享 TypeScript 開發中的最佳實踐，提升程式碼品質與開發效率。",
        "tags": ["TypeScript", "程式設計", "最佳實踐"]
      },
      {
        "title": "雲端運算架構設計",
        "url": "https://medium.com/@cloudarch/cloud-architecture",
        "author": "林美玲",
        "publishedAt": "2026-02-10",
        "summary": "探討現代雲端架構設計原則，包含微服務、容器化與 Kubernetes 應用。"
      }
    ],
    "format": "list"
  }
}
```

**輸出：**
```markdown
# 文章列表

共 3 篇文章

---

## 1. 深度學習入門指南

**文章連結：** https://medium.com/@aiexpert/deep-learning-guide

**作者：** 陳小華

**發佈時間：** 2026-01-20

**標籤：** 深度學習, 機器學習, 教學

**摘要：** 從零開始學習深度學習，包含神經網路基礎、常用框架介紹及實作範例。

---

## 2. TypeScript 最佳實踐

**文章連結：** https://medium.com/@devpro/typescript-best-practices

**作者：** 王大明

**發佈時間：** 2026-02-01

**標籤：** TypeScript, 程式設計, 最佳實踐

**摘要：** 分享 TypeScript 開發中的最佳實踐，提升程式碼品質與開發效率。

---

## 3. 雲端運算架構設計

**文章連結：** https://medium.com/@cloudarch/cloud-architecture

**作者：** 林美玲

**發佈時間：** 2026-02-10

**摘要：** 探討現代雲端架構設計原則，包含微服務、容器化與 Kubernetes 應用。

---
```

## 整合使用情境

### 情境一：搜尋並格式化文章

先使用 `search-articles` 搜尋文章，再使用 `format-article-summary` 格式化結果：

1. 搜尋文章：
```json
{
  "tool": "search-articles",
  "parameters": {
    "keywords": ["人工智慧", "機器學習"],
    "tags": ["AI"]
  }
}
```

2. 將搜尋結果轉換為格式化摘要：
```json
{
  "tool": "format-article-summary",
  "parameters": {
    "articles": [
      // ... 從 search-articles 獲得的結果
    ],
    "format": "list"
  }
}
```

### 情境二：最小化參數使用

只提供必要資訊（標題和 URL）：

```json
{
  "tool": "format-article-summary",
  "parameters": {
    "articles": [
      {
        "title": "簡單的文章標題",
        "url": "https://medium.com/@user/simple-article"
      }
    ]
  }
}
```

**輸出：**
```markdown
# 文章列表

共 1 篇文章

---

## 1. 簡單的文章標題

**文章連結：** https://medium.com/@user/simple-article

---
```

## 參數說明

### articles 陣列
每個文章物件可包含以下欄位：

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `title` | string | ✅ | 文章標題 |
| `url` | string | ✅ | 文章連結 |
| `author` | string | ❌ | 作者名稱 |
| `publishedAt` | string | ❌ | 發佈時間（建議使用 ISO 格式或易讀格式） |
| `summary` | string | ❌ | 文章摘要 |
| `tags` | string[] | ❌ | 文章標籤陣列 |

### format 參數
- `"single"`: 格式化單篇文章（使用陣列第一筆資料）
- `"list"`: 格式化文章列表（預設值）

## Agent 技能應用建議

### 使用時機
1. **內容整理**：整理多篇相關文章的摘要
2. **研究筆記**：建立閱讀清單與筆記
3. **知識管理**：分類管理不同主題的文章
4. **團隊協作**：分享文章摘要給團隊成員
5. **學習追蹤**：記錄學習歷程中閱讀的文章

### 最佳實踐
1. 提供完整的文章資訊以獲得最佳格式化效果
2. 使用有意義的標籤協助分類
3. 摘要控制在 1-2 句話內，簡潔明瞭
4. 發佈時間使用統一格式（如 YYYY-MM-DD）
5. 多篇文章時使用 `list` 格式以獲得清晰的概覽

## 技術整合

此工具可與以下 MCP 工具配合使用：
- `search-articles`: 搜尋文章
- `get-publications`: 獲取出版物資訊
- `publish-article`: 發布整理好的文章摘要

## 故障排除

### 常見問題

**Q: 如果文章陣列為空會發生什麼？**
A: 系統會返回「目前沒有文章。」的訊息。

**Q: 可以只格式化標題和 URL 嗎？**
A: 可以，這是最小必填欄位，其他欄位都是選填。

**Q: 標籤數量有限制嗎？**
A: 程式碼沒有限制，但建議控制在 3-5 個以保持可讀性。

**Q: 如何處理很長的摘要？**
A: 建議將摘要控制在 200 字以內，以維持格式美觀。
