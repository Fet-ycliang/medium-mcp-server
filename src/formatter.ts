// 文章資料介面
export interface ArticleData {
  title: string;
  url: string;
  author?: string;
  publishedAt?: string;
  summary?: string;
  tags?: string[];
}

/**
 * 將文章資料格式化為繁體中文 Markdown 格式
 * @param article 文章資料
 * @returns 格式化後的 Markdown 字串
 */
export function formatArticleSummary(article: ArticleData): string {
  const sections: string[] = [];

  // 標題
  sections.push(`# ${article.title}\n`);

  // 文章 URL
  sections.push(`**文章連結：** ${article.url}\n`);

  // 作者
  if (article.author) {
    sections.push(`**作者：** ${article.author}\n`);
  }

  // 發佈時間
  if (article.publishedAt) {
    sections.push(`**發佈時間：** ${article.publishedAt}\n`);
  }

  // 標籤
  if (article.tags && article.tags.length > 0) {
    sections.push(`**標籤：** ${article.tags.join(', ')}\n`);
  }

  // 摘要
  if (article.summary) {
    sections.push(`## 摘要\n\n${article.summary}\n`);
  }

  return sections.join('\n');
}

/**
 * 將多篇文章格式化為繁體中文 Markdown 格式列表
 * @param articles 文章資料陣列
 * @returns 格式化後的 Markdown 字串
 */
export function formatArticleList(articles: ArticleData[]): string {
  if (articles.length === 0) {
    return '目前沒有文章。';
  }

  const header = `# 文章列表\n\n共 ${articles.length} 篇文章\n\n---\n\n`;
  const formattedArticles = articles.map((article, index) => {
    return `## ${index + 1}. ${article.title}\n\n` +
           `**文章連結：** ${article.url}\n\n` +
           (article.author ? `**作者：** ${article.author}\n\n` : '') +
           (article.publishedAt ? `**發佈時間：** ${article.publishedAt}\n\n` : '') +
           (article.tags && article.tags.length > 0 ? `**標籤：** ${article.tags.join(', ')}\n\n` : '') +
           (article.summary ? `**摘要：** ${article.summary}\n\n` : '') +
           `---\n`;
  });

  return header + formattedArticles.join('\n');
}
