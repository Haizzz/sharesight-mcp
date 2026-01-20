# CLAUDE.md - Project Instructions for Claude

This file provides guidance for Claude when working with the Sharesight MCP Server codebase.

## Project Overview

This is an MCP (Model Context Protocol) server that wraps the Sharesight v3 API, allowing AI assistants to interact with Sharesight portfolio data through natural language.

**Tech Stack:**
- TypeScript
- Node.js 18+
- MCP SDK (`@modelcontextprotocol/sdk`)

## Project Structure

```
sharesight-mcp/
├── src/
│   ├── index.ts              # CLI entry point with serve and auth commands
│   ├── oauth.ts              # OAuth 2.0 token management and refresh
│   ├── sharesight-client.ts  # HTTP client for Sharesight API
│   └── types.ts              # TypeScript interfaces for API types
├── dist/                     # Compiled output (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Key Files

### `src/index.ts`
The main CLI entry point with two commands:
- `sharesight-mcp serve` - Run the MCP server (default)
- `sharesight-mcp auth` - One-time OAuth authentication
Contains tool definitions using Zod schemas for validation.

### `src/oauth.ts`
OAuth 2.0 manager class handling:
- Authorization URL generation
- Token exchange and storage
- Automatic token refresh

### `src/sharesight-client.ts`
HTTP client class with methods for each API endpoint. All methods:
- Are async and return typed responses
- Use the private `request()` method for HTTP calls
- Handle query parameters and request bodies

### `src/types.ts`
TypeScript interfaces matching Sharesight API v3 response structures. Organized into:
- Common types (ApiTransaction, Currency, Pagination)
- Domain types (Portfolio, Holding, CustomInvestment, etc.)
- Response types (PortfoliosResponse, HoldingsResponse, etc.)
- Request types (CreateCustomInvestmentRequest, etc.)

## Build Commands

```bash
npm install     # Install dependencies
npm run build   # Compile TypeScript to dist/
npm run dev     # Watch mode for development
npm start       # Run the compiled server
```

## Adding a New Tool

1. **Add API method** to `src/sharesight-client.ts`:
   ```typescript
   async newMethod(param: string): Promise<SomeResponse> {
     return this.request<SomeResponse>("GET", `/endpoint/${param}`);
   }
   ```

2. **Add types** to `src/types.ts` if needed

3. **Add tool definition** to `tools` array in `src/index.ts`:
   ```typescript
   {
     name: "new_tool",
     description: "Description of what it does",
     inputSchema: {
       type: "object",
       properties: {
         param: { type: "string", description: "..." }
       },
       required: ["param"]
     }
   }
   ```

4. **Add case handler** in the switch statement:
   ```typescript
   case "new_tool":
     result = await client.newMethod((args as { param: string }).param);
     break;
   ```

## API Conventions

### Sharesight API v3
- Base URL: `https://api.sharesight.com/api/v3`
- Auth: Bearer token in Authorization header
- Dates: `YYYY-MM-DD` format
- Pagination: cursor-based with `page` and `per_page`

### Error Handling
The client throws errors for non-2xx responses. The MCP handler catches these and returns `isError: true` responses.

## Authentication

Run `sharesight-mcp auth` once to authenticate interactively. Tokens are saved to `~/.sharesight-mcp/tokens.json` and refreshed automatically.

## Testing

Currently no automated tests. Test manually:

1. Run `node dist/index.js auth` to authenticate (one-time setup)
2. Set `SHARESIGHT_CLIENT_ID` and `SHARESIGHT_CLIENT_SECRET` env vars
3. Run `node dist/index.js serve`
4. Use MCP inspector or Claude Desktop to test tools

## Common Tasks

### Update an existing tool
1. Find the tool in `src/index.ts` tools array
2. Modify the `inputSchema` as needed
3. Update the case handler if parameters changed
4. Update client method in `src/sharesight-client.ts` if needed

### Fix type errors
1. Check `src/types.ts` matches actual API responses
2. The API sometimes returns different field names (camelCase vs snake_case)
3. Mark optional fields with `?`

### Debug API issues
1. Check the access token is valid (not expired)
2. Look at the error message from Sharesight
3. Compare request against API documentation

## Notes

- The server uses stdio transport (stdin/stdout)
- Authentication: Run `sharesight-mcp auth` first to authenticate
- OAuth tokens are stored at `~/.sharesight-mcp/tokens.json`
- All tool responses are JSON stringified with 2-space indentation
