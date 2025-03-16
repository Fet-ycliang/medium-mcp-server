# MediumMCP: Advanced Medium API Integration

## 🚀 Project Overview

**MediumMCP** is a sophisticated Model Context Protocol (MCP) server designed to revolutionize interactions with the Medium API. This project provides developers with a powerful, context-aware framework for retrieving, publishing, and managing Medium content programmatically.

## ✨ Key Features

- **Intelligent Content Management**: Leverage MCP's advanced context handling
- **Secure API Interactions**: Type-safe Medium API interactions
- **Extensible Architecture**: Easy to expand and customize
- **Standardized Protocol**: Follows Model Context Protocol specifications

## 🛠️ Core Capabilities

- Publish articles
- Retrieve user publications
- Manage drafts
- Fetch user profile information
- Search and filter articles
- Interact with comments and responses

## 🚀 Setup and Configuration

### Prerequisites
- Node.js 16+
- Medium Developer Account
- OAuth2 Credentials from Medium

### Installation

```bash
git clone https://github.com/Dishant27/medium-mcp-server.git
cd medium-mcp-server
npm install
```

### Configuration

1. Create a `.env` file:
```
MEDIUM_CLIENT_ID=your_client_id
MEDIUM_CLIENT_SECRET=your_client_secret
MEDIUM_CALLBACK_URL=http://localhost:3000/callback
```

2. Register your application at [Medium's Developer Portal](https://mediumapi.com/)

## 🔍 Tool Capabilities

### Content Tools
- `publish-article`: Publish new articles
- `get-publications`: Retrieve user's publications
- `search-articles`: Search and filter articles
- `manage-draft`: Create, update, and manage drafts

### Profile Tools
- `get-user-profile`: Retrieve user profile information
- `list-user-articles`: List articles by a specific user

## 💡 Example Usage

```typescript
// Publish an article
const result = await mediumClient.publishArticle({
  title: "My First MCP-Powered Article",
  content: "Writing with the power of Model Context Protocol!",
  tags: ["technology", "writing", "mcp"]
});

// Search articles
const articles = await mediumClient.searchArticles({
  keywords: ["artificial intelligence"],
  publicationId: "xyz123"
});
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

## 🚨 Disclaimer

This project is an independent implementation and is not officially affiliated with Medium.
