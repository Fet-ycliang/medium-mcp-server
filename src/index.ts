import { config } from 'dotenv';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
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
      name: "medium-mcp-server",
      version: "1.0.0"
    });

    this.registerTools();
  }

  private registerTools() {
    // 發布文章工具
    this.server.tool(
      "publish-article",
      "在 Medium 上發布新文章",
      {
        title: z.string().min(1, "標題為必填"),
        content: z.string().min(10, "內容至少需要 10 個字元"),
        tags: z.array(z.string()).optional(),
        publicationId: z.string().optional()
      },
      async (args) => {
        try {
          const publishResult = await this.mediumClient.publishArticle({
            title: args.title,
            content: args.content,
            tags: args.tags,
            publicationId: args.publicationId
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(publishResult, null, 2)
              }
            ]
          };
        } catch (error: any) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `發布文章時發生錯誤: ${error.message}`
              }
            ]
          };
        }
      }
    );

    // 取得使用者出版物工具
    this.server.tool(
      "get-publications",
      "取得使用者的出版物",
      {},
      async () => {
        try {
          const publications = await this.mediumClient.getUserPublications();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(publications, null, 2)
              }
            ]
          };
        } catch (error: any) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `取得出版物時發生錯誤: ${error.message}`
              }
            ]
          };
        }
      }
    );

    // 搜尋文章工具
    this.server.tool(
      "search-articles",
      "搜尋和篩選 Medium 文章",
      {
        keywords: z.array(z.string()).optional(),
        publicationId: z.string().optional(),
        tags: z.array(z.string()).optional()
      },
      async (args) => {
        try {
          const articles = await this.mediumClient.searchArticles({
            keywords: args.keywords,
            publicationId: args.publicationId,
            tags: args.tags
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(articles, null, 2)
              }
            ]
          };
        } catch (error: any) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `搜尋文章時發生錯誤: ${error.message}`
              }
            ]
          };
        }
      }
    );
  }

  // 啟動伺服器的方法
  async start() {
    // 首先進行驗證
    await this.auth.authenticate();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("🚀 MediumMCP 伺服器已初始化");
  }
}

// 主要執行程式
async function main() {
  const server = new MediumMcpServer();
  await server.start();
}

main().catch(error => {
  console.error("嚴重錯誤:", error);
  process.exit(1);
});
