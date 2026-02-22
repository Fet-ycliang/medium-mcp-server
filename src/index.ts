import { config } from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import MediumAuth from './auth';
import MediumClient from './client';

// 載入環境變數
config();

class MediumMcpServer {
  private server: McpServer;
  private mediumClient: MediumClient;
  private auth: MediumAuth;

  constructor() {
    // 初始化驗證
    this.auth = new MediumAuth();

    // 初始化 Medium 客戶端
    this.mediumClient = new MediumClient(this.auth);

    // 建立 MCP 伺服器實例
    this.server = new McpServer({
      name: 'medium-mcp-server',
      version: '1.0.0',
    });

    this.registerTools();
  }

  private registerTools(): void {
    // 發布文章工具
    const publishArticleHandler = async (args) => {
      try {
        const publishResult = await this.mediumClient.publishArticle({
          title: args.title,
          content: args.content,
          tags: args.tags,
          publicationId: args.publicationId,
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(publishResult, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `發布文章時發生錯誤: ${message}`,
            },
          ],
        };
      }
    };

    this.server.tool(
      'publish-article',
      '在 Medium 上發布新文章',
      {
        title: z.string().min(1, '標題為必填'),
        content: z.string().min(10, '內容至少需要 10 個字元'),
        tags: z.array(z.string()).optional(),
        publicationId: z.string().optional(),
      },
      publishArticleHandler
    );

    // 取得使用者出版物工具
    const getPublicationsHandler = async () => {
      try {
        const publications = await this.mediumClient.getUserPublications();

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(publications, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `取得出版物時發生錯誤: ${message}`,
            },
          ],
        };
      }
    };

    this.server.tool('get-publications', '取得使用者的出版物', {}, getPublicationsHandler);

    // 搜尋文章工具
    const searchArticlesHandler = async (args) => {
      try {
        const articles = await this.mediumClient.searchArticles({
          keywords: args.keywords,
          publicationId: args.publicationId,
          tags: args.tags,
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(articles, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `搜尋文章時發生錯誤: ${message}`,
            },
          ],
        };
      }
    };

    this.server.tool(
      'search-articles',
      '搜尋和篩選 Medium 文章',
      {
        keywords: z.array(z.string()).optional(),
        publicationId: z.string().optional(),
        tags: z.array(z.string()).optional(),
      },
      searchArticlesHandler
    );
  }

  // 啟動伺服器的方法
  async start(): Promise<void> {
    // 首先進行驗證
    await this.auth.authenticate();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 MediumMCP 伺服器已初始化');
  }
}

// 主要執行程式
async function main(): Promise<void> {
  const server = new MediumMcpServer();
  await server.start();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('嚴重錯誤:', message);
  process.exit(1);
});
