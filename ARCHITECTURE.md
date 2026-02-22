# Medium MCP Server 系統架構文件

## 📋 目錄
1. [系統概述](#系統概述)
2. [系統架構圖](#系統架構圖)
3. [核心元件說明](#核心元件說明)
4. [資料流程](#資料流程)
5. [API 設計](#api-設計)
6. [程式設計模式](#程式設計模式)

## 系統概述

Medium MCP Server 是一個基於模型上下文協議（Model Context Protocol, MCP）的伺服器應用程式，提供與 Medium 平台互動的程式化介面。此系統允許 AI 助手和其他應用程式透過標準化的 MCP 協議來發布文章、搜尋內容及管理 Medium 出版物。

### 主要特點
- **標準化協議**：採用 MCP 標準，提供一致的工具介面
- **OAuth 認證**：安全的 Medium OAuth 2.0 認證流程
- **模組化設計**：清晰的職責分離與可維護性
- **TypeScript 實作**：型別安全與現代化開發體驗

## 系統架構圖

### 整體架構

```mermaid
graph TB
    subgraph "客戶端層"
        A[AI 助手/LLM] 
        B[其他 MCP 客戶端]
    end
    
    subgraph "MCP Server Layer"
        C[MCP Server<br/>index.ts]
        D[Tool Registry<br/>工具註冊器]
    end
    
    subgraph "業務邏輯層"
        E[MediumClient<br/>client.ts]
        F[MediumAuth<br/>auth.ts]
    end
    
    subgraph "外部服務"
        G[Medium API<br/>api.medium.com]
        H[OAuth Provider<br/>Medium OAuth]
    end
    
    A -->|MCP Protocol| C
    B -->|MCP Protocol| C
    C --> D
    D -->|調用工具| E
    E -->|使用認證| F
    F -->|OAuth 流程| H
    E -->|API 請求| G
    
    style C fill:#e1f5ff
    style E fill:#fff4e1
    style F fill:#ffe1e1
    style G fill:#e1ffe1
```

### 類別關係圖

```mermaid
classDiagram
    class MediumMcpServer {
        -McpServer server
        -MediumClient mediumClient
        -MediumAuth auth
        +constructor()
        +registerTools()
        +start()
    }
    
    class MediumAuth {
        -string clientId
        -string clientSecret
        -string accessToken
        +authenticate()
        +getAccessToken()
        -validateCredential()
        -logSecurityAlert()
    }
    
    class MediumClient {
        -MediumAuth auth
        -string baseUrl
        +publishArticle()
        +getUserPublications()
        +searchArticles()
        +getDrafts()
        +getUserProfile()
        +createDraft()
        -makeRequest()
    }
    
    MediumMcpServer --> MediumAuth
    MediumMcpServer --> MediumClient
    MediumClient --> MediumAuth
```

### 工具流程圖

```mermaid
sequenceDiagram
    participant Client as MCP 客戶端
    participant Server as MCP Server
    participant Auth as MediumAuth
    participant MClient as MediumClient
    participant API as Medium API
    
    Client->>Server: 啟動連線
    Server->>Auth: authenticate()
    Auth->>Auth: 驗證憑證
    Auth-->>Server: 認證成功
    
    Client->>Server: 調用工具 (publish-article)
    Server->>Server: 驗證參數
    Server->>MClient: publishArticle(params)
    MClient->>Auth: getAccessToken()
    Auth-->>MClient: 返回 token
    MClient->>API: POST /publications
    API-->>MClient: 返回結果
    MClient-->>Server: 返回發布結果
    Server-->>Client: 返回工具執行結果
```

## 核心元件說明

### 1. MediumMcpServer (index.ts)
**職責**：MCP 伺服器的主要入口點和協調器

**主要功能**：
- 初始化 MCP 伺服器實例
- 註冊所有可用的工具
- 管理伺服器生命週期
- 協調認證和客戶端元件

**提供的工具**：
1. `publish-article`：在 Medium 上發布新文章
2. `get-publications`：取得使用者的出版物列表
3. `search-articles`：搜尋和篩選 Medium 文章

### 2. MediumAuth (auth.ts)
**職責**：處理 Medium OAuth 認證流程

**主要功能**：
- 驗證環境變數中的憑證
- 執行 OAuth 2.0 認證流程
- 管理存取權杖的生命週期
- 提供安全警示日誌

**安全特性**：
- 憑證驗證與錯誤處理
- 安全警示記錄
- 權杖存取控制

### 3. MediumClient (client.ts)
**職責**：與 Medium API 進行互動的客戶端

**主要功能**：
- 統一的 API 請求處理
- 錯誤處理與記錄
- 支援多種 Medium API 端點

**支援的操作**：
- 發布文章
- 取得使用者出版物
- 搜尋文章
- 管理草稿
- 取得使用者個人資料

## 資料流程

### 發布文章流程

```mermaid
flowchart TD
    A[開始] --> B[接收工具調用]
    B --> C{驗證參數}
    C -->|失敗| D[返回錯誤]
    C -->|成功| E[取得存取權杖]
    E --> F[建構 API 請求]
    F --> G[發送到 Medium API]
    G --> H{API 回應}
    H -->|成功| I[格式化結果]
    H -->|錯誤| J[記錄錯誤]
    I --> K[返回結果給客戶端]
    J --> D
    D --> L[結束]
    K --> L
```

### 認證流程

```mermaid
flowchart TD
    A[應用程式啟動] --> B[載入環境變數]
    B --> C{驗證憑證}
    C -->|缺少憑證| D[拋出安全警示]
    C -->|憑證有效| E[請求存取權杖]
    E --> F{OAuth 流程}
    F -->|成功| G[儲存存取權杖]
    F -->|失敗| H[處理認證失敗]
    G --> I[記錄成功]
    I --> J[準備就緒]
    H --> K[拋出錯誤]
    D --> K
    K --> L[應用程式終止]
    J --> M[伺服器運行]
```

## API 設計

### 工具介面規範

#### 1. publish-article

**描述**：在 Medium 上發布新文章

**參數**：
```typescript
{
  title: string;        // 必填，最少 1 字元
  content: string;      // 必填，最少 10 字元
  tags?: string[];      // 選填，文章標籤陣列
  publicationId?: string; // 選填，出版物 ID
}
```

**回應**：
```typescript
{
  content: [{
    type: "text",
    text: string // JSON 格式的發布結果
  }]
}
```

#### 2. get-publications

**描述**：取得使用者的出版物

**參數**：無

**回應**：
```typescript
{
  content: [{
    type: "text",
    text: string // JSON 格式的出版物列表
  }]
}
```

#### 3. search-articles

**描述**：搜尋和篩選 Medium 文章

**參數**：
```typescript
{
  keywords?: string[];      // 選填，搜尋關鍵字
  publicationId?: string;   // 選填，出版物篩選
  tags?: string[];          // 選填，標籤篩選
}
```

**回應**：
```typescript
{
  content: [{
    type: "text",
    text: string // JSON 格式的文章列表
  }]
}
```

## 程式設計模式

### 1. 單一職責原則 (Single Responsibility Principle)
每個類別都有明確且單一的職責：
- `MediumMcpServer`：伺服器協調
- `MediumAuth`：認證管理
- `MediumClient`：API 互動

### 2. 依賴注入 (Dependency Injection)
```typescript
// MediumClient 接收 MediumAuth 作為依賴
constructor(auth: MediumAuth) {
    this.auth = auth;
}
```

### 3. 錯誤處理模式
統一的錯誤處理機制：
```typescript
try {
    // 業務邏輯
} catch (error: any) {
    return {
        isError: true,
        content: [{
            type: "text",
            text: `錯誤訊息: ${error.message}`
        }]
    };
}
```

### 4. 環境配置模式
使用 `dotenv` 管理環境變數，將配置與程式碼分離。

### 5. 建構器模式 (Builder Pattern)
在 API 請求中使用查詢參數建構器：
```typescript
const queryParams = new URLSearchParams();
params.keywords?.forEach(keyword => 
    queryParams.append('q', keyword)
);
```

## 技術堆疊詳細說明

### 核心依賴
1. **@modelcontextprotocol/sdk**: MCP 協議實作
2. **axios**: HTTP 客戶端，用於 API 請求
3. **dotenv**: 環境變數管理
4. **zod**: 執行期型別驗證和模式定義

### 開發工具
1. **TypeScript**: 靜態型別檢查
2. **ts-node-dev**: 開發期間的即時重載
3. **Jest**: 單元測試框架

## 部署架構

```mermaid
flowchart LR
    A[環境變數<br/>.env] --> B[應用程式<br/>Node.js]
    B --> C{傳輸層}
    C -->|stdio| D[標準輸入/輸出]
    D --> E[MCP 客戶端]
    B -->|HTTPS| F[Medium API]
```

### 環境需求
- Node.js v16 或更新版本
- npm 或 yarn 套件管理器
- Medium API 開發者憑證

### 配置需求
```env
MEDIUM_CLIENT_ID=your_client_id
MEDIUM_CLIENT_SECRET=your_client_secret
MEDIUM_CALLBACK_URL=http://localhost:3000/callback
```

## 擴展性設計

系統設計考慮了未來的擴展需求：

1. **新增工具**：在 `registerTools()` 方法中輕鬆新增新的 MCP 工具
2. **新增 API 方法**：在 `MediumClient` 中新增新的 Medium API 互動
3. **認證擴展**：`MediumAuth` 可擴展以支援其他認證機制
4. **傳輸層替換**：可將 stdio 傳輸層替換為 HTTP 或 WebSocket

## 總結

Medium MCP Server 採用了清晰的分層架構和模組化設計，確保了：
- **可維護性**：清晰的職責分離
- **可擴展性**：易於新增功能
- **安全性**：完善的認證和錯誤處理
- **標準化**：遵循 MCP 協議規範

此架構為未來的功能擴展和維護提供了堅實的基礎。
