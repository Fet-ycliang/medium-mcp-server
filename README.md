# <img src="https://cdn-static-1.medium.com/_/fp/icons/Medium-Avatar-500x500.svg" alt="Medium Logo" width="32" height="32"> Medium MCP Server

## Overview
Medium MCP (Model Context Protocol) is an innovative solution for programmatically interacting with Medium's content ecosystem, enabling intelligent and context-aware content retrieval.

## 📖 Deep Dive Article
Want to understand the full story behind Medium MCP? Check out the comprehensive article:

[From Thought to Published: How MediumMCP Streamlines the AI-to-Medium Platform Workflow](https://dishantraghav27.medium.com/from-thought-to-published-how-mediummcp-streamlines-the-ai-to-medium-platform-workflow-9e436159d1a2)

## Key Features
- Intelligent content querying
- AI-powered content extraction
- Context-aware analysis
- **新增：繁體中文文章摘要格式化** - 將文章資訊格式化為易讀的繁體中文 Markdown 格式

## Available Tools

### 1. `publish-article`
Publish a new article on Medium.

**Parameters:**
- `title` (string, required): Article title
- `content` (string, required): Markdown-formatted content
- `tags` (array[string], optional): Up to 5 tags
- `publicationId` (string, optional): Target publication ID

### 2. `search-articles`
Search and filter Medium articles.

**Parameters:**
- `keywords` (array[string], optional): Search keywords
- `publicationId` (string, optional): Filter by publication
- `tags` (array[string], optional): Filter by tags

### 3. `get-publications`
Retrieve user's Medium publications.

### 4. `format-article-summary` 🆕
將文章資訊格式化為繁體中文 Markdown 摘要，包含標題、URL、作者、發佈時間和摘要。

**參數：**
- `articles` (array, required): 文章資料陣列，每篇文章包含：
  - `title` (string, required): 文章標題
  - `url` (string, required): 文章URL
  - `author` (string, optional): 作者名稱
  - `publishedAt` (string, optional): 發佈時間
  - `summary` (string, optional): 文章摘要
  - `tags` (array[string], optional): 文章標籤
- `format` (string, optional): 格式化類型，可選 `'single'` 或 `'list'`（預設為 `'list'`）

**範例輸出：**
```markdown
# 文章列表

共 1 篇文章

---

## 1. AI 的未來發展

**文章連結：** https://medium.com/@user/ai-future-123

**作者：** 張三

**發佈時間：** 2026-02-22

**標籤：** AI, 技術, 未來

**摘要：** 探討人工智慧技術的未來趨勢與應用

---
```

## Technology Stack
- TypeScript
- Model Context Protocol (MCP)
- Advanced Content Parsing

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Medium API credentials

### Installation
```bash
# Clone the repository
git clone https://github.com/Dishant27/medium-mcp-server.git

# Navigate to the project directory
cd medium-mcp-server

# Install dependencies
npm install
